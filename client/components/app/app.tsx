

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from "react-redux";
import * as ReactRouter from 'react-router';

import './style/style.scss';

export class App extends React.Component<any, any> {
    constructor(props, state) {
        super(props, state)
        this.state = { activityByEngagementResponse: null };
    }

    render() {
        
        return (
            <div className="red">
                <span >hi gg1</span>
            </div>
        )
    }
}

export default App;