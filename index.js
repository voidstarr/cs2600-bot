const getTodaysZoomInfo = require("auto-gershed");
const config = require("./config.json");
const Discord = require("discord.js");
const CronJob = require("cron").CronJob;

const client = new Discord.Client();

var latestZoomInfo = null;

function checkZoom() {
    getTodaysZoomInfo(config.username, config.password).then((zoomInfo) => {
        var lastLatestZoomInfo = latestZoomInfo;
        latestZoomInfo = zoomInfo.successful ? zoomInfo : null;
        // if there wasn't any zoom info, and we have some now, tell em
        if(lastLatestZoomInfo == null && latestZoomInfo != null){
            config.updateChannels.forEach((channelID) => {
                client.channels.fetch(channelID).then(sendCurrentZoomInfo);
            });
        }
    }).catch((reason) => {
        console.log(reason);
        latestZoomInfo = null;
    });
}

function sendCurrentZoomInfo(channel) {
    if(latestZoomInfo)
        channel.send(`>>> ID: ${latestZoomInfo.id}\nPassword: ${latestZoomInfo.password}\nURL: ${latestZoomInfo.url}`);
    else
        channel.send("No zoom information. Either there is no class today, or the bot doesn't have the info yet.\nIn any case, check https://www.cpp.edu/~dagershman/cs2600-001");
}

client.on("ready", () => {
    console.log("connected");
    // check zoom at when the bot starts
    checkZoom();
    // check zoom info at minute 0 past every 6th hour on Monday and Wednesday.
    new CronJob("0 */6 * * 1,3", checkZoom).start();
});

function enlighten(channel) {
    channel.send(">>> :cloud_lightning:");
}

client.on("message", msg => {
    if (msg.content === "~!zoomInfo") {
        sendCurrentZoomInfo(msg.channel);
    } else if (msg.content === "~!forceUpdate" && config.authorizedUsers.includes(msg.author.id)) {
        checkZoom();
    } else if (msg.content === "~!forceLightning") {
        enlighten(msg.channel);
    }
});

client.login(config.token);

