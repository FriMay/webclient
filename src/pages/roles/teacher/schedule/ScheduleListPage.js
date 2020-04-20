import {observer} from "mobx-react";
import React, {useEffect, useState} from "react";
import userStore from "../../../../stores/User";
import {Calendar, message, Modal, Select, Steps, Table} from "antd";
import Text from "antd/es/typography/Text";
import EditTwoTone from "@ant-design/icons/lib/icons/EditTwoTone";

const {Option} = Select;

const {Step} = Steps;

const EditAttendanceModal = observer((props) => {

    let {data} = props;

    const columnStyle = {
        width: 200
    }

    const columns = [
        ...userStore.columnsForStudentList(columnStyle),
        {
            ...columnStyle,
            title: "Оценка студента",
            render: context => {
                let marks = [];
                let defaultOpen;
                if (userStore.markList !== null) {
                    for (let i of userStore.markList) {

                        marks.push(<Option value={i.id}>{userStore.shortenName(i.markValue)}</Option>)
                    }

                    let us = userStore.attendance;
                    debugger;
                    if (userStore.attendance[userStore.currentGroup][data.id][calendarValue][context.id] !== undefined) {
                        defaultOpen = userStore.attendance[userStore.currentGroup][data.id][calendarValue][context.id].markId;
                    }
                }

                const handleChange = (value) => {
                    userStore.attendance[userStore.currentGroup][data.id][calendarValue][context.id] = {
                        groupSubjectId: data.id,
                        markId: value,
                        studentId: context.id,
                        issueData: calendarValue
                    }
                }

                return <Select
                    style={{width: 120}}
                    defaultValue={defaultOpen}
                    onChange={handleChange}
                    showSearch
                    filterOption={userStore.filterComparator}
                >
                    {marks}
                </Select>
            }
        }
    ]

    const [visible, setVisible] = useState(false);

    const [current, setCurrent] = useState(0);

    const [calendarValue, setCalendarValue] = useState(null);

    const onSelect = value => {
        value.second(0);
        value.minute(0);
        value.hour(13);
        userStore.currentGroup = data.group.id;
        if (userStore.currentStudentList[userStore.currentGroup] === undefined) {
            userStore.setCurrentStudentList(data.group.id, userStore.setAttendance, {id: data.id, date: value});
        } else {
            userStore.setAttendance({id: data.id, date: value});
        }
        setCalendarValue(value);
    }

    const next = () => {
        setCurrent(current + 1);
    }

    const prev = () => {
        setCurrent(current - 1);
    }

    const steps = [
        {
            title: 'Выберите дату',
            content:
                    <Calendar
                        onSelect={onSelect}
                        value={calendarValue}
                        rules={[{required: true, message: 'Please input your password!'}]}
                        disabledDate={(disableDate) => {
                            if (data !== undefined) {
                                let currentDay = disableDate.day() === 0 ? 7 : disableDate.day();
                                return currentDay !== data.dayOfWeek;
                            }
                            return false;
                        }}
                    />

        },
        {
            title: 'Измените посещаемость',
            content:
                <React.Fragment>
                    <br/>
                    <Table
                        pagination={false}
                        bordered={true}
                        columns={columns}
                        dataSource={userStore.currentStudentList[userStore.currentGroup]}
                    />
                </React.Fragment>,
        }
    ];

    return (
        <React.Fragment>
            <Modal
                width={"150vh"}
                style={{ top: 7, height:"80vh" }}
                closable={false}
                visible={visible}
                okText={current !== 1 ? "Следующий шаг" : "Сохранить"}
                cancelText={"Предыдущий шаг"}
                cancelButtonProps={{
                    disabled: current === 0
                }}
                onCancel={() => {
                    if (current === 0) {
                        setCalendarValue(null);
                        setVisible(false);
                        if (userStore.attendance[userStore.currentGroup] !== undefined)
                            if (userStore.attendance[userStore.currentGroup][data.id]!==undefined)
                                userStore.attendance[userStore.currentGroup][data.id][calendarValue] = undefined;
                    } else {
                        prev();
                    }

                }}
                onOk={() => {
                    if (current === 0) {
                        if (calendarValue === null) {
                            message.info("Чтобы продолжить выберите дату!")
                        } else {
                            if (userStore.markList === null) {
                                userStore.setMarkList().then(() => {
                                    next();
                                });
                            } else {
                                next();
                            }
                        }
                    }
                    if (current === 1) {
                        userStore.editUserMarkByUserList(userStore.attendance[userStore.currentGroup][data.id][calendarValue])
                            .then(() => {
                                message.success("Изменения успешно сохранены!");
                                setCurrent(0);
                                setCalendarValue(null);
                                setVisible(false);
                            });
                    }
                }}
            >
                <div>
                    <Steps current={current}>
                        {steps.map(item => (
                            <Step key={item.title} title={item.title}/>
                        ))}
                    </Steps>
                    <div>{steps[current].content}</div>
                </div>
            </Modal>
            <EditTwoTone onClick={() => {
                setVisible(true);
            }}/>
        </React.Fragment>
    );
});

const ScheduleListPage = observer(() => {
    useEffect(() => {
        userStore.setScheduleListForTeacher();
    }, []);

    let data = [];
    if (userStore.teacherScheduleList !== null) {
        data = JSON.parse(JSON.stringify(userStore.COUPLE_DATA));
        for (let i of userStore.teacherScheduleList) {
            data[i.orderNumber - 1][i.dayOfWeek] = i;
        }

        for (let i = 0; i < data.length; i++) {
            for (let j = 1; j <= 7; j++) {
                if (data[i][j] === undefined)
                    data[i][j] = {dayOfWeek: j, orderNumber: i + 1};
            }
        }
    }

    return <Table
        bordered={true}
        dataSource={data}
        pagination={false}
        columns={userStore.columnsForSubjectList((context) => {
            if (context.id !== undefined) {
                return <React.Fragment>
                    <Text>{userStore.shortenName(context.subject.subjectName, 9)}</Text>
                    <br/>
                    <Text>{userStore.shortenName(context.group.name, 9)}</Text>
                    <br/>
                    <EditAttendanceModal data={context}/>
                </React.Fragment>
            }
        })}/>
        ;
});

export default ScheduleListPage;