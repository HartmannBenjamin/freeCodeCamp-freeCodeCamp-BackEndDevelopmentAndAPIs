require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

console.log("Hello World");

app.use((req, res, next) => {
 console.log(req.method + " " + req.path + " - " + req.ip);
 next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/now', (req, res, next) => {
 req.time = new Date().toString();
 next();
}, (req, res) => {
 res.json({time: req.time});
});

app.get('/:word/echo', (req, res, next) => {
 res.json({echo: req.params.word});
});

app.route('/name').get((req, res) => {
 let firstName = req.query.first;
 let lastName = req.query.last;
 res.send({name: firstName + ' ' + lastName});
}).post((req, res) => {
 let firstName = req.body.first;
 let lastName = req.body.last;
 res.send({name: firstName + ' ' + lastName});
});

app.use("/public", express.static(__dirname + "/public"));

app.get("/", function(req, res) {
 res.sendFile(__dirname + "/views/index.html");
});

app.get('/json', (req, res) => {
 let message = 'Hello json'
 if (process.env.MESSAGE_STYLE === 'uppercase') {
  return res.json({"message": message.toUpperCase()})
 }
 return res.status(200).json({"message": message})
});

module.exports = app;
