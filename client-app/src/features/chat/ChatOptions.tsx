import { observer } from 'mobx-react-lite';
import { useState } from 'react'
import { Button, Confirm, Dropdown, Icon } from 'semantic-ui-react'
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useStore } from '../../app/stores/Store';

interface Props {
    conversationId: number;
    messagesCount: number | undefined;
}

export default observer(function DropDown({ conversationId, messagesCount }: Props) {

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const {
        conversationStore: { deleteConversation },
        commonStore: { setScrollBottom }
    } = useStore();

    const handleDelete = () => {
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!isSendingRequest) {
            setIsSendingRequest(true); // Set loading state to true
            deleteConversation(conversationId);
            setIsSendingRequest(false); // Set loading state back to false after request completes
            setConfirmOpen(false);
            setDeleteConfirmed(true);
            setScrollBottom(false);
        }

    };

    const handleCancel = () => {
        setConfirmOpen(false);
    };

    const options = [
        {
            key: 'archive',
            icon: 'archive',
            text: 'Archive',
            value: 'archive',
        },
        {
            key: 'delete',
            icon: 'delete',
            text: 'Delete',
            value: 'delete',
            onClick: handleDelete,
            disabled: isSendingRequest,
            confirm: {
                content: 'Are you sure you want to delete Conversation?',
                onCancel: handleCancel,
                onConfirm: handleConfirm,
            },
        },
        {
            key: 'block',
            icon: 'remove user',
            text: 'Block',
            value: 'block',
        },
    ];

    const dropdownTrigger = (
        <span>
            <Icon name='info circle' size='large' />
        </span>
    );

    if (isSendingRequest) <LoadingComponent />

    return (

        <Button.Group color='teal' floated='right' >
            <Dropdown
                disabled={(messagesCount === 0 || messagesCount === undefined) ? true : false}
                compact
                className='button icon no-caret'
                floating
                options={options}
                trigger={dropdownTrigger}
                basic
            />
            <Confirm
                centered
                size='mini'
                open={confirmOpen}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                cancelButton={<Button primary>No</Button>}
                confirmButton={<Button negative loading={isSendingRequest}>Yes</Button>}
                content='Are you sure you want to delete?'
                disabled={deleteConfirmed}
            />
        </Button.Group>
    )
})