const functions = require('firebase-functions');
const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database().ref();

app.get('/hello', (req, res) => {
    res.send("Hello World")
})

exports.app = functions.https.onRequest(app);
