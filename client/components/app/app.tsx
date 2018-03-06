

import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from "react-redux";
import * as ReactRouter from 'react-router';

export class App extends React.Component<any, any> {
    constructor(props, state) {
        super(props, state)
        this.state = { activityByEngagementResponse: null };
    }

    render() {
        
        return (
            <div>
                <span>hi gg</span>
            </div>
        )
    }
}

export default App;