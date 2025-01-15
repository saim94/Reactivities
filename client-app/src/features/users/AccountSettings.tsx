import { observer } from 'mobx-react-lite';
import { Card, Divider, Header, Icon, Segment } from 'semantic-ui-react';
import { useEffect } from 'react';
import { useStore } from '../../app/stores/Store';
import PasswordReset from './PasswordReset';
import UserEmails from './UserEmails';
import VerifyToken from './VerifyToken';
import UserPhones from './UserPhones';

export default observer(function AccountSettings() {

    const { modalStore: { openModal, openModal2 }, userStore: { getUserFromStore } } = useStore();

    function handleChangePassword() {
        openModal(<PasswordReset />);
        openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} />);
    }

    function handleEmails() {
        openModal(<UserEmails />, 'tiny');
    }

    function handlePhoneNumbers() {
        openModal(<UserPhones />, 'tiny');
    }

    useEffect(() => {
        // Scroll to just above the bottom
        const bottomOffset = 50; // Adjust as needed
        window.scrollTo({
            top: document.body.scrollHeight - bottomOffset,
            behavior: 'smooth',
        });
    }, []); // Runs once after the component mounts

    return (
        <Segment raised padded="very" style={{ maxWidth: "800px", margin: "0 auto", borderRadius: "10px" }}>
            <Header as="h2" icon textAlign="center" color="teal">
                <Icon name="settings" />
                Account Settings
                <Header.Subheader>Manage your account preferences and details</Header.Subheader>
            </Header>
            <Divider hidden />
            <Card.Group itemsPerRow={1} stackable>
                <Card fluid color="blue" onClick={handleChangePassword} link>
                    <Card.Content>
                        <Card.Header>
                            <Icon name="lock" size="large" color="blue" /> Change Password
                        </Card.Header>
                        <Card.Meta>Update your account password</Card.Meta>
                    </Card.Content>
                </Card>

                <Card fluid color="teal" onClick={handleEmails} link>
                    <Card.Content>
                        <Card.Header>
                            <Icon name="mail" size="large" color="teal" /> Emails
                        </Card.Header>
                        <Card.Meta>Manage your associated email addresses</Card.Meta>
                    </Card.Content>
                </Card>

                <Card fluid color="orange" onClick={handlePhoneNumbers} link>
                    <Card.Content>
                        <Card.Header>
                            <Icon name="phone" size="large" color="orange" /> Phone Numbers
                        </Card.Header>
                        <Card.Meta>Add or update your phone numbers</Card.Meta>
                    </Card.Content>
                </Card>
            </Card.Group>
        </Segment>
    );
});
