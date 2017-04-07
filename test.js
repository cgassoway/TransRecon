var pg          = require("pg")
var config      = require('config')
var signon = config.get('config');
let pool = new pg.Pool(signon);
    
//const connectionString = process.env.DATABASE_URL ||  'postgres://cgassoway:BuxjwiuB~@localhost:5432/todo';
var args = {
  text: 'SELECT date, merchant, amount FROM transactions WHERE date = $1',
  values: ['0217-04-02']
}
isFound = runQuery(args);
//console.log("isFound is " + isFound);
//process.exit(0)

function runQuery(args) {
  pool.connect((err, client, done) => {
    console.log("Did connect")
    if (err) {
      //likely a connection error that will print to console.
      console.log("into err")
      done();
      throw err;
    }
  var query = client.query(args, function(err, result) {
  console.log("got by query")
  if (!result || result.rowCount === 0) {
    console.log('Returned false');
    } else {
    console.log("returned true"); 
    console.log(result.rows[0].date + "  -  " + result.rows[0].merchant  + "  -  " + result.rows[0].amount)
  }
  //console.log("isFound is " + isFound);
  process.exit(0)
  
  }); 
    /*console.log("got to client.query")
    client.query(query, argsArray, (err, results) => {
      console.log("returned from client.query" + results)
      done(); //call done to release the client to the connection pool.
      getResult(err, results); //make it the callers responsiblity for checking for query errors.
    });*/
  });
}
  
function getResult(err, results) {
  if (err) {
      //likely a connection error that will print to console.
      done();
      throw err;
    }
  if (results.rowCount === 0) {
    console.log('Returned false');
    return false
  } else {
    return true;
    console.log("returned true"); 
  }  
}

function query(options) {
    console.log("Got here - query")
    /*
    let query = "select * from items  where text = $options;"
    let args = []
    runQuery(query, args, (err, results) => {  */
    
    /*
        console.log("runQuery")
        if (err) {
            console.error(err);
        } else {
            console.log(results);
            if (results && results === 0) {
                isFound = false;
                } else isFound = true
            }
        process.exit();
        return isFound;
    })
*/  }

