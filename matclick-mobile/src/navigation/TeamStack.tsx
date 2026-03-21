import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TeamDashboardScreen } from '../screens/team/TeamDashboardScreen';
import { ReferralScreen } from '../screens/team/ReferralScreen';
import { RankScreen } from '../screens/team/RankScreen';

const Stack = createNativeStackNavigator();

export const TeamStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TeamDashboard" component={TeamDashboardScreen} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="Rank" component={RankScreen} />
        </Stack.Navigator>
    );
};
