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

module.exports = {
  chooseRandomDoor: chooseRandomDoor,
  eliminateDoor: eliminateDoor
}
