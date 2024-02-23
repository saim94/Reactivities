import { Container, Grid, Segment } from 'semantic-ui-react';
import NavBar from './NavBar';
import { observer } from 'mobx-react-lite';
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import { ToastContainer } from 'react-toastify';
import { useStore } from '../stores/Store';
import { useEffect } from 'react';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';

function App() {

    const location = useLocation();
    const navigate = useNavigate();
    const { commonStore, userStore, conversationStore: { inboxOpen, setOpenInbox, hubConnection, createHubConnection, connectionCheck },
        userStore: { isLoggedIn }
    } = useStore();

    useEffect(() => {
        if (commonStore.token) {
            userStore.getUser().finally(() => { commonStore.setAppLoaded(); })
            commonStore.getCount();
        } else {
            commonStore.setAppLoaded();
        }
    }, [commonStore, userStore]);

    if (!commonStore.appLoaded) <LoadingComponent content='Loading app...' />

    useEffect(() => {
        localStorage.setItem('lastVisitedlocation', location.pathname);
        // Add a listener to capture browser refresh or tab close
        window.addEventListener('beforeunload', () => {
            //console.log('refreshed');
            localStorage.setItem('pageRefreshed', 'true');
        });

        return () => {
            // Clean up the event listener when the component is unmounted
            window.removeEventListener('beforeunload', () => {
                localStorage.setItem('pageRefreshed', 'true');
            });
        };
    }, [navigate]);

    useEffect(() => {
        const wasPageRefreshed = localStorage.getItem('pageRefreshed');
        if (wasPageRefreshed !== 'true')
            localStorage.setItem('lastVisitedUrl', location.pathname);

        if (location.pathname.includes('Chat')) {
            //console.log('INBOX OPENED')
            setOpenInbox(true);
        }
        else {
            if (inboxOpen) {
                //console.log('INBOX CLOSED')
                setOpenInbox(false);
            }
        }

    }, [location, inboxOpen, setOpenInbox])

    useEffect(() => {
        if (isLoggedIn && !hubConnection && !connectionCheck) {
            createHubConnection();
            console.log('Hub Connection from App.tsx')
        }

    }, [connectionCheck, createHubConnection, hubConnection, isLoggedIn])

    return (
        <>
            <ScrollRestoration />
            <ModalContainer />
            <ToastContainer position='bottom-right' hideProgressBar theme='colored' />
            {location.pathname === '/' ? <HomePage /> : (
                <>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                <NavBar />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row className='contentRow' >
                            <Grid.Column width={16}>
                                {/*<Container style={{ paddingTop: "3.5em" }}>*/}
                                <Container>
                                    <Segment secondary>
                                        <Outlet />
                                    </Segment>
                                </Container>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </>
            )}
        </>
    );
}

export default observer(App);
