// import {IActionGeneric} from "react-router-redux";
import {CALL_API} from "../../middlewares/api";
import * as api  from '../../services/api';
import {
    FETCH_ROUTE_CONFIG_SUCCESS, FETCH_ROUTE_CONFIG_REQUEST, FETCH_ROUTE_CONFIG_FAILURE,
    FETCH_CHILD_ROUTE_CONFIG_REQUEST, FETCH_CHILD_ROUTE_CONFIG_SUCCESS, FETCH_CHILD_ROUTE_CONFIG_FAILURE
} from "./constants";
import {stateInterface} from "../../store/store";

export interface routesActionInterface {
    createActionGetRouteConfig?(): any;
}

function fetchRoutes(user) {
    return {
        [CALL_API]: {
            types: [ FETCH_ROUTE_CONFIG_REQUEST, FETCH_ROUTE_CONFIG_SUCCESS, FETCH_ROUTE_CONFIG_FAILURE ],
            url: api.getDataApiBaseUrl() + '/routeConfig/action/doGetRouteConfig',
            method: 'POST',
            data:{
                projectId:""
            },
            user:user
        },
        actionData:{
            errorMessage:"Route configuration fetch failed"
        }
    }
}

export function createActionGetRouteConfig(): Function {
    return function (dispatch: any, getState: Function) {
        let state:stateInterface = getState();
        return dispatch(fetchRoutes(state.user));
    }
}

function fetchChildRoutes(user,projectId,callback) {
    return {
        [CALL_API]: {
            types: [ FETCH_CHILD_ROUTE_CONFIG_REQUEST, FETCH_CHILD_ROUTE_CONFIG_SUCCESS, FETCH_CHILD_ROUTE_CONFIG_FAILURE ],
            url: api.getDataApiBaseUrl() + '/routeConfig/action/doGetRouteConfig',
            method: 'POST',
            data:{
                projectId
            },
            user:user
        },
        actionData:{
            callback
        }
    }
}

export function createActionGetChildRouteConfig(callback): Function {
    return function (dispatch: any, getState: Function) {
        let state:stateInterface = getState();
        return dispatch(fetchChildRoutes(state.user,1,callback));
    }
}