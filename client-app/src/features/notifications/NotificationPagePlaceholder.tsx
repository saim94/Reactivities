import { Message, Placeholder } from "semantic-ui-react";

export default function NotificationPagePlaceholder() {
    return (
        <Message size='small'>
            <Message.Content>
                <Placeholder>
                    <Placeholder.Line length='medium' />
                </Placeholder>
                <div>
                    <Placeholder>
                        <Placeholder.Line length='very short' />
                    </Placeholder>
                </div>
            </Message.Content>
        </Message>
    )
}