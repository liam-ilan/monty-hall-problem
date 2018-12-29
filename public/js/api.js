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
