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

// save the public directory
app.use(express.static('public'))

let games = []

// this function chooses a random door using the built in node.js random number generator
function chooseRandomDoor () {
  return Math.floor(Math.random() * 3)
}

// this function eliminates a door
function eliminateDoor (userChoice, prizePosition) {
  // filter out userChoice and prizePosition
  const possible = [0, 1, 2].filter(function (item, i) {
    return !(item === userChoice || item === prizePosition)
  })

  // return a random item from the remaining array
  // if we have an array with a length of 1 (the user got their guess wrong),
  // then we just return the remaining item
  // if we have an array with a length of 2 (the user got their guess right),
  // then we return a random pick of the two remaining elements in the array
  return possible[Math.floor(Math.random() * possible.length)]
}

app.post('/v1/game/new', function (req, res) {
  let game = {}

  // the time the experiment was created in milliseconds since January 1, 1970, 00:00:00 UTC
  game.created_at = Date.now()

  // id of experiment
  game._id = Math.random()

  // position of the prize
  game.position_of_prize = chooseRandomDoor()

  // push the game into the Database
  games.push(game)

  // ONLY return _id
  res.json({ _id: game._id })

  console.log(games)
})

app.put('/v1/game/choice', function (req, res) {
  // a mock of finding the game in the db
  let game = games.find(item => item._id === req.body._id)

  // the time the user makes the choice in milliseconds since January 1, 1970, 00:00:00 UTC
  game.choice_at = Date.now()

  // the user's choice of doors
  game.initial_choice = req.body.choice

  // the door we eliminate
  game.eliminated_door = eliminateDoor(game.initial_choice, game.position_of_prize)

  // a mock of finding the game in the database, and THEN replacing it with our new game
  games.forEach(function (item, i) {
    if (item._id === game._id) {
      games[i] = game
    }
  })

  console.log(game)

  // ONLY return eliminated door
  res.json({ eliminated_door: game.eliminated_door })
})

app.put('/v1/game/switch', function (req, res) {
  // a mock of finding the game in the db
  let game = games.find(item => item._id === req.body._id)

  game.switch_at = Date.now()
  game.final_choice = req.body.final_choice
  game.win = game.final_choice === game.position_of_prize
  game.switched = game.final_choice === game.initial_choice

  console.log(game)

  res.json({ position_of_prize: game.position_of_prize, win: game.win })
})
