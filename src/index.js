import React from 'react';
import ReactDOM from 'react-dom';
import Authorization from './pages/Authorization';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from "react-router-dom";
import CustomMenu from "./pages/CustomMenu";



ReactDOM.render(<Authorization />, document.getElementById('root'));
// ReactDOM.render(<BrowserRouter><CustomMenu /></BrowserRouter>,  document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
