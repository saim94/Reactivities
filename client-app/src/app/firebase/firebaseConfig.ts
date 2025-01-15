import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Firebase App and Auth instances
let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let auth: Auth | null = null;

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

// Function to initialize Firebase with dynamic config
export const initializeFirebase = (config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}) => {
    if (!firebaseApp) {
        firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
        auth = getAuth(firebaseApp);
        auth.useDeviceLanguage();
    }
    return { firebaseApp, auth };
};

// Function to get Auth instance
export const getFirebaseAuth = (): Auth | null => {
    if (!auth) {
        throw new Error("Firebase has not been initialized. Call initializeFirebase first.");
    }
    return auth;
};
