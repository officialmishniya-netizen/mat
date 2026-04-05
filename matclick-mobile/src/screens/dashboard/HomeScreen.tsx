import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Bell, ArrowUpRight, ArrowDownLeft, Play, Zap, CheckCircle2, Waves, QrCode, Users, Trophy, Star, TrendingUp } from 'lucide-react-native';
import { Card } from '../../components/common/Card';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useDashboard } from '../../hooks/useDashboard';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<any> = ({ navigation }) => {
    const { stats, loading, refresh } = useDashboard();

    const onRefresh = React.useCallback(async () => {
        await refresh();
    }, [refresh]);

    if (loading && !stats) {
        return (
            <View style={styles.container}>
                <View style={[styles.headerBackground, { paddingBottom: 40 }]}>
                    <SkeletonLoader width={150} height={24} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width={100} height={20} />
                </View>
                <View style={styles.balanceContainer}>
                    <Card style={styles.balanceCard}>
                        <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
                        <SkeletonLoader width={200} height={40} style={{ marginBottom: 16 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <SkeletonLoader width={80} height={14} />
                            <SkeletonLoader width={80} height={14} />
                        </View>
                    </Card>
                </View>
            </View>
        );
    }

    if (!stats) return null;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section (Orange Gradient Base) */}
            <View style={styles.headerBackground}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Good Morning, {stats.user.name} 👋</Text>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{stats.user.level}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.bellIcon}>
                        <Bell color={colors.white} size={24} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Overlapping Balance Card */}
            <View style={styles.balanceContainer}>
                <Card style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>${stats.balance}</Text>

                    <View style={styles.balanceStatsRow}>
                        <Text style={styles.balanceStatText}>Total Earned: ${stats.totalEarned}</Text>
                        <Text style={styles.balanceStatText}>Referrals: {stats.referrals}</Text>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Wallet', { screen: 'Withdraw' })}>
                            <ArrowUpRight color={colors.primary} size={16} />
                            <Text style={styles.actionButtonText}>Withdraw</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Wallet', { screen: 'Deposit' })}>
                            <ArrowDownLeft color={colors.primary} size={16} />
                            <Text style={styles.actionButtonText}>Deposit</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>

            {/* Streak Banner */}
            {stats.streak > 0 && (
                <View style={styles.streakBanner}>
                    <Text style={styles.streakText}>🔥 {stats.streak} Day Streak! Bonus: +$0.50 today</Text>
                </View>
            )}

            {/* Daily Summary Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryStrip}>
                <View style={styles.statPill}><Text style={styles.statPillText}>📺 Ads: {stats.stats.ads}</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillText}>✅ Tasks: {stats.stats.tasks}</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillText}>👥 Team: {stats.stats.team}</Text></View>
            </ScrollView>

            {/* Income Systems Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Earning Channels</Text>
                <View style={styles.gridContainer}>
                    {/* PTC Ads */}
                    <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Earn')}>
                        <View style={styles.gridIconContainer}><Play color={colors.primary} size={24} /></View>
                        <Text style={styles.gridTitle}>PTC Ads</Text>
                        <Text style={styles.gridSubtitle}>20 ads available</Text>
                    </TouchableOpacity>

                    {/* PowerGrid */}
                    <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Earn', { screen: 'PowerGrid' })}>
                        <View style={styles.gridIconContainer}><Zap color={colors.primary} size={24} /></View>
                        <Text style={styles.gridTitle}>PowerGrid Cycle</Text>
                        <Text style={styles.gridSubtitle}>Pack #3 Active</Text>
                    </TouchableOpacity>

                    {/* Task Surge */}
                    <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Earn', { screen: 'TaskList' })}>
                        <View style={styles.gridIconContainer}><CheckCircle2 color={colors.primary} size={24} /></View>
                        <Text style={styles.gridTitle}>Task Surge</Text>
                        <Text style={styles.gridSubtitle}>5 tasks ready</Text>
                    </TouchableOpacity>

                    {/* Tide Pool */}
                    <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Earn', { screen: 'TidePool' })}>
                        <View style={styles.gridIconContainer}><Waves color={colors.primary} size={24} /></View>
                        <Text style={styles.gridTitle}>Tide Pool</Text>
                        <Text style={styles.gridSubtitle}>$8.50 accruing</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsStrip}>
                    {[
                        { icon: QrCode, label: 'Refer Friend', stack: 'Team', screen: 'Referral' },
                        { icon: Users, label: 'View Team', stack: 'Team', screen: 'TeamDashboard' },
                        { icon: Trophy, label: 'My Rank', stack: 'Team', screen: 'Rank' },
                        { icon: Star, label: 'Spin Wheel', stack: 'Profile', screen: 'SpinWheel' },
                        { icon: TrendingUp, label: 'Leaderboard', stack: 'Profile', screen: 'Leaderboard' },
                    ].map((action, i) => (
                        <TouchableOpacity 
                            key={i} 
                            style={styles.quickActionPill} 
                            onPress={() => navigation.navigate(action.stack, { screen: action.screen })}
                        >
                            <View style={styles.quickActionIcon}>
                                <action.icon color={colors.primary} size={18} />
                            </View>
                            <Text style={styles.quickActionText}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerBackground: {
        backgroundColor: colors.primary, // Could use expo-linear-gradient here for #FF6B00 -> #FF8C00
        paddingTop: 60,
        paddingBottom: 80,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xl,
        color: colors.white,
    },
    levelBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    levelText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.white,
        fontSize: typography.sizes.xs,
    },
    bellIcon: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    balanceContainer: {
        paddingHorizontal: 24,
        marginTop: -60, // Overlapping effect
    },
    balanceCard: {
        padding: 24,
    },
    balanceLabel: {
        fontFamily: typography.fonts.body,
        color: colors.textMuted,
        fontSize: typography.sizes.sm,
    },
    balanceAmount: {
        fontFamily: typography.fonts.display,
        color: colors.textDark,
        fontSize: 36,
        marginVertical: 4,
    },
    balanceStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    balanceStatText: {
        fontFamily: typography.fonts.mono,
        color: colors.textMedium,
        fontSize: typography.sizes.xs,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingVertical: 10,
        gap: 6,
    },
    actionButtonText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.textDark,
        fontSize: typography.sizes.sm,
    },
    streakBanner: {
        marginHorizontal: 24,
        marginTop: 20,
        backgroundColor: colors.primaryAccent,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    streakText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.white,
        fontSize: typography.sizes.md,
    },
    summaryStrip: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 12,
    },
    statPill: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statPillText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.textDark,
        fontSize: typography.sizes.sm,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridCard: {
        width: (width - 48 - 16) / 2,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    gridIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridTitle: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textDark,
        marginBottom: 4,
    },
    gridSubtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
    quickActionsStrip: {
        gap: 16,
    },
    quickActionPill: {
        alignItems: 'center',
        width: 70,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    quickActionText: {
        fontFamily: typography.fonts.body,
        fontSize: 10,
        color: colors.textMedium,
        textAlign: 'center',
    }
});
