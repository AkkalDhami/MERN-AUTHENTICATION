import { createSlice } from '@reduxjs/toolkit';
import authApi from './authApi';

function saveUserToLocalStorage({ user, accessToken, isLoggedIn }) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('isLoggedIn', isLoggedIn);
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        accessToken: null,
        isLoggedIn: false,
        user: {
            _id: '',
            name: "",
            email: "",
            role: ""
        }
    },
    reducers: {
        setCredentials: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.isLoggedIn = true;
            state.user = action.payload.user
            saveUserToLocalStorage({
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                isLoggedIn: true
            });
        },
        logout: (state) => {
            state.accessToken = null;
            state.isLoggedIn = false;
            state.user = {
                _id: '',
                name: "",
                email: "",
                role: ""
            }
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('isLoggedIn');
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.isLoggedIn = true;
            })
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.accessToken = null;
                state.isLoggedIn = false;
            });
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
