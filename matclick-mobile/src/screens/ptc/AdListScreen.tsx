import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { supabase } from '../../api/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PlayCircle, Clock } from 'lucide-react-native';

interface Ad {
    id: string;
    title: string;
    advertiser: string;
    category: 'Standard' | 'Premium' | 'Bonus';
    reward: number;
    duration: number; // in seconds
}

const TABS = ['All', 'Standard', 'Premium', 'Bonus'];

export const AdListScreen: React.FC<any> = ({ navigation }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('All');
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ watched: 0, limit: 20 });

    const fetchAds = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch available ads
            const { data, error } = await supabase
                .from('ads')
                .select('*')
                .eq('active', true);

            if (error) throw error;

            const mappedAds: Ad[] = (data || []).map(ad => ({
                id: ad.id,
                title: ad.title,
                advertiser: 'Sponsored',
                category: ad.reward > 0.05 ? 'Premium' : 'Standard',
                reward: parseFloat(ad.reward),
                duration: ad.duration
            }));

            setAds(mappedAds);

            // 2. Fetch user's watch progress for today
            if (user?.id) {
                const { data: posData } = await supabase
                    .from('user_ad_positions')
                    .select('ads_watched_today')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .limit(1)
                    .maybeSingle();
                
                if (posData) {
                    setStats({ 
                        watched: posData.ads_watched_today || 0,
                        limit: 20 
                    });
                }
            }
        } catch (error) {
            console.error("Failed to load ads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAds();
        setRefreshing(false);
    };

    const handleWatchAd = (ad: Ad) => {
        navigation.navigate('AdView', { ad });
    };

    const filteredAds = activeTab === 'All' 
        ? ads 
        : ads.filter(ad => ad.category === activeTab);

    useEffect(() => {
        fetchAds();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAds();
        setRefreshing(false);
    };

    const handleWatchAd = (ad: Ad) => {
        // Navigate to AdViewScreen
        navigation.navigate('AdView', { ad });
    };

    const filteredAds = activeTab === 'All' 
        ? ads 
        : ads.filter(ad => ad.category === activeTab);

    const renderAdCard = ({ item }: { item: Ad }) => (
        <Card style={styles.adCard}>
            <View style={styles.adHeader}>
                <Badge 
                    label={item.category} 
                    status={item.category === 'Premium' ? 'warning' : item.category === 'Bonus' ? 'success' : 'default'} 
                />
                <Text style={styles.rewardText}>${item.reward.toFixed(3)}</Text>
            </View>
            
            <Text style={styles.adTitle}>{item.title}</Text>
            <Text style={styles.adAdvertiser}>Sponsored by {item.advertiser}</Text>
            
            <View style={styles.adFooter}>
                <View style={styles.durationBadge}>
                    <Clock size={14} color={colors.textMedium} />
                    <Text style={styles.durationText}>{item.duration} sec</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.watchButton} 
                    onPress={() => handleWatchAd(item)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.watchButtonText}>Watch & Earn</Text>
                    <PlayCircle size={16} color={colors.white} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Watch Ads</Text>
                <Text style={styles.progressText}>{stats.watched}/{stats.limit} watched today</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(stats.watched/stats.limit) * 100}%` }]} />
                </View>
            </View>

            {/* Category Tabs */}
            <View style={styles.tabsContainer}>
                {TABS.map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredAds}
                    renderItem={renderAdCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No ads available right now.</Text>
                            <Text style={styles.emptySubtext}>Check back later or try a different filter.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.white,
        padding: 24,
        paddingTop: 60, // Safe area assuming no native header
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
        marginBottom: 8,
    },
    progressText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.primary,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
    },
    activeTabText: {
        color: colors.primary,
    },
    listContent: {
        padding: 24,
        gap: 16, // using gap for React Native 0.71+ support
    },
    adCard: {
        marginBottom: 16, // fallback if gap not supported
        padding: 20,
    },
    adHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rewardText: {
        fontFamily: typography.fonts.mono,
        color: colors.primary,
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
    },
    adTitle: {
        fontFamily: typography.fonts.display,
        color: colors.textDark,
        fontSize: typography.sizes.lg,
        marginBottom: 4,
    },
    adAdvertiser: {
        fontFamily: typography.fonts.body,
        color: colors.textMuted,
        fontSize: typography.sizes.sm,
        marginBottom: 16,
    },
    adFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.offWhite,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    durationText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.textMedium,
        fontSize: typography.sizes.sm,
    },
    watchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    watchButtonText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.white,
        fontSize: typography.sizes.sm,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMuted,
        textAlign: 'center',
    }
});
