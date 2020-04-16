import React, {useEffect, useState} from "react";
import {Button, Form, Input, Modal, Popconfirm, Select, Table, Tooltip} from "antd";
import userStore from "../../../stores/User";
import {observer} from "mobx-react";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";

const {Option} = Select;

const columnStyle = {
    width: 200
}

const columns = [
    {
        title: 'Имя',
        dataIndex: 'firstName',
        ...columnStyle
    },
    {
        title: 'Фамилия',
        dataIndex: 'lastName',
        ...columnStyle
    },
    {
        title: 'Отчество',
        dataIndex: 'secondName',
        ...columnStyle
    },
    {
        title: 'Логин',
        dataIndex: 'login',
        ...columnStyle
    },
    {
        title: 'Пароль',
        dataIndex: 'password',
        ...columnStyle
    },
    {
        title: 'Действия',
        ...columnStyle,
        align: 'center',
        render: (context) => {
            return <Tooltip title="Удалить студента" placement="rightTop">
                <Popconfirm placement="topLeft" title={"Вы уверены, что хотите удалить этого студента?"} onConfirm={()=>{
                    userStore.deleteUser(context);
                }} okText="Да" cancelText="Нет">
                    <Button type="primary" shape="circle" icon={<DeleteOutlined />} />
                </Popconfirm>
            </Tooltip>
        }

    }
];

const AddStudentModal = observer(() => {

    const [visible, setVisible] = useState(false);

    const layout = {
        labelCol: {span: 8},
        wrapperCol: {span: 15},
    };
    const [form] = Form.useForm();

    const onFinish = values => {
        userStore.addStudent(values, setVisible, form.resetFields);
    };

    let groups = [];

    for (let i of userStore.currentUser.group) {
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }

    return <React.Fragment>
        <Modal
            onOk={() => {
                form.submit();
            }}
            onCancel={
                () => {
                    setVisible(false);
                    form.resetFields();
                }
            }
            visible={visible}>
            <Form
                {...layout}
                name="basic"
                initialValues={{remember: true}}
                onFinish={onFinish}
                form={form}
            >

                <Form.Item
                    label="Фамилия"
                    name="lastName"
                    rules={[{required: true, message: 'Введите фамилию нового пользователя!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Имя"
                    name="firstName"
                    rules={[{required: true, message: 'Введите имя нового пользователя!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Отчество"
                    name="secondName"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Логин"
                    name="login"
                    rules={[{required: true, message: 'Придумайте логин новому пользователю!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{required: true, message: 'Придумайте пароль новому пользователю!'}]}
                >
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
        <Button onClick={() => {
            setVisible(true);
        }}>
            Добавить студента
        </Button>

    </React.Fragment>;
})


const StudentList = observer(() => {
    let groups = [];
    let defaultOpen = userStore.currentUser.group[0].id;

    useEffect(()=>{
        userStore.currentGroup = defaultOpen;
    }, []);

    if (userStore.currentStudentList === null || userStore.isStudentsListReload === true) {
        userStore.isStudentsListReload = false;
        userStore.setCurrentStudentList(defaultOpen);
    }

    const handleChange = (value) => {
        userStore.currentGroup = value;
        userStore.setCurrentStudentList(value);
    };

    for (let i of userStore.currentUser.group) {
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }

    return <React.Fragment>
        <Select style={{width: 120}} defaultValue={defaultOpen} onChange={handleChange}>
            {groups}
        </Select>
        <br/>
        <Table bordered={true} columns={columns} dataSource={userStore.currentStudentList[userStore.currentGroup]}
               size="middle"/>
        <AddStudentModal/>
    </React.Fragment>;

});

export default StudentList;