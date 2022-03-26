const superagent = require('superagent');
const consola = require('consola');
const {
    rbxflip_token, webhook
} = require('./config.json');

const joinedGiveaways = [];

const getThumbnail = id => 'https://www.roblox.com/thumbs/asset.ashx?width=420&height=420&assetid=' + id
const sendWebhookMessage = body => 
    superagent('POST', webhook)
    .set('content-type', 'application/json')
    .send(body).end();

const joinGiveaway = id => new Promise(resolve => {
    consola.success('Attempting to join', id)
    superagent('PUT', 'https://legacy.rbxflip-apis.com/giveaways/' + id)
    .set('authorization', 'Bearer ' + rbxflip_token)
    .send({})
    .then(resp => {
        joinedGiveaways.push(giveaway._id);
        console.log(resp.body);

        resolve(true);
    })
    .catch(err => {
        try {
            consola.log(err.response.body)
        } catch (e) {
            console.log(err);
        }
    
        resolve(false);
    })
})

const getGiveaways = () => new Promise(resolve => {
    consola.success('Fetching giveaways from rbxflip');
    superagent('GET', 'https://legacy.rbxflip-apis.com/giveaways')
    .then(resp => {
        if (!resp.body || !resp.body.data || !resp.body.data.giveaways)
            return resolve([]);
        resolve(resp.body.data.giveaways);
    })
    .catch(err => {
        console.log(err);
        resolve([]);
    })
})

const main = () => {
    setInterval(async () => {
        const currentGiveaways = await getGiveaways();
        for (const giveaway of currentGiveaways) {
            console.log(giveaway.status);
            if (giveaway.status !== 'Open') continue;
            consola.info(`Checking giveaway [${giveaway._id}]`);
            if (joinedGiveaways.indexOf(giveaway._id) > -1) continue;
            const joinResponse = await joinGiveaway(giveaway._id);

            console.log(joinResponse)
            if (joinResponse) sendWebhookMessage({
                content: null,
                embeds: [{
                    title: ":grin: Joined a giveaway",
                    description: ",,\n\n:stars: [View on rbxflip](https://rbxflip.com)",
                    color: 5814783,
                    footer: {
                      text: `ID: ${giveaway._id}`
                    },
                    timestamp: new Date().toISOString(),
                    thumbnail: {
                        url: getThumbnail(giveaway.item.assetId)
                    }
                }]
            })
        }
    }, 10 * 1000)
}

main();
