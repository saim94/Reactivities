import { Field, FieldProps, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Card, Image, Icon, Input, Loader } from "semantic-ui-react";
import { Conversation } from "../../app/models/conversation";
import { store } from "../../app/stores/Store";
import { DateUtils1 } from "../../utils/dateUtils";
import CardMessage from "./CardMessage";
import * as Yup from 'yup'
import { MessageData } from "../../app/models/messageData";
import { toast } from "react-toastify";

interface Props {
    conversation: Conversation;
    send: (messageData: MessageData) => void;
}

export default observer(function ChatCard({ conversation, send }: Props) {
    const otherUser = conversation.otherUser;
    const messages = conversation.messages.slice().sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    const message = messages[messages.length - 1];
    return (
        <Card raised>
            <Card.Content>
                <Card.Meta className="right floated">
                    {((message.sender.userName !== store.userStore.user?.userName) ? 'received ' : 'sent ') + DateUtils1(message.sentAt)}
                </Card.Meta>
                <Image
                    floated="left"
                    size="mini"
                    circular
                    src={otherUser.image || '/assets/user.png'}
                    avatar
                    as={Link}
                    to={`/profiles/${otherUser.userName}`}
                />
                {otherUser.displayName}
            </Card.Content>
            <Card.Content as={Link} to={`/inbox/${otherUser.id}/Chat`}>
                {/*{conversation.messages.slice(-1).map(message => (*/}
                <CardMessage message={message} />
                {/*))}*/}
            </Card.Content>
            <Card.Content extra>
                <Formik
                    key={`formik_${conversation.conversationId}`}
                    initialValues={new MessageData("", otherUser.userName, "")}
                    enableReinitialize
                    onSubmit={(values, { resetForm, setFieldValue }) => {
                        const property = `messageContent_${conversation.conversationId}`;
                        values.messageContent = values[property];
                        delete values[property];
                        send(values);
                        toast.success(`Replied to ${otherUser.displayName}`)
                        resetForm();
                        setFieldValue(property, '');
                        //console.log(values);
                    }}
                    validationSchema={Yup.object({
                        [`messageContent_${conversation.conversationId}`]: Yup.string().trim().required('Please type Your message to send')
                    })}
                >
                    {({ isSubmitting, isValid, handleSubmit }) => (
                        <Form key={`form_${conversation.conversationId}`} className='ui form'>
                            <Field name={`messageContent_${conversation.conversationId}`}>
                                {(props: FieldProps) => (
                                    <div style={{ position: 'relative' }}>
                                        <Loader active={isSubmitting} />
                                        <Input
                                            {...props.field}
                                            fluid
                                            placeholder="Type to send..."
                                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (e.key === 'Enter' && e.shiftKey) {
                                                    return;
                                                }
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    isValid && handleSubmit();
                                                }
                                            }}
                                            icon={<Icon name="send" />}
                                        />
                                        {/*<Button key={`Btn_${conversation.conversationId}`} size='mini' type="submit">Submit</Button>*/}
                                    </div>
                                )}
                            </Field>
                        </Form>
                    )}
                </Formik>
            </Card.Content>
        </Card>
    )
})