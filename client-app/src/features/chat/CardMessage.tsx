import { observer } from "mobx-react-lite";
import { Message, Container, Popup } from "semantic-ui-react";
import { ChatMessage } from "../../app/models/chatMessage";
import { store } from "../../app/stores/Store";

interface Props {
    message: ChatMessage;
}

export default observer(function CardMessage({ message }: Props) {

    const truncatedContent = message.content.length > 30 ? `${message.content.slice(0, 30)}...` : message.content;

    return (
        <Container>
            {message.content.length > 30 ? (
                <Popup
                    wide
                    hoverable
                    content={message.content}
                    position="top center"
                    trigger={
                        <Message
                            size="mini"
                            color={!message.isRead && message.sender.userName !== store.userStore.user?.userName ? 'red' : 'grey'}
                            style={{ wordWrap: 'break-word', cursor: 'pointer' }}
                        >
                            <Message.Header>
                                {(message.sender.userName === store.userStore.user?.userName) ? 'You' : message.sender.displayName}
                            </Message.Header>
                            <Message.Content>
                                {truncatedContent}
                            </Message.Content>
                        </Message>
                    }
                />
            ) : (
                <Message
                    size="mini"
                    color={!message.isRead && message.sender.userName !== store.userStore.user?.userName ? 'red' : 'grey'}
                    style={{ wordWrap: 'break-word', cursor: 'pointer' }}
                >
                    <Message.Header>
                        {(message.sender.userName === store.userStore.user?.userName) ? 'You' : message.sender.displayName}
                    </Message.Header>
                    <Message.Content>
                        {message.content}
                    </Message.Content>
                </Message>
            )}
        </Container>
    );


    //return (
    //    <Container>
    //        <Message
    //            size='mini'
    //            color={!message.isRead && message.sender.userName !== store.userStore.user?.userName ? 'red' : 'grey'}
    //            style={{ wordWrap: 'break-word' }}
    //        >
    //            <Message.Header>
    //                {(message.sender.userName === store.userStore.user?.userName) ? 'You' : message.sender.displayName}
    //            </Message.Header>
    //            <Message.Content>
    //                {message.content}
    //            </Message.Content>
    //        </Message>
    //        <Modal open={showFullMessage} onClose={handleClose} size='tiny'>
    //            <Modal.Header>
    //                {(message.sender.userName === store.userStore.user?.userName) ? 'You' : message.sender.displayName}
    //            </Modal.Header>
    //            <Modal.Content>
    //                <p>{message.content}</p>
    //            </Modal.Content>
    //            <Modal.Actions>
    //                <Button onClick={handleClose} primary>
    //                    Close
    //                </Button>
    //            </Modal.Actions>
    //        </Modal>
    //    </Container>
    //)
})