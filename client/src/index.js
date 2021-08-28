// React stuff
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// CSS
import './styles/_loadingstyles.scss';
import 'tippy.js/dist/tippy.css'; // optional for styling

// Translations
import './i18n';

// Other stuff
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { WholePageLoader } from './components/WholePageLoader.jsx';
import store from './store';
import { gameActionTypes } from './actions/gameActions';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Suspense fallback={<WholePageLoader />}>
                <Router>
                    <App />
                </Router>
            </Suspense>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
