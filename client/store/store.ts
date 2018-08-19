'use strict';
declare var require: any;
import { createStore, combineReducers, Store, applyMiddleware, Middleware } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux'
import { browserHistory } from 'react-router';
import thunk from 'redux-thunk';
import { IRouterState } from "react-router-redux";
import { Location } from 'history';
import * as Cookies from 'js-cookie';
import { reducer as formReducer } from 'redux-form';
let batch = require('redux-batched-actions');
import api from '../middlewares/api';

import { LoaderReducer } from '../components/app/reducers/loaderReducer';
import { ReactRestReducer } from './reactRestReducer';
import { EntitySaveServiceReducer } from './entitySaveServiceReducer';
import { EntitySaveService } from '../common/entity-save-service';
import { ReactRest } from '../common/react-rest';

let userFromCookie = Cookies.get("user");

export interface stateInterface {
    loader: any,
    form: any,
    ReactRest: any,
    EntitySaveService: any
}

const reduxRouterMiddleware: Middleware = routerMiddleware(browserHistory);

const appReducer = combineReducers<stateInterface>({
    loader: LoaderReducer,
    form: formReducer,
    ReactRest: ReactRestReducer,
    EntitySaveService: EntitySaveServiceReducer
});

const rootReducer = (state, action) => {
    return appReducer(state, action);
};


const initialState = <stateInterface>{
};


const store: Store<any> = applyMiddleware(reduxRouterMiddleware, thunk, api)(createStore)(batch.enableBatching(rootReducer), initialState);
export default store;
