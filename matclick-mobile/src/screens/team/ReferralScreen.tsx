import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Copy, Share2, QrCode as QrIcon, Users } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

export const ReferralScreen: React.FC<any> = ({ navigation }) => {
    const referralCode = 'AHMAD2025';
    const referralLink = `https://matclick.com/register?ref=${referralCode}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(referralLink);
        Alert.alert("Copied!", "Referral link copied to clipboard.");
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on MatClick and start earning daily! Sign up here: ${referralLink}`,
                url: referralLink,
                title: 'Join MatClick'
            });
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Invite Friends</Text>
                <Text style={styles.subtitle}>Build your team & earn more</Text>
            </View>

            <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                    <QRCode
                        value={referralLink}
                        size={180}
                        color={colors.primaryDark}
                        backgroundColor={colors.white}
                    />
                </View>
                <Text style={styles.qrText}>Scan to Join my Team</Text>
            </View>

            <Card style={styles.linkCard}>
                <Text style={styles.linkCardLabel}>Your Referral Link</Text>
                
                <View style={styles.linkInputBox}>
                    <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
                        {referralLink}
                    </Text>
                    <TouchableOpacity onPress={handleCopy} style={styles.copyIcon}>
                        <Copy color={colors.primary} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.codeRow}>
                    <Text style={styles.codeLabel}>Or use code:</Text>
                    <Text style={styles.codeValue}>{referralCode}</Text>
                </View>

                <Button 
                    title="Share Link" 
                    onPress={handleShare} 
                    icon={<Share2 color={colors.white} size={20} />} 
                    style={styles.shareButton} 
                />
            </Card>

            <View style={styles.howItWorks}>
                <Text style={styles.sectionTitle}>How it works</Text>
                <View style={styles.stepRow}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumber}>1</Text></View>
                    <Text style={styles.stepText}>Share your link with friends</Text>
                </View>
                <View style={styles.stepRow}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumber}>2</Text></View>
                    <Text style={styles.stepText}>They sign up & buy an Ad Pack</Text>
                </View>
                <View style={styles.stepRow}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
                    <Text style={styles.stepText}>You earn up to 10% instant commission</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingTop: 60 },
    header: { marginBottom: 32, alignItems: 'center' },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark, marginBottom: 8 },
    subtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textMedium },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    qrWrapper: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 16,
    },
    qrText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
    },
    linkCard: {
        padding: 24,
        marginBottom: 32,
    },
    linkCardLabel: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.md,
        color: colors.textDark,
        marginBottom: 16,
    },
    linkInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.offWhite,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
    },
    linkText: {
        flex: 1,
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textDark,
        marginRight: 12,
    },
    copyIcon: {
        padding: 4,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    codeLabel: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
        marginRight: 8,
    },
    codeValue: {
        fontFamily: typography.fonts.mono,
        fontSize: typography.sizes.lg,
        color: colors.primary,
        fontWeight: 'bold',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    howItWorks: {
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 20,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryAccent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumber: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.primary,
    },
    stepText: {
        flex: 1,
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textDark,
    }
});
