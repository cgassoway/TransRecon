var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    //Transactions    = require("../models/transaction"),
    //Register        = require("../models/register"),
    //Balances        = require("../models/balances")
    tools           = require("../shared/pgtools"),
    middleware      = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//MATCH ROUTES
//================================================
//
//INDEX route non-Reconciles Transactions Only
router.get("/",   middleware.isLoggedIn, function(req, res) {
  var transText = 'SELECT * FROM transactions WHERE status = \'No\' ORDER BY date DESC, account_name ASC'
  var regText = 'SELECT * FROM registers WHERE status = \'No\' ORDER BY date DESC, account_name ASC'
  tools.runQuery(transText, [], (err, alltransactions) => {  
    if (err) throw err;
    tools.runQuery(regText, [], (err, foundRegister) => {  
      if (err) throw err;
      res.render("match", {transaction: alltransactions, register: foundRegister});
      });
  });
});


//INDEX route All Transactions
//router.get("/",  middleware.isLoggedIn, function(req, res) {
router.get("/all",   middleware.isLoggedIn, function(req, res) {
  var transText = 'SELECT * FROM transactions ORDER BY date DESC, account_name ASC'
  var regText = 'SELECT * FROM registers ORDER BY date DESC, account_name ASC'
  tools.runQuery(transText, [], (err, alltransactions) => {  
    if (err) throw err;
    tools.runQuery(regText, [], (err, foundRegister) => {  
      if (err) throw err;
      res.render("match", {transaction: alltransactions, register: foundRegister});
    })
  });
});


//SHOW route
//This is the route to show info on one Balances
router.get("/:id",  middleware.isLoggedIn, function(req, res) {
  //  find the Balances with the ID provided
  //render the Show Template with that Balances
  Balances.findById(req.params.id).exec(function(err, foundBalances) {
    if (err) {
      console.log(err);
    } else {
      res.render("balances/", {balances: foundBalances});
    }
  });
});

//EDIT MATCH ROUTE
 
//router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
router.get("/:transaction_id/edit",  middleware.isLoggedIn, function(req, res) {
  var transText = 'SELECT * FROM transactions WHERE transaction_id = ' + req.params.transaction_id
  tools.runQuery(transText, [], (err, foundTransaction) => {  
    if (err) {
      console.log(err);
      res.redirect("back");
    } 
    res.render("match/edit", {transaction: foundTransaction});
  });
 });
 


//UPDATE MATCH ROUTE
 
router.put("/:transaction_id", middleware.isLoggedIn, function(req, res){
  date = tools.getNewDate(new Date());
  var transText = 'UPDATE transactions SET status = \'' + req.body.reconciled + 
      '\', status_date = \'' + date + '\' WHERE transaction_id = ' + req.params.transaction_id;
  console.log(transText)
  tools.runQuery(transText, [], (err, foundTransaction) => {  
    if (err) {
      console.log("Match Transaction update error" + err );
      console.log("ID is " + req.body.match);
      res.redirect("back");
    } 
    text = 'select * from transactions where transaction_id = ' + req.params.transaction_id
    tools.runQuery(text, [], (err, foundTransaction) => {
      if (err) {
        console.log("Match Transaction seek error" + err );
        console.log("ID is " + req.params.transaction_id);
        res.redirect("back");
      }
      if (foundTransaction[0].register_id === 0) {
        addNewRegister(foundTransaction, (callback) => {
          res.redirect("/TransRecon/match");  
        });
        
      } else {
        updateReconStatus(foundTransaction, (callback) => {
          res.redirect("/TransRecon/match");  
        }); 
      }
    });
  });
});

function addNewRegister(foundTransaction, callback) {
  var holdMemo = ' '
  if(foundTransaction.memo !== undefined && foundTransaction[0].memo !== null) {
    holdMemo = foundTransaction[0].memo
  }

  var text = 'INSERT INTO registers (date, merchant, amount, account_name, memo, status, transaction_id, status_date)' +
                              'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  var dateToday = new Date();
  var values = [foundTransaction[0].date, foundTransaction[0].merchant, foundTransaction[0].amount, 
                  foundTransaction[0].account_name, foundTransaction[0].memo,
                  foundTransaction[0].status, foundTransaction[0].transaction_id, 
                  foundTransaction[0].status_date];
  tools.runQuery(text, values, (err, results) => {
    if (err) {
      console.log(err);
      res.redirect("back")
    } 
    var regText = 'SELECT register_id, transaction_id FROM registers WHERE transaction_id = ' + foundTransaction[0].transaction_id;
    tools.runQuery(regText, [], (err, newRegister) => {
      if(err) {
        console.log(err);
        res.redirect("back")
      }
      var transText = 'UPDATE transactions SET register_id = ' + newRegister[0].register_id +
            ' WHERE transaction_id = ' + newRegister[0].transaction_id
      tools.runQuery(transText, [], (err, trans) => {
        if(err) {
          console.log(err);
          res.redirect("back")
        }
        callback();  
      })  
  });
 })
}

function updateReconStatus(foundTransaction, callback) {
  text = 'SELECT * FROM registers WHERE register_id = ' + foundTransaction[0].register_id
  tools.runQuery(text, [], (err, regItem) => {
    if (err) {
      console.log("Match Register seek error" + err );
      console.log("ID is " + foundTransaction.register_id);
      res.redirect("back");
    } 
    var text = 'UPDATE registers SET transaction_id = ' + foundTransaction[0].transaction_id +
                ', status = \'' + foundTransaction[0].status + 
                '\', status_date = \'' + foundTransaction[0].status_date +
                '\' WHERE register_id = ' + regItem[0].register_id
    tools.runQuery(text, [], (err, trans) => {
      if(err) {
        console.log(err);
        res.redirect("back")  
      }
    callback();
    });
  })
}



module.exports = router;
