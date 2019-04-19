var pg = require('pg');
var fs = require('fs');
var conString = process.env.DATABASE_URL;
var client = new pg.Client(conString);

var startupSQL = fs.readFileSync('config/startupPG.sql').toString();
var insertSQL = fs.readFileSync('config/insertPG.sql').toString();

client.connect();

client.query(startupSQL, (err, result) => {
    if(err) console.log('error creating: ', err);
    client.query(insertSQL, (err, result) => {
        if(err) console.log('error inserting: ', err);
        client.end();
    });
});
