import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Button, Grid, Header, Tab } from 'semantic-ui-react';
import { useStore } from '../../app/stores/Store'
import AccountSettings from '../users/AccountSettings';
import ProfileEditForm from './ProfileEditForm';

export default observer(function ProfileAbout() {

    const { profileStore } = useStore();
    const { isCurrentUser, profile } = profileStore;
    const [editMode, setEditMode] = useState(false);
    const [settingMode, setSettingMode] = useState(false);

    function handleProfileEdit(value: boolean) {
        setEditMode(value)
    }
    function handleAccountSetting(value: boolean) {
        setSettingMode(value)
    }

    return (
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16}>
                    <Header floated='left' icon='user' content={`About ${profile?.displayName}`} />
                    {isCurrentUser && (
                        <Button.Group floated='right' vertical primary>
                            {!settingMode && (
                                <Button
                                    floated='right'
                                    icon='edit'
                                    labelPosition='right'
                                    content={editMode ? 'Cancel' : 'Edit Profile'}
                                    onClick={() => handleProfileEdit(!editMode)}
                                />
                            )}
                            {!editMode && (
                                <Button
                                    floated='right'
                                    icon='setting'
                                    labelPosition='right'
                                    content={settingMode ? 'Cancel' : 'Account setting'}
                                    onClick={() => handleAccountSetting(!settingMode)}
                                />
                            )}
                        </Button.Group>
                    )}
                </Grid.Column>
                <Grid.Column width={16}>
                    {editMode ? <ProfileEditForm setEditMode={setEditMode} /> :
                        settingMode ? <AccountSettings /> : (<span style={{ whiteSpace: 'pre-wrap' }} >{profile?.bio}</span>)
                    }
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
})