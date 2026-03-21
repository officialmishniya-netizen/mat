import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ChevronLeft, Trophy, Medal } from 'lucide-react-native';

const LEADERBOARD_DATA = [
    { id: '1', rank: 1, username: '@crypto_dan', amount: '$5,240.50' },
    { id: '2', rank: 2, username: '@maria_g', amount: '$4,120.00' },
    { id: '3', rank: 3, username: '@samuel_d', amount: '$3,890.75' },
    { id: '4', rank: 4, username: '@earnerpro_99', amount: '$2,100.25' },
    { id: '5', rank: 5, username: '@alice_in_crypto', amount: '$1,850.00' },
    { id: '6', rank: 6, username: '@john_doe', amount: '$1,240.10' },
    { id: '7', rank: 7, username: '@hustle_king', amount: '$980.50' },
];

export const LeaderboardScreen: React.FC<any> = ({ navigation }) => {
    const [period, setPeriod] = useState<'weekly' | 'all-time'>('weekly');

    const renderHeader = () => {
        // Top 3 Podium
        const top3 = LEADERBOARD_DATA.slice(0, 3);
        
        return (
            <View style={styles.podiumContainer}>
                {/* 2nd Place */}
                <View style={[styles.podiumItem, { marginTop: 40 }]}>
                    <View style={styles.avatarCircle}><Text style={styles.avatarText}>{top3[1].username[1].toUpperCase()}</Text></View>
                    <Medal color="#C0C0C0" size={24} style={styles.medalIcon} />
                    <Text style={styles.podiumUsername} numberOfLines={1}>{top3[1].username}</Text>
                    <Text style={styles.podiumAmount}>{top3[1].amount}</Text>
                </View>

                {/* 1st Place */}
                <View style={[styles.podiumItem, { zIndex: 10 }]}>
                    <View style={[styles.avatarCircle, styles.firstPlaceAvatar]}><Text style={[styles.avatarText, { fontSize: 24 }]}>{top3[0].username[1].toUpperCase()}</Text></View>
                    <Trophy color="#FFD700" size={32} style={styles.medalIcon} />
                    <Text style={[styles.podiumUsername, { fontSize: typography.sizes.md, fontFamily: typography.fonts.bodyBold }]}>{top3[0].username}</Text>
                    <Text style={[styles.podiumAmount, { color: colors.primaryDark }]}>{top3[0].amount}</Text>
                </View>

                {/* 3rd Place */}
                <View style={[styles.podiumItem, { marginTop: 60 }]}>
                    <View style={styles.avatarCircle}><Text style={styles.avatarText}>{top3[2].username[1].toUpperCase()}</Text></View>
                    <Medal color="#CD7F32" size={24} style={styles.medalIcon} />
                    <Text style={styles.podiumUsername} numberOfLines={1}>{top3[2].username}</Text>
                    <Text style={styles.podiumAmount}>{top3[2].amount}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, period === 'weekly' && styles.activeTab]}
                    onPress={() => setPeriod('weekly')}
                >
                    <Text style={[styles.tabText, period === 'weekly' && styles.activeTabText]}>This Week</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, period === 'all-time' && styles.activeTab]}
                    onPress={() => setPeriod('all-time')}
                >
                    <Text style={[styles.tabText, period === 'all-time' && styles.activeTabText]}>All Time</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={LEADERBOARD_DATA.slice(3)}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>{item.rank}</Text>
                        </View>
                        <View style={styles.listAvatar}>
                            <Text style={styles.listAvatarText}>{item.username[1].toUpperCase()}</Text>
                        </View>
                        <Text style={styles.listUsername}>{item.username}</Text>
                        <Text style={styles.listAmount}>{item.amount}</Text>
                    </View>
                )}
            />

            {/* Current User Fixed Banner */}
            <View style={styles.currentUserBanner}>
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>42</Text>
                </View>
                <Text style={styles.listUsername}>You (@ahmad2025)</Text>
                <Text style={[styles.listAmount, { color: colors.white }]}>$125.50</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    },
    backButton: { padding: 4 },
    headerTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
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
    listContent: { paddingBottom: 100 },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingVertical: 32,
        paddingHorizontal: 16,
        gap: 16,
    },
    podiumItem: {
        alignItems: 'center',
        width: 100,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.offWhite,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -12,
        zIndex: 2,
    },
    firstPlaceAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderColor: '#FFD700',
        borderWidth: 3,
        marginBottom: -16,
    },
    avatarText: { fontFamily: typography.fonts.display, fontSize: 20, color: colors.textDark },
    medalIcon: { zIndex: 3, marginBottom: 8 },
    podiumUsername: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
        marginBottom: 4,
        textAlign: 'center',
    },
    podiumAmount: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textDark,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 16,
        marginHorizontal: 24,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rankText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.textDark },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryAccent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    listAvatarText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.primary },
    listUsername: { flex: 1, fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark },
    listAmount: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.primary },
    currentUserBanner: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: 24,
        paddingBottom: 40, // Account for safe area
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    }
});
