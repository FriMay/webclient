import React from "react";
import '../App.css';
import {Button, Form, Input} from "antd";
import userStore from "../stores/User";
const {authorize} = userStore;

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};
const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
};

const Authorization = () => {
    const onFinish = values => {
        authorize(values.login, values.password);
    };

    return (
        <div className="App">
            <div className="App-header">
                <Form
                    {...layout}
                    name="basic"
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Логин"
                        name="login"
                        rules={[{required: true, message: 'Введите вашн имя пользователя!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[{required: true, message: 'Введите ваш пароль!'}]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Authorization;