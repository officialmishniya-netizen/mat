import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { RootNavigator } from './src/navigation/RootNavigator';
import { View } from 'react-native';



export default function App() {
    const [fontsLoaded] = useFonts({
        'Poppins-Bold': Poppins_700Bold,
        'Nunito-Regular': Nunito_400Regular,
        'Nunito-Bold': Nunito_700Bold,
        'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <Provider store={store}>
            <RootNavigator />
        </Provider>
    );
}
