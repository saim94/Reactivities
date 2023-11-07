import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import { Button, Tab } from 'semantic-ui-react'
import { Profile } from '../../app/models/profile'
import { useStore } from '../../app/stores/Store'
import ProfileAbout from './ProfileAbout'
import ProfileActivities from './ProfileActivities'
import ProfileFollowings from './ProfileFollowings'
import ProfilePhotos from './ProfilePhotos'

interface Props {
    profile: Profile
}

export default observer(function ProfileContent({ profile }: Props) {

    const { profileStore, conversationStore: { setOpenInbox, getUnReadMessageCount } } = useStore();
    const { userStore: { user } } = useStore();
    const panes = [
        { menuItem: 'About', render: () => <ProfileAbout /> },
        { menuItem: 'Photos', render: () => <ProfilePhotos profile={profile} /> },
        { menuItem: 'Events', render: () => <ProfileActivities /> },
        { menuItem: 'Followers', render: () => <ProfileFollowings /> },
        { menuItem: 'Following', render: () => <ProfileFollowings /> },
        /*{ menuItem: 'Chat', render: () => <div> <Statistic label='followers' value={profile.followersCount} /> <Inbox /> </div> }*/
        {
            menuItem: (
                <Button as={Link} to={(profile?.username !== user?.userName) ? `/chat/${profile.username}` : '/inbox'} className="item" style={{ 'textAlign': 'left' }} key='chatTab' >
                    Chat
                    {getUnReadMessageCount > 0 && <div className='badgeStyle'>{getUnReadMessageCount}</div>}
                </Button>
            ),
            render: () => (profile?.username !== user?.userName) ? <Link to={`/chat/${profile.username}`} /> : <Link to={'/inbox'} />
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