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

let stage
// The stage is vertical and defualts to common 980 width on phones
// for anything not a vertical phone (mainly PC) we hack...
if (window.innerHeight < 1743 && window.innerHeight < window.innerWidth) {
  // set a fixed stage size
  stage = new blockLike.Stage({ width: 980, height: 1743 })
  // zoom out (scale down)
  stage.ratio = window.innerHeight / 1743
  stage.css({ transformOrigin: 'top' })
  stage.zoom(stage.ratio * 100)

  // disable user scolling
  window.addEventListener('mousewheel', (e) => {
    e.preventDefault()
  })
  window.onkeydown = function (e) {
    return !(e.keyCode === 32)
  }
} else {
  stage = new blockLike.Stage()
}

// play button
let playButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 200,
    height: 100
  })
})

playButton.goTo(0, -200)
playButton.inner('Play')
playButton.addClass('button')
playButton.addTo(stage)
playButton.hide()

// title
let title = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width,
    height: 150
  })
})

title.goTo(0, 200)
title.inner(`The Monty Hall Problem</br>
              A Science Fair Experiment`)
title.addClass('title')
title.addTo(stage)
title.hide()

// text
let text = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width - 80,
    height: 300
  })
})

text.goTo(0, 300)
text.addClass('text')
text.addTo(stage)
text.hide()

function resetClass () {
  text.removeClass('win')
  text.removeClass('lose')
}

// intro text
let introText = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width,
    height: 150
  })
})
introText.goTo(0, 200)
introText.addClass('text')
introText.addTo(stage)
introText.hide()

// statistics button
let statisticsButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 300,
    height: 135
  })
})

statisticsButton.addClass('statsButton')
statisticsButton.addTo(stage)
statisticsButton.inner(`See The</br>
                        Statistics`)
statisticsButton.hide()
statisticsButton.goTo(0, 0)

// next button
let nextButton = new blockLike.Sprite({
  costume: new blockLike.Costume({
    color: '#FC6A21',
    width: 200,
    height: 100
  })
})

nextButton.goTo(0, -200)
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
    width: 600,
    height: 100
  })
})
playAgainButton.addClass('button')
playAgainButton.addTo(stage)
playAgainButton.inner(`Play Again`)
playAgainButton.hide()
playAgainButton.goTo(0, -200)

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
prize.hide()
prize.addTo(stage)
stage.sendSpriteToFront(prize)

// doors
let doors = new Array(3).fill(0)

doors = doors.map(function (item, i) {
  let color = new Array(3).fill('cc')
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

  s.addTo(stage)
  s.addClass('door')
  s.hide()
  s.changeX((i - 1) * 200)
  s.changeY(50)

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
  let color = new Array(3).fill('cc')
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
  s.changeY(50)

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
function setDoorsSwitchCostumeChoice (choice) {
  doorsSwitch[choice].costume.image = 'img/your_choice.svg'
  doorsSwitch[choice].refresh()
}

function setDoorsSwitchCostumeEliminated () {
  doorsSwitch[game.eliminated].costume.image = 'img/eliminated.svg'
  doorsSwitch[game.eliminated].refresh()
}

stage.sendSpriteToFront(prize)

let table = new blockLike.Sprite({
  costume: new blockLike.Costume({
    width: stage.width - 100,
    height: stage.width / 5,
    image: null
  })
})
table.inner('')
table.addTo(stage)

function updateTable (settings) {
  table.inner(`
    <table>
      <tr>
        <th></th>
        <th>Switched</th>
        <th>Did Not Switch</th>
      </tr>
      <tr>
        <td>Games</td>
        <td>${settings.switchAmount}</td>
        <td>${settings.notSwitchAmount}</td>
      </tr>
      <tr>
        <td>Win Precentage</td>
        <td>${settings.switchChance}%</td>
        <td>${settings.notSwitchChance}%</td>
      </tr>
    </table>
  `)
}

// reset all sprites
function resetAll () {
  resetDoorsSwitchCostume()
  text.inner('')
  introText.inner('')
  resetClass()
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
  api.newGame('user', function (res) {
    game = {}
    game.id = res._id

    resetAll()
    playButton.show()
    title.show()
  })
})

stage.whenReceiveMessage('screen2', function () {
  screenNumber = 2
  hideAll()

  introText.show()
  introText.inner(`Welcome to the Monty Hall Problem Experiment.
                  On the next slide, you will be presented with three doors.
                  Behind one of the doors, is a prize.
                  Guess where the prize is.`)
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
  setDoorsSwitchCostumeChoice(game.choice)
  stage.wait(1)
  setDoorsSwitchCostumeEliminated()
  text.show()
  text.inner(`A check has been placed on the door you picked.
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

  text.inner(`You are now given the chance to change your choice to
              the remaning, unmarked door. Would you like to switch?`)
})

stage.whenReceiveMessage('screen6', function () {
  screenNumber = 6
  hideAll()
  resetDoorsSwitchCostume()
  showDoorsSwitch()

  setDoorsSwitchCostumeEliminated()
  setDoorsSwitchCostumeChoice(game.finalChoice)
  stage.wait(1)
  text.show()
  continueButton.show()

  if (game.win) {
    text.addClass('win')
    text.inner('You Win')
  } else {
    text.addClass('lose')
    text.inner('You Lose')
  }

  prize.show()
  prize.goTo(doorsSwitch[game.position_of_prize].x, -(doorsSwitch[0].height / 2) + prize.height)
})

stage.whenReceiveMessage('screen7', function () {
  screenNumber = 7
  hideAll()
  resetClass()
  table.show()
  text.show()
  text.inner(`Your Results`)
  continueButton.show()
  let settings = {}
  let results = myResults()
  settings.switchChance = (Math.floor((results.switched_win_games / results.switched_games) * 10000) / 100) || 0
  settings.switchAmount = results.switched_games
  settings.notSwitchChance = (Math.floor((results.not_switched_win_games / results.not_switched_games) * 10000) / 100) || 0
  settings.notSwitchAmount = results.not_switched_games
  updateTable(settings)
})

stage.whenReceiveMessage('screen8', function () {
  screenNumber = 8
  hideAll()
  table.show()
  text.show()
  text.inner(`Global Results`)
  playAgainButton.show()
  let settings = {}
  api.results('user', function (results) {
    settings.switchChance = (Math.floor((results.switched_win_games / results.switched_games) * 10000) / 100) || 0
    settings.switchAmount = results.switched_games
    settings.notSwitchChance = (Math.floor((results.not_switched_win_games / results.not_switched_games) * 10000) / 100) || 0
    settings.notSwitchAmount = results.not_switched_games
    updateTable(settings)
  })
})

stage.whenReceiveMessage('screen9', function () {

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
  if (!canClick) { return null }
  canClick = false
  stage.broadcastMessage('screen3')
  canClick = true
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

statisticsButton.whenClicked(function () {
  if (!canClick) { return null }
  canClick = false
  stage.broadcastMessage('screen8')
  canClick = true
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
