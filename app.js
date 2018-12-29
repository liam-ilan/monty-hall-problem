// express
const express = require('express')

// body parser to read body from requests
const bodyParser = require('body-parser')

// MongoDB
const Mongo = require('mongodb')

// allow us to use our .env file
require('dotenv').config()

// our client
const MongoClient = Mongo.MongoClient

// we need ObjectId to find records in the DB by their ID
const ObjectId = Mongo.ObjectId

// The URI set in the .env file
const mongoURI = process.env.MONGODB_URI

// depreciation protection
const mongoOptions = { useNewUrlParser: true }

// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 3000

// the database itself
let db

// connect to the DB
MongoClient.connect(mongoURI, mongoOptions, (err, client) => {
  // if there is an error, log it
  if (err) return console.log(err)

  // set the DB
  db = client.db('heroku_qrw26v0v')

  // listen on the port
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
})

// our app
const app = express()

// use the body parser
app.use(bodyParser.json())

// save the bublic directory
app.use(express.static('public'))


