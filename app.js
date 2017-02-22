var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    flash       = require("connect-flash"),
    config      = require("config"),
    //moment      = require("moment"),
    //expressValidator   = require("express-validator"),
    Validator   = require("validator"),
    Transactions  = require("./models/transaction"),
    Register     = require("./models/register"),
    Plan         = require("./models/plan"),
    Balances     = require("./models/balances"),
    User        = require("./models/user")

    
    //seedDB      = require("./seeds")
    
//requring routes
var transactionRoutes   = require("./routes/transaction"),
    registerRoutes      = require("./routes/register"),
    planRoutes          = require("./routes/plan")
    balancesRoutes		= require("./routes/balances"),
    indexRoutes         = require("./routes/auth"),
    matchRoutes         = require("./routes/match"),
    reportsRoutes       = require("./routes/reports")

console.log(config.get('database'));
//var url= process.env.DATABASEURL || "mongodb://localhost/fininfo";
//var url= process.env.DATABASEURL || "mongodb://localhost/TestDB";
var url= config.get('database') || "mongodb://localhost/TestDB";
console.log(url);
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
//app.use(expressValidator);  //required for Express-Validator
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + "/views");
app.use(methodOverride("_method"));
app.use(flash());


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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
//app.use("/", indexRoutes);
//app.use("/transactions", transactionRoutes);
//app.use("/transactions/:id/transactions", transactionRoutes);

//app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(8080, "192.168.1.50", function(){
app.listen(config.get('port'), config.get('ipAddress'), function(){
   console.log("The TransRecon Server Has Started!");
});
