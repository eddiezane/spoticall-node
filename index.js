const express = require('express')
const { urlencoded } = require('body-parser')
const request = require('request')
const twilio = require('twilio')

const app = express()
const client = twilio()

app.use(urlencoded({ extended: false }))

app.post('/sms', (req, res) => {
  const { Body: track, From: number } = req.body
  client.makeCall({
    to: number,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `http://ez.ngrok.io/call?track=${encodeURIComponent(track)}`, // TODO: Plug in your ngrok url
    method: 'GET'
  })
  .catch(err => console.error(err))
  const twiml = new twilio.TwimlResponse()
  twiml.message('Your jam is on the way!')
  res.send(twiml.toString())
})

app.get('/call', (req, res) => {
  const { track } = req.query
  const twiml = new twilio.TwimlResponse()
  getSong(track)
    .then(song => {
      twiml.play(song)
      res.send(twiml.toString())
    })
    .catch(err => {
      twiml.say(err.message)
      res.send(twiml.toString())
    })
})

function getSong (track) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: 'https://api.spotify.com/v1/search',
      qs: {
        type: 'track',
        q: track,
        limit: 1
      },
      json: true
    }, function (err, resp, body) {
      if (err) {
        return reject(err)
      }
      if (body.tracks.items.length === 0) {
        return reject(new Error('Sorry, track not found'))
      }
      resolve(body.tracks.items[0].preview_url)
    })
  })
}

app.listen(3000)
