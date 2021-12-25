require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require('url');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

let URLmodel = mongoose.model('URL', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ entended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function(req, res) {
  const urlPost = req.body.url;
  const parsedUrl = url.parse(urlPost);
  let urlCountIds = await URLmodel.count();

  if(parsedUrl.protocol == "http:" || parsedUrl.protocol == "https:") {

    const lookupPromise = new Promise((resolve, reject) => {
      dns.lookup(parsedUrl.host, (err, address, family) => {
        if(err) reject(err);
        resolve(address);
      });
    });

    lookupPromise.then(
        async (address) => {
          try {
            let urlData = await URLmodel.findOne({
              original_url: urlPost
            });

            if(urlData) {
              res.json({
                original_url: urlData.original_url,
                short_url: urlData.short_url
              });
            } else {
              urlCountIds++;

              urlData = new URLmodel({
                original_url: urlPost,
                short_url: urlCountIds
              });

              await urlData.save();

              res.json({
                original_url: urlData.original_url,
                short_url: urlData.short_url
              });
            }
          } catch(e) {
            res.status(500);
          }
        },
        (e) => {
          res.json({ error: 'invalid url' });
        }
    );
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url?', async function(req, res) {
  try {
    const urlData = await URLmodel.findOne({
      short_url: req.params.short_url
    });

    if(urlData) {
      return res.redirect(urlData.original_url);
    } else {
      return res.status(404);
    }
  } catch(e) {
    res.status(500);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
