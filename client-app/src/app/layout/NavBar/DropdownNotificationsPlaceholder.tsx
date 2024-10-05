import { Dropdown, Label, Message, Placeholder, Image } from "semantic-ui-react";

export default function DropdownNotificationsPlaceholder() {
    return (
        <Dropdown.Item>
            <Message floating>
                <div style={{ display: "flex", flexDirection: "column", width: '290px' }}>
                    <Label color='grey' horizontal pointing="below" basic style={{ marginRight: "15px" }}>
                        <Image avatar circular src='/assets/user.png' />
                        <Placeholder>
                            <Placeholder.Line length='short' />
                        </Placeholder>
                    </Label>
                    <Placeholder>
                        <Placeholder.Line length='medium' />
                    </Placeholder>
                </div>
            </Message>
        </Dropdown.Item>
    )
}