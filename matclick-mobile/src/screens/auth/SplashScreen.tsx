import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ActivityIndicator } from 'react-native';

export const SplashScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Simulated Logo Pulse */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>M</Text>
                    </View>
                </View>

                {/* Brand Wordmark (White-label ready, will fetch later if needed) */}
                <Text style={styles.title}>MatClick</Text>
                <Text style={styles.tagline}>Earn. Grow. Repeat.</Text>
            </View>

            {/* Bottom Progress Bar area */}
            <View style={styles.bottomBar}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    logoIcon: {
        color: colors.white,
        fontFamily: typography.fonts.display,
        fontSize: 36,
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: 28,
        color: colors.textDark,
        marginBottom: 8,
    },
    tagline: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMuted,
    },
    bottomBar: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    }
});
