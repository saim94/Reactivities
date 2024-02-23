import { Placeholder, Comment, Segment, Item } from 'semantic-ui-react';

export default function CommentPlaceholderWithAvatar() {
    return (

        <Segment basic textAlign='center'>
            <Comment.Group>
                <Item>
                    <Comment>
                        <Comment.Avatar className='ui circular image' src="/assets/user.png" />
                        <Comment.Content>
                            <Placeholder>
                                <Placeholder.Header>
                                    <Placeholder.Line length='medium' />
                                    <Placeholder.Line length='very long' />
                                    <Placeholder.Line length='short' />
                                </Placeholder.Header>
                            </Placeholder>
                        </Comment.Content>
                    </Comment>
                </Item>
            </Comment.Group>
        </Segment>
    );
}
