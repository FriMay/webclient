import React, {useEffect} from "react";
import {Select, Table} from "antd";
import userStore from "../../../stores/User";
import {observer} from "mobx-react";

const { Option } = Select;

const columns = [
    {
        title: 'Имя',
        dataIndex: 'firstName',
    },
    {
        title: 'Фамилия',
        dataIndex: 'lastName',
    },
    {
        title: 'Отчество',
        dataIndex: 'secondName',
    }
];

const StudentList = observer(() =>{
    let groups = [];
    let defaultOpen = userStore.currentUser.group[0].id;

    userStore.currentGroup = defaultOpen;

    if (userStore.currentStudentList === null){
        userStore.setCurrentStudentList(defaultOpen);
    }

    const handleChange = (value) => {
        userStore.currentGroup = value;
        userStore.setCurrentStudentList(value);
    };

    for (let i of userStore.currentUser.group){
        groups.push(<Option value={i.id}>{i.name}</Option>)
    }

    return <React.Fragment>
        <Select style={{ width: 120 }} defaultValue={defaultOpen} onChange={handleChange}>
            {groups}
        </Select>
        <br/>
        <Table columns={columns} dataSource={userStore.currentStudentList} size="middle" />
    </React.Fragment>;

});

export default StudentList;