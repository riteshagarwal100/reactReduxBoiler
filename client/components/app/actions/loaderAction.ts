export const LOADER_START = 'LOADER_START';
export const LOADER_STOP = 'LOADER_STOP';

export interface loaderActionsInterface {
    startLoaderAction?: Function;
    stopLoaderAction?: Function;
}

function startLoader(message) {
    return {
        type: LOADER_START,
        data: message
    };
}

function stopLoader() {
    return {
        type: LOADER_STOP,
        data: null
    };
}

export function startLoaderAction(message): Function {
    return function (dispatch: any, getState: Function) {
        return dispatch(startLoader(message));
    }
}

export function stopLoaderAction(): Function {
    return function (dispatch: any, getState: Function) {
        return dispatch(stopLoader());
    }
}
