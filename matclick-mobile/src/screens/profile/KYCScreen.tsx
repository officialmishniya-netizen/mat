import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ChevronLeft, ShieldCheck, Upload, AlertCircle, FileText } from 'lucide-react-native';

export const KYCScreen: React.FC<any> = ({ navigation }) => {
    const [idFront, setIdFront] = useState<boolean>(false);
    const [idBack, setIdBack] = useState<boolean>(false);
    const [selfie, setSelfie] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleUploadMock = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        // In reality, this would use expo-image-picker
        Alert.alert(
            "Upload Document",
            "Choose source:",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Camera", onPress: () => setter(true) },
                { text: "Gallery", onPress: () => setter(true) }
            ]
        );
    };

    const handleSubmit = () => {
        if (!idFront || !idBack || !selfie) {
            Alert.alert("Missing Documents", "Please upload all required documents before submitting.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 2000);
    };

    if (submitted) {
        return (
            <View style={[styles.container, styles.centerAll]}>
                <ShieldCheck color={colors.success} size={80} style={{ marginBottom: 24 }} />
                <Text style={styles.successTitle}>Under Verification</Text>
                <Text style={styles.successDesc}>Your documents have been submitted securely. We will notify you once your account is verified.</Text>
                
                <Button 
                    title="Back to Profile" 
                    style={{ marginTop: 40, minWidth: 200 }} 
                    onPress={() => navigation.goBack()} 
                />
            </View>
        );
    }

    const UploadBox = ({ title, desc, uploaded, onPress }: any) => (
        <TouchableOpacity 
            style={[styles.uploadBox, uploaded && styles.uploadBoxSuccess]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.uploadBoxLeft}>
                {uploaded ? (
                    <FileText color={colors.success} size={24} />
                ) : (
                    <Upload color={colors.primary} size={24} />
                )}
                <View style={styles.uploadTextCol}>
                    <Text style={styles.uploadTitle}>{title}</Text>
                    <Text style={styles.uploadDesc}>{uploaded ? 'Document attached' : desc}</Text>
                </View>
            </View>
            {uploaded && <ShieldCheck color={colors.success} size={20} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Verification</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.infoBanner}>
                    <AlertCircle color={colors.primary} size={24} style={{ marginTop: 2 }} />
                    <View style={styles.infoTextCol}>
                        <Text style={styles.infoTitle}>Verification Required</Text>
                        <Text style={styles.infoDesc}>To unlock withdrawals and higher limits, we require identity verification to comply with AML laws.</Text>
                    </View>
                </View>

                <Card style={styles.instructionsCard}>
                    <Text style={styles.sectionTitle}>Document Rules</Text>
                    <Text style={styles.ruleText}>• Must be government-issued (Passport, ID Card, Driver's License).</Text>
                    <Text style={styles.ruleText}>• Do not crop or edit the images.</Text>
                    <Text style={styles.ruleText}>• Ensure text is readable and no glare.</Text>
                    <Text style={styles.ruleText}>• Formats: JPG, PNG, PDF (Max 5MB).</Text>
                </Card>

                <UploadBox 
                    title="ID Front" 
                    desc="Upload the front of your ID card"
                    uploaded={idFront}
                    onPress={() => handleUploadMock(setIdFront)}
                />

                <UploadBox 
                    title="ID Back" 
                    desc="Upload the back of your ID card"
                    uploaded={idBack}
                    onPress={() => handleUploadMock(setIdBack)}
                />

                <UploadBox 
                    title="Selfie with ID" 
                    desc="Clear photo of your face holding the ID"
                    uploaded={selfie}
                    onPress={() => handleUploadMock(setSelfie)}
                />

            </ScrollView>

            <View style={styles.footer}>
                <Button 
                    title="Submit Documents" 
                    onPress={handleSubmit} 
                    loading={loading} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centerAll: { justifyContent: 'center', alignItems: 'center', padding: 40 },
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
    infoBanner: { flexDirection: 'row', backgroundColor: colors.primaryAccent + '15', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.primaryAccent },
    infoTextCol: { flex: 1, marginLeft: 12 },
    infoTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.primaryDark, marginBottom: 4 },
    infoDesc: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textDark, lineHeight: 20 },
    instructionsCard: { padding: 20, marginBottom: 32 },
    sectionTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 12 },
    ruleText: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMedium, marginBottom: 8, lineHeight: 20 },
    uploadBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    uploadBoxSuccess: {
        borderColor: colors.success,
        borderStyle: 'solid',
        backgroundColor: colors.success + '05',
    },
    uploadBoxLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    uploadTextCol: { marginLeft: 16, flex: 1 },
    uploadTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 4 },
    uploadDesc: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMuted },
    footer: { backgroundColor: colors.white, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border },
    successTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark, marginBottom: 16, textAlign: 'center' },
    successDesc: { fontFamily: typography.fonts.body, fontSize: typography.sizes.lg, color: colors.textMedium, textAlign: 'center', lineHeight: 26 }
});
