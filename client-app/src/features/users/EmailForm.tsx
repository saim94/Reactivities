import { AxiosError } from "axios";
import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import { Button, Header, Label } from "semantic-ui-react";
import agent from "../../app/api/agent";
import MyTextInput from "../../app/common/form/MyTextInput";
import * as Yup from 'yup'
import { useStore } from "../../app/stores/Store";

interface Props {
    action: string
    setIsAddingNew?: (value: boolean) => void
}

export default observer(function EmailForm({ action, setIsAddingNew }: Props) {

    const { userStore: { addEmail, setIsSubmitting, isSubmitting } } = useStore();


    const sendPasswordResetLink = async (email: string) => {
        await agent.Emails.sendPasswordResetLink(email).then(() => {
            toast.success("Password Reset email sent - please check your email");
        }).catch((error: AxiosError) => {
            console.log(error);
            toast.error(error.response?.data as string)
            throw error;
        });
    }

    const confirmEmailResend = async (email: string) => {
        await agent.Emails.resendEmailConfirm(email).then(() => {
            toast.success("Verification email resent - please check your email");
        }).catch((error: AxiosError) => {
            console.log(error);
            toast.error(error.response?.data as string)
            throw error;
        });
    }

    const handleAction = async (email: string) => {
        setIsSubmitting(true)
        try {
            if (action === 'Email not confirmed') {
                await confirmEmailResend(email);
            } else if (action === 'Invalid Password') {
                await sendPasswordResetLink(email);
            } else if (action === 'AddEmail') {
                await addEmail(email);
                if (setIsAddingNew) setIsAddingNew(false)
            }
            setIsSubmitting(false)
        } catch (error: unknown) {
            setIsSubmitting(false)
            // Handle Axios error type
            if ((error as AxiosError).response) {
                throw (error as AxiosError); // Re-throw AxiosError with response data
            } else {
                throw new Error("Unexpected error");
            }
        }
    };

    const emailValidationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address') // Ensures the email format is valid
            .required('Email is required'), // Ensures the email field is not empty
    });

    return (
        <Formik
            initialValues={{ email: '', error: null }}
            validationSchema={emailValidationSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, { setErrors }) => handleAction(values.email).catch((error) => {
                setErrors({ error: error.response.data })
            })}
        >
            {({ handleSubmit, errors }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Enter email address' color='teal' textAlign='center' />
                    <MyTextInput placeholder='Email' name='email' />
                    <ErrorMessage
                        name='error' render={() =>
                            <Label style={{ marginBottom: 10 }} basic color='red' content={errors.error} />}
                    />
                    <Button loading={isSubmitting} positive content={action === 'AddEmail' ? 'Add Email' : 'Send Email'} type='submit' className={setIsAddingNew ? '' : 'fluid'} />
                    {setIsAddingNew && <Button color='red' content='Cancel' onClick={() => setIsAddingNew(false)} />}
                </Form>
            )}
        </Formik>
    )
})