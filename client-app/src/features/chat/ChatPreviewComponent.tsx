import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Comment, Image } from 'semantic-ui-react';
import { Conversation } from "../../app/models/conversation";
import { store } from "../../app/stores/Store";
import { DateUtils1 } from "../../utils/dateUtils";

interface Props {
    conversation: Conversation
}

export default observer(function ChatPreviewComponent({ conversation }: Props) {

    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth < 991);
    const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 767);
    const otherUser = conversation.otherUser;
    const messages = conversation.messages.slice().sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    const message = messages[messages.length - 1];

    let truncatedContent = '';
    let toDisplay = '';
    let dateToString = '';
    let key = 0;

    if (message) {
        truncatedContent = message.content.length > 10 ? `${message.content.slice(0, 10)}...` : message.content;
        toDisplay = (message.sender.userName === store.userStore.user?.userName) ? 'You' : otherUser.displayName;
        dateToString = DateUtils1(message.sentAt);
        key = message.messageId;
    }

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            setIsLargeScreen(innerWidth >= 767 && innerWidth < 991); // Large screen if width is 992 or more
            setIsMediumScreen(windowWidth <= 767); // Medium screen if width is between 576 and 991
        };

        window.addEventListener('resize', handleResize);

        // Initial setup on component mount
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
            {isLargeScreen ? (
                <Image src={otherUser.image || '/assets/user.png'} alt='User' size='massive' fluid rounded circular />
            ) : isMediumScreen ? (
                <Image src={otherUser.image || '/assets/user.png'} alt='User' size='massive' fluid />
            ) : (
                <Comment.Group>
                    <Comment key={key}>
                        <Comment.Avatar className='ui circular image' src={otherUser.image || "/assets/user.png"} />
                        <Comment.Content>
                            <Comment.Author>{otherUser.displayName}</Comment.Author>
                            <Comment.Metadata style={{ wordWrap: 'break-word !important', cursor: 'pointer', display: 'block' }}>
                                {message && (
                                    <div style={{ width: '100%' }} className={(message.sender.userName === otherUser.userName && !message.isRead) ? 'chatPreviewMessage' : ''}>
                                        {`${toDisplay} : ${truncatedContent} - `}
                                    </div>
                                )}
                            </Comment.Metadata>
                            <Comment.Metadata style={{ display: 'block' }}>
                                {message && (
                                    <div>{dateToString}</div>
                                )}
                            </Comment.Metadata>

                        </Comment.Content>
                    </Comment>
                </Comment.Group>

            )}
        </div >
    )
})