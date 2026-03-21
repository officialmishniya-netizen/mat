import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ChevronLeft, Info, CheckCircle2, Link as LinkIcon, Upload, ArrowRight } from 'lucide-react-native';

export const TaskDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { task } = route.params;
    const [proofText, setProofText] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!proofText) {
            Alert.alert("Missing Proof", "Please provide a link or text proving you completed the task.");
            return;
        }
        
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <View style={[styles.container, styles.centerAll]}>
                <CheckCircle2 color={colors.success} size={80} style={{ marginBottom: 24 }} />
                <Text style={styles.successTitle}>Task Submitted!</Text>
                <Text style={styles.successDesc}>Your proof is under review. You will be credited ${task.reward.toFixed(2)} once approved by the advertiser.</Text>
                
                <Button 
                    title="Back to Tasks" 
                    style={{ marginTop: 40, minWidth: 200 }} 
                    onPress={() => navigation.goBack()} 
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.rewardContainer}>
                    <Text style={styles.rewardLabel}>Potential Reward</Text>
                    <Text style={styles.rewardValue}>${task.reward.toFixed(2)}</Text>
                </View>

                <Card style={styles.instructionsCard}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    <Text style={styles.instructionText}>{task.desc}</Text>
                    <Text style={styles.instructionText}>• Ensure you use your real information.</Text>
                    <Text style={styles.instructionText}>• Take a screenshot of the final success screen.</Text>
                    <Text style={styles.instructionText}>• Do not use VPNs or Proxies.</Text>

                    <TouchableOpacity style={styles.externalLinkButton}>
                        <Text style={styles.externalLinkButtonText}>Open Task URL</Text>
                        <ArrowRight color={colors.primary} size={16} />
                    </TouchableOpacity>
                </Card>

                <Text style={styles.sectionTitle}>Submit Proof</Text>
                
                <Input 
                    label="Proof Link / Message *"
                    placeholder="https://imgur.com/... or your username"
                    value={proofText}
                    onChangeText={setProofText}
                    multiline
                    style={{ height: 100, alignItems: 'flex-start', paddingTop: 16 }}
                />

                <TouchableOpacity style={styles.uploadBox}>
                    <Upload color={colors.primary} size={24} style={{ marginBottom: 8 }} />
                    <Text style={styles.uploadBoxTitle}>Upload Screenshot</Text>
                    <Text style={styles.uploadBoxDesc}>JPG, PNG up to 2MB (Optional)</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <Button 
                    title="Submit for Review" 
                    onPress={handleSubmit} 
                    loading={loading} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerAll: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    },
    content: {
        padding: 24,
    },
    rewardContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    rewardLabel: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
        marginBottom: 4,
    },
    rewardValue: {
        fontFamily: typography.fonts.display,
        fontSize: 40,
        color: colors.primary,
    },
    instructionsCard: {
        marginBottom: 24,
    },
    taskTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xl,
        color: colors.textDark,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 12,
    },
    instructionText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textDark,
        marginBottom: 8,
        lineHeight: 22,
    },
    externalLinkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.offWhite,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    externalLinkButtonText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.primary,
    },
    uploadBox: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    uploadBoxTitle: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.textDark,
        marginBottom: 4,
    },
    uploadBoxDesc: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
    },
    footer: {
        backgroundColor: colors.white,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: colors.textDark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    successTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
        marginBottom: 16,
        textAlign: 'center',
    },
    successDesc: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.lg,
        color: colors.textMedium,
        textAlign: 'center',
        lineHeight: 26,
    }
});
