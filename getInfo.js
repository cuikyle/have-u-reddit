const fetch = require('node-fetch');

/**
 *  Wrapper function --> Gets info from the Reddit API and returns new posts within the time limit
 *  {string} subreddit - the subreddit being monitored and the channel messages are sent to
 *  {number} timeLimit - the time in seconds between checks (note: keep above once/min to avoid being rate limited)
 * */
async function getNewPosts(subreddit, timeLimit) {
    const response = await getData(subreddit);
    return await filterPosts(response, timeLimit);
}

async function getData(subreddit) {
    const response = await fetch(`https://old.reddit.com/r/${subreddit}/new.json?sort=new`);
    return response.json();
}

// filters the list of newest posts and returns the ones within the time limit
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
                ['self', 'default'].indexOf(thumbnail) !== -1
                    ? 'https://www.redditstatic.com/new-icon.png'
                    : thumbnail
        };
        res.push(obj);
    });
    return res;
}

module.exports = getNewPosts;