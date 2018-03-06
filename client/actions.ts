
import {push} from "react-router-redux";
import {IActionGeneric} from "redux";

export interface commonActionsInterface {
    createActionRedirect?(path:string): Function;
    createActionLogoutUser?(): IActionGeneric<any>;
}

export function createActionRedirect(path) {
    return function (dispatch: any, getState: Function) {
        return dispatch(push(path));
    }
}

export function createActionLogoutUser() {
    return {type: "LOGOUT_USER", payload: {}};
}
