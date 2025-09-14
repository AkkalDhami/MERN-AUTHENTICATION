import { configureStore } from "@reduxjs/toolkit";
import authApi from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice"
const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(
        authApi.middleware,
    ),
});

export default store;

// make a complete form handling in reactjs with full validation, it should be production level, make a login form validation 