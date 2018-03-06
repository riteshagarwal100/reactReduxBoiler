import {routeConfigInterface} from "../model";
import {RouteConfig} from "react-router";

export const getPathByLabelFromRouteConfig = (label: string, routeConfig: routeConfigInterface) => {
    if (routeConfig.hasOwnProperty("label") && routeConfig.label == label) {
        return routeConfig.path;
    }

    if (routeConfig.hasOwnProperty("childRoutes") &&
        Array.isArray(routeConfig.childRoutes) &&
        routeConfig.childRoutes.length
    ) {
        let path: null| string = null;
        routeConfig.childRoutes
            .forEach((child: routeConfigInterface) => {
                if (path == null) {

                    path = getPathByLabelFromRouteConfig(label, child);
                    if(path) {
                        path = routeConfig.path+'/'+path;
                    }
                }
            });
        return path && path.replace(/[\/]+/,'/') || path;
    }

    return null;
}

export const getUrlForPath = (path: string, context: Object) => {
    Object.keys(context).forEach((contextKey: string, contextIndex) => {
        path = path.replace(":"+contextKey, context[contextKey]);
    });
    return path;
}

export function transformRoutes(route: any): RouteConfig | RouteConfig[] {
    return route;
}