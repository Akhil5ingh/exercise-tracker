// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var exerciseSchema = new Schema({
  "description":{type: String},
  "duration":{type:Number},
  "date":{type: Date}
});

var userSchema = new Schema({
  "username": {type: String, required:true},
  "_id":{type:String, requried:true},
  "exercise": [exerciseSchema]
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User',userSchema);

// make this available to our users in our Node applications
module.exports = User;
