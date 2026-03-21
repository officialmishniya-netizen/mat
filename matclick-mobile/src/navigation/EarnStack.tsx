import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdListScreen } from '../screens/ptc/AdListScreen';
import { AdViewScreen } from '../screens/ptc/AdViewScreen';
import { PowerGridScreen } from '../screens/ptc/PowerGridScreen';
import { TaskListScreen } from '../screens/ptc/TaskListScreen';
import { TaskDetailScreen } from '../screens/ptc/TaskDetailScreen';
import { TidePoolScreen } from '../screens/ptc/TidePoolScreen';

// A simple routing screen that handles the navigation from Home grid
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Play, Zap, CheckCircle2, Waves, ChevronRight } from 'lucide-react-native';

const Stack = createNativeStackNavigator();

// Temporary Dashboard to test navigation. Home Grid already navigates correctly 
// but we need a root screen for the "Earn" tab itself if pressed directly.
const EarnHomeScreen: React.FC<any> = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Earning Systems</Text>
            </View>
            <View style={styles.list}>
                <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdList')}>
                    <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
                        <Play color={colors.primary} size={24} />
                    </View>
                    <View style={styles.itemText}>
                        <Text style={styles.itemTitle}>PTC Ads</Text>
                        <Text style={styles.itemSub}>Earn by viewing websites</Text>
                    </View>
                    <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PowerGrid')}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                        <Zap color="#4F46E5" size={24} />
                    </View>
                    <View style={styles.itemText}>
                        <Text style={styles.itemTitle}>PowerGrid Cycles</Text>
                        <Text style={styles.itemSub}>Ad Packs yielding up to 135%</Text>
                    </View>
                    <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TaskSurge')}>
                    <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                        <CheckCircle2 color={colors.success} size={24} />
                    </View>
                    <View style={styles.itemText}>
                        <Text style={styles.itemTitle}>Task Surge</Text>
                        <Text style={styles.itemSub}>High-paying micro tasks</Text>
                    </View>
                    <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TidePool')}>
                    <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                        <Waves color="#2563EB" size={24} />
                    </View>
                    <View style={styles.itemText}>
                        <Text style={styles.itemTitle}>Tide Pool</Text>
                        <Text style={styles.itemSub}>Global revenue sharing</Text>
                    </View>
                    <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export const EarnStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="EarnHome" component={EarnHomeScreen} />
            <Stack.Screen name="AdList" component={AdListScreen} />
            <Stack.Screen name="AdView" component={AdViewScreen} />
            <Stack.Screen name="PowerGrid" component={PowerGridScreen} />
            <Stack.Screen name="TaskSurge" component={TaskListScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="TidePool" component={TidePoolScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 24, paddingTop: 60 },
    title: { fontFamily: typography.fonts.display, fontSize: typography.sizes.xxl, color: colors.textDark },
    list: { paddingHorizontal: 24 },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemText: { flex: 1 },
    itemTitle: { fontFamily: typography.fonts.bodyBold, fontSize: typography.sizes.md, color: colors.textDark },
    itemSub: { fontFamily: typography.fonts.body, fontSize: typography.sizes.sm, color: colors.textMuted }
});
