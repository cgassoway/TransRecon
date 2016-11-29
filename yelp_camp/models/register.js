var mongoose = require("mongoose");

//Schema setup
var registerSchema = new mongoose.Schema({
    date: Date,
    description: String,
    accountName: String,
    amount: Number,
    memo: String,
    institution: String,
    reconciled: {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction"
            },
            status: String,
            date: Date,
            description: String,
            amount: Number,
            transaction_type: String,
            accountName: String,
            },
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
})

   
module.exports = mongoose.model("register", registerSchema);
