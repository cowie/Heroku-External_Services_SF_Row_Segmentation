const { Pool } = require('pg');

const pool = new Pool();

pool.on('error', (err, client) => {
  console.error('Issue w idle client');
  process.exit(-1);
});

function searchPGByPhone(req, res) {
  const phoneNum = req.swagger.params.phoneNum.value;
  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query('SELECT * FROM CUSTOMERS WHERE phone = $1', [phoneNum], (qerr, qres) => {
      done();
      if (qerr) {
        console.log(qerr.stack);
      } else {
        console.log(qres.rows[0]);
      }
    });
  });
}

function searchPGByEmail(req, res) {
  const email = req.swagger.params.email.value;
  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query('SELECT * FROM CUSTOMERS WHERE email = $1', [email], (qerr, qres) => {
      done();
      if (err) {
        console.log(qerr.stack);
      } else {
        console.log(qres.rows[0]);
      }
    });
  }); 
}

module.exports = {
  searchEmail: searchPGByEmail,
  searchPhone: searchPGByPhone,
};
