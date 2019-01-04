// express
const express = require('express')

// body parser to read body from requests
const bodyParser = require('body-parser')

// MongoDB
const Mongo = require('mongodb')

// allow us to use our .env file
require('dotenv').config()

// the game mechanics
const gameMechanics = require('./game-mechanics')

// the input validation
const inputValidation = require('./input-validation')

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

// save the public directory
app.use(express.static('public'))

// mockup data
let games = []

// make a new game
app.post('/v1/game/new', function (req, res) {
  let game = {}

  // the time the experiment was created in milliseconds since January 1, 1970, 00:00:00 UTC
  game.created_at = Date.now()

  // id of experiment
  game._id = Math.random()

  // position of the prize
  game.position_of_prize = gameMechanics.chooseRandomDoor()

  // the game is not completed
  // this value is set to true when the game is finished
  game.completed = false

  // push the game into the Database
  games.push(game)

  // ONLY return _id
  res.json({ _id: game._id })

  console.log(games)
})

// make a choice
app.put('/v1/game/choice', function (req, res) {
  // a mock of finding the game in the db
  let game = games.find(item => item._id === req.body._id)

  // validate this route
  if (!inputValidation.choice(game, req.body)) { res.json({ fail: 'invalid input / corrupt game' }) }

  // the time the user makes the choice in milliseconds since January 1, 1970, 00:00:00 UTC
  game.choice_at = Date.now()

  // the user's choice of doors
  game.initial_choice = req.body.choice

  // the door we eliminate
  game.eliminated_door = gameMechanics.eliminateDoor(game.initial_choice, game.position_of_prize)

  // a mock of finding the game in the database, and THEN replacing it with our new game
  games.forEach(function (item, i) {
    if (item._id === game._id) {
      games[i] = game
    }
  })

  // ONLY return eliminated door
  res.json({ eliminated_door: game.eliminated_door })
})

// change your choice
app.put('/v1/game/switch', function (req, res) {
  // a mock of finding the game in the db
  let game = games.find(item => item._id === req.body._id)

  // validate this route
  if (!inputValidation.switch(game, req.body)) { res.json({ fail: 'invalid input / corrupt game' }) }

  // time the user's choice was switched
  game.switch_at = Date.now()

  // the users final choice
  game.final_choice = req.body.final_choice

  // if the user won
  game.win = game.final_choice === game.position_of_prize

  // did the user switch
  game.switched = game.final_choice === game.initial_choice

  // the game is finished
  game.completed = true

  // a mock of finding the game in the database, and THEN replacing it with our new game
  games.forEach(function (item, i) {
    if (item._id === game._id) {
      games[i] = game
    }
  })

  res.json({ position_of_prize: game.position_of_prize, win: game.win })
})
