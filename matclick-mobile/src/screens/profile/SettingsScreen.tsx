import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ChevronLeft, ChevronRight, Edit2, Lock, Bell, Moon } from 'lucide-react-native';
import { Button } from '../../components/common/Button';

export const SettingsScreen: React.FC<any> = ({ navigation }) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const SettingsRow = ({ icon, title, subtitle, rightElement, onPress }: any) => (
        <TouchableOpacity 
            style={styles.settingsRow} 
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.settingsRowLeft}>
                <View style={styles.iconBox}>{icon}</View>
                <View>
                    <Text style={styles.rowTitle}>{title}</Text>
                    {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.settingsRowRight}>
                {rightElement || <ChevronRight color={colors.textMuted} size={20} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.sectionContainer}>
                    <SettingsRow 
                        icon={<Edit2 color={colors.primary} size={20} />}
                        title="Edit Profile"
                        subtitle="Change name, phone, etc."
                        onPress={() => {}}
                    />
                    <View style={styles.divider} />
                    <SettingsRow 
                        icon={<Lock color={colors.primary} size={20} />}
                        title="Change Password"
                        subtitle="Update security credentials"
                        onPress={() => {}}
                    />
                </View>

                <Text style={styles.sectionHeader}>Notifications</Text>
                <View style={styles.sectionContainer}>
                    <SettingsRow 
                        icon={<Bell color={colors.textDark} size={20} />}
                        title="Push Notifications"
                        subtitle="Ad alerts, commission updates"
                        rightElement={
                            <Switch 
                                trackColor={{ false: colors.border, true: colors.primaryAccent }}
                                thumbColor={pushEnabled ? colors.primary : colors.white}
                                onValueChange={setPushEnabled}
                                value={pushEnabled}
                            />
                        }
                    />
                    <View style={styles.divider} />
                    <SettingsRow 
                        icon={<Bell color={colors.textDark} size={20} />}
                        title="Email Notifications"
                        subtitle="Weekly summary, important alerts"
                        rightElement={
                            <Switch 
                                trackColor={{ false: colors.border, true: colors.primaryAccent }}
                                thumbColor={emailEnabled ? colors.primary : colors.white}
                                onValueChange={setEmailEnabled}
                                value={emailEnabled}
                            />
                        }
                    />
                </View>

                <Text style={styles.sectionHeader}>App Preferences</Text>
                <View style={styles.sectionContainer}>
                    <SettingsRow 
                        icon={<Moon color={colors.textDark} size={20} />}
                        title="Dark Mode"
                        subtitle="Toggle app theme (Beta)"
                        rightElement={
                            <Switch 
                                trackColor={{ false: colors.border, true: colors.primaryAccent }}
                                thumbColor={darkMode ? colors.primary : colors.white}
                                onValueChange={setDarkMode}
                                value={darkMode}
                            />
                        }
                    />
                </View>

                <Button 
                    title="Delete Account" 
                    variant="secondary"
                    style={styles.deleteButton}
                    textStyle={{ color: colors.error }}
                    onPress={() => {}}
                />

                <Text style={styles.legalText}>Terms of Service • Privacy Policy</Text>

            </ScrollView>
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
    sectionHeader: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
        marginBottom: 12,
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 32,
        overflow: 'hidden',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingsRowLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rowTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 2 },
    rowSubtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMuted },
    settingsRowRight: { justifyContent: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
    deleteButton: { marginTop: 16, borderColor: colors.error },
    legalText: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMuted, textAlign: 'center', marginTop: 32, marginBottom: 40 }
});
