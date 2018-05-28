/*eslint-disable*/
import React from 'react';
import ReactDOM from 'react-dom';
import "antd/dist/antd.css";
import MyRouts from './MyRouts';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as firebase from 'firebase';

 const config = {
    apiKey: "AIzaSyBWDeUU9s3nuMD_5Mn1NvH_Wj9pz10Vkn0",
    authDomain: "mycommerce-8f129.firebaseapp.com",
    databaseURL: "https://mycommerce-8f129.firebaseio.com",
    projectId: "mycommerce-8f129",
    storageBucket: "mycommerce-8f129.appspot.com",
    messagingSenderId: "1052647827328"
  };
  firebase.initializeApp(config);



ReactDOM.render(<MyRouts />, document.getElementById('root'));
registerServiceWorker();
