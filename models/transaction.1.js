var mongoose = require("mongoose");
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
//Schema setup

var transactionSchema = new mongoose.Schema({
    date: Date,
    description: String,
    original_description: String,
    amount: Number,
    transaction_type: String,
    category: String,
    accountName: String,
    institution: String,
    reconciled: {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Register"
            },
            status: String
            },
    date_reconciled: Date,
    plan_id: String,
    created: {type:Date, default: Date.now()},
    updated: {type:Date, default: Date.now()}    
});

    
module.exports = mongoose.model("transaction", transactionSchema);
