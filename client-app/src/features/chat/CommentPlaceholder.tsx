import { Placeholder, Comment } from 'semantic-ui-react';

export default function CommentPlaceholder() {
    return (
        <Comment.Group>
            <Comment>
                <Comment.Avatar as={Placeholder} />
                <Comment.Content>
                    <Placeholder fluid>
                        <Placeholder.Header>
                            <Placeholder.Line />
                            <Placeholder.Line />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line length='medium' />
                        </Placeholder.Paragraph>
                    </Placeholder>
                </Comment.Content>
            </Comment>
        </Comment.Group>
    );
}
