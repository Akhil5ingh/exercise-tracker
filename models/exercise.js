// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var exerciseSchema = new Schema({
  "description":{type: String},
  "duration":{type:Number},
  "date":{type: Date}
});

// the schema is useless so far
// we need to create a model using it
var Exercise = mongoose.model('Exercise',exerciseSchema);

// make this available to our users in our Node applications
module.exports = Exercise;
// {"username":"hinanana","description":"testing","duration":5,"_id":"B1F2pmFwV","date":"Fri Mar 15 2019"}
