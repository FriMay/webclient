
import React from "react";
import {Button, Form, Input, Select} from "antd";
import userStore from "../../../stores/User";

const { Option } = Select;


const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};
const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
};


const AddStudent = () => {
    const onFinish = values => {
        userStore.addStudent(values);
    };

    let groups = [];

    for (let i of userStore.currentUser.group){
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
                label="Имя"
                name="firstName"
                rules={[{required: true, message: 'Введите имя нового пользователя!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                label="Фамилия"
                name="lastName"
                rules={[{required: true, message: 'Введите фамилию нового пользователя!'}]}
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
                label="Группа"
                name="groupId"
                rules={[{required: true, message: 'Выберите группу!'}]}
            >
                <Select  style={{ width: 120 }} >
                    {groups}
                </Select>
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


            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" >
                    Добавить
                </Button>
            </Form.Item>
        </Form>

    </React.Fragment>;
};

export default AddStudent;