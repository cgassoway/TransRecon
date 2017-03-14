var mongoose = require("mongoose");
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
//Schema setup

var transactionSchema = new mongoose.Schema({
  date: Date,
  institution: String,
  accountName: String,
  merchant: String,
  amount: Number,
  transaction_type: String,
  category: String,
  reconciled: {
          id:{
              type: mongoose.Schema.Types.ObjectId,
              ref: "Register"
          },
          date: Date,
          status: String
          },
      

  created: {type:Date, default: Date.now()},
  updated: {type:Date, default: Date.now()}    
});

    
module.exports = mongoose.model("transaction", transactionSchema);
