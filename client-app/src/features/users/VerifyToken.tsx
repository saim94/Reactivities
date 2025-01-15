import { useEffect, useRef, useState } from "react";
import { Formik, ErrorMessage } from "formik";
import { Button, Form, Header, Label, Segment, Icon } from "semantic-ui-react";
import * as Yup from "yup";
import Toast from "../../utils/Toast";
import { clearRecaptcha, initializeRecaptcha, sendCode, verifyCode } from "../../utils/firebaseUtils";
import { RecaptchaVerifier } from "firebase/auth";
import { useStore } from "../../app/stores/Store";
import { observer } from "mobx-react-lite";
import OTPInput from "react-otp-input";

interface Props {
    email?: string; // Optional: for email verification
    phoneNumber?: string; // Optional: for phone number verification
    onSuccess?: () => void; // Callback after successful verification
}

export default observer(function VerifyToken({ email, phoneNumber, onSuccess }: Props) {
    const {
        userStore: { sendVerificationCode, codeVerification, getUserFromStore },
        modalStore: { closeModal2 },
    } = useStore();

    const [timer, setTimer] = useState(120); // 2-minute countdown timer
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const hasRun = useRef(false);

    const handleCodeRequest = async () => {
        if (email) {
            sendVerificationCode(email);
            setIsTimerActive(true);
            Toast.show("info", `We resent you a code to ${maskEmail(email)}. Please enter the code to verify.`);
        } else if (phoneNumber) {
            try {
                const result = await sendCode(phoneNumber);
                if (result) {
                    setVerificationId(result.verificationId);
                    Toast.show("info", `We sent you a code to ${phoneNumber}. Please enter the code to verify.`);
                    setIsTimerActive(true);
                }
            } catch (error) {
                console.error("Error sending verification code:", error);
                Toast.show("error", "Failed to send verification code. Please try again.");
            }
        }
    };

    const initializeRecaptchaAndSendCode = async () => {
        try {
            await clearRecaptcha();
            // Check if reCAPTCHA is already initialized
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = initializeRecaptcha();
            }

            // Check if the container exists, reinitialize if missing
            const recaptchaElement = document.getElementById("recaptcha-container");
            if (!recaptchaElement) {
                console.warn("ReCAPTCHA container missing. Reinitializing...");
                recaptchaVerifierRef.current?.clear();
                recaptchaVerifierRef.current = initializeRecaptcha();
            }

            // Verify CAPTCHA
            await recaptchaVerifierRef.current.verify();
            Toast.show("info", "CAPTCHA solved successfully. Sending the verification code...");
            // Automatically send the code after CAPTCHA is solved
            await handleCodeRequest();
        } catch (error) {
            console.error("CAPTCHA error:", error);
            Toast.show("error", "Failed to verify CAPTCHA. Please refresh the page and try again.");
        }
    };

    useEffect(() => {
        if ((email || phoneNumber) && !hasRun.current) {
            if (phoneNumber) {
                initializeRecaptchaAndSendCode();
            } else {
                handleCodeRequest();
            }
            hasRun.current = true;
        }
    }, [email, phoneNumber]);

    useEffect(() => {
        let countdown: NodeJS.Timeout;
        if (isTimerActive && timer > 0) {
            countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer <= 0) {
            setIsTimerActive(false);
            setTimer(120);
        }
        return () => clearInterval(countdown);
    }, [isTimerActive, timer]);

    const handleSubmit = async (
        code: string,
        setErrors: (errors: { error: string }) => void
    ) => {
        try {
            if (email) {
                await codeVerification(code, email);
            } else if (phoneNumber && verificationId) {
                const userCredential = await verifyCode(verificationId, code);
                if (!userCredential) {
                    throw new Error("Phone verification failed.");
                }
            }
            Toast.show("success", `${email ? "Email" : "Phone"} verification successful!`);
            if (onSuccess) onSuccess();
            closeModal2();
        } catch (error) {
            const errorMessage =
                (error as { response?: { data?: string }; message?: string }).response?.data ||
                (error as { message?: string }).message ||
                "Verification failed. Please try again.";
            console.error("Verification error:", errorMessage);
            setErrors({ error: errorMessage });
        }
    };


    const formatTime = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    const maskEmail = (email: string | null) => {
        if (!email) return "";
        const [localPart, domain] = email.split("@");
        if (localPart.length <= 2) return email;
        return `${localPart[0]}${"*".repeat(localPart.length - 2)}${localPart.slice(-1)}@${domain}`;
    };

    return (
        <Segment padded style={{ maxWidth: 400, margin: "auto", borderRadius: "15px", background: "#f0f5ff" }}>
            <Header as="h4" style={{ fontWeight: "bold", color: "#4a4a4a", marginBottom: "10px" }}>
                {getUserFromStore().displayName}
            </Header>
            <Header as="h2" content={`Verify Your ${email ? "Email" : "Phone Number"}`} color="black" />
            {isTimerActive && <p style={{ color: "#4a4a4a" }}>
                Enter the code we sent to <strong>{email ? maskEmail(email) : phoneNumber}</strong>.
            </p>
            }
            {phoneNumber && <div id="recaptcha-container" style={{ marginBottom: "10px" }}></div>}
            {isTimerActive &&
                <Formik
                    initialValues={{ code: "", error: "" }}
                    validationSchema={Yup.object({ code: Yup.string().required("Code is required") })}
                    onSubmit={(values, { setErrors }) =>
                        handleSubmit(values.code, setErrors).catch((error) =>
                            setErrors({ error: error.message })
                        )
                    }
                >
                    {({ handleSubmit, errors, isValid, isSubmitting, setFieldValue, values }) => (
                        <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                            {/*<MyTextInput placeholder="Enter code" name="code" type="text" />*/}
                            <OTPInput
                                value={values.code}
                                onChange={(otp) => setFieldValue("code", otp)}
                                numInputs={email ? 9 : 6}
                                renderSeparator={<span style={{ width: "8px" }}></span>}
                                renderInput={(props) => <input {...props} />}
                                inputStyle={{
                                    width: (email) ? "30px" : "40px",
                                    height: "40px",
                                    padding: "2px",
                                    fontSize: "16px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    textAlign: "center",
                                    color: "#000",
                                    backgroundColor: "#fff",
                                    outline: "none",
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const len = (email) ? 9 : 6;
                                    const pastedValue = e.clipboardData.getData("Text").slice(0, len);
                                    setFieldValue("code", pastedValue);
                                }}
                            />
                            <ErrorMessage
                                name="error"
                                render={() => (
                                    <div style={{ textAlign: "center" }}>
                                        <Label style={{ margin: 5 }} basic color="red" content={errors.error} />
                                    </div>
                                )}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "20px",
                                    cursor: isTimerActive ? "not-allowed" : "pointer",
                                    color: isTimerActive ? "gray" : "#4a90e2",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex !important",
                                        alignItems: "center !important",
                                        justifyContent: "center !important", // Center-aligns horizontally
                                        marginBottom: "20px !important",
                                        cursor: isTimerActive ? "not-allowed" : "pointer",
                                        color: isTimerActive ? "gray" : "#4a90e2",
                                    }}
                                >
                                    <Icon name="refresh" style={{ marginRight: "8px" }} />
                                    {isTimerActive ? <span>Try again in {formatTime()}</span> : <span>CAPTCHA required</span>}
                                </div>

                            </div>
                            <Button
                                disabled={!isValid}
                                loading={isSubmitting}
                                primary
                                content="Continue"
                                type="submit"
                                fluid
                                style={{
                                    padding: "12px",
                                    fontSize: "1.1em",
                                    fontWeight: "bold",
                                    borderRadius: "10px",
                                }}
                            />
                        </Form>
                    )}
                </Formik>
            }
        </Segment>
    );
});
