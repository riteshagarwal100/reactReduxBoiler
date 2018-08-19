import { LOADER_START, LOADER_STOP } from '../actions/loaderAction';


export function LoaderReducer(state = <any>{}, action: any): any {
    switch (action.type) {
        case LOADER_START:
            return Object.assign({}, state, {
                loading: true,
                message: action.data
            });
        case LOADER_STOP:
            return Object.assign({}, state, {
                loading: false,
                message: null
            });
    }
    return state;
}
