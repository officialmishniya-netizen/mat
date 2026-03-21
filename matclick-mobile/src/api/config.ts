import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://matclick.com/api'; // Production Laravel Backend

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': '1.0.0',
        'X-Platform': 'android'
    }
});

apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching token for request', error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    if (error.response?.status === 401) {
        // Handle token expiration/logout
        await SecureStore.deleteItemAsync('jwt_token');
        // Trigger global logout event or state reset here
    }
    return Promise.reject(error);
});

export default apiClient;
