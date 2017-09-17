const config = {
    "url": "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/",
    "api_key": "f72f7c2a51b8ba214a3948b279914c80208a2311",
}

const functions = require('firebase-functions');
const express = require('express');
const axios = require('axios');
// const bodyParser = require('body-parser');
const app = express();
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database().ref();

app.post('/new', (req, res) => {
  let url = req.body.url;
  let url_hash = hashCode(url); // hashed int value as key
  let req_url = `${config.url}classify?version=2016-05-20&api_key=${config.api_key}&classifier_ids=${req.query.classifier}&url=${url}`;
  axios.get(req_url)
  .then(response => {
    image_classes = response.data.images[0].classifiers[0].classes;
    let max_score = 0;
    let top_class;
    image_classes.forEach( (cls) => {
      if(cls.score > max_score){
        max_score = cls.score;
        top_class = cls.class;
      }
    });
    let img_ref = databaseRef.child(req.query.classifier + '/' + top_class + "/" + url_hash);

    img_ref.once('value').then(snapshot => {
      if (snapshot.val() != null) {
        img_ref.set({ url: url, report_count: snapshot.val().report_count + 1 })
      } else {
        img_ref.set( {url: url, report_count: 1 } );
      }
      res.status(200).send("posting stuff to violence -> img: " + url + " of class: " + top_class);
    });
  })
  .catch(error => {
    console.error(error);
    res.status(500).send("internal error");
  });

});

const hashCode = (str) => {
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
