import * as React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory'

import { routes } from '../routesConfig';

const history = createBrowserHistory();

class Routes extends React.Component<any, any> {

    renderRoutes(routes) {
        let routeList = [];

        routes.forEach(({component: Component, path, childRoutes, ...rest}) => {
            routeList.push(
                <Route
                    exact
                    key={path}
                    path={path}
                    render={props => { let combinedProps = {...rest, ...props}; return <Component {...combinedProps}/>}}
                    {...rest}
                />
            );
            if (childRoutes && childRoutes.length > 0) {
                routeList = routeList.concat(this.renderRoutes(childRoutes));
            }
        });
        return routeList;
    }

    render() {
        return (
            <BrowserRouter>
                <div>
                    <main role="main">
                        <Switch>
                            {this.renderRoutes(routes)}
                        </Switch>
                    </main>
                </div>
            </BrowserRouter>
        );
    }
}

export default Routes;
