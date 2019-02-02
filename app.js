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
  if (err) return console.log({ fail: 'database error' })

  // the name of the DB
  const dbName = mongoURI.substr(mongoURI.lastIndexOf('/') + 1)

  // set the DB
  db = client.db(dbName)

  // listen on the port
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
})

// our app
const app = express()

// use the body parser
app.use(bodyParser.json())

// save the public directory
app.use(express.static('public'))

// make a new game
app.post('/v1/game/new', function (req, res) {
  let game = {}

  // the time the experiment was created in milliseconds since January 1, 1970, 00:00:00 UTC
  game.created_at = Date.now()

  // position of the prize
  game.position_of_prize = gameMechanics.chooseRandomDoor()

  // the game is not completed
  // this value is set to true when the game is finished
  game.completed = false

  // what type of experiment this is (non-verifyable)
  game.experiment = req.body.experiment

  db.collection('games').insertOne(game, function (err, result) {
    if (err) return res.json({ fail: 'database error' })
  })

  // ONLY return _id
  res.json({ _id: game._id })
})

// make a choice
app.put('/v1/game/choice', function (req, res) {
  // find the game based on it's _id
  db.collection('games').findOne({ '_id': ObjectId(req.body._id) }, function (err, game) {
    if (err) return res.json({ fail: 'database error' })

    // validate this route
    if (!inputValidation.choice(game, req.body)) { return res.json({ fail: 'invalid input / corrupt game' }) }

    // the time the user makes the choice in milliseconds since January 1, 1970, 00:00:00 UTC
    game.choice_at = Date.now()

    // the user's choice of doors
    game.initial_choice = req.body.choice

    // the door we eliminate
    game.eliminated_door = gameMechanics.eliminateDoor(game.initial_choice, game.position_of_prize)

    delete game._id

    // find the game based on it's _id, and then update it with our new, updated game
    db.collection('games').findOneAndUpdate({ '_id': ObjectId(req.body._id) }, { $set: game }, { returnOriginal: false }, function (err, result) {
      if (err) return res.json({ fail: 'database error' })

      // ONLY return eliminated door
      res.json({ eliminated_door: result.value.eliminated_door })
    })
  })
})

// change your choice
app.put('/v1/game/switch', function (req, res) {
  db.collection('games').findOne({ '_id': ObjectId(req.body._id) }, function (err, game) {
    if (err) return res.json({ fail: 'database error' })

    // validate this route
    if (!inputValidation.switch(game, req.body)) { return res.json({ fail: 'invalid input / corrupt game' }) }

    // time the user's choice was switched
    game.switch_at = Date.now()

    // the users final choice
    game.final_choice = req.body.final_choice

    // if the user won
    game.win = game.final_choice === game.position_of_prize

    // did the user switch
    game.switched = game.final_choice !== game.initial_choice

    // the game is finished
    game.completed = true

    delete game._id

    db.collection('games').findOneAndUpdate({ '_id': ObjectId(req.body._id) }, { $set: game }, { returnOriginal: false }, function (err, result) {
      if (err) return res.json({ fail: 'database error' })
      res.json({ position_of_prize: result.value.position_of_prize, win: result.value.win })
    })
  })
})

// get results
app.post('/v1/game/results', function (req, res) {
  // queries
  let userQuery = { experiment: { $eq: req.body.experiment } }

  let allGamesQuery = { completed: { $eq: true } }

  let switchedGamesQuery = { $and: [{ completed: { $eq: true } }, { switched: { $eq: true } }] }
  let switchedWinGamesQuery = { $and: [{ completed: { $eq: true } }, { switched: { $eq: true } }, { win: { $eq: true } }] }

  let notSwitchedGamesQuery = { $and: [{ completed: { $eq: true } }, { switched: { $eq: false } }] }
  let notSwitchedWinGamesQuery = { $and: [{ completed: { $eq: true } }, { switched: { $eq: false } }, { win: { $eq: true } }] }

  // numbers to return
  let numbers = {}

  // welcome to callback hell
  db.collection('games').countDocuments({ $and: [allGamesQuery, userQuery] }, function (err, allGames) {
    if (err) return res.json({ fail: 'database error' })
    numbers.all_games = allGames

    db.collection('games').countDocuments({ $and: [switchedGamesQuery, userQuery] }, function (err, switchedGames) {
      if (err) return res.json({ fail: 'database error' })
      numbers.switched_games = switchedGames

      db.collection('games').countDocuments({ $and: [switchedWinGamesQuery, userQuery] }, function (err, switchedWinGames) {
        if (err) return res.json({ fail: 'database error' })
        numbers.switched_win_games = switchedWinGames

        db.collection('games').countDocuments({ $and: [notSwitchedGamesQuery, userQuery] }, function (err, notSwitchedGames) {
          if (err) return res.json({ fail: 'database error' })
          numbers.not_switched_games = notSwitchedGames

          db.collection('games').countDocuments({ $and: [notSwitchedWinGamesQuery, userQuery] }, function (err, notSwitchedWinGames) {
            if (err) return res.json({ fail: 'database error' })
            numbers.not_switched_win_games = notSwitchedWinGames

            res.json(numbers)
          })
        })
      })
    })
  })
})
