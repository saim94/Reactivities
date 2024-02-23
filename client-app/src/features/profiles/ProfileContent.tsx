import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import { Button, Tab } from 'semantic-ui-react'
import { Profile } from '../../app/models/profile'
import { useStore } from '../../app/stores/Store'
import UserChats from '../chat/UserChats'
import ProfileAbout from './ProfileAbout'
import ProfileActivities from './ProfileActivities'
import ProfileFollowings from './ProfileFollowings'
import ProfilePhotos from './ProfilePhotos'

interface Props {
    profile: Profile
}

export default observer(function ProfileContent({ profile }: Props) {

    const { profileStore, conversationStore: { setOpenInbox } } = useStore();
    const { userStore: { user } } = useStore();
    const panes = [
        { menuItem: 'About', render: () => <ProfileAbout /> },
        { menuItem: 'Photos', render: () => <ProfilePhotos profile={profile} /> },
        { menuItem: 'Events', render: () => <ProfileActivities /> },
        { menuItem: 'Followers', render: () => <ProfileFollowings /> },
        { menuItem: 'Following', render: () => <ProfileFollowings /> },
        {
            menuItem: (
                <Button key='InboxChat' as={Link} to={profile.username !== user?.userName && `/inbox/${profile.id}/Chat`} style={{ 'textAlign': 'left', 'margin': '0px' }} className='item'>
                    {(profile.username === user?.userName) ? 'Chats' : 'Chat'} {profile.unreadMessageCount > 0 && <div className='badgeStyle'>{profile.unreadMessageCount}</div>}
                </Button>
            ), render: () => (profile.username === user?.userName) ? <UserChats /> : /*<Inbox2 userName={profile.username} />*/ <Link to={`/inbox/${profile.id}/Chat`} />
        }

    ]
    return (
        <Tab
            key='profileTabs'
            menu={{ fluid: true, vertical: true }}
            menuPosition='right'
            panes={panes}
            onTabChange={(_, data) => {
                profileStore.setActiveTab(data.activeIndex);
                //(data.activeIndex === 5) ? setOpenInbox(true) : setOpenInbox(false)
                setOpenInbox((data.activeIndex === 5) ? true : false);
            }}
        />
    )
})