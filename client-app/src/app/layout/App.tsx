import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Segment, } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { v4 as uuid } from 'uuid'
import { randomUUID } from 'crypto';

function App() {

    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setselectedActivity] = useState<Activity | undefined>(undefined)
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        axios.get<Activity[]>('http://localhost:5000/api/Activities')
            .then(response => {
                console.log(response);
                setActivities(response.data);
            })
    }, [])

    function handleSelectActivity(id: string) {
        setselectedActivity(activities.find(act => act.id === id));
    }

    function handleCancelSelectActivity() {
        setselectedActivity(undefined);
    }

    function handleFormOpen(id?: string) {
        id ? handleSelectActivity(id) : handleCancelSelectActivity();
        setEditMode(true);
    }

    function handleFormClose() {
        setEditMode(false);
    }

    function handleCreateOrEditActivity(activity: Activity) {
        activity.id
            ? setActivities([...activities.filter(x => x.id !== activity.id), activity])
            : setActivities([...activities, { ...activity, id: uuid() }]);
        setEditMode(false);
        setselectedActivity(activity);
    }

    function handleDeleteActivity(id: string) {
        setActivities([...activities.filter(x => x.id !== id)])
    }

    return (
        <Segment>
            <NavBar openForm={handleFormOpen} />
            <Container style={{ marginTop: "7em" }}>
                <ActivityDashboard
                    activities={activities}
                    selectedActivity={selectedActivity}
                    selectActivity={handleSelectActivity}
                    cancelSelectActivity={handleCancelSelectActivity}
                    editMode={editMode}
                    openForm={handleFormOpen}
                    closeForm={handleFormClose}
                    createOrEdit={handleCreateOrEditActivity}
                    deleteActivity={handleDeleteActivity}
                />
            </Container>

        </Segment>
    );
}

export default App;
