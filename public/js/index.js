/* global blockLike api */

// current game
let game = {}

let canClick = true
// list of games
let games = JSON.parse(window.localStorage.getItem('games'))

if (games === null) {
  window.localStorage.setItem('games', JSON.stringify([]))
  games = JSON.parse(window.localStorage.getItem('games'))
}

function updateGames (game) {
  games.push(game)
  window.localStorage.setItem('games', JSON.stringify(games))
}

function myResults () {
  let allGames = 0
  let switchedWin = 0
  let switched = 0
  let notSwitchedWin = 0
  let notSwitched = 0
  games.forEach(function (item, i) {
    allGames += 1
    if (item.switched === true) {
      switched += 1
      if (item.win === true) {
        switchedWin += 1
      };
    } else {
      notSwitched += 1
      if (item.win === true) {
        notSwitchedWin += 1
      };
    }
  })

  let res = {
    all_games: allGames,
    switched_games: switched,
    not_switched_games: notSwitched,
    switched_win_games: switchedWin,
    not_switched_win_games: notSwitchedWin
  }
  return res
}

// screen number
let screenNumber = 0

// stage
let stage = new blockLike.Stage()

stage.css('border', '10px solid black')

// play button
let playButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 200,
    height: 100
  })
})

playButton.inner('Play')
playButton.addClass('button')
playButton.addTo(stage)
playButton.hide()

// title
let title = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width,
    height: 200
  })
})

title.goTo(0, stage.height / 2 - title.height / 2 - 50)
title.inner(`The Monty Hall Problem</br>
              A Science Fair Experiment`)
title.addClass('title')
title.addTo(stage)
title.hide()

// text
let text = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width - 80,
    height: stage.height
  })
})
text.changeY(-20)
text.addClass('text')
text.addTo(stage)
text.hide()

// next button
let nextButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 200,
    height: 100
  })
})
nextButton.addClass('button')
nextButton.addTo(stage)
nextButton.inner(`Next`)
nextButton.hide()

// continue button
let continueButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 300,
    height: 100
  })
})
continueButton.addClass('button')
continueButton.addTo(stage)
continueButton.inner(`Continue`)
continueButton.hide()
continueButton.goTo(0, -200)

// play again
let playAgainButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 300,
    height: 180
  })
})
playAgainButton.addClass('button')
playAgainButton.addTo(stage)
playAgainButton.inner(`Play Again`)
playAgainButton.hide()
playAgainButton.goTo(0, -150)

// yes button (for switch)
let yes = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 150,
    height: 100
  })
})
yes.addClass('button')
yes.addTo(stage)
yes.inner(`Yes`)
yes.hide()
yes.goTo(-150, -200)

// no button (for switch)
let no = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 150,
    height: 100
  })
})
no.addClass('button')
no.addTo(stage)
no.inner(`No`)
no.hide()
no.goTo(150, -200)

// prize
let prize = new blockLike.Sprite({
  costume: new blockLike.Costume({
    image: 'img/prize.svg',
    width: 80,
    height: 100
  })
})
prize.addTo(stage)
stage.sendSpriteToFront(prize)

// doors
let doors = new Array(3).fill(0)

doors = doors.map(function (item, i) {
  let color = new Array(3).fill('00')
  color[i] = 'fc'
  color = color.join('')
  color = color.toUpperCase()
  color = '#' + color

  let s = new blockLike.Sprite({
    costume: new blockLike.Costume({
      color: color,
      width: 200,
      height: 400,
      image: 'img/door.svg'
    })
  })

  s.addTo(stage)
  s.addClass('door')
  s.hide()
  s.changeX((i - 1) * 250)

  return s
})

// show doors
function showDoors () {
  doors.forEach(function (item) {
    item.show()
  })
}

// doors that display the choice, and the eliminated
let doorsSwitch = new Array(3).fill(0)

doorsSwitch = doors.map(function (item, i) {
  let color = new Array(3).fill('00')
  color[i] = 'fc'
  color = color.join('')
  color = color.toUpperCase()
  color = '#' + color

  let s = new blockLike.Sprite({
    costume: new blockLike.Costume({
      color: color,
      width: 150,
      height: 300,
      image: 'img/door.svg'
    })
  })

  s.myColor = color
  s.addTo(stage)
  s.addClass('door')
  s.hide()
  s.changeX((i - 1) * 200)
  s.changeY(25)

  return s
})

// show doors (for switched screen)
function showDoorsSwitch () {
  doorsSwitch.forEach(function (item) {
    item.show()
  })
}

// reset doors (for switched screen)
function resetDoorsSwitchCostume () {
  doorsSwitch.forEach(function (item) {
    item.costume.image = 'img/door.svg'
    item.refresh()
  })
}

// set door costumes (for switched screen)
function setDoorsSwitchCostume (choice) {
  doorsSwitch[game.eliminated].costume.image = 'img/eliminated.svg'
  doorsSwitch[game.eliminated].refresh()

  doorsSwitch[choice].costume.image = 'img/your_choice.svg'
  doorsSwitch[choice].refresh()
}

stage.sendSpriteToFront(prize)

let table = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: 600,
    height: 200,
    image: null
  })
})
table.inner('')
table.addTo(stage)

function updateTable (settings) {
  table.inner(`
    <table>
      <tr>
        <td></td>
        <td>Those Who Switched</td>
        <td>Those Who Did Not Switch</td>
      </tr>
      <tr>
        <td>Win Chance</td>
        <td>${settings.switchChance}%</td>
        <td>${settings.notSwitchChance}%</td>
      </tr>
      <tr>
        <td>Amount of games</td>
        <td>${settings.switchAmount}</td>
        <td>${settings.notSwitchAmount}</td>
      </tr>
    </table>
  `)
}

// reset all sprites
function resetAll () {
  resetDoorsSwitchCostume()
  text.inner('')
  stage.sprites.forEach(function (item) {
    item.hide()
  })
}

// hide all sprites
function hideAll () {
  stage.sprites.forEach(function (item) {
    item.hide()
  })
}

// screens

stage.whenReceiveMessage('screen1', function () {
  screenNumber = 1
  api.newGame(false, function (res) {
    game.id = res._id
  })
  game = {}
  resetAll()
  playButton.show()
  title.show()
})

stage.whenReceiveMessage('screen2', function () {
  screenNumber = 2
  hideAll()

  text.show()
  text.inner(`Welcome to the Monty Hall Problem Experiment.</br>
              On the next slide, you will be presented three doors.</br>
              Behind one of the doors, is a prize.</br>
              Guess where the prize is.</br>`)
  nextButton.show()
})

stage.whenReceiveMessage('screen3', function () {
  screenNumber = 3
  hideAll()
  text.show()
  showDoors()
  text.inner(`Please pick a door`)
  showDoors()
})

stage.whenReceiveMessage('screen4', function () {
  screenNumber = 4
  hideAll()

  showDoorsSwitch()
  setDoorsSwitchCostume(game.choice)
  text.show()
  text.inner(`A check has been placed on the door you picked. </br>
              An X has been placed on the door where the prize is not located.`)
  continueButton.show()
})

stage.whenReceiveMessage('screen5', function () {
  screenNumber = 5
  hideAll()
  yes.show()
  no.show()
  text.show()
  showDoorsSwitch()

  text.inner(`You are now given the chance to change your choice to </br>
              the remaning, unmarked door. Would you like to switch?`)
})

stage.whenReceiveMessage('screen6', function () {
  screenNumber = 6
  hideAll()
  text.show()
  continueButton.show()
  resetDoorsSwitchCostume()

  setDoorsSwitchCostume(game.finalChoice)

  if (game.win) {
    text.inner('You Win')
  } else {
    text.inner('You Lose')
  }

  prize.show()
  prize.goTo(doorsSwitch[game.position_of_prize].x, -75)
  showDoorsSwitch()
})

stage.whenReceiveMessage('screen7', function () {
  screenNumber = 7
  hideAll()
  continueButton.show()
  text.show()
  text.inner(`The Monty Hall Problem is a question in probability and
                statistics. If you follow the process defined previously,
                should you you change your choice of doors.
                </br>
                </br>
                This might seem like a trivial question with a simple
                answer. The two remaining doors have an equal
                probability of having a prize behind them, therefore, your
                final choice does not affect the probability of getting
                the prize.
                </br>
                </br>
                You will be surprised to hear that the woman with the
                highest IQ on the planet disagreed to that simple 
                solution. Marilyn Vos Savant, an editor for the parade
                magazine, believed that it is beneficial to switch.
                </br>
                </br>
                Surprisingly, Marilyn was proved correct through a simulation.
                A true experiment, involving real people, was never done.
                This website is built to run through the Monty Hall Problem
                with real people, and to gather statistics about the problem.`)
})

stage.whenReceiveMessage('screen8', function () {
  screenNumber = 8
  hideAll()
  table.show()
  continueButton.show()
  let settings = {}
  api.results(function (results) {
    console.log(results)
    settings.switchChance = (Math.floor((results.switched_win_games / results.switched_games) * 10000) / 100) || 0
    settings.switchAmount = results.switched_games
    settings.notSwitchChance = (Math.floor((results.not_switched_win_games / results.not_switched_games) * 10000) / 100) || 0
    settings.notSwitchAmount = results.not_switched_games
    updateTable(settings)
  })
})

stage.whenReceiveMessage('screen9', function () {
  screenNumber = 9
  hideAll()
  table.show()
  playAgainButton.show()
  let settings = {}
  let results = myResults()
  settings.switchChance = (Math.floor((results.switched_win_games / results.switched_games) * 10000) / 100) || 0
  settings.switchAmount = results.switched_games
  settings.notSwitchChance = (Math.floor((results.not_switched_win_games / results.not_switched_games) * 10000) / 100) || 0
  settings.notSwitchAmount = results.not_switched_games
  updateTable(settings)
})

// on start
stage.whenLoaded(function () {
  stage.broadcastMessage('screen1')
})

// events
playButton.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  stage.broadcastMessage('screen2')
  canClick = true
})

nextButton.whenClicked(function () {
  stage.broadcastMessage('screen3')
})

doors.forEach(function (item, i) {
  item.whenClicked(function () {
    if (!canClick) { return null }
    canClick = false
    game.choice = doors.indexOf(this)
    api.makeChoice(game.id, doors.indexOf(this), function (res) {
      game.eliminated = res.eliminated_door
      stage.broadcastMessage('screen4')
      canClick = true
    })
  })
})

playAgainButton.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  stage.broadcastMessage('screen1')
  canClick = true
})

continueButton.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  if (screenNumber === 8) {
    stage.broadcastMessage('screen9')
  }
  if (screenNumber === 7) {
    stage.broadcastMessage('screen8')
  }
  if (screenNumber === 6) {
    stage.broadcastMessage('screen7')
  }
  if (screenNumber === 4) {
    stage.broadcastMessage('screen5')
  }
  canClick = true
})

function final (res) {
  game.win = res.win
  game.position_of_prize = res.position_of_prize
  stage.broadcastMessage('screen6')
  updateGames(game)
  canClick = true
}

yes.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  game.switched = true
  game.finalChoice = parseInt('012'.replace(game.choice + '', '').replace(game.eliminated + '', ''))
  api.changeChoice(game.finalChoice, game.id, final)
})

no.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  game.switched = false
  game.finalChoice = game.choice
  api.changeChoice(game.finalChoice, game.id, final)
})
