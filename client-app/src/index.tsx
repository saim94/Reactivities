import ReactDOM from 'react-dom/client';
import 'semantic-ui-css/semantic.min.css'
import 'react-calendar/dist/Calendar.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-datepicker/dist/react-datepicker.css'
import './app/layout/styles.css';
import { store, StoreContext } from './app/stores/Store';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/Routes';
import * as React from 'react';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <StoreContext.Provider value={store}>
            <RouterProvider router={router} />
        </StoreContext.Provider>
    </React.StrictMode>
);

