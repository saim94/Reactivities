import { Container } from 'semantic-ui-react';
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
    const { commonStore, userStore, conversationStore: { inboxOpen, setOpenInbox } } = useStore();

    useEffect(() => {
        if (commonStore.token) {
            userStore.getUser().finally(() => commonStore.setAppLoaded())
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
        //debugger
        const wasPageRefreshed = localStorage.getItem('pageRefreshed');
        if (wasPageRefreshed !== 'true')
            localStorage.setItem('lastVisitedUrl', location.pathname);

        //window.addEventListener('beforeunload', () => {
        //    localStorage.setItem('lastLocation', location.pathname);
        //});
        //localStorage.setItem('lastLocation', location.pathname);
        //const lastVisitedUrl = sessionStorage.getItem('lastVisitedUrl');
        //const wasPageRefreshed = performance.navigation.type === 1;
        //console.log('Page Refresh' + wasPageRefreshed);
        //if (wasPageRefreshed && lastVisitedUrl) {
        //    navigate(lastVisitedUrl);
        //}

        /*localStorage.setItem('lastVisitedUrl', location.pathname);*/
        //console.log(location);
        if (location.pathname.includes('chat/')) {
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

    //useEffect(() => {
    //    debugger;
    //    const a = 10;
    //}, []);

    return (
        <>
            <ScrollRestoration />
            <ModalContainer />
            <ToastContainer position='bottom-right' hideProgressBar theme='colored' />
            {location.pathname === '/' ? <HomePage /> : (
                <>
                    <NavBar />
                    <Container style={{ marginTop: "7em" }}>
                        <Outlet />
                    </Container>
                </>
            )}
        </>
    );
}

export default observer(App);
