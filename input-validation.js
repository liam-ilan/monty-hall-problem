function validateChoice (game, body) {
  // ignore request if the game has not been made yet
  if (!game) return false

  // ignore request if properties were already created
  if (game.hasOwnProperty('choice_at')) return false
  if (game.hasOwnProperty('initial_choice')) return false
  if (game.hasOwnProperty('eliminated_door')) return false

  // ignore request if the choice is not a number
  if (body.choice !== parseInt(body.choice, 10)) return false

  // ignore request if the users choice is not a number between 0 and 2
  if (!(body.choice > -1 && body.choice < 3)) return false

  return true
}

function validateSwitch (game, body) {
  // ignore request if the game has not been made yet
  if (!game) return false

  // ignore request if properties were already created
  if (game.hasOwnProperty('switch_at')) return false
  if (game.hasOwnProperty('final_choice')) return false
  if (game.hasOwnProperty('win')) return false
  if (game.hasOwnProperty('switched')) return false

  // ignore request if the choice has not been made yet
  if (!game.hasOwnProperty('choice_at')) return false
  if (!game.hasOwnProperty('initial_choice')) return false
  if (!game.hasOwnProperty('eliminated_door')) return false

  // ignore request if the final choice is not a number
  if (body.final_choice !== parseInt(body.final_choice, 10)) return false

  // ignore request if the final choice is equal to the eliminated door
  if (body.final_choice === game.eliminated_door) return false

  // ignore request if the users final choice is not a number between 0 and 2
  if (!(body.final_choice > -1 && body.final_choice < 3)) return false

  return true
}

module.exports = {
  choice: validateChoice,
  switch: validateSwitch
}
