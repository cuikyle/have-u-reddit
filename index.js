require('dotenv').config();
const CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const subreddits = require('./subreddits.json');  // file to set up which
const getNewPosts = require('./getInfo');

const client = new Discord.Client();

/**
 *  Sends messages to discord channels with the same name as the subreddit.
 *  {string} subreddit - the subreddit being monitored and the channel messages are sent to
 *  {number} timeLimit - the time in seconds between checks (note: keep above once/min to avoid being rate limited)
 *  {bool} removeFirstWord - some subreddits have flairs / etc. as the first word, this formats them nicely
 * */
async function sendMessages(subreddit, timeLimit, removeFirstWord) {
  const data = await getNewPosts(subreddit, timeLimit);
  const channel = client.channels.find(channel => channel.name === subreddit);
  let postCount = 0;

  data.forEach(post => {
    const { type, permalink, domain, url, title, thumbnail } = post;
    postCount++;

    try {
      const info = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle(type == null ? 'No flair' : type)
        .setURL(permalink)
        .setAuthor(domain, '', url)
        .setDescription(
          removeFirstWord ? title.substr(title.indexOf(' ') + 1) : title
        )
        .setTimestamp()
        .setThumbnail(thumbnail);

      channel.send(info);
    } catch (err) {
      console.log(err);
    }
  });
  console.log(`Posts sent from ${subreddit}:`, postCount);
}


// quick test to see if the bot is running
client.on('message', message => {
  if (message.content === '!ping') {
    // send back 'Pong.' to the channel the message was sent in
    message.channel.send('Pong.');
  }
});


// function that runs a cron job which calls sendMessages to see if there are any new posts
client.on('ready', () => {
  console.log('Before job instantiation');

  const job = new CronJob('*/5 * * * *', () => {  // cron job currently set to every 5 minutes
    const date = new Date();
    subreddits.forEach(subreddit => {
      const { name, frequency, removeFirstWord } = subreddit;
      sendMessages(name, frequency, removeFirstWord);
    });
    console.log('Five minutes:', date);
  });

  console.log('After job instantiation');
  job.start();
  console.log('Job started!');
});

client.on('warn', console.warn);
client.on('error', console.error);
client.login(process.env.DISCORD_TOKEN);  // change this in the .env when hosting
