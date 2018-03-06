
import * as React from 'react';
import {PlainRoute} from "react-router";
import {RouteConfig} from "react-router";


export interface  routeConfigInterface {
    label?: string
    requiresAuthentication?: boolean,
    path?: string,
    dataPath?:string,
    indexRoute?: routeConfigInterface | RouteConfig ,
    component: string,
    childRoutes?: Array<routeConfigInterface| RouteConfig>,
    fullPage:boolean,
    projectId?:string
}