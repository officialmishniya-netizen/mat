import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { ChevronLeft, Gift } from 'lucide-react-native';

const SEGMENTS = [
    { label: '$0.10', color: '#FF7F50', value: 0.10 },
    { label: 'Try Again', color: '#6A5ACD', value: 0 },
    { label: '$1.00', color: '#FFD700', value: 1.00 },
    { label: '+5 Shares', color: '#32CD32', value: 5 },
    { label: '$5.00', color: '#FF4500', value: 5.00 },
    { label: 'Try Again', color: '#8A2BE2', value: 0 },
];

export const SpinWheelScreen: React.FC<any> = ({ navigation }) => {
    const [spinning, setSpinning] = useState(false);
    const [spinsLeft, setSpinsLeft] = useState(1);
    
    const spinAnim = useRef(new Animated.Value(0)).current;

    const handleSpin = () => {
        if (spinsLeft <= 0) {
            Alert.alert("No Spins Left", "Come back tomorrow for your daily free spin!");
            return;
        }

        setSpinning(true);

        const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
        const segmentAngle = 360 / SEGMENTS.length;
        
        // At least 5 full rotations + exact segment
        const targetAngle = (360 * 5) + (segmentAngle * targetIndex) + (segmentAngle / 2);

        Animated.timing(spinAnim, {
            toValue: targetAngle,
            duration: 3000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setSpinning(false);
            setSpinsLeft(spinsLeft - 1);
            
            // To figure out which segment landed at top (0 degrees):
            // The wheel spins clockwise. So the segment at top is calculated based on the offset.
            const reward = SEGMENTS[(SEGMENTS.length - targetIndex) % SEGMENTS.length];
            
            if (reward.value > 0) {
                Alert.alert("Congratulations!", `You won ${reward.label}! It has been added to your account.`);
            } else {
                Alert.alert("Aw, snap!", "You didn't win anything this time. Better luck next time!");
            }
            
            // Reset for next spin without jumping (could also keep state and build up)
            spinAnim.setValue((segmentAngle * targetIndex) + (segmentAngle / 2));
        });
    };

    const spinRotate = spinAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={colors.textDark} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daily Spin</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Spin & Win</Text>
                    <Text style={styles.subtitle}>Win cash, ad credits, or pool shares everyday!</Text>
                </View>

                {/* The Wheel */}
                <View style={styles.wheelWrapper}>
                    {/* Wheel Pointer */}
                    <View style={styles.pointer} />
                    
                    <Animated.View style={[styles.wheel, { transform: [{ rotate: spinRotate }] }]}>
                        {SEGMENTS.map((segment, index) => {
                            const rotation = `${(360 / SEGMENTS.length) * index}deg`;
                            return (
                                <View key={index} style={[styles.segmentContainer, { transform: [{ rotate: rotation }] }]}>
                                    <View style={[styles.segment, { borderBottomColor: segment.color }]} />
                                    <View style={styles.segmentLabelContainer}>
                                        <Text style={styles.segmentLabel}>{segment.label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                        {/* Wheel Center */}
                        <View style={styles.wheelCenter}>
                            <Gift color={colors.primaryDark} size={24} />
                        </View>
                    </Animated.View>
                </View>

                <View style={styles.actions}>
                    <Text style={styles.spinsLeftText}>{spinsLeft} free spin(s) left today</Text>
                    
                    <Button 
                        title="SPIN THE WHEEL" 
                        onPress={handleSpin} 
                        disabled={spinning || spinsLeft <= 0}
                        style={styles.spinButton}
                    />
                </View>
            </View>
        </View>
    );
};

const WHEEL_SIZE = 300;

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
    },
    backButton: { padding: 4 },
    headerTitle: { fontFamily: typography.fonts.display, fontSize: typography.sizes.lg, color: colors.textDark },
    content: { flex: 1, padding: 24, justifyContent: 'space-between', alignItems: 'center' },
    titleContainer: { alignItems: 'center', marginTop: 20 },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.primary, marginBottom: 8 },
    subtitle: { fontFamily: typography.fonts.body, fontSize: typography.sizes.md, color: colors.textMedium, textAlign: 'center' },
    wheelWrapper: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
    },
    pointer: {
        position: 'absolute',
        top: -20,
        zIndex: 10,
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: colors.textDark,
    },
    wheel: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        borderRadius: WHEEL_SIZE / 2,
        backgroundColor: colors.border,
        overflow: 'hidden',
        borderWidth: 5,
        borderColor: colors.white,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
    },
    segmentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
    },
    /* CSS trick for drawing triangles inside a circle for wheel slices */
    segment: {
        position: 'absolute',
        top: 0,
        left: WHEEL_SIZE / 2 - (WHEEL_SIZE / 2), 
        width: 0,
        height: 0,
        borderLeftWidth: WHEEL_SIZE / 2,
        borderRightWidth: WHEEL_SIZE / 2,
        borderBottomWidth: WHEEL_SIZE / 2,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderBottomColor set dynamically
        transform: [{ translateY: -WHEEL_SIZE / 4 }]
    },
    segmentLabelContainer: {
        position: 'absolute',
        top: 30,
        width: '100%',
        alignItems: 'center',
    },
    segmentLabel: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.md,
        color: colors.white,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    wheelCenter: {
        position: 'absolute',
        top: WHEEL_SIZE / 2 - 30,
        left: WHEEL_SIZE / 2 - 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.white,
        borderWidth: 4,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    actions: { width: '100%', alignItems: 'center', paddingBottom: 20 },
    spinsLeftText: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textMedium, marginBottom: 16 },
    spinButton: { width: '100%', height: 60, borderRadius: 30 }
});
