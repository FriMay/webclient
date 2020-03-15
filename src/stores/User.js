import {action, observable} from 'mobx';
import React from "react";
import ApolloClient, {gql} from "apollo-boost";
import {message} from 'antd';

const client = new ApolloClient({
    uri: "http://localhost:5000/graphql/",
    headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS"
    }
});

const authorizationQuery = gql`query loginQuery($log:String!,$pass:String!) {
                                login(login:$log, password:$pass){
                                    id
                                    firstName
                                    secondName
                                }
                            }`;


class User {


    @observable currentUser = null;

    @action authorize(login, password) {
        client.query({
            query: authorizationQuery,
            variables: { log: login, pass: password}
        }).then(res => {
            if (res.data.login === null){
                message.info("Такого пользователя не существует!");
            }
            userStore.currentUser = res.data.login;
        }).catch(res => {
            message.error("Вам запрещён доступ в систему администрирования!");
        });
    }
}

const userStore = new User();

export default userStore;