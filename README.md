# External Services Example Customer Master

WIP: Because I'm about to swap laptops lol

## Description
Hi there. This is the Heroku side of a buildout for a service to be consumed by Salesforce's External Services. 

The example is built around the idea of having a larger customer master remote from Salesforce, and loading customers in on the fly to work with. This keeps the Salesforce row counts at a minimum, which can help with all sorts of stuff. Relational store vs larger volumes and all that.

The single API endpoint implemented is a service that will query the attached Postgres datastore with `SELECT * FROM "customerMaster" WHERE "Email" = $1` (It's located at pg_search.js:63 if you want to change this to fit your schema). If it finds the answer, it'll use the SFDCUSER/SFDCPASS credentials to directly log into your SF org and insert the contents of that row into Salesforce's Contacts table. Then it will respond to the URI with a 200, and the newly inserted Salesforce ID as the body.

This allows you to leverage Salesforce Flow to request an email, have it inserted locally, then redirect to the new Contact/Case immediately, as if it had existed all along.

### *Note*: 
**The volumes actually stored in here are *not* aligned or associated with actual scale counts or limits with Salesforce. I'm using like thousands, SF goes WAY higher than that. This is meant as a quick reference/demo.**

## Prereqs
You need a Salesforce org for this. Without one you SOL, since that's half the demo. I HIGHLY suggest hitting up Trailhead and getting your trailblazer on, or developer.salesforce.com and fetching a free org to toy with. Can also use a Sandbox, I'm not your supervisor. You'll need to set a Security Token.

## Dev, Build, Test

Create the Salesforce Org. 

Install the associated package - here - into your Salesforce org so the schema matches what is in PG. OR git clone this sucker and change the PG schema around.

Use this button to launch the mofo, and fill out SFDCUSER and SFDCPASS appropriately. Don't forget: Pass also may require the Security Token!

Go into your salesforce org and correct the Named Credential to point at your Heroku instance.


## Resources

## Description of Files/Dir

## Issues

The code and swagger are functional - if simplistic. What's not ready is the script to autodeploy. If you wanted to do this yourself, you need to run the SQL files in PG in order to craft the PG schema into what the code expects.