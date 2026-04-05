import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Home, Play, Users, Wallet, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../screens/dashboard/HomeScreen';

const Tab = createBottomTabNavigator();

import { EarnStack } from './EarnStack';
import { TeamStack } from './TeamStack';
import { WalletStack } from './WalletStack';
import { ProfileStack } from './ProfileStack';

export const MainTabs = () => {
    const insets = useSafeAreaInsets();
    
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 60 + (Platform.OS === 'ios' ? insets.bottom : insets.bottom > 0 ? insets.bottom : 0),
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom > 0 ? insets.bottom + 8 : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: typography.fonts.bodyBold,
                    fontSize: 10,
                },
                tabBarIcon: ({ color, size }) => {
                    let IconComponent;
                    
                    switch (route.name) {
                        case 'Home':
                            IconComponent = Home;
                            break;
                        case 'Earn':
                            IconComponent = Play;
                            break;
                        case 'Team':
                            IconComponent = Users;
                            break;
                        case 'Wallet':
                            IconComponent = Wallet;
                            break;
                        case 'Profile':
                            IconComponent = User;
                            break;
                        default:
                            IconComponent = Home;
                    }

                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <IconComponent color={color} size={24} />
                            {color === colors.primary && (
                                <View style={{ 
                                    width: 4, 
                                    height: 4, 
                                    borderRadius: 2, 
                                    backgroundColor: colors.primary,
                                    position: 'absolute',
                                    bottom: -8
                                }} />
                            )}
                        </View>
                    );
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Earn" component={EarnStack} />
            <Tab.Screen name="Team" component={TeamStack} />
            <Tab.Screen name="Wallet" component={WalletStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};
