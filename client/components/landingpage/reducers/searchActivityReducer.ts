import {FETCH_ACTIVITY_COMPANY_SUCCESS} from '../constants';

export default function SearchActivityReducer(state = <any>{}, action: any):any {
    let activityCompanies:any = {};
    switch (action.type) {
        case FETCH_ACTIVITY_COMPANY_SUCCESS:
            activityCompanies = Object.assign({},state);
            return activityCompanies;
    }
    return state;
}