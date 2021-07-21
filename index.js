let tmi = require('tmi.js')
let channel = process.env.TWITCH_ACCOUNT
let express = require('express')
let path = require('path')

let app = express()
let cors = require('cors')
let bodyParser = require('body-parser')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' })

let config = {
  options: {
    debug: true
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: 'aucto_bot',
    // get yours at http://twitchapps.com/tmi
    password: process.env.TWITCH_TMI_TOKEN
  },
  channels: [channel]
}

/* Express Serve */
app.get('/', (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`)
  res.sendFile(path.join(__dirname, './index.html'))
})

/* */

/* AJAX Routing */
app.get('/data', (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`)
  dynamoDB
    .scan({
      TableName: 'bids'
    })
    .promise()
    .then((data) => {
      let sortedData = data.Items.sort((a, b) => (a.bid > b.bid ? 1 : -1))
      let highestBid = sortedData[sortedData.length - 1].bid
      let highestBidder = sortedData[sortedData.length - 1].user
      res.status(200).send({
        highestBid,
        highestBidder
      })
    })
    .catch(console.error)
})

let port = process.env.PORT || 3369
app.listen(port, () => {
  console.clear()
  console.log(`API server started on port ${port}`)
})

/**/

/* Bot Functionality */

let client = new tmi.client(config)
client.connect()

client.on('connected', (address, port) => {
  // client.action(channel, "The bot has connected on" + address + ":" + port);
  client.action(channel, 'Hello 🤖').catch((err) => {
    console.log(err)
  })
})

client.on('chat', (channel, user, message, self) => {
  if (self) return
  if (message.indexOf('!auction') === 0) {
    client.say(
      channel,
      "Jawnzun's artwork is for sale and the proceeds go to a great cause"
    )
    return
  }

  if (message.indexOf('!bid') === 0) {
    let msgArr = message.split(' ')
    displayName = user['display-name']
    let rawBid = msgArr[1].match(/(\d+)/)[0]
    let bid = Math.floor(Number(rawBid) * 100) / 100
    dynamoDB
      .scan({
        TableName: 'bids'
      })
      .promise()
      .then((data) => {
        let sortedData = data.Items.sort((a, b) => (a.bid > b.bid ? 1 : -1))
        let highestBid = sortedData[sortedData.length - 1].bid
        let highestBidder = sortedData[sortedData.length - 1].user
        console.log(sortedData)
        console.log('highestBid', highestBid)
        if (bid > highestBid) {
          postBid(bid, displayName)
        } else {
          client.say(
            channel,
            `Woah 🛑 The hightest bid is currently
            $${highestBid.toFixed(2)},
            by ${highestBidder}, gotta bid higher`
          )
        }
      })
      .catch(console.error)

    let postBid = (bid, user) => {
      let id = new Date().getTime()
      dynamoDB
        .put({
          Item: {
            id,
            bid,
            user
          },
          TableName: 'bids'
        })
        .promise()
        .then((data) => {
          client.say(
            channel,
            `Congrats ${user},
            you're now the highest bidder at
            $${bid.toFixed(2)} USD`
          )
        })
        .catch(console.error)

      return
    }
  }
})

//// TODO:
// need instructions
// !highestbid
// auction start
//auction interval reminders
