/* global api */

function runGame () {
  // the game data we collect
  let game = {}

  // make a new game
  api.newGame(true, function (id) {
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

        // log the collected data
        console.log(game)
      })
    })
  })
}

function loopGames (amount) {
  for (let i = 0; i < amount; i++) {
    runGame()
  };
}
