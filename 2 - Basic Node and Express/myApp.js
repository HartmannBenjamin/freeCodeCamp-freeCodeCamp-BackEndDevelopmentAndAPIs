require('dotenv').config();

var express = require('express');
var app = express();

console.log("Hello World");

app.use((req, res, next) => {
 console.log(req.method + " " + req.path + " - " + req.ip);
 next();
});

app.get('/now', (req, res, next) => {
 req.time = new Date().toString();
 next();
}, (req, res) => {
 res.json({time: req.time});
});

app.get('/:word/echo', (req, res, next) => {
 res.json({echo: req.params.word});
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
