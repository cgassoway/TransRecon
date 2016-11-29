var mongoose = require("mongoose");

//Schema setup
var planSchema = new mongoose.Schema({
    dayOfMonth: Number,
    description: String,
    accountName: String,
    amount: Number,
    memo: String,
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
})

   
module.exports = mongoose.model("plan", planSchema);
