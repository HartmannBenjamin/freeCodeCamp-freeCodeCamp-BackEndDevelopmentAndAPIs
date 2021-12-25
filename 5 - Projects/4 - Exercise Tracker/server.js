const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ entended: false }));

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String
});

let Users = mongoose.model('users', userSchema);

const exerciceSchema = new Schema({
  idUser: String,
  description: String,
  duration: Number,
  date: Date,
});

let Exercices = mongoose.model('exercices', exerciceSchema);

app.post('/api/users', async function(req, res) {
  let username = req.body.username;

  if (!username) {
    return res.status(404).json({result: false})
  }

  let userData = await Users.findOne({
    username: req.body.username
  });

  if (userData) {
    return res.status(404).json({result: false})
  } else {
    Users.create({username: req.body.username}).then(async () => {
      let userInfo = await Users.findOne({username: req.body.username});
      return res.status(200).json(userInfo);
    })
  }
});

app.get('/api/users', async function(req, res) {
  let users = await Users.find();
  return res.status(200).json(users);
});

app.post('/api/users/:_id/exercises',
    async function(req, res) {
      let userData = await Users.findById(req.params._id);

      if (userData) {
        let description = req.body.description;
        let duration = req.body.duration;
        let dateStr = req.body.date;

        if (description && duration) {
          let date = null;

          if (dateStr) {
            date = new Date(dateStr);
          } else {
            date = Date.now();
          }

          try {
            Exercices.create({
              idUser: req.params._id,
              description: description,
              duration: duration,
              date: date,
            });
          } catch(e) {
            return res.status(404).json({msg: e});
          }

          let result = {};

          result._id = userData._id;
          result.username = userData.username;
          result.description = description;
          result.duration = parseInt(duration);
          result.date = new Date(date).toDateString();

          res.json(result);
        } else {
          return res.status(404).json({msg: "bad data provided"});
        }
      } else {
        return res.status(404);
      }
    }
);

app.get('/api/users/:_id/logs',
    async function(req, res) {
      if (req.params._id) {
        dataSearch = {idUser: req.params._id};

        if (req.query.from && req.query.to) {
          dataSearch.date = {
            $gte: new Date(req.query.from),
            $lt: new Date(req.query.to)
          }
        }

        let requestExercices = [];
        let countEcercices = 0;

        if (req.query.limit) {
          requestExercices = await Exercices.find(dataSearch).limit(parseInt(req.query.limit)).then(exercices => {
            return exercices;
          });
        } else {
          requestExercices = await Exercices.find(dataSearch);
        }

        let logs = [];

        requestExercices.forEach((elem) => {
          logs.push({
            description: elem.description,
            duration: elem.duration,
            date: elem.date.toDateString(),
          });
        });

        let userInfo = await Users.findById(req.params._id);
        let response = {};

        response.count = await Exercices.count({idUser: req.params._id});
        response.username = userInfo.username;
        response._id = req.params._id;
        response.log = logs;

        return res.status(200).json(response);
      } else {
        return res.status(404);
      }
    }
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
