import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ChevronLeft, Info, Receipt } from 'lucide-react-native';

const WITHDRAW_METHODS = [
    { id: '1', name: 'USDT (TRC20)', min: 5, fee: '2% + $1' },
    { id: '2', name: 'Bitcoin (BTC)', min: 20, fee: '3%' },
    { id: '3', name: 'Perfect Money', min: 2, fee: '1%' },
];

export const WithdrawScreen: React.FC<any> = ({ navigation }) => {
    const [selectedMethodId, setSelectedMethodId] = useState(WITHDRAW_METHODS[0].id);
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const activeMethod = WITHDRAW_METHODS.find(m => m.id === selectedMethodId)!;
    const availableBalance = 125.50; // Mock balance pulled from Redux state ideally

    const handleWithdraw = () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt < activeMethod.min) {
            Alert.alert("Invalid Amount", `Minimum withdrawal is $${activeMethod.min}.`);
            return;
        }
        if (amt > availableBalance) {
            Alert.alert("Insufficient Funds", "You do not have enough wallet balance.");
            return;
        }
        if (!walletAddress) {
            Alert.alert("Missing Destination", "Please enter your wallet address or account ID.");
            return;
        }

        setLoading(true);

        // Simulate API call to /api/withdraw
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                "Request Submitted",
                "Your withdrawal request has been placed in the queue. It will be processed within 24 hours.",
                [{ text: "OK", onPress: () => navigation.navigate('WalletHome') }]
            );
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Withdraw Funds</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available to Withdraw</Text>
                    <Text style={styles.balanceValue}>${availableBalance.toFixed(2)}</Text>
                </View>

                <Text style={styles.sectionTitle}>Payout Method</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodsScroll}>
                    {WITHDRAW_METHODS.map(method => {
                        const isSelected = selectedMethodId === method.id;
                        return (
                            <TouchableOpacity 
                                key={method.id}
                                style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                                onPress={() => setSelectedMethodId(method.id)}
                            >
                                <View style={[styles.methodRadio, isSelected && styles.methodRadioSelected]} />
                                <View>
                                    <Text style={[styles.methodName, isSelected && { color: colors.primary }]}>{method.name}</Text>
                                    <Text style={styles.methodLimits}>Min: ${method.min} | Fee: {method.fee}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.formContainer}>
                    <Input 
                        label="Amount (USD) *"
                        placeholder={`Min. $${activeMethod.min}`}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <Input 
                        label="Destination Address / Account *"
                        placeholder="e.g. T9yD14Nj9... or U123456"
                        value={walletAddress}
                        onChangeText={setWalletAddress}
                    />

                    <View style={styles.infoBox}>
                        <Info color={colors.primary} size={20} />
                        <Text style={styles.infoText}>
                            Withdrawals are processed manually for security. Please allow up to 24-48 business hours. Ensure your address is correct.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.receiptRow}>
                    <Receipt color={colors.textMuted} size={18} />
                    <Text style={styles.receiptLine}>Estimated Payout:</Text>
                    <Text style={styles.receiptTotal}>
                        ${amount ? (parseFloat(amount) * 0.98).toFixed(2) : '0.00'}
                    </Text>
                </View>
                <Button 
                    title="Request Withdrawal" 
                    onPress={handleWithdraw}
                    loading={loading}
                />
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark },
    content: { padding: 24 },
    balanceCard: { backgroundColor: colors.primaryAccent + '15', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: colors.primaryAccent },
    balanceLabel: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.sm, color: colors.textDark, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    balanceValue: { fontFamily: typography.fonts.display, fontSize: 36, color: colors.primaryDark },
    sectionTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark, marginBottom: 16 },
    methodsScroll: { marginBottom: 32 },
    methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginRight: 16, width: 220 },
    methodCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryAccent + '10' },
    methodRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, marginRight: 12 },
    methodRadioSelected: { borderColor: colors.primary, backgroundColor: colors.primary, borderWidth: 6 },
    methodName: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 4 },
    methodLimits: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMuted },
    formContainer: { marginBottom: 20 },
    infoBox: { flexDirection: 'row', backgroundColor: colors.offWhite, padding: 16, borderRadius: 12, gap: 12, marginTop: 16, borderWidth: 1, borderColor: colors.border },
    infoText: { flex: 1, fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium, lineHeight: 20 },
    footer: { backgroundColor: colors.white, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border, shadowColor: colors.textDark, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
    receiptRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
    receiptLine: { flex: 1, fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textMedium, marginLeft: 8 },
    receiptTotal: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xl, color: colors.success }
});
