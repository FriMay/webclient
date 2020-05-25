import {action, observable, reaction} from 'mobx';
import React from "react";
import ApolloClient, {gql} from "apollo-boost";
import {message, Tooltip} from 'antd';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import CustomMenu from "../pages/menu/CustomMenu";

const client = new ApolloClient({
    uri: "http://192.168.1.102:8080/graphql/",
    headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, AuthorizationPage, X-Requested-With",
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
    gql`query teacherList{
        teachers{
            id
            firstName
            secondName
            lastName
        }
    }`;

const teacherDisabledListQuery =
    gql`query teacherDisabledList($dayOfWeek:Int!, $orderNumber: Int!, $teachers:[Int]){
    teachersDisabled(dayOfWeek:$dayOfWeek, orderNumber:$orderNumber, teachers:$teachers){
        teacher{
            id
        }
    }
}`;

const allSubjectListQuery =
    gql`query allSubjectList{
        allSubjects{
            id
            subjectName
        }
    }`;

const attendanceListToCurrentDateQuery =
    gql`query attendanceListToCurrentDate($groupSubjectId:Int!, $date:DateTime!){
        attendance(groupSubjectId:$groupSubjectId, date:$date){
            id
            mark{
                id
            }
            user{
                id
            }
        }
    }`

const authorizationQuery =
    gql`query authorization($log:String!,$pass:String!) {
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
    gql`query subjectList($groupId:Int!){
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

const markListQuery =
    gql`query marks{
        allMarks{
            id
            markValue
        }
    }`

const scheduleListForTeacherQuery =
    gql`query scheduleListForTeacher($teacherId:Int!){
        subjectsForTeacher(teacherId:$teacherId){
            id
            dayOfWeek
            orderNumber
            subject{
                id
                subjectName
            }           
            group{
                id
                name
            }
        }
    }`

const addStudentMutation =
    gql`mutation addStudent($userId:Int!, $user:UserInputType!, $groupId:Int!) {
        addUser(userId:$userId, user:$user, groupId:$groupId){
            id
        }
    }`;

const editUserMarkByUserListMutation =
    gql`mutation editUserMarkByUserList($userMarks:[UserMarkInputType]!){
        editUserMarkByUserList(userMarks:$userMarks){
            id
        }
    }`

const deleteUserMutation =
    gql`mutation deleteUser($deleteId:Int!, $userId:Int!){
        deleteUser(userId:$userId, deleteId:$deleteId){
            id
        }
    }`;

const deleteGroupSubjectMutation =
    gql`mutation deleteGroupSubject($groupSubjectId:Int!) {
        deleteGroupSubject(groupSubjectId:$groupSubjectId){
            id
        }
    }`;

const deleteNotificationMutation =
    gql`mutation deleteNotification($notificationId:Int!){
        deleteNotification(notificationId:$notificationId){
            id
        }
    }`;

const addGroupSubjectMutation =
    gql`mutation addGroupSubject($groupSubject:GroupSubjectInputType!, $userId: Int!) {
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

const addNotificationForGroupMutation =
    gql`mutation addNotification($notification:NotificationInputType!){
        addNotification(notification:$notification){
            id
        }
    }`

const notificationListQuery =
    gql`query notificationList($groupId:Int!){
        studentsByGroupId(groupId:$groupId){
            id
            firstName
            secondName
            lastName
            login
            password
        }
        notificationsByGroupId(groupId:$groupId){
            id
            message
            notificationStudents{
                student{
                    id
                }
            }
        }
    }`;


class User {

    @observable disabledMap = {};

    @observable isStudentsListReload = true;

    @observable isTeachersDisabledReload = true;

    @observable teacherScheduleList = null;

    @observable teachers = null;


    @observable attendance = {};

    @observable currentStudentList = {};

    @observable currentUser = null;

    @observable currentGroup = null;

    @observable currentNotification = null;

    @observable markList = null;


    @observable notificationList = {};

    @observable allSubjects = null;

    @observable subjectListOnWeekTable = undefined;

    @observable dataToChangeSubjectList = null;

    @observable dataToChangeNotificationList = null;

    @observable subjectListOnWeekData = {};

    notificationSelectReload = null;

    SHORT_LENGTH_FOR_SELECT = 12;

    COUPLE_DATA = [
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

    columnsForStudentList = (columnStyle) => {
        let colStyle = columnStyle;
        if (colStyle === undefined) {
            colStyle = {
                width: 200
            }
        }

        return [
            {
                title: 'Фамилия',
                dataIndex: 'lastName',
                sorter: {
                    compare: (a, b) => userStore.sortComparator(a.lastName, b.lastName),
                    multiple: 3,
                },
                ...colStyle
            },
            {
                title: 'Имя',
                dataIndex: 'firstName',
                sorter: {
                    compare: (a, b) => userStore.sortComparator(a.firstName, b.firstName),
                    multiple: 3,
                },
                ...colStyle
            },

            {
                title: 'Отчество',
                dataIndex: 'secondName',
                sorter: {
                    compare: (a, b) => userStore.sortComparator(a.secondName, b.secondName),
                    multiple: 3,
                },
                ...colStyle
            },
        ];
    }

    columnsForSubjectList = (render, columnStyle) => {
        let colStyle = columnStyle;
        if (colStyle === undefined) {
            colStyle = {
                width: 100,
                align: "center"
            };

        }
        return [
            {
                title: "Время",
                dataIndex: "time",
                ...colStyle
            },
            {
                title: "Понедельник",
                dataIndex: "1",
                render: render,
                ...colStyle
            },
            {
                title: "Вторник",
                dataIndex: "2",
                render: render,
                ...colStyle

            },
            {
                title: "Среда",
                dataIndex: "3",
                render: render,
                ...colStyle
            },
            {
                title: "Четверг",
                dataIndex: "4",
                render: render,
                ...colStyle
            },
            {
                title: "Пятница",
                dataIndex: "5",
                render: render,
                ...colStyle
            },
            {
                title: "Суббота",
                dataIndex: "6",
                render: render,
                ...colStyle
            },
            {
                title: "Воскресение",
                dataIndex: "7",
                render: render,
                ...colStyle
            }
        ];
    }

    constructor() {
        reaction(() => this.dataToChangeSubjectList,
            () => {
                let data = JSON.parse(JSON.stringify(userStore.COUPLE_DATA));

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
                return;
            }
            userStore.currentUser = res.data.login;
            message.success("Вход выполнен успешно");
            ReactDOM.render(<BrowserRouter><CustomMenu/></BrowserRouter>, document.getElementById('root'))
        }).catch(() => {
            message.error("Вам запрещён доступ в систему администрирования!");
        });
    }

    ////////Работа с пользователем//////////
    ////////////////////////////////////////


    ////////////////////////////////////////
    //////////Функции добавления////////////
    @action addStudent(values, setVisible, formReset) {
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
                    userStore.dataToChangeSubjectList = JSON.parse(JSON.stringify(userStore.dataToChangeSubjectList));
                    message.success("Предмет добавлен в расписание");
                }
            });
        });
    }

    @action addNotification(message) {
        return client.mutate({
            mutation: addNotificationForGroupMutation,
            variables: {
                notification: {
                    message: message,
                    groupId: userStore.currentGroup
                }
            }
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
            client.clearStore().then(r => {
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
                userStore.dataToChangeSubjectList = JSON.parse(JSON.stringify(userStore.dataToChangeSubjectList));
            });

        });
    }

    @action deleteNotification() {
        return client.mutate({
            mutation: deleteNotificationMutation,
            variables: {
                notificationId: userStore.currentNotification
            }
        });
    }

    @action deleteUser(context) {
        client.mutate(
            {
                mutation: deleteUserMutation,
                variables: {
                    userId: userStore.currentUser.id,
                    deleteId: context.id
                }
            }
        ).then(() => {
            message.success("Пользователь успешно удалён.");
            userStore.setCurrentStudentList(userStore.currentGroup);
        });
    }

    ///////////Функции удаления/////////////
    ////////////////////////////////////////


    ////////////////////////////////////////
    ///////Функции установки значений///////
    @action setAllSubjects() {
        client.query({
            query: allSubjectListQuery
        }).then(res => {
            userStore.allSubjects = res.data.allSubjects;
        });
    }

    @action setAttendance(data) {
        if (userStore.attendance[userStore.currentGroup] === undefined
            || userStore.attendance[userStore.currentGroup][data.id] === undefined
            || userStore.attendance[userStore.currentGroup][data.id][data.date] === undefined

        ) {
            client.clearStore().then(() => {
                client.query({
                    query: attendanceListToCurrentDateQuery,
                    variables: {
                        groupSubjectId: data.id,
                        date: data.date
                    }
                }).then(r => {
                    if (userStore.attendance[userStore.currentGroup] === undefined)
                        userStore.attendance[userStore.currentGroup] = {};

                    debugger
                    userStore.attendance[userStore.currentGroup][data.id] = {};

                    userStore.attendance[userStore.currentGroup][data.id][data.date] = {};

                    let newData = {};

                    for (let i of r.data.attendance) {
                        newData[i.user.id] = {
                            groupSubjectId: data.id,
                            markId: i.mark.id,
                            studentId: i.user.id,
                            issueData: data.date
                        };
                    }

                    userStore.attendance[userStore.currentGroup][data.id][data.date] = newData;
                })
            });
        }
    }

    @action setCurrentSubjectList(value) {
        if (userStore.subjectListOnWeekData[value] !== undefined) {
            userStore.currentGroup = value;
            userStore.dataToChangeSubjectList = JSON.parse(JSON.stringify(userStore.dataToChangeSubjectList));
        } else {
            client.query({
                query: subjectListQuery,
                variables: {
                    groupId: value
                }
            }).then(res => {
                userStore.subjectListOnWeekData[userStore.currentGroup] = res.data.subjectListOnWeek;
                userStore.dataToChangeSubjectList = res.data.subjectListOnWeek;
            })
        }
    }

    @action setCurrentStudentList(groupId, underEvent, dataUnderEvent) {
        client.clearStore().then(() => {
            client.query({
                query: studentListQuery,
                variables: {groupId: groupId}
            }).then(res => {
                userStore.currentStudentList[groupId] = res.data.studentsByGroupId;
                if (underEvent !== undefined)
                    underEvent(dataUnderEvent);
            })
        })
    }

    @action setMarkList() {
        return client.query({
            query: markListQuery
        }).then((r) => {
            userStore.markList = r.data.allMarks;
        });
    }

    @action setNotificationList(variable) {
        if (userStore.notificationList[userStore.currentGroup] === undefined || variable !== undefined) {
            client.clearStore().then(() => {
                client.query({
                    query: notificationListQuery,
                    variables: {groupId: userStore.currentGroup}
                }).then(r => {
                    let {data} = r;
                    data.notified = {};
                    for (let i of data.notificationsByGroupId) {
                        let notificationId = i.id;
                        let students = {};
                        for (let j of data.studentsByGroupId) {
                            students[j.id] = false;
                        }
                        for (let j of i.notificationStudents) {
                            students[j.student.id] = true;
                        }
                        data.notified[notificationId] = students;
                    }
                    userStore.notificationList[userStore.currentGroup] = data;
                })
            })
        }
    }

    @action setScheduleListForTeacher() {
        if (userStore.teacherScheduleList === null) {
            client.clearStore().then(() => {
                client.query({
                    query: scheduleListForTeacherQuery,
                    variables: {
                        teacherId: userStore.currentUser.id
                    }
                }).then(r => {
                    userStore.teacherScheduleList = r.data.subjectsForTeacher;
                })
            });
        }
    }

    @action setTeachers() {
        return client.query({
            query: teacherListQuery
        }).then(res => {
            userStore.teachers = res.data.teachers;
        });
    }

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

    ///////Функции установки значений///////
    ////////////////////////////////////////


    ////////////////////////////////////////
    /////////Вспомогательные функции////////
    filterComparator = (input, option) => userStore.getOptionTitle(option).toLowerCase().indexOf(input.toLowerCase()) >= 0;

    shortenName = (name, length) => {
        let leng = length;
        if (leng === undefined)
            leng = userStore.SHORT_LENGTH_FOR_SELECT;
        if (name.length > leng) {
            return <Tooltip placement="rightTop" title={name}>
                {name.slice(0, leng) + "..."}
            </Tooltip>;
        } else {
            return name;
        }
    }

    getOptionTitle = (a) => {
        let title = a.props.children;
        if (title.props !== undefined) {
            title = title.props.title;
        }
        return title;
    }

    sortComparator = (a, b) => {
        let leftTitle = a;
        if (leftTitle.props !== undefined) {
            leftTitle = userStore.getOptionTitle(a)
        }

        let rightTitle = b;

        if (rightTitle.props !== undefined) {
            rightTitle = userStore.getOptionTitle(a)
        }

        if (leftTitle < rightTitle) {
            return -1
        }
        if (leftTitle > rightTitle) {
            return 1
        }
        return 0
    }
    /////////Вспомогательные функции////////
    ////////////////////////////////////////

    @action editUserMarkByUserList(userMarkList) {
        let data = [];
        for (let i in userMarkList) {
            data.push(userMarkList[i]);
        }
        return client.mutate({
            mutation: editUserMarkByUserListMutation,
            variables: {
                userMarks: data
            }
        })
    }
}

const userStore = new User();

export default userStore;