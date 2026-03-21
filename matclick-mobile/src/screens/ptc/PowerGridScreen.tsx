import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Info, Zap, ChevronDown } from 'lucide-react-native';

const PACK_TIERS = [
    { id: '1', name: 'Starter Pack', price: 10, payout: 12, roi: '120%' },
    { id: '2', name: 'Basic Pack', price: 25, payout: 31.25, roi: '125%' },
    { id: '3', name: 'Pro Pack', price: 50, payout: 65, roi: '130%' },
    { id: '4', name: 'Elite Pack', price: 100, payout: 135, roi: '135%' }
];

export const PowerGridScreen: React.FC<any> = ({ navigation }) => {
    const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

    const handleInvest = (pack: any) => {
        Alert.alert(
            "Confirm Activation",
            `Are you sure you want to purchase the ${pack.name} for $${pack.price}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: () => {
                        Alert.alert("Success", `Your ${pack.name} is now active and generating returns!`);
                        // Dispatch to API...
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>PowerGrid Ad Cycle</Text>
                <TouchableOpacity onPress={() => Alert.alert("How it works", "Buy advertising credits that cycle over time, generating up to 135% ROI as the network scales.")}>
                    <Info color={colors.primary} size={24} />
                </TouchableOpacity>
            </View>

            {/* Active Pack Status Card */}
            <Card style={styles.activeCard}>
                <View style={styles.activeHeader}>
                    <View style={styles.iconContainer}>
                        <Zap color={colors.white} size={20} />
                    </View>
                    <View>
                        <Text style={styles.activePackName}>Pro Pack Active</Text>
                        <Text style={styles.activeInvested}>$50.00 Invested</Text>
                    </View>
                </View>

                {/* Progress Bar pretending to be ring for layout simplicity */}
                <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>Cycle Progress</Text>
                        <Text style={styles.progressPercentage}>65%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '65%' }]} />
                    </View>
                </View>

                <View style={styles.activeFooter}>
                    <View style={styles.footerStat}>
                        <Text style={styles.statLabel}>Earnings so far</Text>
                        <Text style={styles.statValue}>$32.50</Text>
                    </View>
                    <View style={styles.footerStat}>
                        <Text style={styles.statLabel}>Target Payout</Text>
                        <Text style={[styles.statValue, { color: colors.success }]}>$65.00</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Buy New Pack</Text>
                <Text style={styles.sectionSubtitle}>Expand your earning potential</Text>
            </View>

            {/* Pack Tiers */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tiersContainer}
            >
                {PACK_TIERS.map(pack => {
                    const isSelected = selectedPackId === pack.id;
                    return (
                        <TouchableOpacity 
                            key={pack.id} 
                            style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                            onPress={() => setSelectedPackId(pack.id)}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.tierName}>{pack.name}</Text>
                            <Text style={styles.tierPrice}>${pack.price}</Text>

                            <View style={styles.tierDivider} />

                            <View style={styles.tierDetailRow}>
                                <Text style={styles.tierDetailLabel}>Total Earn</Text>
                                <Text style={styles.tierDetailValue}>${pack.payout}</Text>
                            </View>
                            <View style={styles.tierDetailRow}>
                                <Text style={styles.tierDetailLabel}>Guaranteed ROI</Text>
                                <Text style={styles.tierDetailValue}>{pack.roi}</Text>
                            </View>

                            <Button 
                                title="Select" 
                                variant={isSelected ? "primary" : "secondary"}
                                style={styles.tierButton}
                                onPress={() => handleInvest(pack)}
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Pack History Collapsible */}
            <TouchableOpacity style={styles.historyToggle}>
                <Text style={styles.historyToggleText}>Pack History</Text>
                <ChevronDown color={colors.textMedium} size={20} />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        marginBottom: 24,
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
    },
    activeCard: {
        backgroundColor: colors.white,
        padding: 24,
        marginBottom: 32,
    },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activePackName: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    },
    activeInvested: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
    },
    progressSection: {
        marginBottom: 24,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.textDark,
    },
    progressPercentage: {
        fontFamily: typography.fonts.mono,
        fontSize: typography.sizes.sm,
        color: colors.primary,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primaryAccent,
        borderRadius: 4,
    },
    activeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
    },
    footerStat: {
        alignItems: 'flex-start',
    },
    statLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xl,
        color: colors.textDark,
    },
    sectionSubtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
    },
    tiersContainer: {
        gap: 16,
        paddingRight: 24,
    },
    tierCard: {
        width: 200,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tierCardSelected: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    tierName: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
        marginBottom: 4,
    },
    tierPrice: {
        fontFamily: typography.fonts.display,
        fontSize: 32,
        color: colors.textDark,
    },
    tierDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    tierDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tierDetailLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
    },
    tierDetailValue: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.textDark,
    },
    tierButton: {
        marginTop: 16,
        height: 40,
        borderRadius: 8,
    },
    historyToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginTop: 32,
    },
    historyToggleText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    }
});
