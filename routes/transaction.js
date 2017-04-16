console.log('Got into transactions.js')
var express     = require("express"),
    router      = express.Router(),
    //Transaction  = require("../models/transaction"),
    //Register     = require("../models/register"),
    tools         = require('../shared/pgtools'),
    pool          = require ('../shared/pgpool'),           
    query         = require('../shared/pgquery'),
    middleware  = require("../middleware");  //index.js is automatically picked up because of it's name
    
console.log('Got into transactions.js past var')    
//================================================

//===============================
//  TransactionS Route
//===============================

//INDEX route
router.get("/", middleware.isLoggedIn, function(req, res) {

  var text = "SELECT * FROM transactions ORDER BY date DESC, merchant ASC, account_name ASC";
  tools.runQuery(text, [], (err, allTransactions) => {
  if (err) throw err;
  res.render("transactions/index", {transactions: allTransactions});
  });
});

module.exports = router;