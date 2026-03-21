import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Trophy, CheckCircle2, Lock, Star, Shield, Crown } from 'lucide-react-native';
import { Badge } from '../../components/common/Badge';

const { width } = Dimensions.get('window');

const RANKS = [
    { id: '1', level: 1, name: 'Bronze Member', active: true, reqActive: 0, reqDirects: 0, bonus: '$0' },
    { id: '2', level: 2, name: 'Silver Director', active: true, reqActive: 5, reqDirects: 5, bonus: '$50' },
    { id: '3', level: 3, name: 'Gold Executive', active: false, reqActive: 25, reqDirects: 15, bonus: '$250' },
    { id: '4', level: 4, name: 'Platinum Founder', active: false, reqActive: 100, reqDirects: 30, bonus: '$1,000' },
    { id: '5', level: 5, name: 'Diamond Legend', active: false, reqActive: 500, reqDirects: 100, bonus: '$5,000' }
];

export const RankScreen: React.FC<any> = () => {
    
    // Determine user's current rank index
    const currentRankIndex = RANKS.findIndex(r => !r.active) - 1;
    const currentRank = currentRankIndex >= 0 ? RANKS[currentRankIndex] : RANKS[RANKS.length - 1];

    const getRankIcon = (level: number, color: string) => {
        switch(level) {
            case 1: return <Star color={color} size={28} />;
            case 2: return <Shield color={color} size={28} />;
            case 3: return <Trophy color={color} size={28} />;
            case 4: return <Crown color={color} size={28} />;
            case 5: return <Star color={color} size={28} />; // Adjust icons as needed
            default: return <Trophy color={color} size={28} />;
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Achievements</Text>
                <Text style={styles.subtitle}>Climb the ranks, unlock rewards</Text>
            </View>

            {/* Current Rank Spotlight */}
            <View style={styles.spotlightContainer}>
                <View style={styles.spotlightRays} />
                <View style={styles.spotlightCircle}>
                    {getRankIcon(currentRank.level, colors.white)}
                </View>
                <Text style={styles.spotlightTitle}>{currentRank.name}</Text>
                <Text style={styles.spotlightSubtitle}>Current Rank Indicator</Text>
                
                <View style={styles.nextTargetContainer}>
                    <Text style={styles.nextTargetLabel}>Next: {RANKS[currentRankIndex + 1]?.name}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '40%' }]} />
                    </View>
                    <Text style={styles.progressText}>Need 20 more active directs</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Rank Pathways</Text>

            <View style={styles.timeline}>
                <View style={styles.timelineLine} />

                {RANKS.map((rank, index) => {
                    const isUnlocked = rank.active;
                    const isNext = index === currentRankIndex + 1;
                    const isCurrent = index === currentRankIndex;
                    
                    const markerColor = isUnlocked ? colors.primary : colors.border;
                    const bgColor = isUnlocked ? colors.white : colors.offWhite;

                    return (
                        <View key={rank.id} style={styles.timelineItem}>
                            <View style={[styles.timelineMarker, { borderColor: markerColor }]}>
                                {isUnlocked ? (
                                    <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />
                                ) : (
                                    <View style={[styles.markerHole, { backgroundColor: colors.background }]} />
                                )}
                            </View>

                            <Card style={[styles.rankCard, { backgroundColor: bgColor }]}>
                                <View style={styles.rankCardHeader}>
                                    <View style={styles.rankInfo}>
                                        <Text style={[styles.rankName, !isUnlocked && styles.dullText]}>
                                            {rank.name}
                                        </Text>
                                        <Text style={styles.bonusText}>Bonus: {rank.bonus}</Text>
                                    </View>
                                    
                                    {isUnlocked ? (
                                        <CheckCircle2 color={colors.success} size={24} />
                                    ) : (
                                        <Lock color={colors.textMuted} size={20} />
                                    )}
                                </View>

                                {isCurrent && (
                                    <View style={{ marginTop: 12 }}>
                                        <Badge label="You are here" status="warning" />
                                    </View>
                                )}

                                {isNext && (
                                    <View style={styles.requirementsBox}>
                                        <Text style={styles.reqTitle}>Requirements</Text>
                                        <Text style={styles.reqLine}>• Active Directs: 5 / {rank.reqDirects}</Text>
                                        <Text style={styles.reqLine}>• Team Active Refs: 18 / {rank.reqActive}</Text>
                                    </View>
                                )}
                            </Card>
                        </View>
                    );
                })}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingTop: 60 },
    header: { marginBottom: 32 },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark },
    subtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textMedium },
    spotlightContainer: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginBottom: 40,
        ...colors.shadowDefault,
    },
    spotlightRays: {
        position: 'absolute',
        top: -20, left: 0, right: 0, height: 100,
        backgroundColor: colors.primaryAccent + '10',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    spotlightCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
    },
    spotlightTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xl, color: colors.textDark, marginBottom: 4 },
    spotlightSubtitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
    nextTargetContainer: {
        width: '100%',
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    nextTargetLabel: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.textDark, marginBottom: 12 },
    progressBar: { height: 8, backgroundColor: colors.offWhite, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
    progressText: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMedium },
    sectionTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark, marginBottom: 24 },
    timeline: { paddingLeft: 12 },
    timelineLine: {
        position: 'absolute',
        left: 20, top: 20, bottom: 40,
        width: 2,
        backgroundColor: colors.border,
    },
    timelineItem: { flexDirection: 'row', marginBottom: 24 },
    timelineMarker: {
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: colors.white,
        borderWidth: 3,
        justifyContent: 'center', alignItems: 'center',
        marginTop: 24,
        marginRight: 16,
    },
    markerDot: { width: 6, height: 6, borderRadius: 3 },
    markerHole: { width: 6, height: 6, borderRadius: 3 },
    rankCard: { flex: 1, padding: 20 },
    rankCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    rankInfo: { flex: 1 },
    rankName: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark, marginBottom: 4 },
    dullText: { color: colors.textMuted },
    bonusText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.primary },
    requirementsBox: { marginTop: 16, backgroundColor: colors.offWhite, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    reqTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.xs, color: colors.textDark, textTransform: 'uppercase', marginBottom: 8 },
    reqLine: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium, marginBottom: 4 }
});
