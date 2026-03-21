import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, View, StyleProp, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    icon?: React.ReactNode;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
    title, 
    variant = 'primary', 
    loading = false, 
    style, 
    disabled,
    icon,
    textStyle,
    ...props 
}) => {
    const isPrimary = variant === 'primary';
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                isPrimary ? styles.primaryButton : styles.secondaryButton,
                isDisabled && styles.disabled,
                style
            ]} 
            disabled={isDisabled}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {icon && icon}
                    <Text style={[
                        styles.text, 
                        isPrimary ? styles.primaryText : styles.secondaryText,
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    text: {
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.display, // Poppins Bold matching specs
        textAlign: 'center',
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.primary,
    },
    disabled: {
        opacity: 0.6,
    }
});
