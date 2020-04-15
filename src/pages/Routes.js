import CustomMenu from "./CustomMenu";
import React from "react";
import { Switch, Route } from 'react-router-dom';
import GeneralPage from "./GeneralPage";
import AddStudent from "./сurator/student/AddStudent";
import StudentList from "./сurator/student/StudentList";
import SubjectList from "./сurator/subject/SubjectList";

const Routes = () => {
    return <>
        <Switch>
            <Route exact path='/' component={GeneralPage}/>
            <Route exact path='/addStudent' component={AddStudent}/>
            <Route path='/studentList' component={StudentList}/>
            <Route path='/subjectList' component={SubjectList}/>
            {/*<Route path='/order' component={OrderList}/>*/}
            {/*<Route path='/addModel' component={AddModel}/>*/}
            {/*<Route path='/listModel' component={ListModel}/>*/}
        </Switch>

    </>
};

export default Routes;