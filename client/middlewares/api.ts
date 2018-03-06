import {IMiddleware, IMiddlewareStore, IDispatch, IActionGeneric, IAction} from "redux";
let batch = require('redux-batched-actions');
import {stateInterface} from "../store/store";
import  * as api from  '../services/api';
import {createActionLogoutUser} from "../actions";
export const CALL_API = 'Call API';


// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
//
const apiMiddleware: IMiddleware<stateInterface> =
    (store: IMiddlewareStore<stateInterface>) =>
        (next: IDispatch): any =>
            (action: any): any => {
                const callAPI = action[CALL_API]
                if (typeof callAPI === 'undefined') {
                    return next(action)
                }

                let {url} = callAPI
                const {schema, types} = callAPI

                if (typeof url === 'function') {
                    url = url(store.getState())
                }

                if (typeof url !== 'string') {
                    throw new Error('Specify a string endpoint URL.')
                }
                // if (!schema) {
                //     throw new Error('Specify one of the exported Schemas.')
                // }
                if (!Array.isArray(types) || types.length !== 3) {
                    throw new Error('Expected an array of three action types.')
                }
                if (!types.every(type => typeof type === 'string')) {
                    throw new Error('Expected action types to be strings.')
                }


                function actionWith(data) {
                    const finalAction = Object.assign({}, action, data)
                    delete finalAction[CALL_API]
                    return finalAction;
                }

                const [ requestType, successType, failureType ] = types
                next(actionWith({type: requestType}))

                return api.callAPI(callAPI).then(
                    (response) => {
                        if (action.actionData && action.actionData.successMessage
                            && action.actionData.successMessage.length > 0) {
                            let {successMessage:message} = action.actionData;
                            //let successNotification = <notificationModel>{message};
                            next(
                                batch.batchActions([
                                    //createActionAddSuccess(successNotification),
                                    actionWith({
                                        response,
                                        type: successType,
                                        params: action.params
                                    })
                                ])
                            )
                        }
                        else {
                            next(actionWith({
                                response,
                                type: successType,
                                params: action.params
                            }))
                        }

                    }
                ).catch(
                    (error) => {
                        if (error && error.status === 401) {
                            let message = "Sorry! You have been Logged out. Please login again to continue";
                            //let errorNotification = <notificationModel>{message};
                            next(
                                batch.batchActions([
                                    //createActionAddError(errorNotification),
                                    createActionLogoutUser()
                                ])
                            );

                        }
                        if (error && error.status === 404 || error.status === 403 || error.status === 500 || error.status === 400) {
                            let message = error.data.message || (action.actionData && action.actionData.errorMessage)
                                || "Something Bad Happened";
                            //let errorNotification = <notificationModel>{message};
                            next(
                                batch.batchActions([
                                    //createActionAddError(errorNotification),
                                    actionWith({
                                        type: failureType,
                                        error: error.message || 'Something bad happened',
                                        params: action.params
                                    })

                                ])
                            );
                        }
                    }
                );
            };

export default apiMiddleware;