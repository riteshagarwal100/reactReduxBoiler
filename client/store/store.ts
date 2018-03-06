'use strict';
import {createStore, combineReducers, IStore, applyMiddleware, IMiddleware} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux'
import {browserHistory} from 'react-router';
import thunk from 'redux-thunk';
import {IRouterState} from "react-router-redux";
import {Location} from 'history';
import * as Cookies from 'js-cookie';
import {reducer as formReducer} from 'redux-form';
let batch = require('redux-batched-actions');
import api from '../middlewares/api';
import routeConfigReducer from "../components/routes/reducer";
import {routeConfigInterface} from "../components/routes/model";
import SearchActivityReducer from "../components/landingpage/reducers/searchActivityReducer";
let userFromCookie = Cookies.get("user");

export interface stateInterface {
    location?: Location,
    user: any,
    routing?: IRouterState,
    projects?: {
        message: string,
    }
    form: any,
    pageData?: any,
    patentData?:any,
    routeConfig?: routeConfigInterface,
    activityCompanyByParams: any
}

const reduxRouterMiddleware: IMiddleware<stateInterface> = routerMiddleware(browserHistory);

const appReducer = combineReducers<stateInterface>({
    routing: routerReducer,
    routeConfig: routeConfigReducer,
    activityCompanyByParams: SearchActivityReducer
});

const rootReducer = (state, action)=> {
    let newState;
    if (action.type == "LOGOUT_USER") {
        newState = Object.assign({}, state);
        let routeConfig = state.routeConfig;
        let routing = state.routing;
        newState = initialState;
        newState.routing = routing;
        newState.routeConfig = routeConfig;
        return appReducer(newState, action);
    }
    return appReducer(state, action);

};


const initialState = <stateInterface>{
    projects: {
        message: "",
        data: null
    },
    user: <any>{},
    form: <any>{},
    projectRouteConfig: {
        message: "",
        data: null
    },
    activityCompanyByParams:<any>{},
    navConfig: {
        message: "",
        data: null
    },
    widgetConfig: {},
    logos: {}
};


const store: IStore<stateInterface> = applyMiddleware(reduxRouterMiddleware, thunk, api)(createStore)(batch.enableBatching(rootReducer), initialState);
export  default store;

