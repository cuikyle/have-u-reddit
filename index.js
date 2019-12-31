const fetch = require('node-fetch');

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
    const currTime = Math.floor(Date.now()/1000);

    //         const res = posts.filter(post => console.log((currTime - post.data.created_utc)));

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


async function test(){
    let data = await getNewPosts('frugalmalefashion', 20000);
    console.log(data);
}

test();
