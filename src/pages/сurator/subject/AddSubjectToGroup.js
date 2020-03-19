import userStore from "../../../stores/User";
import React, {useEffect, useState} from "react";
import {Button, Form, Input, Select} from "antd";
import {observer} from "mobx-react";


const {Option} = Select;

const layout = {
    labelCol: {span: 12},
    wrapperCol: {span: 12},
};
const tailLayout = {
    wrapperCol: {offset: 10, span: 14},
};

const AddSubjectToGroup = observer(() => {
    const onFinish = values => {
        // userStore.setTeachers();
        userStore.addGroupSubject(values);
    };

    useEffect(() => {
        userStore.setAllSubjects();
        userStore.setTeachers();
    }, []);


    const [groupChoice, setGroupChoice] = useState(null);
    const [dayChoice, setDayChoice] = useState(null);
    const [orderChoice, setOrderChoice] = useState(null);
    const [orderDisabled, setOrderDisabled] = useState([false, false, false, false, false, false, false, false]);
    const [teachers, setTeachers] = useState(null);

    let subjects = [];

    if (userStore.allSubjects !== null) {
        for (let i of userStore.allSubjects) {
            subjects.push(<Option value={i.id}>{i.subjectName}</Option>);
        }
    }

    const [teacherDisabled, setTeacherDisabled] = useState({});


    if (teachers === null) {
        if (userStore.teachers !== null){
            let teacherList = [];
            let disabledArray = {};
            for (let i of userStore.teachers) {
                disabledArray[i.id] = false;
            }

            for (let i of userStore.teachers) {
                teacherList.push(<Option disabled={disabledArray[i.id]}
                                      value={i.id}>{i.firstName + " " + (i.lastName !== null ? i.lastName : "")}</Option>);
            }
            setTeacherDisabled(disabledArray);
            setTeachers(teacherList);
        }
    }

    let groups = [];

    for (let i of userStore.currentUser.group) {
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }

    return <React.Fragment>
        <Form
            {...layout}
            name="basic"
            initialValues={{remember: true}}
            onFinish={onFinish}
        >

            <Form.Item
                label="Группа"
                name="groupId"
                rules={[{required: true, message: 'Выберите группу!'}]}
            >
                <Select onSelect={(value) => {
                    setGroupChoice(value);
                }} style={{width: 120}}>
                    {groups}
                </Select>
            </Form.Item>

            <Form.Item
                label="День недели"
                name="dayOfWeek"
                rules={[{required: true, message: 'Выберите день недели!'}]}
            >
                <Select onSelect={(value) => {
                    userStore.setGroupSubjectsToDay(groupChoice, value)
                        .then(res => {
                            let newArray = [false, false, false, false, false, false, false, false];
                            if (res.data.subjectsOnDay.length !== 0) {

                                for (let i of res.data.subjectsOnDay) {

                                    newArray[i.orderNumber - 1] = true;
                                }

                            }


                            setOrderDisabled(newArray);
                            setDayChoice(value);

                        });

                }}  disabled={groupChoice === null} style={{width: 120}}>
                    <Option value="1">Понедельник</Option>
                    <Option value="2">Вторник</Option>
                    <Option value="3">Среда</Option>
                    <Option value="4">Четверг</Option>
                    <Option value="5">Пятница</Option>
                    <Option value="6">Суббота</Option>
                    <Option value="7">Воскресенье</Option>
                </Select>

            </Form.Item>

            <Form.Item
                label="Время пары"
                name="orderNumber"
                rules={[{required: true, message: 'Выберите время в которое проводится пара!'}]}
            >
                <Select onSelect={(value) => {
                    userStore.setTeachersDisabled(dayChoice, value).then(res=>{

                        let teacherList = [];
                        let newDisabled = JSON.parse(JSON.stringify(teacherDisabled));
                        for (let i in newDisabled){
                            newDisabled[i] = false;
                        }

                        if (res.data.teachersDisabled.length !==0){
                            for (let o of res.data.teachersDisabled){
                                newDisabled[o.teacher.id] = true;
                            }
                        }

                        for (let i of userStore.teachers) {
                            teacherList.push(<Option disabled={newDisabled[i.id]}
                                                     value={i.id}>{i.firstName + " " + (i.lastName !== undefined ? i.lastName : "")}</Option>);
                        }
                        setTeacherDisabled(newDisabled);
                        setTeachers(teacherList);
                        setOrderChoice(value);
                    });
                }}
                        disabled={groupChoice === null || dayChoice === null} style={{width: 120}}>
                    <Option value="1" disabled={orderDisabled[0]}>8:00-9:35</Option>
                    <Option value="2" disabled={orderDisabled[1]}>9:50-11:25</Option>
                    <Option value="3" disabled={orderDisabled[2]}>11:40-13:15</Option>
                    <Option value="4" disabled={orderDisabled[3]}>13:45-15:20</Option>
                    <Option value="5" disabled={orderDisabled[4]}>15:35-17:10</Option>
                    <Option value="6" disabled={orderDisabled[5]}>17:25-19:00</Option>
                    <Option value="7" disabled={orderDisabled[6]}>19:15-20:50</Option>
                    <Option value="8" disabled={orderDisabled[7]}>21:05-22:40</Option>
                </Select>
            </Form.Item>

            <Form.Item
                label="Предмет"
                name="subjectId"
                rules={[{required: true, message: 'Выберите предмет'}]}
            >
                <Select disabled={groupChoice === null || dayChoice === null || orderChoice === null}
                        style={{width: 120}}>
                    {subjects}
                </Select>
            </Form.Item>

            <Form.Item
                label="Преподаватель"
                name="teacherId"
                rules={[{required: true, message: 'Выберите преподавателя!'}]}
            >
                <Select disabled={groupChoice === null || dayChoice === null || orderChoice === null}
                        style={{width: 120}}>
                    {teachers}
                </Select>
            </Form.Item>


            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Добавить
                </Button>
            </Form.Item>
        </Form>

    </React.Fragment>;
});

export default AddSubjectToGroup;