require('dotenv').config();

var express = require('express');
var app = express();

console.log("Hello World");

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
