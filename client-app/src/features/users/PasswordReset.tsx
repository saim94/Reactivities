import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Header, Icon, Label, Segment } from 'semantic-ui-react';
import MyTextInput from '../../app/common/form/MyTextInput';
import { observer } from 'mobx-react-lite';
import useQuery from '../../app/util/hooks';
import { useStore } from '../../app/stores/Store';
import { useState } from 'react';

export default observer(function PasswordReset() {

    const { userStore: { resetPassword, changePassword, isLoggedIn }, modalStore: { closeModal } } = useStore();

    const [submit, setSubmit] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    //const [timer, setTimer] = useState<number>(10);

    //useEffect(() => {
    //    if (isSuccess) {
    //        const countdown = setInterval(() => {
    //            setTimer((prev) => {
    //                if (prev === 1) {
    //                    window.close();
    //                    return prev;
    //                }
    //                return prev - 1;
    //            });
    //        }, 1000);
    //        return () => clearInterval(countdown);
    //    }
    //}, [isSuccess]);

    const email = useQuery().get('email') as string;
    const token = useQuery().get('token') as string;

    type Values = {
        password: string;
        confirmPassword: string;
        currentPassword: string;
        error: string | null;
    };

    type SetErrors = (errors: { error: string }) => void;

    const handleSuccess = (message: string) => {
        if (message) {
            setIsSuccess(true);
            setSuccessMessage(message);
            closeModal(); // Only close the modal if there’s a success message
        }
        setSubmit(false);
    };

    // Failure handler
    const handleFailure = (error: string, setErrors: SetErrors) => {
        setErrors({ error });
        setSubmit(false);
    };

    // Handle change password
    const handleChangePassword = async (values: Values, setErrors: SetErrors) => {
        setSubmit(true);
        try {
            const message = await changePassword({
                currentPassword: values.currentPassword,
                password: values.password,
                email,
                token: ''
            });
            handleSuccess(message);
        } catch (error) {
            handleFailure(error as string, setErrors);
        }
    };

    // Handle reset password
    const handleResetPassword = async (values: Values, setErrors: SetErrors) => {
        setSubmit(true);
        try {
            const message = await resetPassword({
                currentPassword: '',
                password: values.password,
                email,
                token
            });
            handleSuccess(message);
        } catch (error) {
            handleFailure(error as string, setErrors);
        }
    };

    // onSubmit handler
    const onSubmit = (values: Values, { setErrors }: { setErrors: SetErrors }) => {
        setSubmit(true);
        if (isLoggedIn) {
            handleChangePassword(values, setErrors);
        } else {
            handleResetPassword(values, setErrors);
        }
    };
    //const Status = {
    //    Verifying: 'Verifying',
    //    Failed: 'Failed',
    //    Success: 'Success'
    //}

    //const [status, setStatus] = useState(Status.Verifying);

    const getValidationSchema = (isLoggedIn: boolean) => {
        const validationShape: Record<string, Yup.Schema<unknown>> = {
            password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters long')
                .max(15, 'Password must not exceed 15 characters')
                .matches(
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{6,15}$/,
                    'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, ^, &, +, =).'
                ),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
                .required('Confirm password is required'),
        };

        // Conditionally add currentPassword field
        if (isLoggedIn) {
            validationShape.currentPassword = Yup.string().required('Current password is required');
        } else {
            validationShape.currentPassword = Yup.string().notRequired();
        }

        return Yup.object().shape(validationShape);
    };


    //useEffect(() => {
    //    agent.Account.passwordReset(email, token).then(() => {
    //        setStatus(Status.Success)
    //    }).catch(() => {
    //        setStatus(Status.Failed)
    //    })
    //}, [Status.Success, Status.Failed, token, email]);

    function getBody() {
        //switch (status) {
        //    case Status.Verifying:
        //        return <p>Verifying...</p>;
        //    case Status.Failed:
        //        return (
        //            <div>
        //                <p>Failed. You can try resending the password reset link to your email</p>
        //                <Button primary onClick={handlePasswordResetEmailResend} size='huge' content='Resend Email' />
        //            </div>
        //        );
        //    case Status.Success:

        return (
            <Segment size='huge'>
                {isSuccess ? (
                    <div>
                        <Header as='h2' color='green'>Password Changed Successfully</Header>
                        <p>
                            Your password has been changed successfully. Please close this tab and login with your new password.
                        </p>
                        {/*<p>*/}
                        {/*    This tab will close automatically in {timer} seconds.*/}
                        {/*</p>*/}
                    </div>
                ) : (
                    <div>
                        <p>Please enter new Password</p>
                        <Formik
                            initialValues={{ password: '', confirmPassword: '', currentPassword: '', error: null }}
                            validationSchema={getValidationSchema}
                            onSubmit={onSubmit}
                        >
                            {({ handleSubmit, errors, isValid }) => (
                                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                                    <Header as='h2' content='Enter new password' color='teal' textAlign='center' />
                                    {isLoggedIn && <MyTextInput placeholder='Current Password' name='currentPassword' type='password' />}
                                    <MyTextInput placeholder='New Password' name='password' type='password' />
                                    <MyTextInput placeholder='Confirm Password' name='confirmPassword' type='password' />

                                    {isSuccess && (
                                        <Label style={{ marginBottom: 10 }} basic color='green' content={successMessage + " Close the page and login"} />
                                    )}
                                    <ErrorMessage
                                        name='error' render={() =>
                                            <Label style={{ marginBottom: 10 }} basic color='red' content={errors.error} />}
                                    />
                                    <Button disabled={!isValid && !isSuccess} loading={submit} positive content='Change Password' type='submit' fluid />
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
            </Segment>
        );
        //}
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header>
                <Icon name='envelope' />
                Password reset
            </Header>
            <Segment.Inline>
                {getBody()}
            </Segment.Inline>
        </Segment>
    );
})

