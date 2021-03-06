var mongoose = require("mongoose");

//Schema setup
var planSchema = new mongoose.Schema({
    date: Date,
    institution: String,
    accountName: String,
    merchant: String,
    amount: Number,
    frequency: String,
    untilDate:Date,
    memo: String,
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
})

   
module.exports = mongoose.model("plan", planSchema);
