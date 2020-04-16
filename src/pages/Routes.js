import React from "react";
import { Switch, Route } from 'react-router-dom';
import GeneralPage from "./GeneralPage";
import StudentList from "./сurator/student/StudentList";
import SubjectList from "./сurator/subject/SubjectList";

const Routes = () => {
    return <>
        <Switch>
            <Route exact path='/' component={GeneralPage}/>
            <Route path='/studentList' component={StudentList}/>
            <Route path='/subjectList' component={SubjectList}/>
            {/*<Route path='/order' component={OrderList}/>*/}
            {/*<Route path='/addModel' component={AddModel}/>*/}
            {/*<Route path='/listModel' component={ListModel}/>*/}
        </Switch>

    </>
};

export default Routes;