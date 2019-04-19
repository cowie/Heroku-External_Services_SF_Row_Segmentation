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
  loginUrl: process.env.SF_ENVIRONMENT == 'production' ? 'https://login.salesforce.com' : 'https://test.salesforce.com',
});

//todo complete implementation
function searchPGByPhone(req, res) {
  console.log('entering search module');
  const phoneNumber = req.swagger.params.phoneNumber.value;
  pool.connect((err, client, done) => {
    if (err) {
      console.error(err);
      res.status(503).json('Error connecting to Pool');
    }
    console.log('connected to pool');
    client.query('SELECT * FROM "customerMaster" WHERE "Phone" = $1', [phoneNumber], (qerr, qres) => {
      done();
      if (qerr) {
        console.log(qerr.stack);
        res.status(503).send('Error querying Master table');
      } else if (qres.rows.length < 1) {
        console.log('no records found');
        res.status(404).send('No records found');
      } else {
        console.log(`query successful: ${qres.rows[0]}`);
        conn.login(process.env.SFDCUSER, process.env.SFDCPASS, (sfLoginErr, sfLoginRes) => {
          if (sfLoginErr) {
            console.log('something blew up at sf login');
            console.error(sfLoginErr);
            res.status(503).send('SF Login Failure');
          } else {
            console.log('sf login successful');
            const custRec = qres.rows[0];
            custRec.External_ID__c = custRec.customerID;
            delete custRec.customerID;
            //const creationObject;
            conn.sobject('Contact').create(
              custRec, (sfInsErr, sfInsRet) => {
                if (sfInsErr) {
                  console.error(sfInsErr);
                  res.status(503).send('SF insert failure');
                } else {
                  console.log(`Created SF Record id: ${sfInsRet.id}`);
                  res.send(sfInsRet.id);
                }
              }).catch((error) => {
              res.status(503).send('Error inserting');
            });
          }
        });
      }
    });
  });
}

function searchPGByEmail(req, res) {
  console.log('entering search module');
  const email = req.swagger.params.emailAddress.value;
  pool.connect((err, client, done) => {
    if (err) {
      //throw err;
      console.error(err);
      res.status(503).json('Error connecting to Pool');
    }
    console.log('connected to pool');
    client.query('SELECT * FROM "customerMaster" WHERE "Email" = $1', [email], (qerr, qres) => {
      done();
      if (qerr) {
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
            const custRec = qres.rows[0];
            custRec.External_ID__c = custRec.customerID;
            delete custRec.customerID;
            //const creationObject;
            conn.sobject('Contact').create(
              /*{
              firstname: custRec.FirstName,
              lastname: custRec.LastName,
              email: custRec.Email,
              salutation: custRec.Salutation,
              otherstreet: custRec.OtherStreet,
              otherstate: custRec.OtherState,
              otherpostalcode: custRec.OtherPostalCode,
              custRec.OtherCountry,
              custRec.OtherCountry,
              custRec.MailingStreet,
              custRec.MailingCity
            }*/
              custRec, (sfInsErr, sfInsRet) => {
                if (sfInsErr) {
                  console.error(sfInsErr);
                //res.status(503).send('SF insert failure');
                } else {
                  console.log(`Created SF Record id: ${sfInsRet.id}`);
                  res.send(sfInsRet.id);
                }
              }).catch((error) => {
              res.status(503).json('Error inserting');
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
