// Call this via CLI with $ node app.js /PathTo/Your.csv
//var parse = require('csv-parse'),
var mongoose    = require("mongoose"),
    Transaction = require("./models/transaction"),
    User        = require("./models/balance"),
    Budget      = require("./models/plan"),
    fs          = require('fs'),
    parse       = require('csv-parse');

//    passport    = require("passport"),
//    LocalStrategy = require("passport-local"),

require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
var numAdded = 0;
var url= process.env.DATABASEURL || "mongodb://localhost/fininfo";
var db = mongoose.connect(url);
/*
Transaction.find().distinct("description", function(err, data) {
    console.log("starting Payee build");
    data.forEach( function(item) {
        Payee.count({description: item[1]}, function(err, numFound) {
           if (numFound === 0) {
                payee = Payee({
                    description: item
                    })
                payee.save(function(err) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    numAdded = numAdded + 1;
                };
                });
           };   
  console.log("Created " + data.length + "Payee items");
});
*/
/*
Transaction.find().distinct("account_name", function(err, data) {
    console.log("starting Account build");
    data.forEach( function(item) {
        Account.count({account_name: item}, function(err, numFound) {
            if (numFound === 0) {
                account = Account({
                    account_name: item,
                    currentBalance: 0
                    });    
                account.save(function(err) {
                    if (err) {
                        console.log(err);
                        throw err;
                        }
                    numAdded = numAdded + 1;
                    });
            };
        });   
    });
    console.log("Created " + data.length + "Account items");
});
*/