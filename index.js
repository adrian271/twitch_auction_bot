var tmi = require('tmi.js')
var channel = process.env.TWITCH_ACCOUNT

const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' })

let randomName = [
  'Michael Scott',
  'Dwight Schrute',
  'Jim Halpert',
  'Pam Beesly',
  'Ryan Howard',
  'Andy Bernard',
  'Robert California',
  'Roy Anderson',
  'Jan Levinson',
  'Stanley Hudson',
  'Kevin Malone',
  'Meredith Palmer',
  'Angela Martin',
  'Oscar Martinez',
  'Phyllis Vance',
  'Toby Flenderson',
  'Kelly Kapoor',
  'Creed Bratto'
]

var config = {
  options: {
    debug: true
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: process.env.TWITCH_ACCOUNT,
    // get yours at http://twitchapps.com/tmi
    password: process.env.TWITCH_TMI_TOKEN
  },
  channels: [channel]
}

var client = new tmi.client(config)
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
    // let user = randomName[Math.floor(Math.random() * randomName.length)]
    user = user.username
    console.log(user.username)
    let bid = Number(msgArr[1])
    client.say(channel, '**** placing bid ****')
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
        console.log('hightestBid', highestBid)
        if (bid > highestBid) {
          postBid(bid, user)
        } else {
          client.say(
            channel,
            `The hightest bid is currently $${highestBid}, by ${highestBidder}`
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
            `Congrats ${user}, you're now the highest bidder at $${bid} USD`
          )
        })
        .catch(console.error)

      return
    }
  }
})
