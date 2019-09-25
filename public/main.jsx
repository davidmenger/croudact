
import React from 'react';
import ReactDom from 'react-dom';
import 'babel-polyfill';
import './main.scss';
import App from './components/App';

const div = document.getElementById('app');

ReactDom.render(
    (<App />),
    div
);
