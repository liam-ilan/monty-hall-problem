let api = {}

api.reqJson = async function (url, method = 'GET', data = null) {
  // set fetch options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  // add body if content exists
  if (data) {
    options.body = JSON.stringify(data)
  }

  // await the fetch from the url
  const res = await window.fetch(url, options)

  // await until the json promise is resolved
  const json = await res.json()
  return json
}

// new game
// gets callback
// posts game to server
// runs callback and passes _id

api.newGame = async function (isBot, cb) {
  const _id = await api.reqJson('/v1/game/new', 'post', {bot: isBot})

  // cb
  return cb ? cb(_id) : null
}

// make a choice
// gets choice, _id, and callback
// posts choice and game _id to server, and gets back eliminated door
// runs callback and passes the eliminated door

api.makeChoice = async function (_id, choice, cb) {


  // options to pass to server
  let options = {
    _id: _id,
    choice: choice
  }
  
  const eliminated = await api.reqJson('/v1/game/choice', 'put', options)

  // cb
  return cb ? cb(eliminated) : null
}

// change your choice
// gets _id, final_choice, and callback
// posts final_choice and game _id to server, and gets back the final results
// runs callback and passes the final results

api.changeChoice = async function (finalChoice, _id, cb) {
  // options to pass to server
  let options = {
    final_choice: finalChoice,
    _id: _id
  }

  const final = await api.reqJson('/v1/game/switch', 'put', options)

  // cb
  return cb ? cb(final) : null
}


// get results
// gets query
// posts query to server, and gets back the count
// runs callback and passes the count

api.results = async function (cb) {

  const results = await api.reqJson('/v1/game/results', 'get')

  // cb
  return cb ? cb(results) : null
}
