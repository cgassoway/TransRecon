var mongoose    = require("mongoose"),
    User = require("./models/user.js")
    
var url= process.env.DATABASEURL || "mongodb://localhost/fininfo";

var db = mongoose.connect(url);

user = User({
    firstName: "Bill",
    middleInitial: " ",
    lastName: "Gassoway",
    userName: "cgassoway",
    password: "password",
    });
user.save(function(err) {
    if (err) {
        console.log(err);
        throw err;
    } else {
            var numAdded = numAdded + 1;
        };
    });                    
