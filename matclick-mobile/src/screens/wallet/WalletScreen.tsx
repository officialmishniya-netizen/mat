import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Clock } from 'lucide-react-native';
import apiClient from '../../api/config';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'earning' | 'commission';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    date: string;
    description: string;
}

export const WalletScreen: React.FC<any> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Mock Data Fetch
        const mockFetch = setTimeout(() => {
            setWalletData({
                mainBalance: 125.50,
                earningBalance: 42.00,
                commissionBalance: 83.50,
                pendingWithdrawals: 15.00
            });

            setTransactions([
                { id: '1', type: 'earning', amount: 0.05, status: 'completed', date: 'Today, 10:24 AM', description: 'PTC Ad Reward' },
                { id: '2', type: 'commission', amount: 5.00, status: 'completed', date: 'Yesterday', description: 'Referral Bonus: @crypto_dan' },
                { id: '3', type: 'withdrawal', amount: -20.00, status: 'pending', date: 'Mar 15, 2026', description: 'Withdraw to USDT TRC20' },
                { id: '4', type: 'deposit', amount: 50.00, status: 'completed', date: 'Mar 10, 2026', description: 'Crypto Deposit' }
            ]);

            setLoading(false);
        }, 1000);

        return () => clearTimeout(mockFetch);
    }, []);

    const getTransactionIcon = (type: string) => {
        switch(type) {
            case 'deposit': return <ArrowDownLeft color={colors.success} size={20} />;
            case 'withdrawal': return <ArrowUpRight color={colors.error} size={20} />;
            case 'earning': return <Clock color={colors.primary} size={20} />;
            case 'commission': return <ArrowRightLeft color={colors.primaryLight} size={20} />;
            default: return <Wallet color={colors.textMedium} size={20} />;
        }
    };

    const getTransactionColor = (type: string, amount: number) => {
        if (type === 'withdrawal' || amount < 0) return colors.error;
        if (type === 'deposit') return colors.success;
        return colors.textDark; // Earning or commission
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerAll]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Finance</Text>
            </View>

            {/* Total Balance Card */}
            <View style={styles.mainBalanceCard}>
                <Text style={styles.mainBalanceLabel}>Total Available Balance</Text>
                <Text style={styles.mainBalanceValue}>${walletData.mainBalance.toFixed(2)}</Text>
                <Text style={styles.pendingText}>Pending Withdrawals: ${walletData.pendingWithdrawals.toFixed(2)}</Text>

                <View style={styles.mainActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Deposit')}>
                        <View style={styles.actionIconBg}><ArrowDownLeft color={colors.primary} size={24} /></View>
                        <Text style={styles.actionButtonText}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Withdraw')}>
                        <View style={styles.actionIconBg}><ArrowUpRight color={colors.primary} size={24} /></View>
                        <Text style={styles.actionButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Transfer', 'Internal transfer coming soon.')}>
                        <View style={styles.actionIconBg}><ArrowRightLeft color={colors.primary} size={24} /></View>
                        <Text style={styles.actionButtonText}>Transfer</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Balances Breakdown */}
            <View style={styles.breakdownRow}>
                <Card style={[styles.breakdownCard, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.breakdownLabel}>Earning Wallet</Text>
                    <Text style={styles.breakdownValue}>${walletData.earningBalance.toFixed(2)}</Text>
                </Card>
                <Card style={[styles.breakdownCard, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.breakdownLabel}>Commission Wallet</Text>
                    <Text style={styles.breakdownValue}>${walletData.commissionBalance.toFixed(2)}</Text>
                </Card>
            </View>

            {/* Transactions List */}
            <View style={styles.transactionsSection}>
                <View style={styles.transactionsHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {transactions.map(tx => (
                    <View key={tx.id} style={styles.txItem}>
                        <View style={[styles.txIconBox, { backgroundColor: getTransactionColor(tx.type, tx.amount) + '15' }]}>
                            {getTransactionIcon(tx.type)}
                        </View>
                        <View style={styles.txDetailsColumn}>
                            <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                            <Text style={styles.txDate}>{tx.date}</Text>
                        </View>
                        <View style={styles.txStatusColumn}>
                            <Text style={[styles.txAmount, { color: getTransactionColor(tx.type, tx.amount) }]}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                            </Text>
                            {tx.status === 'pending' && <Badge label="Pending" status="warning" />}
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingTop: 60 },
    centerAll: { justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24 },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark },
    mainBalanceCard: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
        alignItems: 'center',
    },
    mainBalanceLabel: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.white, opacity: 0.9, marginBottom: 4 },
    mainBalanceValue: { fontFamily: typography.fonts.display, fontSize: 48, color: colors.white, marginBottom: 8 },
    pendingText: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.offWhite, opacity: 0.8, marginBottom: 32 },
    mainActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 16 },
    actionButton: { flex: 1, alignItems: 'center' },
    actionIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionButtonText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.xs, color: colors.white },
    breakdownRow: { flexDirection: 'row', marginBottom: 32 },
    breakdownCard: { padding: 20, alignItems: 'flex-start' },
    breakdownLabel: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMedium, marginBottom: 8 },
    breakdownValue: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xl, color: colors.textDark },
    transactionsSection: { backgroundColor: colors.white, borderRadius: 24, padding: 24, paddingBottom: 16 },
    transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    sectionTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark },
    viewAllText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.primary },
    txItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    txIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    txDetailsColumn: { flex: 1, marginRight: 16 },
    txDesc: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 4 },
    txDate: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMuted },
    txStatusColumn: { alignItems: 'flex-end' },
    txAmount: { fontFamily: typography.fonts.display, fontSize: typography.sizes.md, marginBottom: 4 }
});
