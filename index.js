'use strict';
const fetch = require('node-fetch');

console.log('test');

/* return as array of objects, first post is oldest one
 * filter out useless info
 */

console.log(Date.now());


fetch('https://old.reddit.com/r/buildapcsales/new.json?sort=new')
    .then((response) => {
        return response.json();
    })
    .then((response) => {

        const posts = response.data.children;
        const currTime = Math.floor(Date.now()/1000);

        //         const res = posts.filter(post => console.log((currTime - post.data.created_utc)));

        const newPosts = posts.filter(post => (currTime - post.data.created_utc) < 9000);

        let res = [];

        console.log('posts!!!!');

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

        console.log(posts.length);
        console.log(newPosts.length);
        console.log(res);
    });