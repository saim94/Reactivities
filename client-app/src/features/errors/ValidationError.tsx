import { Message } from "semantic-ui-react"

interface Props {
    errors: { [key: string]: string };
}

export default function ValidationError({ errors }: Props) {
    return (
        <Message error>
            {Object.values(errors).map((err, i) => (
                <Message.Item key={i}>{err}</Message.Item>
            ))}
        </Message>
    )
}