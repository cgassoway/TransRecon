var pg          = require("pg"),
    config      = require('config'),
    signon      = config.get('config');
console.log("Into pgpool")
var pool = new pg.Pool(signon)
if (!pool) {
  console.log("Login Problem")
}
console.log("Out of pgpool")
module.exports = pool;