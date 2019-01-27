const api = require('./api')

function jsonToCsv (obj) {
  return Object.values(obj).toString()
}

function runGame (experiment, cb) {
  // the game data we collect
  let game = {}

  // make a new game
  api.newGame(experiment, function (id) {
    // the game id
    game._id = id._id

    // pick the first choice
    let choice = Math.floor(Math.random() * 3)

    // make a choice
    api.makeChoice(game._id, choice, function (eliminated) {
      // record the choice and the eliminated door
      game.choice = choice
      game.eliminated = eliminated.eliminated_door

      // the door to switch to
      let switchTo = [0, 1, 2]

      switchTo.splice(switchTo.indexOf(game.eliminated), 1)

      switchTo = switchTo[Math.floor(Math.random() * 2)]

      api.changeChoice(switchTo, game._id, function (res) {
        // record the final data
        game.switchedTo = switchTo
        game.posOfPrize = res.position_of_prize
        game.win = res.win

        cb()
      })
    })
  })
}

function makeBatch (count, cb) {
  const experiment = `batch-${Date.now()}`

  let toDo = count
  for (let i = 0; i < count; i++) {
    runGame(experiment, function () {
      toDo -= 1
      if (!toDo) {
        api.results(experiment, function (r) {
          console.log(`${experiment},${jsonToCsv(r)}`)
          cb()
        })
      }
    })
  };
}

function makeSimulation (batchCount, count) {
  let toDo = batchCount
  function callback () {
    toDo -= 1
    if (toDo) {
      makeBatch(count, callback)
    }
  }
  makeBatch(count, callback)
}

const batchCount = process.argv[2]
const count = process.argv[3]

console.log('experiment,number_of_games,not_switched_games,not_switched_win_games,switched_games,switched_win_games')
makeSimulation(batchCount, count)
