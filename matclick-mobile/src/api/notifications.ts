import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from './config';

// Define Notification Channels based on Master Spec
export const NOTIFICATION_CHANNELS = {
    EARNINGS: 'earnings',
    TEAM: 'team',
    SYSTEM: 'system',
    PROMO: 'promo',
    REMINDERS: 'reminders',
};

// Global handler configuration
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function setupPushNotifications() {
    let token = null;

    if (Platform.OS === 'android') {
        // Create required channels
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.EARNINGS, {
            name: 'Earnings Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            lightColor: '#FF6B00',
        });
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.TEAM, {
            name: 'Team Activity',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SYSTEM, {
            name: 'System Messages',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.PROMO, {
            name: 'Promotions',
            importance: Notifications.AndroidImportance.LOW,
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        try {
            // FCM token for direct backend integration
            token = (await Notifications.getDevicePushTokenAsync()).data;
            
            // Send token to Laravel API
            if (token) {
                await apiClient.post('/notifications/device-token', { token, platform: Platform.OS });
            }
        } catch (error) {
            console.error('Error fetching push token', error);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
