import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../store/slices/authSlice';
import apiClient from '../../api/config';
import * as SecureStore from 'expo-secure-store';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token, user } = response.data;
            
            await SecureStore.setItemAsync('jwt_token', token);
            dispatch(setToken(token));
            dispatch(setUser(user));
            // RootNavigator will automatically redirect to MainTabs
        } catch (error: any) {
            console.error('Login error', error.response?.data || error.message);
            Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
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
                <View style={styles.header}>
                    {/* Placeholder for Logo */}
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>M</Text>
                    </View>
                </View>

                <Card style={styles.card}>
                    <Text style={styles.title}>Welcome Back 👋</Text>
                    
                    <Input 
                        label="Email Address"
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Input 
                        label="Password"
                        placeholder="••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button 
                        title="Login" 
                        onPress={handleLogin} 
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <Button 
                        title="Sign in with Google" 
                        variant="secondary"
                        onPress={() => Alert.alert("Coming Soon", "Google Sign in not yet implemented")}
                    />
                </Card>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Register</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: colors.white,
        fontFamily: typography.fonts.display,
        fontSize: 36,
    },
    card: {
        padding: 24,
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
        marginBottom: 24,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.primary,
        fontSize: typography.sizes.sm,
    },
    loginButton: {
        marginBottom: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        fontFamily: typography.fonts.body,
        color: colors.textMuted,
        fontSize: typography.sizes.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontFamily: typography.fonts.body,
        color: colors.textMedium,
        fontSize: typography.sizes.md,
    },
    footerLink: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.primary,
        fontSize: typography.sizes.md,
    }
});
