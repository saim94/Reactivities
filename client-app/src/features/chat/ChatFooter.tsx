import { Field, FieldProps, Form, Formik } from "formik";
import React from "react";
import { Button, Loader, TextArea } from "semantic-ui-react";
import * as Yup from 'yup';
import { MessageData } from "../../app/models/messageData";
import { useStore } from "../../app/stores/Store";

interface Props {
    username: string;
    send: (messageDate: MessageData) => void;
}

export default function ChatFooter({ username, send }: Props) {

    const { commonStore, conversationStore } = useStore();

    const { setSyncPages, setScrollBottom } = commonStore;

    const { selectedConversation } = conversationStore;
    username = (selectedConversation) ? selectedConversation?.otherUser.userName : '';
    return (
        <Formik
            initialValues={new MessageData("", username, "")}
            onSubmit={(values, { resetForm }) => {
                //console.log(values)
                //setFirstUnread_MessageIdCalBack(0);
                //setUnReadMessageCountCalBack(0);
                //setFirstUnread_MessageId(0);
                //setUnReadMessageCount(0);
                if (selectedConversation) {
                    selectedConversation.firstUnreadMessageId = 0;
                    selectedConversation.unreadMessageCount = 0;
                }
                resetForm();
                send(values);
                setScrollBottom(true);
                setSyncPages(true);
            }}
            validationSchema={Yup.object({
                messageContent: Yup.string().trim().required('Please type Your message to send')
            })}
        >
            {({ isSubmitting, isValid, dirty, handleSubmit }) => (
                <Form className='ui form'>
                    <Field name='messageContent'>
                        {(props: FieldProps) => (
                            <div style={{ position: 'relative' }}>
                                <Loader active={isSubmitting} />
                                <TextArea
                                    placeholder='Enter your reply(Enter to submit, SHIFT + enter for new line )'
                                    rows={2}
                                    {...props.field}
                                    onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                        if (e.key === 'Enter' && e.shiftKey) {
                                            return;
                                        }
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            isValid && handleSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    style={{ marginTop: '0.5px' }}
                                    primary
                                    type='submit'
                                    loading={isSubmitting}
                                    content='Send'
                                    disabled={!isValid || !dirty}
                                    icon='send'
                                    labelPosition="left"
                                />
                            </div>
                        )}
                    </Field>
                </Form>
            )}
        </Formik>
    )
}