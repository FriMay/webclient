import {observer} from "mobx-react";
import userStore from "../../../../stores/User";
import React, {useEffect, useState} from "react";
import {Button, Modal, Popconfirm, Select, Table, Tooltip} from "antd";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Text from "antd/es/typography/Text";
import MinusOutlined from "@ant-design/icons/lib/icons/MinusOutlined";
import Form from "antd/es/form";
import GroupSelector from "../../../utils/GroupSelector";

const {Option} = Select;

const layout = {
    labelCol: {span: 12},
    wrapperCol: {span: 12},
};

const getFullName = (value)=>{
    return (value.lastName != null ? value.lastName + " " : "") + value.firstName + (value.secondName != null ? " " + value.secondName  : "")
}

const AddSubjectToGroup = observer((props) => {
    const [teachers, setTeachers] = useState(null);

    const setTeachersList = () =>{
        let teacherList = [];
        for (let i of userStore.teachers) {
            teacherList.push(<Option
                disabled={userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber][i.id]}
                value={i.id}>{userStore.shortenName(getFullName(i))}</Option>);
        }

        teacherList.sort(userStore.sortComparator);

        setTeachers(teacherList);
    }

    const onFinish = values => {
        props.resultEvent(values);
    };

    if (userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber] === undefined) {
        userStore.setTeachersDisabled(props.dayOfWeek, props.orderNumber).then((res) => {
            userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber] = {};

            for (let i of userStore.teachers) {
                userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber][i.id] = false;
            }

            if (res.data.teachersDisabled.length !== 0) {
                for (let o of res.data.teachersDisabled) {
                    userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber][o.teacher.id] = true;
                }
            }

            setTeachersList();

        });
    }

    useEffect(() => {
        userStore.setAllSubjects();
    }, []);


    let subjects = [];

    if (userStore.allSubjects !== null) {

        userStore.allSubjects.sort((a,b)=>userStore.sortComparator(a.subjectName, b.subjectName))
        for (let i of userStore.allSubjects) {
            subjects.push(<Option value={i.id}>{userStore.shortenName(i.subjectName)}</Option>);
        }
    }

    if (teachers === null || userStore.isTeachersDisabledReload) {
        if (userStore.teachers !== null && userStore.disabledMap[props.dayOfWeek + " " + props.orderNumber] !== undefined) {
            userStore.isTeachersDisabledReload = false;
            setTeachersList();
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
                    showSearch
                    filterOption={userStore.filterComparator}
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
                    showSearch
                    filterOption={userStore.filterComparator}
                    style={{width: 120}}>
                    {teachers}
                </Select>
            </Form.Item>
        </Form>

    </React.Fragment>;
});

const SubjectListPage = observer(() => {
    useEffect(() => {
        userStore.setTeachers();
    }, []);

    const [visible, setVisible] = useState(false);

    const [values, setValues] = useState({});

    const render = (context) => {
        if (context.subject === undefined) {
            return <Tooltip title="Добавить пару">
                <Button onClick={() => {
                    userStore.isTeachersDisabledReload = true;
                    setValues({dayOfWeek: context.dayOfWeek, orderNumber: context.orderNumber});
                    setVisible(true);
                }} type="primary" shape="circle" icon={<PlusOutlined/>}/>
            </Tooltip>
        } else {
            return <React.Fragment>
                <Text>{userStore.shortenName(context.subject.subjectName, 9)}</Text>
                <br/>
                <Text>{userStore.shortenName(getFullName(context.teacher), 9)}</Text>
                <br/>
                <Tooltip title="Удалить пару">
                    <Popconfirm
                        title="Вы уверены, что хотите удалить пару?"
                        onConfirm={() => {
                            userStore.isTeachersDisabledReload = true;
                            userStore.deleteGroupSubject(context);
                        }}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button danger type="primary" shape="circle" icon={<MinusOutlined/>}/>
                    </Popconfirm>
                </Tooltip>
            </React.Fragment>
        }
    };


    const [form] = Form.useForm();

    return <React.Fragment>
        <GroupSelector
            restoreEvent={(defOpen) => {
                if (userStore.subjectListOnWeekTable === undefined) {
                    userStore.setCurrentSubjectList(defOpen);
                }
            }}
            handleChange={(value) => {
                userStore.setCurrentSubjectList(value);
            }}/>
        <br/>
        <Table pagination={false}
               columns={userStore.columnsForSubjectList(render)}
               dataSource={userStore.subjectListOnWeekTable}
               size="middle"
               bordered/>
        <Modal
            onCancel={() => {
                setVisible(false);
                form.resetFields();
            }}
            onOk={() => {
                form.submit();
            }}
            visible={visible}>

            <AddSubjectToGroup form={form} dayOfWeek={values.dayOfWeek} orderNumber={values.orderNumber}
                               resultEvent={(res) => {
                                   setVisible(false);
                                   let data = {
                                       ...res,
                                       ...values,
                                       groupId: userStore.currentGroup
                                   };
                                   userStore.addGroupSubject(data);
                                   form.resetFields();
                               }}/>

        </Modal>
    </React.Fragment>

});

export default SubjectListPage;