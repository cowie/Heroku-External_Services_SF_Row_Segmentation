var pg = require('pg');
var fs = require('fs');
var conString = process.env.DATABASE_URL;


var startupSQL = fs.readFileSync('config/startupPG.sql').toString();
var insertSQL = fs.readFileSync('config/insertPG.sql').toString();

pg.connect(conString, (err, client, done) => {
    if(err){
        console.log('error: ', err);
    }
    client.query(startupSQL, function(err, result){
        done();
        if(err){
            console.log('error: ', err);
        }
        client.query(insertSQL, (err, result) => {
            if (err){
                console.log('error: ', err);
            }
        })
    })
});
