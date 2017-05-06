var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    cookieParser = require("cookie-parser"),
    session      = require('express-session'),
    passport    = require("passport"),
    methodOverride = require("method-override"),
    flash       = require("connect-flash"),
    config      = require("config"),
    signon = config.get('config');
    //moment      = require("moment"),
    //expressValidator   = require("express-validator"),passport
    Validator   = require("validator"),
    flash = require('connect-flash');
    //Transactions  = require("./models/transaction"),
    //Register     = require("./models/register"),
    //Plan         = require("./models/plan"),
    //Balances     = require("./models/balances"),
    //User        = require("./models/user")

console.log('Got thru first var') 
    //seedDB      = require("./seeds")
    
//requring routes
var transactionRoutes   = require("./routes/transaction"),
    registerRoutes      = require("./routes/register"),
    planRoutes          = require("./routes/plan")
    balancesRoutes		= require("./routes/balances"),
    indexRoutes         = require("./routes/auth"),
    matchRoutes         = require("./routes/match"),
    reportsRoutes       = require("./routes/reports")

/*
var pool = new pg.Pool(signon)
if (!pool) {
  console.log("Login Problem")
}
*/
app.use(flash())
console.log('Got to passport require')    
require('./config/passport')(passport); // pass passport for configuration

app.use(bodyParser());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + "/views");
app.use(methodOverride("_method"));
;
app.use(cookieParser());

console.log('got here 1')
//Comment out for testing
//seedDB();
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This course is giving me trouble",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//passport.use(new LocalStrategy(User.authenticate()));
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/TransRecon/", indexRoutes);
app.use("/TransRecon/transactions", transactionRoutes);
app.use("/TransRecon/register", registerRoutes);
app.use("/TransRecon/plan", planRoutes);
app.use("/TransRecon/balances", balancesRoutes);
app.use("/TransRecon/match", matchRoutes);
app.use("/TransRecon/reports", reportsRoutes);

app.listen(config.get('port'), config.get('ipAddress'), function(){
   console.log("The TransRecon Server Has Started!");
});
