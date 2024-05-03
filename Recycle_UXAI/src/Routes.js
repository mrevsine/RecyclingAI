
import React, { Component } from "react";
import { HashRouter, Router, Switch, Route} from 'react-router-dom';

import StartContainer from './pages/start/start';
import InstructionsContainer from './pages/instructions/instructions';
import Main1Container from "./pages/main/main-task1";
//import Main2Container from "./pages/main/main-task2";
//import SurveyContainer from "./pages/survey/survey"
//import EndContainer from "./pages/end/end";


export default class Routes extends Component {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route path="/" exact component={StartContainer} />
                    <Route path="/Main1" component={Main1Container} />
                    <Route path="/Instructions" component={InstructionsContainer} />
                </Switch>
            </HashRouter>

        )
    }
}