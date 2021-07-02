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
  client.action(channel, "Hello 🤖");
});

client.on("chat", (channel, user, message, self) => {
  if (self) return;
  if (message == "!cd") {
    let time = 5;
    let announce = (count) => {
      let val = count ? count : `Go!`,
        preText = time === count ? `Starting Countdown... ` : ``;
      client.say(channel, `${preText}${val}`);
      setTimeout(() => {
        if (count) announce(count - 1);
      }, 1000);
    };
    announce(time);
  }
});
