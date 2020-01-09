const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const CronJob = require('cron').CronJob;
client.login('NjY0MzE3MTAzMTU4OTg0NzA0.XhVT1Q.GEETZZTnhIVNDOExtzAfH2XXF98');

async function getNewPosts(subreddit, timeLimit){
    let response = await getData(subreddit);
    return await filterPosts(response, timeLimit);
}

async function getData(subreddit){
    let response = await fetch(`https://old.reddit.com/r/${subreddit}/new.json?sort=new`);
    return response.json()
}

async function filterPosts(response, timeLimit){
    const posts = response.data.children;
    const currTime = Math.floor(Date.now() / 1000);
    const newPosts = posts.filter(post => (currTime - post.data.created_utc) < timeLimit);

    let res = [];

    newPosts.forEach(post => {
        let obj = {};

        obj.subreddit = post.data.subreddit;
        obj.title = post.data.title;
        obj.type = post.data.link_flair_text;
        obj.domain = post.data.domain;
        obj.url = post.data.url;
        obj.permalink = `https://reddit.com${post.data.permalink}`;
        obj.thumbnail = ['self', 'default'].indexOf(post.data.thumbnail) !== -1 ? 'https://www.redditstatic.com/new-icon.png' : post.data.thumbnail;

        res.push(obj);
    });

    return res;
}


client.on('message', message => {
    if (message.content === '!ping') {
        // send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
        const channel = client.channels.find('name', 'test');
        channel.send('pls\npls\npls')
    }
});



async function sendMessages(subreddit, timeLimit){
    let data = await getNewPosts(subreddit, timeLimit);
    const channel = client.channels.find('name', subreddit);

    data.forEach(post => {

        try {
            const info = new Discord.RichEmbed()
                .setColor('#0099ff')
                .setTitle(post.type)
                .setURL(post.permalink)
                .setAuthor(post.domain, '', post.url)
                .setDescription(post.title)
                .setTimestamp()
                .setThumbnail(post.thumbnail);

            channel.send(info);
        } catch (err) {
            console.log('error')
        }

    });

}


console.log('Before job instantiation');
const job = new CronJob('*/10 * * * * ', function() {
    const d = new Date();
    console.log('Ten minutes:', d);
    console.log('Posts sent:', count);
    sendMessages('buildapcsales', 600);
    sendMessages('frugalmalefashion', 600);
});
console.log('After job instantiation');
job.start();
console.log('Job started!');

console.log(process.env.DISCORD_TOKEN);
