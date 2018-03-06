import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from "react-redux";
import { stateInterface } from "../../../store/store";
let fusioncharts = require('fusioncharts');
// Load the charts module
let charts = require('fusioncharts/fusioncharts.charts');
let ReactFC = require('react-fusioncharts');
import { fetchActivityActionInterface, createActionGetActivityCompanyByParams } from "../actions/searchActivity";
// Pass fusioncharts as a dependency of charts
charts(fusioncharts)
interface SearchByActivity {
    title: string,
    data: Array<{
        name: string,
        values: Array<{
            x: string,
            y: number
        }>,
        color: string
    }>
}

export interface apiDimensionSetting { columnName?: string, order?: number, color?: string, friendlyColumnName?: string }

export interface SearchByActivityAPIData {
    title?: string,
    columnNameForTimeDimensionInData?: string,
    columnNamesForDimensionsInOrder?: Array<apiDimensionSetting>,
    isAutoScaling?: boolean,
    scalingLowerBound?: number,
    scalingUpperBound?: number,
    scalFactor?: number,
    isLogrithmicScaling?: boolean,
    data?: Array<any>
}

export interface SearchByActivityInterface extends fetchActivityActionInterface {
    SearchByActivity?: SearchByActivity;
    projectId?: string;
    title?: string;
    data?: any;
    message: string;
    activityCompanyByParams: any;
}

class SearchByActivity extends React.Component<SearchByActivityInterface, any> {
    constructor(props, state) {
        super(props, state)
        this.state = { activityCompanyByParams: null };
    }

    componentWillMount() {
        this.props.createActionGetActivityCompanyByParams();
    }

    render() {
        return (
            <div>
                <span>hi there</span>
            </div>
        )
    }
}

export default connect((state: stateInterface) => {
    return {
        activityCompanyByParams: state.activityCompanyByParams
    }
},
    {
        createActionGetActivityCompanyByParams
    })(SearchByActivity);
