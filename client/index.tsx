import * as React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux';
import {Router, browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux';
import store from './store/store';
import RouterWrapper from './components/routes/components/RouterWrapper';
import { App } from "./components/app/App";

const history = syncHistoryWithStore(browserHistory, store);


render(
    <Provider store={store}>
        <RouterWrapper history={history} />
    </Provider>
    , document.getElementById('app'));
