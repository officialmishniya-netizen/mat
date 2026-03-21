import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Watch Ads & Earn Daily',
        subtitle: 'Get paid for every ad you view. Withdraw anytime.',
        icon: '▶️', // Placeholder for actual illustration
    },
    {
        id: '2',
        title: 'Build Your Team',
        subtitle: 'Refer members and earn from every level of your downline.',
        icon: '👨‍👩‍👧‍👦',
    },
    {
        id: '3',
        title: 'Rise Through the Ranks',
        subtitle: 'Unlock bonuses as you climb from Bronze to Diamond.',
        icon: '🏆',
    }
];

export const OnboardingScreen: React.FC<any> = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (slideIndex !== currentIndex) setCurrentIndex(slideIndex);
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            navigation.replace('Login');
        }
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.skipButton} 
                onPress={() => navigation.replace('Login')}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
                <Button 
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"} 
                    onPress={handleNext} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        fontFamily: typography.fonts.bodyBold,
        color: colors.primary,
        fontSize: typography.sizes.lg,
    },
    slide: {
        width,
        alignItems: 'center',
        paddingTop: height * 0.2,
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    iconText: {
        fontSize: 80,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.lg,
        color: colors.textMedium,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primaryAccent,
        marginHorizontal: 4,
        opacity: 0.5,
    },
    activeDot: {
        width: 24,
        backgroundColor: colors.primary,
        opacity: 1,
    }
});
