import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import apiClient from '../../api/config';
import { CheckCircle } from 'lucide-react-native';

export const AdViewScreen: React.FC<any> = ({ route, navigation }) => {
    const { ad } = route.params;
    const [timeLeft, setTimeLeft] = useState(ad.duration);
    const [isPaused, setIsPaused] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [loading, setLoading] = useState(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        // Anti-cheat: Listen for app backgrounding
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
                setIsPaused(true);
                Alert.alert("Timer Paused", "You must keep the app open to earn credit for this ad!");
            } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                setIsPaused(false);
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && !isPaused && !showCaptcha) {
            timer = setInterval(() => {
                setTimeLeft((prev: number) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !showCaptcha) {
            setShowCaptcha(true);
        }

        return () => clearInterval(timer);
    }, [timeLeft, isPaused, showCaptcha]);

    const handleCaptchaComplete = async () => {
        setLoading(true);
        try {
            // Simulated API call for ad completion
            // await apiClient.post(`/ads/${ad.id}/complete`, { captcha_token: 'valid' });
            
            Alert.alert(
                "Success! 🎉",
                `$${ad.reward.toFixed(3)} credited to your wallet.`,
                [{ text: "Awesome", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert("Error", "Could not verify ad completion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Ad Website */}
            <View style={styles.webviewContainer}>
                {/* Fallback to google.com if no URL is provided in the mock */}
                <WebView 
                    source={{ uri: 'https://example.com' }} 
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>

            {/* Always-visible Bottom Overlay Tracker */}
            <View style={styles.overlay}>
                {!showCaptcha ? (
                    <View style={styles.timerContainer}>
                        {/* Simple Timer Display (SVG circular progress can be swapped in here) */}
                        <View style={styles.circle}>
                            <Text style={styles.timerText}>{timeLeft}</Text>
                        </View>
                        <View style={styles.adInfo}>
                            <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                            <Text style={styles.earningLabel}>Earning: ${ad.reward.toFixed(3)}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.captchaContainer}>
                        <View style={styles.captchaHeader}>
                            <CheckCircle color={colors.success} size={24} />
                            <Text style={styles.captchaTitle}>Verification Required</Text>
                        </View>
                        <Text style={styles.captchaSubtitle}>Please verify you are human to claim reward.</Text>
                        
                        <Button 
                            title="I am Human (Claim)" 
                            onPress={handleCaptchaComplete}
                            loading={loading}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    webviewContainer: {
        flex: 1,
        marginBottom: 100, // Leave space for overlay
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: 24,
        paddingBottom: 40, // Safe area
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    timerText: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xl,
        color: colors.primary,
    },
    adInfo: {
        flex: 1,
    },
    adTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
    },
    earningLabel: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.success,
        marginTop: 4,
    },
    captchaContainer: {
        alignItems: 'stretch',
    },
    captchaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    captchaTitle: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginLeft: 8,
    },
    captchaSubtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
        textAlign: 'center',
        marginBottom: 20,
    }
});
