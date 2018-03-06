
import {routeConfigInterface} from './model';
import {IActionGeneric} from "redux";
import {FETCH_ROUTE_CONFIG_SUCCESS, FETCH_ROUTE_CONFIG_FAILURE} from "./constants";

export default function routeConfigReducer(state: routeConfigInterface = <routeConfigInterface>{},
                                           action: any): routeConfigInterface {


    switch (action.type) {
        case FETCH_ROUTE_CONFIG_SUCCESS:
            let newState = Object.assign({},state);
            newState = action.response.data;
            return newState;
        case FETCH_ROUTE_CONFIG_FAILURE:
            break;
    }

    return state;

}
