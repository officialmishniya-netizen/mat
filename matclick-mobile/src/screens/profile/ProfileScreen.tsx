import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
    User, Settings, ShieldCheck, Gamepad2, 
    Trophy, HelpCircle, LogOut, ChevronRight, Edit3 
} from 'lucide-react-native';

export const ProfileScreen: React.FC<any> = ({ navigation }) => {
    
    // Mock user data
    const user = {
        name: 'Ahmad Khan',
        username: '@ahmad2025',
        email: 'ahmad@example.com',
        rank: 'Gold Executive',
        kycStatus: 'unverified', // 'verified', 'pending', 'unverified'
        joinDate: 'Jan 15, 2026'
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout", 
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => {
                    // Navigate to Auth Stack (handled securely by Redux later)
                    Alert.alert("Logged Out", "You have been logged out.");
                }}
            ]
        );
    };

    const renderMenuItem = (icon: React.ReactNode, title: string, subtitle: string, routeName: string, showChevron: boolean = true) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate(routeName)}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBox}>{icon}</View>
                <View>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            {showChevron && <ChevronRight color={colors.textMuted} size={20} />}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitials}>AK</Text>
                    </View>
                    <TouchableOpacity style={styles.editAvatarBtn}>
                        <Edit3 color={colors.white} size={14} />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userUsername}>{user.username}</Text>

                <View style={styles.badgesRow}>
                    <Badge label={user.rank} status="warning" />
                    {user.kycStatus === 'unverified' ? (
                        <Badge label="KYC Unverified" status="error" />
                    ) : (
                        <Badge label="KYC Verified" status="success" />
                    )}
                </View>
            </View>

            <View style={styles.menuGroup}>
                <Text style={styles.groupTitle}>Gamification</Text>
                <Card style={styles.menuCard}>
                    {renderMenuItem(<Gamepad2 color={colors.primary} size={22} />, 'Spin & Win', 'Daily lucky spins', 'SpinWheel')}
                    <View style={styles.menuDivider} />
                    {renderMenuItem(<Trophy color={colors.warning} size={22} />, 'Leaderboards', 'Top earners globally', 'Leaderboard')}
                </Card>
            </View>

            <View style={styles.menuGroup}>
                <Text style={styles.groupTitle}>Account</Text>
                <Card style={styles.menuCard}>
                    {renderMenuItem(<ShieldCheck color={colors.success} size={22} />, 'Identity Verification', 'Complete KYC to withdraw', 'KYC')}
                    <View style={styles.menuDivider} />
                    {renderMenuItem(<User color={colors.textDark} size={22} />, 'Personal Details', 'Manage your info', 'Settings')}
                    <View style={styles.menuDivider} />
                    {renderMenuItem(<Settings color={colors.textDark} size={22} />, 'Preferences', 'Security & App settings', 'Settings')}
                </Card>
            </View>

            <View style={styles.menuGroup}>
                <Text style={styles.groupTitle}>Support</Text>
                <Card style={styles.menuCard}>
                    {renderMenuItem(<HelpCircle color={colors.primaryLight} size={22} />, 'Help Center', 'FAQs & Contact', 'Support')}
                </Card>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut color={colors.error} size={20} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>MatClick v1.0.0 (Build 42)</Text>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingTop: 60 },
    header: { marginBottom: 32 },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark },
    profileHeader: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
    avatarInitials: { fontFamily: typography.fonts.display, fontSize: 36, color: colors.white },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.textDark, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background },
    userName: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xl, color: colors.textDark, marginBottom: 4 },
    userUsername: { fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textMedium, marginBottom: 16 },
    badgesRow: { flexDirection: 'row', gap: 12 },
    menuGroup: { marginBottom: 32 },
    groupTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.sm, color: colors.textMedium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
    menuCard: { padding: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.offWhite, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark, marginBottom: 2 },
    menuSubtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.xs, color: colors.textMuted },
    menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error + '15', paddingVertical: 16, borderRadius: 16, marginBottom: 24, gap: 8 },
    logoutText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.error },
    versionText: { fontFamily: typography.fonts.mono, fontSize: typography.sizes.xs, color: colors.textMuted, textAlign: 'center' }
});
