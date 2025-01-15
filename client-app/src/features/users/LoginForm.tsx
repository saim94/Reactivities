import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/Store";
import EmailForm from "./EmailForm";

export default observer(function LoginForm() {
    const { userStore, commonStore, modalStore } = useStore();

    //function handleConfirmEmailResend(email: string) {
    //    agent.Emails.resendEmailConfirm(email).then(() => {
    //        toast.success("Verification email resent - please check your email");
    //    }).catch(error => console.log(error));
    //}

    function openEmailForm(action: string) {
        modalStore.openModal(<EmailForm action={action} />)
    }

    function handleErrorContent(error: string | undefined) {
        if (error === 'Email not confirmed')
            return 'Resned link!'
        if (error === 'Invalid Password')
            return 'Forget password?'
    }

    return (
        <Formik
            initialValues={{ email: '', password: '', error: null }}
            onSubmit={(values, { setErrors }) => userStore.login(values).catch((error) =>
                setErrors({ error: error.response.data })).then(() => commonStore.getCount())}
        >
            {({ handleSubmit, isSubmitting, errors }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Login to Reactivities' color='teal' textAlign='center' />
                    <MyTextInput placeholder='Email' name='email' />
                    <MyTextInput placeholder='Password' name='password' type='password' />
                    <ErrorMessage
                        name='error' render={() =>
                            <Label style={{ marginBottom: 10 }} basic color='red' content={errors.error} />}
                    />

                    {errors.error && (errors.error === "Email not confirmed" || errors.error === "Invalid Password") && (
                        <Button
                            style={{ marginLeft: '76px' }}
                            primary
                            content={handleErrorContent(errors.error)}
                            compact
                            size='tiny'  // Smaller size for the button
                            onClick={() => openEmailForm(errors.error as string)}
                        />
                    )}
                    <Button loading={isSubmitting} positive content='Login' type='submit' fluid />
                </Form>
            )}
        </Formik>
    )
})