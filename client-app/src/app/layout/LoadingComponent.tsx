import { Dimmer, Image, Loader, Segment } from 'semantic-ui-react';

interface Props {
    inverted?: boolean,
    content?: string
}

export default function LoadingComponent({ inverted = true, content = "Loading..." }: Props) {
    return (
        <Dimmer active={true} inverted={inverted} page>
            <Segment raised secondary>
                <Loader content={content} />
                <Image bordered circular src='/assets/logo.png' />
            </Segment>
        </Dimmer>
    )
}