const { Pool } = require('pg');
const jsforce = require('jsforce');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Issue w idle client');
  process.exit(-1);
});

const conn = new jsforce.Connection({
  loginUrl: 'https://test.salesforce.com',
});

//todo complete implementation
function searchPGByPhone(req, res) {
  const phoneNum = req.swagger.params.phoneNum.value;
  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query('SELECT * FROM CUSTOMERS WHERE phone = $1', [phoneNum], (qerr, qres) => {
      done();
      if (qerr) {
        console.log(qerr.stack);
        res.send(200);
      } else {
        console.log(qres.rows[0]);
        conn.login(process.env.SFDCUSER, process.env.SFDCPASS, (sfLoginErr, sfLoginRes) => {
          if (sfLoginErr) {
            console.error(sfLoginErr);
            res.json(sfLoginErr);
          } else {
            conn.sobject('Contact').create({
              firstname: qres.rows[0].firstname,
              lastname: qres.rows[0].lastname
            }, (sfInsErr, sfInsRet) => {
              if (sfInsErr) {
                console.error(sfInsErr);
                res.json(sfInsErr);
              } else {
                console.log(`Created SF Record id: ${sfInsRet.id}`);
                res.json(sfInsRet.id);
              }
            });
          }
        });
      }
    });
  });
}

function searchPGByEmail(req, res) {
  console.log('entering search module');
  const email = req.swagger.params.emailAddy.value;
  pool.connect((err, client, done) => {
    if (err) {
      //throw err;
      console.error(err);
      res.status(503).json('Error connecting to Pool');
    }
    console.log('connected to pool');
    client.query('SELECT * FROM CUSTOMERS WHERE email = $1', [email], (qerr, qres) => {
      done();
      if (err) {
        console.log(qerr.stack);
        res.status(503).json('Error querying Master table');
      } else if (qres.rows.length < 1) {
        console.log('no records found');
        res.status(404).json('No records found');
      } else {
        console.log(`query successful: ${qres.rows[0]}`);
        conn.login(process.env.SFDCUSER, process.env.SFDCPASS, (sfLoginErr, sfLoginRes) => {
          if (sfLoginErr) {
            console.log('something blew up at sf login');
            console.error(sfLoginErr);
            res.status(503).json('SF Login Failure');
          } else {
            console.log('sf login successful');
            conn.sobject('Contact').create({
              firstname: qres.rows[0].firstname,
              lastname: qres.rows[0].lastname,
              email: qres.rows[0].email,
              phone: qres.rows[0].phone,
            }, (sfInsErr, sfInsRet) => {
              if (sfInsErr) {
                console.error(sfInsErr);
                res.status(503).send('SF insert failure');
              } else {
                console.log(`Created SF Record id: ${sfInsRet.id}`);
                res.json(sfInsRet.id);
              }
            });
          }
        });
      }
    });
  });
}

module.exports = {
  searchEmail: searchPGByEmail,
  searchPhone: searchPGByPhone,
};
