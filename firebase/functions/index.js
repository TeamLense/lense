const functions = require('firebase-functions');
const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database().ref();

app.post('/new', (req, res) => {
  let classifier = req.query.classifier;
  let class_name = req.body.class;
  let url = req.body.url;
  let url_hash = hashCode(url); // hashed int value as key
  let image_key;

  let img_ref = databaseRef.child(classifier + '/' + class_name + "/" + url_hash);

  img_ref.once('value').then(snapshot => {
    if (snapshot.val() != null) {
      console.log(snapshot.val());
      img_ref.set({ url: url, report_count: snapshot.val().report_count + 1 })
    } else {
      console.log("empty image path");
      img_ref.set( {url: url, report_count: 1 } );
    }
    res.status(200).send("posting stuff to violence -> img: " + url + " of class: " + class_name);
  });
});

hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

exports.classifiers = functions.https.onRequest(app);
