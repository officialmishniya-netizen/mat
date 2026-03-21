import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setToken } from '../store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';

// Import all screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen'; 
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator();

// Temporary mock screens until we build them


export const RootNavigator = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('jwt_token');
                if (token) {
                    dispatch(setToken(token));
                }
            } catch (e) {
                console.error("Error reading token", e);
            } finally {
                // Keep splash visible briefly or until checked
                setTimeout(() => {
                    setIsAppReady(true);
                }, 1500); // 1.5s simulated load and progress bar
            }
        };
        checkToken();
    }, [dispatch]);

    if (!isAppReady) {
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                // Auth Stack
                <Stack.Group>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Group>
            ) : (
                // Main App Stack
                <Stack.Group>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
};
