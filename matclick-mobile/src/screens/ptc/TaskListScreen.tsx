import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ClipboardCheck, Search, Clock, Zap } from 'lucide-react-native';

const CATEGORIES = ['All', 'Survey', 'Social', 'Install', 'Review'];

export const TaskListScreen: React.FC<any> = ({ navigation }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    const tasks = [
        { id: '1', title: 'Complete Profile Survey', desc: 'Answer a 5-min survey about demographics', category: 'Survey', reward: 0.50, time: '~5 min', difficulty: 'Easy' },
        { id: '2', title: 'Follow MatClick on X', desc: 'Follow our official X account and retweet', category: 'Social', reward: 0.20, time: '~2 min', difficulty: 'Easy' },
        { id: '3', title: 'Install Crypto Wallet App', desc: 'Download app, create account, and save seed phrase', category: 'Install', reward: 1.50, time: '~15 min', difficulty: 'Hard' },
    ];

    const filteredTasks = activeCategory === 'All' ? tasks : tasks.filter(t => t.category === activeCategory);

    const renderTaskCard = ({ item }: { item: typeof tasks[0] }) => {
        let diffColor = item.difficulty === 'Easy' ? colors.success : item.difficulty === 'Medium' ? colors.warning : colors.error;

        return (
            <Card style={styles.taskCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <ClipboardCheck color={colors.primary} size={20} />
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.rewardText}>${item.reward.toFixed(2)}</Text>
                    </View>
                </View>

                <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{item.desc}</Text>

                <View style={styles.badgesRow}>
                    <View style={styles.timeBadge}>
                        <Clock color={colors.textMedium} size={12} />
                        <Text style={styles.timeBadgeText}>{item.time}</Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: `${diffColor}15` }]}>
                        <Text style={[styles.diffBadgeText, { color: diffColor }]}>{item.difficulty}</Text>
                    </View>
                </View>

                <Button 
                    title="Start Task" 
                    style={styles.startButton} 
                    onPress={() => navigation.navigate('TaskDetail', { task: item })} 
                />
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Task Surge</Text>
                    <Text style={styles.subtitle}>Micro-tasks, macro-rewards</Text>
                </View>
                <View style={styles.todayChip}>
                    <Text style={styles.todayChipText}>Today: $0.45</Text>
                </View>
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoriesList}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[
                                styles.categoryChip, 
                                activeCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setActiveCategory(item)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                activeCategory === item && styles.categoryChipTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filteredTasks}
                renderItem={renderTaskCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        marginBottom: 20,
    },
    title: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.xxl,
        color: colors.textDark,
    },
    subtitle: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
    },
    todayChip: {
        backgroundColor: colors.primaryAccent + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primaryAccent,
    },
    todayChipText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.primary,
    },
    categoriesContainer: {
        marginBottom: 16,
    },
    categoriesList: {
        paddingHorizontal: 24,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.sm,
        color: colors.textMedium,
    },
    categoryChipTextActive: {
        color: colors.white,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    taskCard: {
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    rewardText: {
        fontFamily: typography.fonts.display,
        fontSize: typography.sizes.lg,
        color: colors.primary,
    },
    taskTitle: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.lg,
        color: colors.textDark,
        marginBottom: 4,
    },
    taskDesc: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.md,
        color: colors.textMedium,
        marginBottom: 16,
        lineHeight: 20,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    timeBadgeText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.xs,
        color: colors.textMedium,
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    diffBadgeText: {
        fontFamily: typography.fonts.bodyBold,
        fontSize: typography.sizes.xs,
    },
    startButton: {
        height: 44,
    }
});
