declare var require: any;
import { Middleware, Store, Dispatch, Action } from 'redux';
let batch = require('redux-batched-actions');
import { stateInterface } from '../store/store';
import * as api from '../services/api';
import { createActionLogoutUser } from '../actions';
export const CALL_API = 'Call API';
import * as myStore from '../store/store';

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
//
const apiMiddleware: Middleware =
    (store: Store<any>) =>
        (next: any): any =>
            (action: any): any => {
                let callAPI = action[CALL_API]
                if (typeof callAPI === 'undefined') {
                    return next(action)
                }

                callAPI = api.setHeaders(callAPI);

                let { url } = callAPI
                const { schema, types } = callAPI

                if (typeof url === 'function') {
                    url = url(store.getState())
                }

                if (typeof url !== 'string') {
                    throw new Error('Specify a string endpoint URL.')
                }

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

                const [requestType, successType, failureType] = types
                next(actionWith({ type: requestType }));

                if (callAPI.isFile) {
                    const formData = new FormData();
                    callAPI.data.forEach(el => {
                        formData.append('file', el);
                    });
                    callAPI.data = formData;
                    callAPI.headers['Content-Type'] = 'multipart/form-data';                    
                }

                if (callAPI.isAction) {
                    let state = store.getState();
                    return state['ReactRest'].getFromUrl(callAPI.url, callAPI.dtoFn, callAPI.method, callAPI.data).then(response => {
                        next(actionWith({
                            response,
                            type: successType,
                            params: action.params
                        }))
                    }).catch(err => {
                        next(actionWith({
                            error: err.data || (action.actionData && action.actionData.errorMessage) || 'Failed To Perform Action',
                            type: failureType,
                            params: action.params
                        }))
                    });
                }

                if (callAPI.restCall) {
                    let state = store.getState();
                    return state['EntitySaveService'].save(callAPI.data, callAPI.isChildSave).then(res => {
                        next(actionWith({
                            response: { data: callAPI.data },
                            type: successType,
                            params: action.params
                        }))
                    }).catch(err => {
                        next(actionWith({
                            error: err.data || (action.actionData && action.actionData.errorMessage) || 'Failed To Perform Action',
                            type: failureType,
                            params: action.params
                        }))
                    });
                }

                return api.callAPI(callAPI).then(
                    (response) => {
                        if (action.actionData && action.actionData.successMessage
                            && action.actionData.successMessage.length > 0) {
                            // const { successMessage: message } = action.actionData;
                            next(
                                batch.batchActions([
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
                            let message = 'Sorry! You have been Logged out. Please login again to continue';
                            next(
                                batch.batchActions([
                                    createActionLogoutUser()
                                ])
                            );

                        }
                        if (error && error.status === 404 || error.status === 403 || error.status === 500 || error.status === 400 || error.status === 401) {
                            const message = error.data || (action.actionData && action.actionData.errorMessage);
                            next(
                                batch.batchActions([
                                    actionWith({
                                        type: failureType,
                                        error: message || 'Failed To Perform Action',
                                        params: action.params
                                    })
                                ])
                            );
                        } else {
                            next(batch.batchActions(
                                [
                                    actionWith({
                                        type: failureType,
                                        error: 'Failed To Perform Action',
                                        params: action.params
                                    })
                                ]
                            ));
                        }
                    }
                );
            };

export default apiMiddleware;