var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    //Transactions    = require("../models/transaction"),
    //Register        = require("../models/register"),
    //Balances        = require("../models/balances")
    tools           = require("../shared/pgtools")
    middleware      = require("../middleware");  //index.js is automatically picked up because of it's name
//================================================
//Report ROUTES
//================================================
//

//Reports Selection Route

router.get("/",   middleware.isLoggedIn, function(req, res) {
  //console.log("All query strings: " + JSON.stringify(req.query.dateFrom));
  var text = 'SELECT DISTINCT institution FROM transactions ORDER BY institution';
  tools.runQuery(text, [], (err, finInst) => {
    res.render("reports/bldreports", {finInst: finInst});
  });
});

// Display Reports
router.get("/bldRegReports",   middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT DISTINCT institution FROM registers ORDER BY institution';
  tools.runQuery(text, [], (err, finInst) => {
    res.render("reports/bldRegReports", {finInst: finInst});
  });
});
  
router.get("/bldTransReports",   middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT DISTINCT institution FROM transactions ORDER BY institution';
  tools.runQuery(text, [], (err, finInst) => {
    res.render("reports/bldTransReports", {finInst: finInst});
  });
});
router.get("/bldSummaryReports",   middleware.isLoggedIn, function(req, res) {
  var text = 'SELECT DISTINCT institution FROM transactions ORDER BY institution';
  tools.runQuery(text, [], (err, finInst) => {
    res.render("reports/bldSummaryReports");
    });
});


//Reports generation Route

router.get("/register",   middleware.isLoggedIn, function(req, res) {
  var queryParams = req.query;
  //Format params in query to the form to build JSON format query string
  var rptParams = tools.bldQuery(queryParams, 'registers')
  console.log(rptParams)
  //Get selected documents and render the query
  tools.runQuery(rptParams, [], (err, foundRegister) => {
    if (err) throw err;
    res.render("reports/regReport", {registers: foundRegister, rptData: "Register"});
  }); 
});

router.get("/transactions",   middleware.isLoggedIn, function(req, res) {
  var queryParams = req.query;
  //Format params in query to the form to build JSON format query string
  var rptParams = tools.bldQuery(queryParams, 'transactions')
  console.log(rptParams)
  //Get selected documents and render the query
  tools.runQuery(rptParams, [], (err, foundRegister) => {
    if (err) throw err;
    res.render("reports/regReport", {registers: foundRegister, rptData: "Transaction"});
  }); 

});

router.get("/summary",   middleware.isLoggedIn, function(req, res) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var rptFromDate = monthNames[Number(req.query.dateFrom.substr(0,2) - 1)] + " " +
                                      req.query.dateFrom.substr(3,2) + " " +
                                      req.query.dateFrom.substr(6,4);
  var rptToDate = monthNames[Number(req.query.dateTo.substr(0,2) - 1)] + " " +
                                      req.query.dateTo.substr(3,2) + " " +
                                      req.query.dateTo.substr(6,4);
  var rptDate = '{"date": {"$gte": "' + rptFromDate + '", "$lte": "' + rptToDate + '"}';
  
  var rptParams = rptDate + "}";
  var parsedParams = JSON.parse(rptParams);
 
  var summaryCtrs = {
                    fromDate: rptFromDate,
                    toDate: rptToDate,
                    reconciled:{
                            spent: 0,
                            income: 0,
                            count: 0
                      
                    },
                    unreconciled:{
                            spent: 0,
                            income: 0,
                            count: 0
                      
                    },
                    committed: {
                          spent: 0,
                          income: 0,
                          count: 0
                    }
                  };
  Transactions.find(parsedParams).exec(function(err, foundTransactions) {
    if (err) throw err;
    foundTransactions.forEach (function(transData) {
      if (transData.amount > 0) {
        if (transData.reconciled.status === 'Yes') {
          summaryCtrs.reconciled.count++;
          summaryCtrs.reconciled.income += transData.amount;
        } else {
          summaryCtrs.unreconciled.count++;
          summaryCtrs.unreconciled.income += transData.amount;
        }
      } else if (transData.reconciled.status === 'Yes') {
        summaryCtrs.reconciled.count++;
        summaryCtrs.reconciled.spent += transData.amount
      } else {
        summaryCtrs.unreconciled.count++;
        summaryCtrs.unreconciled.spent +=transData.amount;
      }
    });

    Register.find(parsedParams).exec(function(err, foundRegister) {
      if (err) throw err;
      foundRegister.forEach (function(regData) {
        //console.log("regAmount = " + regData.amount)
        if (regData.reconciled.status !== 'Yes') {
          summaryCtrs.committed.count++
          if (regData.amount > 0) {
              summaryCtrs.committed.income += regData.amount
          } else {
              summaryCtrs.committed.spent += regData.amount
          }
        }
      });
      //console.log("# reg transactions = " + summaryCtrs.spending.count)
      //console.log("regSpent - " +  summaryCtrs.reg.committedSpent + "  regIncome = " + summaryCtrs.reg.expectedIncome)
      Balances.find({$or: [{accountType: "bank"}, {accountType: "credit"}]}).sort({accountType: 1, accountName: 1}).exec(function(err, allBalances){
        if (err) throw err;
      res.render("reports/summaryReport", {summaryCtrs: summaryCtrs, balances: allBalances});  
      });
    });  
  });  
});

module.exports = router;