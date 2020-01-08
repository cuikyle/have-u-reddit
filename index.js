const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
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





async function test(){
    let data = await getNewPosts('frugalmalefashion', 10000);
    console.log(data);
    const channel = client.channels.find('name', 'test');

    data.forEach(post => {

        channel.send(`item: ${post.title}\ntype: ${post.type}\n${post.url}`
        )

    });

}

test();
