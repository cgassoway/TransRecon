var mongoose = require("mongoose");

//Schema setup


var balanceSchema = new mongoose.Schema( {
  month: String,
  year: String,
  fiName: String,
  accountName: String,
  accountId: String,
  accountType: String,
  currentBalance: Number,
  startingBalance: Number,
  endingBalance: Number,
  dueDate: String,
  dueAmt: Number,
  created: {type:Date, default: Date.now()},
  updated: {type:Date, default: Date.now()}
});

    
module.exports = mongoose.model("balance", balanceSchema);
