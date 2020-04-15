import {observer} from "mobx-react";
import userStore from "../../../stores/User";
import React, {useEffect, useState} from "react";
import {Button, Modal, Popconfirm, Select, Table, Tooltip} from "antd";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Text from "antd/es/typography/Text";
import MinusOutlined from "@ant-design/icons/lib/icons/MinusOutlined";
import Form from "antd/es/form";

const {Option} = Select;

const layout = {
    labelCol: {span: 12},
    wrapperCol: {span: 12},
};

const AddSubjectToGroup = observer((props) => {
    const onFinish = values => {
        props.resultEvent(values);
    };
    if (userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber] === undefined) {
        userStore.setTeachersDisabled(props.dayOfWeek, props.orderNumber).then((res) => {
            let teacherList = [];
            let newDisabled = JSON.parse(JSON.stringify(teacherDisabled));
            for (let i in newDisabled) {
                newDisabled[i] = false;
            }

            if (res.data.teachersDisabled.length !== 0) {
                for (let o of res.data.teachersDisabled) {
                    newDisabled[o.teacher.id] = true;
                }
            }

            for (let i of userStore.teachers) {
                teacherList.push(<Option disabled={newDisabled[i.id]}
                                         value={i.id}>{i.firstName + " " + (i.lastName !== undefined ? i.lastName : "")}</Option>);
            }
            userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber] = newDisabled;
            setTeacherDisabled(newDisabled);
            setTeachers(teacherList);

        });
    }


    useEffect(() => {
        userStore.setAllSubjects();
    }, []);


    const [teachers, setTeachers] = useState(null);
    const [teacherDisabled, setTeacherDisabled] = useState({});

    let subjects = [];

    if (userStore.allSubjects !== null) {
        for (let i of userStore.allSubjects) {
            subjects.push(<Option value={i.id}>{i.subjectName}</Option>);
        }
    }

    if (teachers === null) {
        if (userStore.teachers !== null) {
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


    return <React.Fragment>
        <Form
            {...layout}
            form={props.form}
            name="basic"
            initialValues={{remember: true}}
            onFinish={onFinish}
        >

            <Form.Item
                label="Предмет"
                name="subjectId"
                rules={[{required: true, message: 'Выберите предмет'}]}
            >
                <Select
                    style={{width: 120}}>
                    {subjects}
                </Select>
            </Form.Item>

            <Form.Item
                label="Преподаватель"
                name="teacherId"
                rules={[{required: true, message: 'Выберите преподавателя!'}]}
            >
                <Select
                    style={{width: 120}}>
                    {teachers}
                </Select>
            </Form.Item>
        </Form>

    </React.Fragment>;
});

const SubjectList = observer(() => {
    useEffect(() => {
        userStore.setTeachers();
    }, []);
    let groups = [];
    let defaultOpen = userStore.currentUser.group[0].id;

    const [visible, setVisible] = useState(false);

    const [values, setValues] = useState({});

    userStore.currentGroup = defaultOpen;

    const [group, setGroup] = useState(userStore.currentGroup);


    if (userStore.subjectListOnWeekTable === null) {
        userStore.setCurrentSubjectList(defaultOpen);
    }

    const handleChange = (value) => {
        userStore.currentGroup = value;
        setGroup(userStore.currentGroup);
        userStore.setCurrentSubjectList(value);
    };

    for (let i of userStore.currentUser.group) {
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }


    const render = (context) => {
        if (context.subject === undefined) {
            return <Tooltip title="Добавить пару">
                <Button onClick={() => {
                    setValues({dayOfWeek: context.dayOfWeek, orderNumber: context.orderNumber});
                    setVisible(true);
                }} type="primary" shape="circle" icon={<PlusOutlined/>}/>
            </Tooltip>
        } else {
            return <React.Fragment>
                <Text>{context.subject.subjectName}</Text>
                <br/>
                <Text>{context.teacher.firstName + (context.teacher.secondName == null ? "" : " " + context.teacher.secondName)}</Text>
                <br/>
                <Tooltip title="Удалить пару">
                    <Popconfirm
                        title="Вы уверены, что хотите удалить пару?"
                        onConfirm={() => {
                            userStore.deleteGroupSubject(context.id);
                        }}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="primary" shape="circle" icon={<MinusOutlined/>}/>
                    </Popconfirm>
                </Tooltip>
            </React.Fragment>
        }
    };

    const columnStyle = {
        width: "150px",
        align: "center"
    };

    const columns = [
        {
            title: "Время",
            dataIndex: "time",
            ...columnStyle
        },
        {
            title: "Понедельник",
            dataIndex: "1",
            render: render,
            ...columnStyle
        },
        {
            title: "Вторник",
            dataIndex: "2",
            render: render,
            ...columnStyle

        },
        {
            title: "Среда",
            dataIndex: "3",
            render: render,
            ...columnStyle
        },
        {
            title: "Четверг",
            dataIndex: "4",
            render: render,
            ...columnStyle
        },
        {
            title: "Пятница",
            dataIndex: "5",
            render: render,
            ...columnStyle
        },
        {
            title: "Суббота",
            dataIndex: "6",
            render: render,
            ...columnStyle
        },
        {
            title: "Воскресение",
            dataIndex: "7",
            render: render,
            ...columnStyle
        }
    ];

    const [form] = Form.useForm();

    return <React.Fragment>
        <Select style={{width: 120}} defaultValue={defaultOpen} onChange={handleChange}>
            {groups}
        </Select>
        <br/>
        <Table pagination={false} columns={columns} dataSource={userStore.subjectListOnWeekTable} size="middle"
               bordered/>
        <Modal
            onCancel={() => {
                setVisible(false);
                form.resetFields();
                userStore.isTeachersDisabledReload = true;
            }}
            onOk={() => {
                form.submit();
            }}
            visible={visible}>

            <AddSubjectToGroup form={form} dayOfWeek={values.dayOfWeek} orderNumber={values.orderNumber} group={group}
                               resultEvent={(res) => {
                                   setVisible(false);
                                   let data = {
                                       ...res,
                                       ...values,
                                       groupId: userStore.currentGroup
                                   };
                                   userStore.addGroupSubject(data);
                                   form.resetFields();
                                   userStore.isTeachersDisabledReload = true;
                               }}/>

        </Modal>
    </React.Fragment>

});

export default SubjectList;