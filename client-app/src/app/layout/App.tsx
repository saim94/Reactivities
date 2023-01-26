import React, { useEffect } from 'react';
import { Container, Segment, } from 'semantic-ui-react';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import { useStore } from '../stores/Store';
import { observer } from 'mobx-react-lite';

function App() {

    const { activityStore } = useStore();

    useEffect(() => {
        activityStore.loadActivities();
    }, [activityStore])

    if (activityStore.loadingInitial) return <LoadingComponent content="Loading App" />

    return (
        <Segment>
            <NavBar />
            <Container style={{ marginTop: "7em" }}>
                <ActivityDashboard />
            </Container>

        </Segment>
    );
}

export default observer(App);
