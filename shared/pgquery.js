var tools = require('../shared/pgtools')

module.exports = {

  performQuery: function(text, args) {
    console.log("got into pgquery ")
    var resultsArray = [];
    var i = 0;
    tools.runQuery(text, [], (err, results) => {
      if (err) throw err;    
      console.log("query results row count" + results.rowCount)
      for (i=0; i< results.rowCount; i++)  {
        resultsArray.push(results.rows[i]);
        console.log(resultsArray[i].date + '  i - ' + i)
      };
      console.log("Returning values")
      return resultsArray;  
    });
  }
};
