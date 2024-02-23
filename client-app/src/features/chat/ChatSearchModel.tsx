import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, Modal, Input, Dropdown, CommentGroup, Comment, CommentAvatar, CommentContent, CommentAuthor, CommentMetadata, Message, Menu } from "semantic-ui-react"
import { router } from "../../app/router/Routes";
import { useStore } from "../../app/stores/Store";

export default observer(function ChatSearchModel() {
    const [searchQuery, setSearchQuery] = useState('');
    //const [matchedUsers, setMatchedUsers] = useState([]);

    const { conversationStore: { Search }, commonStore: { matchedUsers, setMatchedUsers } } = useStore();

    const handleSearch = (searchQuery: string) => {
        if (searchQuery === "")
            setMatchedUsers([]);
        if (searchQuery !== "")
            Search(searchQuery);

        setSearchQuery(searchQuery);
    };

    useEffect(() => {
        return () => {
            setMatchedUsers([]);
        }
    }, [setMatchedUsers]);

    const handleNavigation = (userId: string) => {
        if (userId && userId !== '') {
            router.navigate(`/inbox/${userId}/Chat`)
        }
    }

    return (
        <Modal size='small' closeIcon trigger={<Button primary compact >New Message</Button>}>
            <Modal.Header style={{ textAlign: "center" }}>New Message</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <CommentGroup>
                        <Input
                            fluid
                            icon='users'
                            iconPosition='left'
                            placeholder='Search users...'
                            value={searchQuery}
                            onChange={(_, { value }) => handleSearch(value)}
                        />
                        <Dropdown
                            className='dropDownSearch'
                            onClose={() => { setSearchQuery(''); setMatchedUsers([]) }}
                            open
                            fluid
                            floating
                            icon={null}
                            value={undefined}
                            scrolling
                        >

                            <Dropdown.Menu>
                                {matchedUsers.map(user => (
                                    <Menu.Item key={user.id + '_MI'} onClick={() => handleNavigation(user.id)}>

                                        <CommentGroup key={user.id + '_CG'}>
                                            <Message>
                                                <Comment>
                                                    <CommentAvatar src={user?.image || '/assets/user.png'} />
                                                    <CommentContent>
                                                        <CommentAuthor as='a'>{user.displayName}</CommentAuthor>
                                                        <CommentMetadata>
                                                            <div>{user.username}</div>
                                                        </CommentMetadata>
                                                    </CommentContent>
                                                </Comment>
                                            </Message>
                                        </CommentGroup>

                                    </Menu.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </CommentGroup>
                </Modal.Description>
            </Modal.Content>
            <Modal.Content>
            </Modal.Content>
        </Modal>
    );
})