import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import agent from "../../app/api/agent";
import { useStore } from "../../app/stores/Store";
import useQuery from "../../app/util/hooks";
import LoginForm from "./LoginForm";

export default function ConfirmEmail() {
    const { modalStore } = useStore()
    const email = useQuery().get('email') as string;
    const token = useQuery().get('token') as string;

    const Status = {
        Verifying: 'Verifying',
        Failed: 'Failed',
        Success: 'Success'
    }

    const [status, setStatus] = useState(Status.Verifying);

    function handleConfirmEmailResend() {
        agent.Emails.resendEmailConfirm(email).then(() => {
            toast.success("Verification email resent - please check your email");
        }).catch(error => console.log(error));
    }

    useEffect(() => {
        agent.Emails.verifyEmail(email, token).then(() => {
            setStatus(Status.Success)
        }).catch(() => {
            setStatus(Status.Failed)
        })
    }, [Status.Success, Status.Failed, token, email]);

    function getBody() {
        switch (status) {
            case Status.Verifying:
                return <p>Verifying...</p>;
            case Status.Failed:
                return (
                    <div>
                        <p>Verification failed. You can try resending the Verify link to your email</p>
                        <Button primary onClick={handleConfirmEmailResend} size='huge' content='Resend Email' />
                    </div>
                );
            case Status.Success:
                return (
                    <div>
                        <p>Email has been verified - you can now login</p>
                        <Button primary onClick={() => modalStore.openModal(<LoginForm />)} size='huge' content='Login' />
                    </div>
                );
        }
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header>
                <Icon name='envelope' />
                Email verification
            </Header>
            <Segment.Inline>
                {getBody()}
            </Segment.Inline>
        </Segment>
    )
}