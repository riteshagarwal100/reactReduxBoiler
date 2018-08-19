import * as React from 'react';

interface Props{
}

class TestPage extends React.Component<Props, any> {
    constructor(props, state) {
        super(props, state);
    }

    render() { 
        return (<div>hi there</div>);
    }
}

export default TestPage;