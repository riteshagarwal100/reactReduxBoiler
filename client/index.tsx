import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import store from './store/store';
import App from "./components/app/app";


render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('app')
);
