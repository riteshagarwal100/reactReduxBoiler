import {stateInterface} from "../../../store/store";
import { CALL_API } from "../../../middlewares/api";
import {
    FETCH_ACTIVITY_COMPANY_REQUEST,FETCH_ACTIVITY_COMPANY_FAILURE,FETCH_ACTIVITY_COMPANY_SUCCESS
} from "../constants";
import * as api from '../../../services/api';

export interface fetchActivityActionInterface {
    createActionGetActivityCompanyByParams?(): any;
}

function fetchActivitiyCompaniesByParam(user) {
    return {
        [CALL_API]: {
            types: [ FETCH_ACTIVITY_COMPANY_REQUEST, FETCH_ACTIVITY_COMPANY_SUCCESS, FETCH_ACTIVITY_COMPANY_FAILURE ],
            url: api.getDataApiBaseUrl() + '/suppcompanylocation/action/doGetCompanyListing',
            method: 'POST',
            data:{
                "searchParams":{
                    "location":[ -73.9667, 40.78 ],
                    "activities":["Ziplining","Guided Hunt"],
                    "minDistance":0,
                    "maxdistance":5000000,
                    "limit":3,
                    "skip":2
                }
            },
            user:user
        },
        actionData:{
            errorMessage:"Activitycompany fetch by params failed"
        }
    }
}

export function createActionGetActivityCompanyByParams(): Function {
    return function (dispatch: any, getState: Function) {
        let state:stateInterface = getState();
        return dispatch(fetchActivitiyCompaniesByParam(state.user));
    }
}