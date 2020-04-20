import React from "react";
import { Switch, Route } from 'react-router-dom';
import GeneralPage from "../GeneralPage";
import StudentListPage from "../roles/сurator/student/StudentListPage";
import SubjectListPage from "../roles/сurator/subject/SubjectListPage";
import NotificationListPage from "../NotificationListPage";
import ScheduleListPage from "../roles/teacher/schedule/ScheduleListPage";

const Routes = () => {
    return <>
        <Switch>
            <Route exact path='/' component={GeneralPage}/>
            <Route path='/studentList' component={StudentListPage}/>
            <Route path='/subjectList' component={SubjectListPage}/>
            <Route path='/notificationList' component={NotificationListPage}/>
            <Route path='/scheduleList' component={ScheduleListPage}/>
            {/*<Route path='/order' component={OrderList}/>*/}
            {/*<Route path='/addModel' component={AddModel}/>*/}
            {/*<Route path='/listModel' component={ListModel}/>*/}
        </Switch>

    </>
};

export default Routes;