import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    PhoneAuthProvider,
    signInWithCredential,
    Auth,
} from "firebase/auth";
import { getFirebaseAuth } from "../app/firebase/firebaseConfig";

export const initializeRecaptcha = () => {
    const auth = getFirebaseAuth() as Auth;
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "normal",
                callback: (response: unknown) => {
                    console.log("reCAPTCHA solved:", response);
                },
                "expired-callback": () => {
                    console.error("reCAPTCHA expired. Please try again.");
                },
            }
        );
    }
    return window.recaptchaVerifier;
};

export const sendCode = async (phoneNumber: string) => {
    const auth = getFirebaseAuth() as Auth;
    if (!window.recaptchaVerifier) initializeRecaptcha();
    try {
        if (!window.recaptchaVerifier) {
            throw new Error("ReCAPTCHA verifier not initialized");
        }
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            window.recaptchaVerifier!
        );
        return confirmationResult;
    } catch (error) {
        console.error("Error sending verification code:", error);
        throw error;
    }
};

export const verifyCode = async (verificationId: string, verificationCode: string) => {
    const auth = getFirebaseAuth() as Auth;
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    return await signInWithCredential(auth, credential);
};

export const clearRecaptcha = async () => {
    if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
            console.log("ReCAPTCHA verifier cleared.");
        } catch (error) {
            console.error("Error clearing ReCAPTCHA verifier:", error);
        } finally {
            delete window.recaptchaVerifier;
        }
    }
};
