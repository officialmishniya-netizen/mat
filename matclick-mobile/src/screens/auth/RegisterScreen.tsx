import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../store/slices/authSlice';
import apiClient from '../../api/config';
import * as SecureStore from 'expo-secure-store';

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleRegister = async () => {
        if (!name || !username || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/auth/register', { 
                name, username, email, password, referral_code: referralCode 
            });
            const { token, user } = response.data;
            
            await SecureStore.setItemAsync('jwt_token', token);
            dispatch(setToken(token));
            dispatch(setUser(user));
            // RootNavigator will automatically redirect
        } catch (error: any) {
            console.error('Registration error', error.response?.data || error.message);
            Alert.alert("Registration Failed", error.response?.data?.message || "An error occurred during sign up.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Create Account</Text>

                <View style={styles.form}>
                    <Input 
                        label="Full Name *"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />
                    <Input 
                        label="Username *"
                        placeholder="johndoe99"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <Input 
                        label="Email Address *"
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Input 
                        label="Password *"
                        placeholder="••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    {/* Simple strength bar */}
                    {password.length > 0 && (
                        <View style={styles.strengthContainer}>
                            <View style={[styles.strengthBar, { backgroundColor: password.length > 6 ? colors.success : colors.warning }]} />
                            <Text style={styles.strengthText}>{password.length > 6 ? "Strong" : "Weak"}</Text>
                        </View>
                    )}

                    <Input 
                        label="Confirm Password *"
                        placeholder="••••••••"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <Input 
                        label="Referral Code (Optional)"
                        placeholder="e.g. AHMAD2025"
                        autoCapitalize="characters"
                        value={referralCode}
                        onChangeText={setReferralCode}
                    />

                    <Button 
                        title="Create Account" 
                        onPress={handleRegister} 
                        loading={loading}
                        style={styles.registerButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginTop: 40,
        marginBottom: 24,
    },
    backButtonText: {
        color: colors.primary,
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
        marginBottom: 32,
    },
    form: {
        flex: 1,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -8,
        marginBottom: 16,
    },
    strengthBar: {
        height: 4,
        flex: 1,
        borderRadius: 2,
        marginRight: 12,
    },
    strengthText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.xs,
        color: colors.textMedium,
    },
    registerButton: {
        marginTop: 16,
        marginBottom: 40,
    }
});
