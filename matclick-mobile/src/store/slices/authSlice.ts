import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        },
        setOnboardingCompleted: (state) => {
            state.hasCompletedOnboarding = true;
        }
    },
});

export const { setToken, setUser, logout, setOnboardingCompleted } = authSlice.actions;
export default authSlice.reducer;
