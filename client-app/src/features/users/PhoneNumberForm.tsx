import { AxiosError } from "axios";
import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import { Button, Header, Label } from "semantic-ui-react";
import agent from "../../app/api/agent";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as Yup from "yup";
import { useStore } from "../../app/stores/Store";
import "../../app/layout/PhoneNumberForm.css"

interface Props {
    action: string;
    setIsAddingNew?: (value: boolean) => void;
}

export default observer(function PhoneNumberForm({ action, setIsAddingNew }: Props) {
    const { userStore: { addPhone, setIsSubmitting, isSubmitting } } = useStore();

    const sendVerificationLink = async (phone: string) => {
        await agent.Phones.sendVerificationCode(phone).then(() => {
            toast.success("Verification code sent - please check your phone");
        }).catch((error: AxiosError) => {
            console.log(error);
            toast.error(error.response?.data as string);
            throw error;
        });
    };

    const handleAction = async (phone: string) => {
        console.log(phone);
        if (!phone.includes("+")) phone = "+" + phone;
        console.log(phone);
        setIsSubmitting(true);
        try {
            if (action === "AddPhone") {
                await addPhone(phone);
                if (setIsAddingNew) setIsAddingNew(false);
            } else if (action === "SendVerification") {
                await sendVerificationLink(phone);
            }
            setIsSubmitting(false);
        } catch (error: unknown) {
            setIsSubmitting(false);
            if ((error as AxiosError).response) {
                throw error as AxiosError; // Re-throw AxiosError with response data
            } else {
                throw new Error("Unexpected error");
            }
        }
    };

    const phoneValidationSchema = Yup.object({
        phone: Yup.string()
            .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number") // Validates E.164 format
            .required("Phone number is required"), // Ensures the phone field is not empty
    });

    return (
        <Formik
            initialValues={{ phone: "", error: null }}
            validationSchema={phoneValidationSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, { setErrors }) =>
                handleAction(values.phone).catch((error) => {
                    setErrors({ error: error.response?.data });
                })
            }
        >
            {({ handleSubmit, setFieldValue, values, errors }) => (
                <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                    <Header as="h2" content="Enter phone number" color="teal" textAlign="center" />
                    <div style={{ marginBottom: "1em" }} className="custom-phone-input">
                        <PhoneInput
                            country={"us"} // Default country
                            value={values.phone}
                            onChange={(value: string) => setFieldValue("phone", value)} // Update Formik value
                            inputProps={{
                                name: "phone",
                                required: true,
                                autoFocus: true,
                            }}
                        />
                    </div>

                    {/* Error Display */}
                    <ErrorMessage
                        name="error"
                        render={() => (
                            <Label style={{ marginBottom: 10 }} basic color="red" content={errors.error} />
                        )}
                    />

                    {/* Submit Button */}
                    <Button
                        loading={isSubmitting}
                        positive
                        content={action === "AddPhone" ? "Add Phone" : "Send Verification"}
                        type="submit"
                        className={setIsAddingNew ? "" : "fluid"}
                    />

                    {/* Cancel Button (if applicable) */}
                    {setIsAddingNew && (
                        <Button color="red" content="Cancel" onClick={() => setIsAddingNew(false)} />
                    )}
                </Form>
            )}
        </Formik>
    );
});
