import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Droplets, Clock, TrendingUp } from 'lucide-react-native';

export const TidePoolScreen: React.FC<any> = ({ navigation }) => {
    const [sharesAmount, setSharesAmount] = useState('1');
    const sharePrice = 5.00;
    
    // Mock Data
    const poolData = {
        totalPot: 4500,
        targetPot: 5000,
        myShares: 12,
        totalShares: 1500,
        timeToDrop: '14 hrs 22 mins'
    };

    const progressPercentage = (poolData.totalPot / poolData.targetPot) * 100;
    const estYieldPerShare = (poolData.totalPot / poolData.totalShares).toFixed(2);
    const myEstPayout = (poolData.myShares * Number(estYieldPerShare)).toFixed(2);

    const handleBuyShares = () => {
        const qty = parseInt(sharesAmount, 10);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert("Error", "Please enter a valid number of shares.");
            return;
        }

        const cost = (qty * sharePrice).toFixed(2);

        Alert.alert(
            "Confirm Purchase",
            `Buy ${qty} shares for $${cost}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: () => Alert.alert("Success", `You bought ${qty} shares! Your payout will process at the drop.`) 
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Tide Pool</Text>
                    <Text style={styles.subtitle}>Global Revenue Share</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Droplets color={colors.white} size={28} />
                </View>
            </View>

            <Card style={styles.potCard}>
                <View style={styles.potHeader}>
                    <Text style={styles.potLabel}>Current Prize Pool</Text>
                    <View style={styles.timerBadge}>
                        <Clock color={colors.primaryAccent} size={14} />
                        <Text style={styles.timerText}>{poolData.timeToDrop}</Text>
                    </View>
                </View>

                <Text style={styles.potValue}>${poolData.totalPot.toLocaleString()}</Text>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabelsRow}>
                        <Text style={styles.progressLabelText}>Progress to Drop</Text>
                        <Text style={styles.progressLabelValue}>${poolData.targetPot.toLocaleString()}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                    </View>
                </View>

                <View style={styles.potStatsRow}>
                    <View style={styles.potStat}>
                        <Text style={styles.potStatLabel}>Total Shares</Text>
                        <Text style={styles.potStatValue}>{poolData.totalShares}</Text>
                    </View>
                    <View style={styles.potStatDivider} />
                    <View style={styles.potStat}>
                        <Text style={styles.potStatLabel}>Est. Yield / Share</Text>
                        <Text style={styles.potStatValue}>${estYieldPerShare}</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.myPositionContainer}>
                <Text style={styles.sectionTitle}>Your Position</Text>
                <View style={styles.myPositionCards}>
                    <View style={styles.positionCard}>
                        <Text style={styles.positionLabel}>My Shares</Text>
                        <Text style={styles.positionValue}>{poolData.myShares}</Text>
                    </View>
                    <View style={[styles.positionCard, { backgroundColor: colors.offWhite }]}>
                        <Text style={styles.positionLabel}>Est. Payout</Text>
                        <Text style={[styles.positionValue, { color: colors.success }]}>${myEstPayout}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.buySection}>
                <View style={styles.buyHeaderRow}>
                    <TrendingUp color={colors.primary} size={20} />
                    <Text style={styles.sectionTitle}>Buy More Shares</Text>
                </View>
                
                <Text style={styles.sharePriceText}>Current Price: ${sharePrice.toFixed(2)} per share</Text>

                <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                        <Input 
                            label="Quantity"
                            keyboardType="numeric"
                            value={sharesAmount}
                            onChangeText={setSharesAmount}
                            style={styles.quantityInput}
                        />
                    </View>
                    <View style={styles.totalPreview}>
                        <Text style={styles.totalLabel}>Total Cost</Text>
                        <Text style={styles.totalValue}>
                            ${(parseFloat(sharesAmount || '0') * sharePrice).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <Button 
                    title="Purchase Shares" 
                    onPress={handleBuyShares} 
                    style={styles.buyButton}
                />
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
    subtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    potCard: {
        backgroundColor: colors.white,
        padding: 24,
        marginBottom: 32,
        borderRadius: 20,
    },
    potHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    potLabel: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textDark,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryAccent + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    timerText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.xs,
        color: colors.primary,
    },
    potValue: {
        fontFamily: typography.fonts.display,
        fontSize: 48,
        color: colors.primary,
        marginBottom: 24,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabelText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.xs,
        color: colors.textMedium,
    },
    progressLabelValue: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.textDark,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: colors.border,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4AA9FF', // Cool blue to match 'Tide' theme
        borderRadius: 5,
    },
    potStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.offWhite,
        padding: 16,
        borderRadius: 12,
    },
    potStat: {
        flex: 1,
    },
    potStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    potStatLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.xs,
        color: colors.textMedium,
        marginBottom: 4,
    },
    potStatValue: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    },
    myPositionContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 16,
    },
    myPositionCards: {
        flexDirection: 'row',
        gap: 16,
    },
    positionCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        borderRadius: 12,
    },
    positionLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
        marginBottom: 8,
    },
    positionValue: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xl,
        color: colors.textDark,
    },
    buySection: {
        backgroundColor: colors.white,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buyHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sharePriceText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 8,
    },
    inputWrapper: {
        flex: 1,
    },
    quantityInput: {
        marginBottom: 0,
    },
    totalPreview: {
        backgroundColor: colors.offWhite,
        padding: 16,
        borderRadius: 10,
        justifyContent: 'center',
        minWidth: 120,
    },
    totalLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.xs,
        color: colors.textMedium,
        marginBottom: 4,
    },
    totalValue: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.lg,
        color: colors.primary,
    },
    buyButton: {
        marginTop: 16,
    }
});
