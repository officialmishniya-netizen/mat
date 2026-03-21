import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Users, UserPlus, Network, Trophy, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TeamDashboardScreen: React.FC<any> = ({ navigation }) => {
    // Mock Data
    const teamStats = {
        totalNetwork: 1450,
        directs: 48,
        activeRate: '68%',
        rank: 'Diamond Director',
        commissionThisMonth: 1250.75,
        matrixProgress: '6/10 levels filled'
    };

    const recentActivity = [
        { id: '1', user: 'samuel_d', action: 'upgraded to Premium', amount: '+$5.00' },
        { id: '2', user: 'maria_g', action: 'joined your Level 1', amount: '' },
        { id: '3', user: 'crypto_dan', action: 'completed Ad Cycle', amount: '+$1.25' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>My Network</Text>
                
                <TouchableOpacity style={styles.referButton} onPress={() => navigation.navigate('Referral')}>
                    <UserPlus color={colors.white} size={18} />
                    <Text style={styles.referButtonText}>Invite</Text>
                </TouchableOpacity>
            </View>

            {/* Rank Card */}
            <Card style={styles.rankCard}>
                <View style={styles.rankHeader}>
                    <View style={styles.rankIconBg}>
                        <Trophy color={colors.primary} size={32} />
                    </View>
                    <View style={styles.rankTextCol}>
                        <Text style={styles.rankLabel}>Current Rank</Text>
                        <Text style={styles.rankTitle}>{teamStats.rank}</Text>
                    </View>
                </View>

                <View style={styles.rankDivider} />

                <View style={styles.rankFooter}>
                    <Text style={styles.rankFooterLabel}>Rank Bonus Next Month</Text>
                    <Text style={styles.rankFooterValue}>$500.00</Text>
                </View>
            </Card>

            {/* Core Stats Grid */}
            <View style={styles.grid}>
                <View style={styles.statBox}>
                    <Network color={colors.textMedium} size={20} />
                    <Text style={styles.statValue}>{teamStats.totalNetwork}</Text>
                    <Text style={styles.statLabel}>Total Team</Text>
                </View>
                <View style={styles.statBox}>
                    <Users color={colors.success} size={20} />
                    <Text style={styles.statValue}>{teamStats.directs}</Text>
                    <Text style={styles.statLabel}>Direct Referrals</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.statBox}>
                    <Text style={styles.statValueCompact}>{teamStats.activeRate}</Text>
                    <Text style={styles.statLabel}>Active Rate</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.primaryAccent + '10' }]}>
                    <Text style={[styles.statValueCompact, { color: colors.primary }]}>
                        ${teamStats.commissionThisMonth}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.primaryDark }]}>Team Earnings</Text>
                </View>
            </View>

            {/* Matrix Viewer Action */}
            <TouchableOpacity style={styles.matrixActionCard} onPress={() => null}>
                <View style={styles.matrixActionLeft}>
                    <View style={styles.matrixIconCircle}>
                        <Network color={colors.white} size={24} />
                    </View>
                    <View>
                        <Text style={styles.matrixTitle}>View Tree Structure</Text>
                        <Text style={styles.matrixSubtitle}>{teamStats.matrixProgress}</Text>
                    </View>
                </View>
                <ChevronRight color={colors.textMuted} size={24} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Network Activity</Text>
            
            <View style={styles.activityList}>
                {recentActivity.map(act => (
                    <View key={act.id} style={styles.activityItem}>
                        <View style={styles.activityDot} />
                        <View style={styles.activityContent}>
                            <Text style={styles.activityText}>
                                <Text style={{ fontFamily: typography.fonts.bodyBold }}>@{act.user}</Text> {act.action}
                            </Text>
                            {act.amount ? (
                                <Text style={styles.activityAmount}>{act.amount}</Text>
                            ) : null}
                        </View>
                    </View>
                ))}
            </View>

            <Button 
                title="View All Activity" 
                variant="secondary" 
                style={styles.viewAllButton}
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark },
    referButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    referButtonText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.white },
    rankCard: { padding: 24, marginBottom: 24, backgroundColor: colors.white },
    rankHeader: { flexDirection: 'row', alignItems: 'center' },
    rankIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.offWhite, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    rankTextCol: { flex: 1 },
    rankLabel: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.textMedium, textTransform: 'uppercase', letterSpacing: 1 },
    rankTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xl, color: colors.textDark },
    rankDivider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
    rankFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rankFooterLabel: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium },
    rankFooterValue: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.lg, color: colors.success },
    grid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    statBox: { 
        flex: 1, 
        backgroundColor: colors.white, 
        padding: 20, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: colors.border,
        alignItems: 'flex-start',
    },
    statValue: { fontFamily: typography.fonts.display, fontSize: 32, color: colors.textDark, marginTop: 12, marginBottom: 4 },
    statValueCompact: { fontFamily: typography.fonts.display, fontSize: 24, color: colors.textDark, marginBottom: 4 },
    statLabel: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium },
    matrixActionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 16,
        marginBottom: 32,
    },
    matrixActionLeft: { flexDirection: 'row', alignItems: 'center' },
    matrixIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.textDark, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    matrixTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 4 },
    matrixSubtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium },
    sectionTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark, marginBottom: 16 },
    activityList: { backgroundColor: colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
    activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    activityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginRight: 16, marginTop: 4, alignSelf: 'flex-start' },
    activityContent: { flex: 1 },
    activityText: { fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textDark, lineHeight: 22 },
    activityAmount: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.success, marginTop: 4 },
    viewAllButton: { marginTop: 16 }
});
