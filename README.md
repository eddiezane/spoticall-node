# spoticall-node

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Installation

```bash
git clone git@github.com:eddiezane/spoticall-node.git
cd spoticall-node
npm install
```

## Usage

Fire up [ngrok](https://ngrok.com) on port 3000.

```
ngrok http 3000
```

Point your [Twilio phone number](https://www.twilio.com/console/phone-numbers/dashboard) for inbound messages to `http://YOUR_NGROK_URL/sms`.

Start the application and text a song name to your Twilio phone number.

```
npm start
```

## License

MIT
