import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Button, Comment, Confirm } from 'semantic-ui-react';
import { Message } from '../../app/models/message';
import format from 'date-fns/esm/format';
import { useStore } from '../../app/stores/Store';

interface Props {
    message: Message
}

export default observer(function MessageComponent({ message }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const { conversationStore, userStore: { user } } = useStore();
    const [method, setMethod] = useState('');
    //const method: string = "";
    const content = user?.userName === message.sender.userName ? 'Unsend' : 'Delete';
    const handleDelete = () => {
        setMethod(content);
        console.log('Delete Request');
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setIsSendingRequest(true);
        await conversationStore.deleteMessage(message.messageId, method);
        setConfirmOpen(false);
        setIsSendingRequest(false)
    };

    const handleCancel = () => {
        setConfirmOpen(false);
    };
    return (

        <Comment key={message.messageId} >
            <Button
                circular compact size='mini'
                icon={user?.userName === message.sender.userName ? 'undo' : 'delete'}
                negative floated='right'
                onClick={() => { handleDelete() }}
            />
            <Confirm
                centered
                size='mini'
                open={confirmOpen}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                cancelButton={<Button primary>No</Button>}
                confirmButton={<Button negative loading={isSendingRequest}>Yes</Button>}
                content={'Are you sure you want to ' + content + ' Message?'}
            />
            <Comment.Avatar src={message.sender.image || "/assets/user.png"} />
            <Comment.Content>
                <Comment.Author as="a">
                    {user!.userName !== message.sender.userName ? message.sender.displayName : 'Me'}
                </Comment.Author>
                {/*<Comment.Metadata>*/}
                {/*    <div>{format(message.sentAt, 'yyyy-MM-dd HH:mm:ss')}</div>*/}
                {/*</Comment.Metadata>*/}
                <Comment.Text >{message.content}</Comment.Text>
            </Comment.Content>
            <Comment.Content>
                <div style={{ float: 'right' }} className='metadata'>
                    {user!.userName !== message.sender.userName ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Received </span>
                    ) : message.isRead ? (
                        <span style={{ color: 'blue', fontWeight: 'bold' }}>Read </span>
                    ) : (
                        <span>Sent </span>
                    )}
                    <span>{format(message.sentAt, 'hh:mm bb')}</span>
                </div>
            </Comment.Content>
        </Comment>
    )
})