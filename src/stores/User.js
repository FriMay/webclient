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

const studentListQuery = gql`query studentList($groupId:Int!){
        studentsByGroupId(groupId:$groupId){
            id
            firstName
            secondName
            lastName
        }
    }`;

const teacherListQuery = gql`query teachr{
        teachers{
            id
            firstName
            secondName
        }
    }`;

const teacherDisabledListQuery = gql`query teachr($dayOfWeek:Int!, $orderNumber: Int!, $teachers:[Int]){
    teachersDisabled(dayOfWeek:$dayOfWeek, orderNumber:$orderNumber, teachers:$teachers){
        teacher{
            id
        }
    }
}`;


const allSubjectListQuery = gql`query qw{
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
                firstName
                secondName
            }
        }
    }`;

const addStudentMutation =
    gql`mutation add($userId:Int!, $user:UserInputType!, $groupId:Int!) {
        addUser(userId:$userId, user:$user, groupId:$groupId){
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
                firstName
                secondName
            }
        }
    }`;

class User {

    @observable disabledMap = {};

    @observable isTeachersDisabledReload = true;

    @observable teachers = null;

    @observable currentStudentList = null;

    @observable currentUser = null;

    @observable currentGroup = null;

    @observable allSubjects = null;

    @observable subjectListOnWeekTable = null;

    @observable subjectListOnWeekData = null;

    constructor() {
        reaction(() => this.subjectListOnWeekData,
            (subjectListOnWeekData) => {
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
                for (let i in subjectListOnWeekData) {
                    data[subjectListOnWeekData[i].orderNumber - 1][subjectListOnWeekData[i].dayOfWeek] = subjectListOnWeekData[i];
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

    @action setTeachersDisabled(dayOfWeek, orderNumber) {
        let a = userStore.teachers;

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
        client.query({
            query: studentListQuery,
            variables: {groupId: groupId}
        }).then(res => {
            userStore.currentStudentList = res.data.studentsByGroupId;
        })
    }

    @action addStudent(values) {
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
                    groupId: values.groupId
                }
            }
        ).then((res) => {
            if (res.data.addUser === null) {
                message.info("Такой логин существует!");
                return;
            }
            message.success("Студент успешно добавлен!");
            userStore.setCurrentStudentList(userStore.currentGroup);
        }).catch(() => {
            message.success("Студент не добавлен! Попробуйте позже");
        })

    }

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

    @action addGroupSubject(values) {
        client.mutate({
            mutation: addGroupSubjectMutation,
            variables: {
                groupSubject: values,
                userId: userStore.currentUser.id
            }
        }).then(res => {
            if (res.data.addGroupSubject !== null) {
                userStore.subjectListOnWeekData=[...JSON.parse(JSON.stringify(userStore.subjectListOnWeekData)), res.data.addGroupSubject];
                message.success("Предмет добавлен в расписание");
            }
        });
    }

    @action deleteGroupSubject(groupSubjectId){
        client.mutate({
            mutation: deleteGroupSubjectMutation,
            variables:{
                groupSubjectId: groupSubjectId
            }
        }).then(res=>{
            message.success("Предмет удалён успешно");
            let index = -1;
            for (let i in userStore.subjectListOnWeekData){
                if (userStore.subjectListOnWeekData[i].id === res.data.deleteGroupSubject.id){
                    index = i;
                    break;
                }
            }
            let newData = JSON.parse(JSON.stringify(userStore.subjectListOnWeekData));
            newData.splice(index,1);
            userStore.subjectListOnWeekData = newData;
        });
    }

    @action setCurrentSubjectList(value) {
        client.query({
            query: subjectListQuery,
            variables: {
                groupId: value
            }
        }).then(res => {
            userStore.subjectListOnWeekData = res.data.subjectListOnWeek;
        })
    }
}

const userStore = new User();

export default userStore;