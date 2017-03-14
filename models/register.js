var mongoose = require("mongoose");

//Schema setup
var registerSchema = new mongoose.Schema({
    date: Date,
    accountName: String,
    institution: String,
    merchant: String,
    amount: Number,
    memo: String,
    reconciled: {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction"
            },
            status: String,
            date: Date
            },
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
})

   
module.exports = mongoose.model("register", registerSchema);
