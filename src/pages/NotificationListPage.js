import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import GroupSelector from "./utils/GroupSelector";
import userStore from "../stores/User";
import {Button, Col, Form, Input, Modal, Row, Select, Table, Tooltip, message} from "antd";
import CheckOutlined from "@ant-design/icons/lib/icons/CheckOutlined";
import LoadingOutlined from "@ant-design/icons/lib/icons/LoadingOutlined";


const {TextArea} = Input;

const {Option} = Select;

const AddNotificationModal = observer(() => {
    const [form] = Form.useForm();

    const [visible, setVisible] = useState(false);

    const layout = {
        labelCol: {span: 6},
        wrapperCol: {span: 15},
    };

    const onFinish = values => {
        userStore.addNotification(values.message)
            .then(()=>{
                message.success("Уведомление успешно добавлено!");
                form.resetFields();
                userStore.setNotificationList(5);
                setVisible(false);
            })
        ;
    };

    return <React.Fragment>
        <Modal
            visible={visible}
            onOk={()=>{
                form.submit();
            }}
            onCancel={()=>{
                form.resetFields();
                setVisible(false);
            }}
        >
            <Form
                {...layout}
                form={form}
                onFinish={onFinish}
                initialValues={{remember: true}}>
                <Form.Item
                    label={"Сообщение"}
                    name="message"
                    rules={[{required: true, message: 'Введите фамилию нового пользователя!'}]}
                >
                    <TextArea rows={4}/>
                </Form.Item>
            </Form>
        </Modal>
        <Button
            type={"primary"}
            onClick={() => {
            form.resetFields();
            setVisible(true);
        }}>
            Добавить уведомление
        </Button>

    </React.Fragment>


});

const DeleteNotification = observer(() =>{
    return <Button
        disabled={userStore.currentNotification === null}
        danger
        onClick={()=>{
            userStore.deleteNotification().then(() => {
                message.success("Уведомление удалено успешно!");
                userStore.currentNotification = null;
                userStore.notificationSelectReload();
                userStore.setNotificationList(5);
            });
        }}
    >
        Удалить уведомление
    </Button>;
});

const NotificationSelector = observer((props) => {

    let notifications = [];

    const handleChange = (value) => {
        userStore.currentNotification = value;
    }

    if (userStore.notificationList[userStore.currentGroup] !== undefined) {
        for (let i of userStore.notificationList[userStore.currentGroup].notificationsByGroupId) {
            notifications.push(<Option value={i.id}>{userStore.shortenName(i.message)}</Option>)
        }

        notifications.sort(userStore.sortComparator);
    }

    return <Form form={props.form}>
        <Form.Item
            name="notificationId"
        >
            <Select
                showSearch
                filterOption={userStore.filterComparator}
                style={{width: 120}} onChange={handleChange}
                disabled={userStore.notificationList[userStore.currentGroup] !== undefined && notifications.length === 0}
                loading={userStore.notificationList[userStore.currentGroup] === undefined}
            >
                {notifications}
            </Select>
        </Form.Item>
    </Form>;

});

const NotificationTable = observer(() => {

    const columnStyle = {
        width: 200
    }

    const columns = [
        ...userStore.columnsForStudentList(columnStyle),
        {
            title: 'Статус уведомления',
            dataIndex: 'id',
            ...columnStyle,
            align: 'center',
            render: (context) => {
                if (userStore.currentNotification !== null) {
                    let condition = userStore
                        .notificationList[userStore.currentGroup]
                        .notified[userStore.currentNotification][context];
                    let icon = condition
                        ? <CheckOutlined/> :
                        <LoadingOutlined/>;

                    return <Tooltip
                        title={condition ?
                            "Уведомление получено" :
                            "Уведомление ещё не получено"}
                        placement="rightTop">
                        {icon}
                    </Tooltip>;
                } else {
                    return <React.Fragment/>;
                }

            }

        }
    ];

    let data;
    if (userStore.notificationList[userStore.currentGroup] !== undefined) {
        data = userStore.notificationList[userStore.currentGroup].studentsByGroupId;
    }
    if (userStore.currentNotification !== null) {
        data = userStore.notificationList[userStore.currentGroup].studentsByGroupId;
    }

    return <Table
        bordered={true}
        dataSource={data}
        columns={columns}/>
});

const NotificationListPage = observer(() => {

    let [form] = Form.useForm();

    userStore.notificationSelectReload = form.resetFields;

    return <React.Fragment>
        <Row>
            <Col span={8}>
                Группа:
                <GroupSelector
                    restoreEvent={() => {
                        useEffect(() => {
                            userStore.setNotificationList();
                        }, []);
                    }}
                    handleChange={() => {
                        userStore.currentNotification = null;
                        form.resetFields();
                        userStore.setNotificationList();
                    }}
                />
            </Col>
            <Col span={8} offset={8}>
                Уведомление:
                <NotificationSelector
                    form={form}
                />
            </Col>
        </Row>

        <NotificationTable/>

        <Row>
            <Col span={8}>
                <AddNotificationModal/>
            </Col>
            <Col span={8} offset={8}>
                <DeleteNotification/>
            </Col>
        </Row>

    </React.Fragment>;
});

export default NotificationListPage;