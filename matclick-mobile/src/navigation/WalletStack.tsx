import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WalletScreen } from '../screens/wallet/WalletScreen';
import { DepositScreen } from '../screens/wallet/DepositScreen';
import { WithdrawScreen } from '../screens/wallet/WithdrawScreen';

const Stack = createNativeStackNavigator();

export const WalletStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WalletHome" component={WalletScreen} />
            <Stack.Screen name="Deposit" component={DepositScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        </Stack.Navigator>
    );
};
