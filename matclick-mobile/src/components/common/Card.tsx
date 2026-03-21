import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    style?: any;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, noPadding = false, ...props }) => {
    return (
        <View style={[styles.card, !noPadding && styles.padding, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                // Android doesn't support colored shadows easily without external libraries
                // Using standard elevation for now, or use react-native-shadow-2 if exact match needed
                elevation: 4,
                shadowColor: colors.primary, // API 28+ supports this
            }
        })
    },
    padding: {
        padding: 16,
    }
});
