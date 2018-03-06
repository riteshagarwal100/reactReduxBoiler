import * as React from 'react';
import {Router, Route} from 'react-router';

import {connect} from "react-redux";
import {stateInterface} from "../../../store/store";
import {routeConfigInterface} from "../model";
import {getPathByLabelFromRouteConfig, transformRoutes} from "../services/routes";
import { routesActionInterface, createActionGetRouteConfig } from "../actions";
import { routes } from '../routesConfig';
// import Notifications, {notificationPropsInterface} from "../../notifications/components/Notifications";

export interface RouterWrapperPropsInterface extends routesActionInterface/*,
    notificationPropsInterface*/ {
    history: any;
    routes?: any;
}

class RouterWrapper extends React.Component<RouterWrapperPropsInterface,any> {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        // this.props.createActionGetRouteConfig();
    }

    render() {
        // if (routes.hasOwnProperty("component")) {
        //     let transformedRoutes: any = transformRoutes(routes);
        return (
            <Router history={this.props.history}>
                <Route path={routes.path} component={routes.component}>
                </Route>

            </Router>
        );
        // } else {
        //     return null;
        // }
    }

}

export default RouterWrapper;