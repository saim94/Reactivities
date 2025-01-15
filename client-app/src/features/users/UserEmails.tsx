import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, Card, Divider, Header, Icon, Label, Segment } from "semantic-ui-react";

import { useStore } from "../../app/stores/Store";
import Toast from "../../utils/Toast";
import EmailForm from "./EmailForm";
import VerifyToken from "./VerifyToken";

export default observer(function UserEmails() {
    const [isAddingNew, setIsAddingNew] = useState(false);

    const { userStore: { user, getUserFromStore, setPrimary, deleteEmail, setVerification }, modalStore: { openModal2, closeModal2 } } = useStore();

    useEffect(() => {
        console.log("Emails changed");
    }, [user?.emails]);

    const handleMakePrimary = async (emailId: number) => {
        try {
            await setPrimary(emailId); // Wait for the API call to complete
            Toast.show('success', 'Email has been successfully set as primary.');
        } catch (error) {
            console.error("Failed to set email as primary:", error);
            Toast.show('error', 'An error occurred while setting the email as primary. Please try again.');
        }
    };

    const handleDeleteEmail = async (emailId: number) => {
        try {
            // Make the API call to delete the email
            await deleteEmail(emailId);
            Toast.show('success', 'Email has been successfully deleted.');
        } catch (error) {
            console.error("Failed to delete email: ", error);
            Toast.show('error', 'An error occurred while deleting email. Please try again.');
        }
    };


    const handleVerifyEmail = async (emailId: number) => {
        try {
            await setVerification(emailId)
            Toast.show('success', 'email has been successfully verified.');
        } catch (error) {
            console.error("Failed to verify email: ", error);
            Toast.show('error', 'An error occurred while verifying email. Please try again.');
        }
    };

    const confirmMakePrimary = (email: string, emailId: number) => {
        openModal2(
            <Segment>
                <Header content="Confirm Make Primary" />
                <p>
                    Are you sure you want to make <strong>{email}</strong> your primary email? Your current primary
                    email will be unmarked as primary.
                </p>
                <Button
                    color="blue"
                    onClick={() => {
                        closeModal2();
                        openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} onSuccess={() => handleMakePrimary(emailId)} />)
                    }}
                >
                    Confirm
                </Button>
                <Button color="grey" onClick={closeModal2}>
                    Cancel
                </Button>
            </Segment>
        );
    };

    const confirmDeleteEmail = (email: string, emailId: number) => {
        openModal2(
            <Segment>
                <Header content="Confirm Delete Email" />
                <p>Are you sure you want to delete <strong>{email}</strong>? This action cannot be undone.</p>
                <Button
                    color="red"
                    onClick={() => {
                        closeModal2();
                        openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} onSuccess={() => handleDeleteEmail(emailId)} />)
                    }}
                >
                    Confirm
                </Button>
                <Button color="grey" onClick={closeModal2}>
                    Cancel
                </Button>
            </Segment>
        );
    };

    const confirmVerifyEmail = (email: string, emailId: number) => {

        openModal2(
            <Segment>
                <Header content="Confirm Email Verification" />
                <p>
                    Are you sure you want to send a verification code to <strong>{email}</strong>?
                </p>
                <Button
                    color="orange"
                    onClick={() => {
                        closeModal2();
                        openModal2(<VerifyToken email={email} onSuccess={() => handleVerifyEmail(emailId)} />)
                    }}
                >
                    Confirm
                </Button>
                <Button color="grey" onClick={closeModal2}>
                    Cancel
                </Button>
            </Segment>
        );
    };

    const addNewEmail = () => {
        setIsAddingNew(true);
        openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} />)
        console.log("Adding a new email");
    };

    return (
        <Segment raised padded="very" style={{ maxWidth: "800px", margin: "0 auto", borderRadius: "10px" }}>
            <Header as="h2" icon textAlign="center" color="teal">
                <Icon name="mail" />
                Email Addresses
                <Header.Subheader>Manage the email addresses associated with your account</Header.Subheader>
            </Header>
            <Divider hidden />
            <Card.Group itemsPerRow={1} stackable>
                {user!.emails.map((email) => (
                    <Card key={email.id} fluid color={email.isPrimary ? "green" : "blue"}>
                        <Card.Content>
                            <Icon name="envelope" size="large" color="teal" style={{ float: "left", marginRight: "10px" }} />
                            <Card.Header style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#333" }}>
                                {email.email}
                                {!email.isPrimary && (
                                    <Label
                                        as="a"
                                        attached="top right"
                                        icon="trash"
                                        color="red"
                                        onClick={() => confirmDeleteEmail(email.email, email.id)}
                                        style={{ cursor: "pointer" }}
                                    />
                                )}
                            </Card.Header>
                            <Card.Meta>
                                {email.isPrimary ? (
                                    <Label color="green" basic   style={{ marginTop: "10px" }}>
                                        Primary <Icon className="key" color="green" />
                                    </Label>
                                ) : (
                                    email.isVerified && (
                                        <Label
                                            as="a"
                                             
                                            color="blue"
                                            onClick={() => confirmMakePrimary(email.email, email.id)}
                                            style={{ marginTop: "10px", cursor: "pointer" }}
                                        >
                                            Make Primary
                                        </Label>
                                    )
                                )}
                                {email.isVerified ? (
                                    <Label color="blue" basic   style={{ marginLeft: "10px" }}>
                                        Verified <Icon className="check circle" color="blue" />
                                    </Label>
                                ) : (
                                    <Label
                                        as="a"
                                         
                                        color="orange"
                                        onClick={() => confirmVerifyEmail(email.email, email.id)}
                                        style={{ marginLeft: "10px", cursor: "pointer" }}
                                    >
                                        Verify
                                    </Label>
                                )}
                            </Card.Meta>
                        </Card.Content>
                    </Card>
                ))}
            </Card.Group>
            <Divider hidden />
            <div style={{ textAlign: "center" }}>
                {!isAddingNew && (
                    <Button color="teal" icon labelPosition="left" onClick={addNewEmail}>
                        <Icon name="add" />
                        Add New Email
                    </Button>
                )}
                {isAddingNew && <EmailForm action="AddEmail" setIsAddingNew={setIsAddingNew} />}
            </div>
        </Segment>
    );
});
