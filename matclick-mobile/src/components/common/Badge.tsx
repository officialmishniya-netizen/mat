import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface BadgeProps {
    label: string;
    status: 'success' | 'warning' | 'error' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ label, status }) => {
    let backgroundColor = colors.border;
    let textColor = colors.textDark;

    switch (status) {
        case 'success':
            backgroundColor = `${colors.success}20`; // 20% opacity background
            textColor = colors.success;
            break;
        case 'warning':
            backgroundColor = `${colors.warning}20`;
            textColor = colors.warning;
            break;
        case 'error':
            backgroundColor = `${colors.error}20`;
            textColor = colors.error;
            break;
        case 'default':
        default:
            backgroundColor = colors.border;
            textColor = colors.textMedium;
            break;
    }

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20, // pill-shaped
        alignSelf: 'flex-start',
    },
    text: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
    }
});
