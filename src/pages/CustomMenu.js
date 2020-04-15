import userStore from "../stores/User";
import {StarOutlined, StarFilled, StarTwoTone} from '@ant-design/icons';
import {NavLink} from 'react-router-dom';
import React from "react";
import {Menu} from "antd";
import Routes from "./Routes";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";
import BookOutlined from "@ant-design/icons/lib/icons/BookOutlined";

const {SubMenu} = Menu;

const CustomMenu = () => {

    let items = [<Menu.Item key="general"><NavLink to={'/'}>Главная</NavLink></Menu.Item>];

    if (userStore.currentUser.userRole.roleName === "Teacher") {

    } else {
        items.push(
            <SubMenu
                key="students"
                title={
                    <span>
                <UserOutlined/>
                <span>Студенты</span>
              </span>
                }
            >
                <Menu.Item key="addStudent"><NavLink to={'/addStudent'}>Добавить студента</NavLink></Menu.Item>
                <Menu.Item key="studentList"><NavLink to={'/studentList'}>Список студентов</NavLink></Menu.Item>
            </SubMenu>,
            <SubMenu
                key="subjects"
                title={
                    <span>
                <BookOutlined/>
                <span>Предметы</span>
              </span>}
            >
                <Menu.Item key="subjectList"><NavLink to={'/subjectList'}>Расписание</NavLink></Menu.Item>
            </SubMenu>
        );
    }
    // items.push(<Menu.Item key="addStudent"><NavLink to={'/addStudent'}>Добавить студента</NavLink></Menu.Item>);


    return <React.Fragment>
        <Menu style=
                  {{
                      width: "256px",
            height: "100vh",
            float: "left"
                  }}
              mode="inline"
              theme="dark"
              defaultSelectedKeys={['general']}>
            {items}
            <div id={'content'}/>
        </Menu>
        <div style={{
            minHeight: '100vh', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Routes/>
        </div>

    </React.Fragment>
};

export default CustomMenu;