const express = require('express')
const { urlencoded } = require('body-parser')
const request = require('request')
const twilio = require('twilio')

const app = express()
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

app.set('PORT', process.env.PORT || 3000)

app.use(urlencoded({ extended: false }))

app.post('/sms', (req, res) => {
  const { Body: track, From: number } = req.body
  console.log('track:', track)
  client.makeCall({
    to: number,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${process.env.TWILIO_CALL_HOSTNAME}/call?track=${encodeURIComponent(track)}`, // TODO: Plug in your ngrok url
    method: 'GET'
  })
  .catch(err => console.error(err))
  const twiml = new twilio.TwimlResponse()
  twiml.message(process.env.TWILIO_SMS_MESSAGE || 'Your jam is on the way!')
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
      try {
        return resolve(body.tracks.items[0].preview_url)
      } catch (e) {
        return reject(new Error('Sorry, track not found. Please try a different song that will be on Spotify.'))
      }
    })
  })
}

app.listen(app.get('PORT'), err => {
  if (err) {
    throw err
  }

  console.log(`started on port: ${app.get('PORT')}`)
})
