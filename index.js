require("dotenv").config();
const fetch = require("node-fetch");
const CronJob = require("cron").CronJob;
const Discord = require("discord.js");
const subreddits = require("./subreddits.json");

const client = new Discord.Client();

async function getNewPosts(subreddit, timeLimit) {
  const response = await getData(subreddit);
  return await filterPosts(response, timeLimit);
};

async function getData(subreddit) {
  const response = await fetch(
    `https://old.reddit.com/r/${subreddit}/new.json?sort=new`
  );
  return response.json();
};

async function filterPosts(response, timeLimit) {
  const posts = response.data.children;
  const currTime = Math.floor(Date.now() / 1000);
  const newPosts = posts.filter(
    post => currTime - post.data.created_utc < timeLimit
  );

  let res = [];

  newPosts.forEach(post => {
    const {
      subreddit,
      title,
      link_flair_text,
      domain,
      url,
      permalink,
      thumbnail
    } = post.data;
    let obj = {
      subreddit: subreddit,
      title: title,
      type: link_flair_text,
      domain: domain,
      url: url,
      permalink: `https://reddit.com${permalink}`,
      thumbnail:
        ["self", "default"].indexOf(thumbnail) !== -1
          ? "https://www.redditstatic.com/new-icon.png"
          : thumbnail
    };
    res.push(obj);
  });
  return res;
};

async function sendMessages(subreddit, timeLimit, removeFirstWord) {
  const data = await getNewPosts(subreddit, timeLimit);
  const channel = client.channels.find(channel => channel.name === subreddit);
  let postCount = 0;

  data.forEach(post => {
    const { type, permalink, domain, url, title, thumbnail } = post;
    postCount++;

    try {
      const info = new Discord.RichEmbed()
        .setColor("#0099ff")
        .setTitle(type == null ? "No flair" : type)
        .setURL(permalink)
        .setAuthor(domain, "", url)
        .setDescription(
          removeFirstWord ? title.substr(title.indexOf(" ") + 1) : title
        )
        .setTimestamp()
        .setThumbnail(thumbnail);

      channel.send(info);
    } catch (err) {
      console.log(err);
    }
  });
  console.log(`Posts sent from ${subreddit}:`, postCount);
};

client.on("message", message => {
  if (message.content === "!ping") {
    // send back "Pong." to the channel the message was sent in
    message.channel.send("Pong.");
    const channel = client.channels.find("name", "test");
    channel.send("pls\npls\npls");
  }
});

client.on("ready", () => {
  client.user.setActivity(`Geico Car Insurance`);
  console.log("Before job instantiation");
  const job = new CronJob("*/5 * * * *", () => {
    const date = new Date();
    subreddits.forEach(subreddit => {
      const { name, frequency, removeFirstWord } = subreddit;
      sendMessages(name, frequency, removeFirstWord);
    })
    console.log("Ten minutes:", date);
  });
  console.log("After job instantiation");
  job.start();
  console.log("Job started!");
});

client.on("warn", console.warn);
client.on("error", console.error);
client.login(process.env.DISCORD_TOKEN);
