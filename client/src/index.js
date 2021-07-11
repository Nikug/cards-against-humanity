// React stuff
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

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

ReactDOM.render(
    <React.StrictMode>
        <Suspense fallback={<WholePageLoader />}>
            <Router>
                <App />
            </Router>
        </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
