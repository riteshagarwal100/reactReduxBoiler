import * as React from 'react';
import { connect } from 'react-redux';

import Routes from '../routes/components/Routes';
import { stateInterface } from '../../store/store';
import './style/style.scss';
import '../../assets/styles/scss/site.scss';
declare var google: any;


interface Props{
    loader?: any;
}

class App extends React.Component<Props, any> {
    constructor(props, state) {
        super(props, state);
    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillUpdate() {
        console.log('componentWillUpdate');
    }

    componentDidUpdate() {
        console.log('componentDidUpdate');
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
    }

    render() {
        const { loader } = this.props;
        return (
            <div>
                <Routes />
            </div>
        );
    }
}

export default connect((state: stateInterface) => {
    return {
        loader: state.loader
    }
},
    {
    }
)(App);
