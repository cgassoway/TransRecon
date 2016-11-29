var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
//Schema setup

var userSchema = new mongoose.Schema({
    firstName: String,
    middleInitial: String,
    lastName: String,
    username: String,
    password: String,
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
});


userSchema.plugin(passportLocalMongoose);    
module.exports = mongoose.model("User", userSchema);


