import {action, observable, reaction} from 'mobx';
import React from "react";
import ApolloClient, {gql} from "apollo-boost";
import {message} from 'antd';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import CustomMenu from "../pages/CustomMenu";

const client = new ApolloClient({
    uri: "http://localhost:5000/graphql/",
    headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS"
    }
});

const studentListQuery =
    gql`query studentList($groupId:Int!){
        studentsByGroupId(groupId:$groupId){
            id
            firstName
            secondName
            lastName
            login
            password
        }
    }`;

const teacherListQuery =
    gql`query teachr{
        teachers{
            id
            firstName
            secondName
            lastName
        }
    }`;

const teacherDisabledListQuery =
    gql`query teachr($dayOfWeek:Int!, $orderNumber: Int!, $teachers:[Int]){
    teachersDisabled(dayOfWeek:$dayOfWeek, orderNumber:$orderNumber, teachers:$teachers){
        teacher{
            id
        }
    }
}`;

const allSubjectListQuery =
    gql`query qw{
        allSubjects{
            id
            subjectName
        }
    }`;

const authorizationQuery =
    gql`query loginQuery($log:String!,$pass:String!) {
        login(login:$log, password:$pass){
            id
            firstName
            secondName
            userRole{
                roleName
            }
            group{
                id
                name
            }
        }
    }`;

const subjectListQuery =
    gql`query subjectListOnWeek($groupId:Int!){
        subjectListOnWeek(groupId:$groupId){
            id
            dayOfWeek
            orderNumber
            subject{
                subjectName
            }
            teacher{
                id
                firstName
                secondName
                lastName
            }
        }
    }`;

const addStudentMutation =
    gql`mutation addUser($userId:Int!, $user:UserInputType!, $groupId:Int!) {
        addUser(userId:$userId, user:$user, groupId:$groupId){
            id
        }
    }`;

const deleteUserMutation =
    gql`mutation del($deleteId:Int!, $userId:Int!){
        deleteUser(userId:$userId, deleteId:$deleteId){
            id
        }
    }`;

const deleteGroupSubjectMutation =
    gql`mutation delete($groupSubjectId:Int!) {
        deleteGroupSubject(groupSubjectId:$groupSubjectId){
            id
        }
    }`;

const addGroupSubjectMutation =
    gql`mutation add($groupSubject:GroupSubjectInputType!, $userId: Int!) {
        addGroupSubject(groupSubject:$groupSubject, userId: $userId){
            id
            dayOfWeek
            orderNumber
            subject{
                subjectName
            }
            teacher{
                id
                firstName
                secondName
                lastName
            }
        }
    }`;

class User {

    @observable disabledMap = {};

    @observable isStudentsListReload = true;

    @observable isTeachersDisabledReload = true;

    @observable teachers = null;

    @observable currentStudentList = {};

    @observable currentUser = null;

    @observable currentGroup = null;

    @observable allSubjects = null;

    @observable subjectListOnWeekTable = undefined;

    @observable dataToChange = null;

    @observable subjectListOnWeekData = {};

    constructor() {
        reaction(() => this.dataToChange,
            () => {
                let data = [
                    {
                        time: "8:00-9:35"
                    },
                    {
                        time: "9:50-11:25"
                    },
                    {
                        time: "11:40-13:15"
                    },
                    {
                        time: "13:45-15:20"
                    },
                    {
                        time: "15:35-17:10"
                    },
                    {
                        time: "17:25-19:00"
                    },
                    {
                        time: "19:15-20:50"
                    },
                    {
                        time: "21:05-22:40"
                    }
                ];
                for (let i of userStore.subjectListOnWeekData[userStore.currentGroup]) {
                    data[i.orderNumber - 1][i.dayOfWeek] = i;
                }

                for (let i = 0; i < data.length; i++) {
                    for (let j = 1; j <= 7; j++) {
                        if (data[i][j] === undefined)
                            data[i][j] = {dayOfWeek: j, orderNumber: i + 1};
                    }
                }

                userStore.subjectListOnWeekTable = data;
            });
        this.authorize("La", "La");
    }


    ////////////////////////////////////////
    ////////Работа с пользователем//////////
    @action authorize(login, password) {
        client.query({
            query: authorizationQuery,
            variables: {log: login, pass: password}
        }).then(res => {
            if (res.data.login === null) {
                message.info("Такого пользователя не существует!");
            }
            userStore.currentUser = res.data.login;
            message.success("Вход выполнен успешно");
            ReactDOM.render(<BrowserRouter><CustomMenu/></BrowserRouter>, document.getElementById('root'))
        }).catch(res => {
            message.error("Вам запрещён доступ в систему администрирования!");
        });
    }
    ////////Работа с пользователем//////////
    ////////////////////////////////////////


    ////////////////////////////////////////
    //////////Функции добавления////////////
    @action addStudent(values, setVisible, formReset) {

        let cur = userStore.currentGroup;

        debugger;

        client.mutate({
                mutation: addStudentMutation,
                variables: {
                    userId: userStore.currentUser.id,
                    user: {
                        firstName: values.firstName,
                        secondName: values.secondName,
                        lastName: values.lastName,
                        login: values.login,
                        password: values.password
                    },
                    groupId: userStore.currentGroup
                }
            }
        ).then((res) => {
            client.clearStore().then(() => {
                if (res.data.addUser === null) {
                    message.info("Такой логин существует!");
                    return;
                }
                message.success("Студент успешно добавлен!");
                setVisible(false);
                formReset();
                userStore.setCurrentStudentList(userStore.currentGroup);
            });

        }).catch(() => {
            message.warning("Студент не добавлен! Попробуйте позже");
        })

    }

    @action addGroupSubject(values) {
        client.mutate({
            mutation: addGroupSubjectMutation,
            variables: {
                groupSubject: values,
                userId: userStore.currentUser.id
            }
        }).then(res => {
            client.clearStore().then(r => {
                if (res.data.addGroupSubject !== null) {
                    if (userStore.disabledMap[values.dayOfWeek + " " + values.orderNumber] === undefined) {
                        let disabled = {};
                        disabled[values.teacherId] = true;
                        userStore.disabledMap[values.dayOfWeek + " " + values.orderNumber] = disabled;
                    } else {
                        userStore.disabledMap[values.dayOfWeek + " " + values.orderNumber][values.teacherId] = true;
                    }
                    userStore.subjectListOnWeekData[userStore.currentGroup] = [...JSON.parse(JSON.stringify(userStore.subjectListOnWeekData[userStore.currentGroup])), res.data.addGroupSubject];
                    userStore.dataToChange = JSON.parse(JSON.stringify(userStore.dataToChange));
                    message.success("Предмет добавлен в расписание");
                }
            });
        });
    }
    //////////Функции добавления////////////
    ////////////////////////////////////////


    ////////////////////////////////////////
    ///////////Функции удаления/////////////
    @action deleteGroupSubject(context) {
        client.mutate({
            mutation: deleteGroupSubjectMutation,
            variables: {
                groupSubjectId: context.id
            }
        }).then(res => {
            client.clearStore().then(r =>{
                message.success("Предмет удалён успешно");
                let index = -1;
                if (userStore.disabledMap[context.dayOfWeek + " " + context.orderNumber] === undefined) {
                    let disabled = {};
                    disabled[context.teacher.id] = false;
                    userStore.disabledMap[context.dayOfWeek + " " + context.orderNumber] = disabled;
                } else {
                    userStore.disabledMap[context.dayOfWeek + " " + context.orderNumber][context.teacher.id] = false;
                }

                for (let i in userStore.subjectListOnWeekData[userStore.currentGroup]) {
                    if (userStore.subjectListOnWeekData[userStore.currentGroup][i].id === res.data.deleteGroupSubject.id) {
                        index = i;
                        break;
                    }
                }
                let newData = JSON.parse(JSON.stringify(userStore.subjectListOnWeekData[userStore.currentGroup]));
                newData.splice(index, 1);
                userStore.subjectListOnWeekData[userStore.currentGroup] = newData;
                userStore.dataToChange = JSON.parse(JSON.stringify(userStore.dataToChange));
            });

        });
    }

    @action deleteUser(context){
        client.mutate(
            {
                mutation: deleteUserMutation,
                variables:{
                    userId: userStore.currentUser.id,
                    deleteId: context.id
                }
            }
        ).then(()=>{
            message.success("Пользователь успешно удалён.");
            userStore.setCurrentStudentList(userStore.currentGroup);
        });
    }
    ///////////Функции удаления/////////////
    ////////////////////////////////////////


    ////////////////////////////////////////
    ///////Функции установки значений///////
    @action setTeachersDisabled(dayOfWeek, orderNumber) {
        let teachersList = [];

        for (let i of userStore.teachers) {
            teachersList.push(i.id);
        }

        return client.query({
            query: teacherDisabledListQuery,
            variables: {dayOfWeek, orderNumber, teachers: teachersList}
        });
    }

    @action setTeachers() {
        return client.query({
            query: teacherListQuery
        }).then(res => {
            userStore.teachers = res.data.teachers;
        });
    }

    @action setAllSubjects() {
        client.query({
            query: allSubjectListQuery
        }).then(res => {
            userStore.allSubjects = res.data.allSubjects;
        });
    }

    @action setCurrentStudentList(groupId) {
        client.clearStore().then(()=>{
            client.query({
                query: studentListQuery,
                variables: {groupId: groupId}
            }).then(res => {
                userStore.currentStudentList[userStore.currentGroup] = res.data.studentsByGroupId;
            })
        })
    }

    @action setCurrentSubjectList(value) {
        if (userStore.subjectListOnWeekData[value] !== undefined ){
            userStore.currentGroup = value;
            userStore.dataToChange = JSON.parse(JSON.stringify(userStore.dataToChange));
        }else{
            client.query({
                query: subjectListQuery,
                variables: {
                    groupId: value
                }
            }).then(res => {
                userStore.subjectListOnWeekData[userStore.currentGroup] = res.data.subjectListOnWeek;
                userStore.dataToChange = res.data.subjectListOnWeek;
            })
        }
    }
    ///////Функции установки значений///////
    ////////////////////////////////////////

}

const userStore = new User();

export default userStore;