import React from 'react';
import ReactDOM from 'react-dom';
import AuthorizationPage from './pages/AuthorizationPage';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<AuthorizationPage />, document.getElementById('root'));

serviceWorker.unregister();
