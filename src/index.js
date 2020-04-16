import React from 'react';
import ReactDOM from 'react-dom';
import Authorization from './pages/Authorization';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Authorization />, document.getElementById('root'));

serviceWorker.unregister();
