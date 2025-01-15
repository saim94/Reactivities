import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, Card, Divider, Header, Icon, Label, Segment } from "semantic-ui-react";
import { initializeFirebase } from "../../app/firebase/firebaseConfig";
import { useStore } from "../../app/stores/Store";
import Toast from "../../utils/Toast";
import PhoneNumberForm from "./PhoneNumberForm";
import VerifyToken from "./VerifyToken";

export default observer(function UserPhones() {
    const [isAddingNew, setIsAddingNew] = useState(false);

    const {
        userStore: { user, getUserFromStore, setPrimaryPhone, deletePhone, setPhoneVerification },
        modalStore: { openModal2, closeModal2 },
        commonStore: { getFirebaseConfig }
    } = useStore();

    useEffect(() => {
        const initialize = async () => {
            try {
                const firebaseConfig = await getFirebaseConfig();
                initializeFirebase(firebaseConfig);
            } catch (error) {
                console.error("Error initializing Firebase:", error);
            }
        };

        initialize();
    }, [getFirebaseConfig]);

    const handleMakePrimary = async (phoneId: number) => {
        try {
            await setPrimaryPhone(phoneId);
            Toast.show('success', 'Phone number has been successfully set as primary.');
        } catch (error) {
            console.error("Failed to set phone number as primary:", error);
            Toast.show('error', 'An error occurred while setting the phone number as primary. Please try again.');
        }
    };

    const handleDeletePhone = async (phoneId: number) => {
        try {
            await deletePhone(phoneId);
            Toast.show('success', 'Phone number has been successfully deleted.');
        } catch (error) {
            console.error("Failed to delete phone number: ", error);
            Toast.show('error', 'An error occurred while deleting the phone number. Please try again.');
        }
    };

    const handleVerifyPhone = async (phoneId: number) => {
        try {
            await setPhoneVerification(phoneId);
            Toast.show('success', 'Phone number has been successfully verified.');
        } catch (error) {
            console.error("Failed to verify phone number: ", error);
            Toast.show('error', 'An error occurred while verifying the phone number. Please try again.');
        }
    };

    const confirmMakePrimary = (phone: string, phoneId: number) => {
        openModal2(
            <Segment>
                <Header content="Confirm Make Primary" />
                <p>
                    Are you sure you want to make <strong>{phone}</strong> your primary phone number? Your current primary phone number will be unmarked as primary.
                </p>
                <Button
                    color="blue"
                    onClick={() => {
                        closeModal2();
                        if (getUserFromStore().phones.length > 0 && getUserFromStore().getPrimaryPhone())
                            openModal2(<VerifyToken phoneNumber={getUserFromStore().getPrimaryPhone()?.number as string} onSuccess={() => handleMakePrimary(phoneId)} />)
                        else openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} onSuccess={() => handleMakePrimary(phoneId)} />)
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

    const confirmDeletePhone = (phone: string, phoneId: number) => {
        openModal2(
            <Segment>
                <Header content="Confirm Delete Phone" />
                <p>Are you sure you want to delete <strong>{phone}</strong>? This action cannot be undone.</p>
                <Button
                    color="red"
                    onClick={() => {
                        closeModal2();
                        if (getUserFromStore().phones.length > 0 && getUserFromStore().getPrimaryPhone())
                            openModal2(<VerifyToken phoneNumber={getUserFromStore().getPrimaryPhone()?.number as string} onSuccess={() => handleDeletePhone(phoneId)} />)
                        else openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} onSuccess={() => handleDeletePhone(phoneId)} />)
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

    const confirmVerifyPhone = (phone: string, phoneId: number) => {
        openModal2(
            <Segment>
                <Header content="Confirm Phone Verification" />
                <p>
                    Are you sure you want to send a verification code to <strong>{phone}</strong>?
                </p>
                <Button
                    color="orange"
                    onClick={() => {
                        closeModal2();
                        openModal2(<VerifyToken phoneNumber={phone} onSuccess={() => handleVerifyPhone(phoneId)} />)
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

    const addNewPhone = () => {
        setIsAddingNew(true);
        if (getUserFromStore().phones.length > 0 && getUserFromStore().getPrimaryPhone())
            openModal2(<VerifyToken phoneNumber={getUserFromStore().getPrimaryPhone()?.number as string} />)
        else openModal2(<VerifyToken email={getUserFromStore().getPrimaryEmail()?.email as string} />)
        console.log("Adding a new phone number");
    };

    return (
        <Segment raised padded="very" style={{ maxWidth: "800px", margin: "0 auto", borderRadius: "10px" }}>
            <Header as="h2" icon textAlign="center" color="teal">
                <Icon name="phone" />
                Phone Numbers
                <Header.Subheader>Manage the phone numbers associated with your account</Header.Subheader>
            </Header>
            <Divider hidden />
            <Card.Group itemsPerRow={1} stackable>
                {user!.phones.map((phone) => (
                    <Card key={phone.id} fluid color={phone.isPrimary ? "green" : "blue"}>
                        <Card.Content>
                            <Icon name="phone" size="large" color="teal" style={{ float: "left", marginRight: "10px" }} />
                            <Card.Header style={{ fontWeight: "bold", fontSize: "1.3rem", color: "#333" }}>
                                {phone.number}
                                {!phone.isPrimary && (
                                    <Label
                                        as="a"
                                        attached="top right"
                                        icon="trash"
                                        color="red"
                                        onClick={() => confirmDeletePhone(phone.number, phone.id)}
                                        style={{ cursor: "pointer" }}
                                    />
                                )}
                            </Card.Header>
                            <Card.Meta>
                                {phone.isPrimary ? (
                                    <Label color="green" basic style={{ marginTop: "10px" }}>
                                        Primary <Icon className="key" color="green" />
                                    </Label>
                                ) : (
                                    phone.isVerified && (
                                        <Label
                                            as="a"
                                            color="blue"
                                            onClick={() => confirmMakePrimary(phone.number, phone.id)}
                                            style={{ marginTop: "10px", cursor: "pointer" }}
                                        >
                                            Make Primary
                                        </Label>
                                    )
                                )}
                                {phone.isVerified ? (
                                    <Label color="blue" basic style={{ marginLeft: "10px" }}>
                                        Verified <Icon className="check circle" color="blue" />
                                    </Label>
                                ) : (
                                    <Label
                                        as="a"
                                        color="orange"
                                        onClick={() => confirmVerifyPhone(phone.number, phone.id)}
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
                    <Button color="teal" icon labelPosition="left" onClick={addNewPhone}>
                        <Icon name="add" />
                        Add New Phone Number
                    </Button>
                )}
                {isAddingNew && <PhoneNumberForm action="AddPhone" setIsAddingNew={setIsAddingNew} />}
            </div>
        </Segment>
    );
});
