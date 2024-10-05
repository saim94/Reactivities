import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Dropdown, Icon } from "semantic-ui-react";
import { AppNotification } from "../../models/appNotification";
import { useStore } from "../../stores/Store";

interface Prop {
	index: number
	notification: AppNotification
}

export default observer(function NotificationOptionsDropdown({ index, notification }: Prop) {

	const { notificationStore: { removeNotification, readNotification } } = useStore();

	const useNotificationDropdownState = (initialOpenIndex: number | null = null) => {
		const [openIndex, setOpenIndex] = useState(initialOpenIndex);

		const toggleDropdown = (index: number | null, e: React.SyntheticEvent<HTMLElement, Event>) => {
			setOpenIndex(index === openIndex ? null : index);
			e.stopPropagation();
		};

		return { openIndex, toggleDropdown };
	};

	const handleRemoveClick = (e: React.SyntheticEvent<HTMLElement, Event>, notificationId: string, index: number) => {
		toggleDropdown(index, e);
		e.stopPropagation();
		removeNotification(notificationId);
	}
	const handleReadClick = (e: React.SyntheticEvent<HTMLElement, Event>, notification: AppNotification, index: number) => {
		toggleDropdown(index, e);
		e.stopPropagation();
		if (!notification.isRead)
			readNotification(notification.notificationId);
	}

	const { openIndex, toggleDropdown } = useNotificationDropdownState();
	return (
		<Dropdown
			pointing='right'
			trigger={<span style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: 'xx-large' }} onClick={(e) => toggleDropdown(index, e)}>...</span>}
			icon={null}
			className='rightAlignedDropdown'
			open={openIndex === index}
			onClose={(e) => toggleDropdown(index, e)}
			onOpen={(e) => toggleDropdown(index, e)}
			inline
		>
			<Dropdown.Menu>
				<Dropdown.Item
					icon
					key="delete"
					onClick={(e) => handleRemoveClick(e, notification.notificationId, index)}
				>
					<Icon className='remove circle' />
					Delete
				</Dropdown.Item>
				<Dropdown.Item
					icon
					key="markRead"
					onClick={(e) => handleReadClick(e, notification, index)}
				>
					<Icon className='check circle' />
					Mark as Read
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	)
})