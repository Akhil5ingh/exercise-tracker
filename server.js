'use strict';

// require('dotenv').load();

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOLAB_URI,
  {useNewUrlParser: true},
  function(error){
    if(error) console.log(error);
    console.log("connection successful");
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// My code
var User = require('./models/user');

// To clean records
// User.deleteMany({}, function(err, users) {
//   if (err) throw err;
//   console.log('User: Remove old records');
// });

// Find records
var findUsername = function(res,name){
  User.find({"username": name}, (err,data)=>{
    if (err) { return console.log("Error: find user name")}
    if (data.length===0){
      newIdAndCreate(res,name)
    } else {
      console.log("Find old record, id: ",data[0]["_id"])
      res.send('username already taken')
    }
  })
}

var newIdAndCreate = function(res,name){
  User.countDocuments({}, function(err, count) {
    if (err) { return console.log("Error: coundDocuments") }
    var id = ('0000'+(count+1)).slice(-5)
    console.log('New id: ', id)
    createAndSaveUser(name,id)
    res.json({
      "username": name,
      "_id": id
    });
  });
}

var createAndSaveUser = function(name,id){
  var newUser = new User({
    "username": name,
    "_id": id
  });
  newUser.save(function(err){
    if (err) { return console.log("Error: save user")};
    console.log('New user created, id: ',id)
    return
  });
};

// For adding exercise
var findUserId = function(req,res){
  User.find({"_id": req.body.userId}, (err,data)=>{
    if (err) { return console.log("Error: find user name")}
    if (data.length===0){
      res.send('unknown _id')
    } else {
      pushExer(req,res,data)
    }
  })
}

var pushExer = function(req,res,data){
  var id= req.body.userId;
  var description= req.body.description;
  var duration= req.body.duration;

  if (description=='') { return res.send('Path `description` is required.')}
  if (duration=='') { return res.send('Path `duration` is required.')}
  if (parseInt(duration).toString()!=duration) {
    console.log(duration, parseInt(duration).toString())
    return res.send('Cast to Number failed for value "'+duration+'" at path "duration"')
  }

  if (req.body.date==''){
    var date = new Date();
  } else {
    var date = new Date(req.body.date);
    if (date.getTime() !== date.getTime()){
      return res.send('Cast to Date failed for value " '+req.body.date+'" at path "date"')
    }
    console.log(date)
  }

  var exerData = {
    "description":description,
    "duration":   parseInt(duration),
    "date":       date}

  console.log(exerData)

  var returnData = {
    "username":   data[0]['username'],
    "description":description,
    "duration":   parseInt(duration),
    "_id":        id,
    "date":       date.toString().slice(0,15)}

  console.log(returnData)

  User.updateOne({"_id":id},{$push:{"exercise":exerData}},(err)=>{
    if (err) { return console.log(err,"Error: save exercise")};
    console.log('New exer created')
    res.json(returnData);
  });
};

app.post('/api/exercise/new-user',(req,res)=>{
  var name= req.body.username;
  findUsername(res,name)
});

app.post('/api/exercise/add',(req,res)=>{
  findUserId(req,res)
});

app.get('/api/exercise/log',(req,res)=>{
  var id = req.query.userId
  User.find({'_id':id},(err,data)=>{
    if (err) { return console.log(err,'Error:find records from query')}
    var result = {
      "_id": data[0]["_id"],
      "username": data[0]["username"]
    }
    var log = data[0]["exercise"]
    if (req.query.from!=undefined){
      var from = new Date(req.query.from)
      result["from"]=from.toString().slice(0,15)
      log = log.filter((x) => x['date'] > from)
    };
    if (req.query.to!=undefined){
      var to = new Date(req.query.to)
      result["to"]=to.toString().slice(0,15)
      log = log.filter((x) => x['date'] < to)
    };
    if (req.query.limit!=undefined){
      var limit = req.query.limit
      if (log.length > limit){
        log = log.slice(0,limit)
      }
    };
    result["count"] = log.length;
    log = log.map((x)=>{
      return {
        "description": x["description"],
        "duration": x["duration"],
        "date": x["date"].toString().slice(0,15)
      }
    })
    result['log'] = log;
    res.json(result)
  })
});


// End of my own code

// Error handling

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})
