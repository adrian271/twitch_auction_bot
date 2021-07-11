var tmi = require("tmi.js");
var channel = process.env.TWITCH_ACCOUNT;

var config = {
  options: {
    debug: true,
  },
  connection: {
    cluster: "aws",
    reconnect: true,
  },
  identity: {
    username: process.env.TWITCH_ACCOUNT,
    // get yours at http://twitchapps.com/tmi
    password: process.env.TWITCH_TMI_TOKEN,
  },
  channels: [channel],
};

var client = new tmi.client(config);
client.connect();

client.on("connected", (address, port) => {
  // client.action(channel, "The bot has connected on" + address + ":" + port);
  client.action(channel, "Hello 🤖").catch((err) => {
    console.log(err);
  });
});

client.on("chat", (channel, user, message, self) => {
  if (self) return;
  if (message.indexOf("!auction") === 0) {
    client.say(
      channel,
      "Jawnzun's artwork is for sale and the proceeds go to a great cause"
    );
    return;
  }
  if (message.indexOf("!bid") === 0) {
    client.say(channel, "starts with !bid");
    return;
  }
});
