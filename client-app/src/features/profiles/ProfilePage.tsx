import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStore } from "../../app/stores/Store";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

export default observer(function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { profileStore } = useStore();
    const { loadingProfile, loadProfile, profile, setActiveTab, resetProfileStore } = profileStore;
    const { conversationStore: { GetConversation, listConversations, resetConversationStore } } = useStore();
    const { userStore: { user } } = useStore();

    useEffect(() => {
        if (username && username !== profile?.username) {
            resetProfileStore();
            resetConversationStore();
            loadProfile(username)
        }
        return () => {
            setActiveTab(0);
        }

    }, [loadProfile, username, setActiveTab, profile?.username, profile, resetProfileStore, resetConversationStore]);

    useEffect(() => {
        return () => {
            
        }
    },[])

    useEffect(() => {
        if (username && username !== user?.userName) {
            GetConversation(username);
        }

        else if (username && username === user?.userName) {
            listConversations();
        }

    }, [username, GetConversation, listConversations, user?.userName])

    //useEffect(() => {
    //    resetProfileStore();
    //    resetConversationStore();
    //}, [])

    if (loadingProfile) return <LoadingComponent content='Loading Profile...' />

    return (
        <Grid>
            <Grid.Column width={16}>
                {profile &&
                    <>
                        <ProfileHeader profile={profile} />
                        <ProfileContent profile={profile} />
                    </>}
            </Grid.Column>
        </Grid>
    )
})