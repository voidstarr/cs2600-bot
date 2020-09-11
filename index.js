const getTodaysZoomInfo = require("auto-gershed");
const config = require("./config.json");
const Discord = require("discord.js");
const CronJob = require("cron").CronJob;

const client = new Discord.Client();

var latestZoomInfo = null;

function checkZoom() {
    getTodaysZoomInfo(config.username, config.password).then((zoomInfo) => {
        if(zoomInfo.success) {
            latestZoomInfo = zoomInfo;
        } else {
            latestZoomInfo = null;
        }
    });
}

function sendCurrentZoomInfo(channel) {
    if(latestZoomInfo)
        channel.send(`ID: ${latestZoomInfo.id}\nPassword: ${latestZoomInfo.password}\nURL: ${latestZoomInfo.url}`);
    else
        channel.send("No zoom information. Either there is no class today, or the bot doesn't have the info yet.\nIn any case, check https://www.cpp.edu/~dagershman/cs2600-001");
}

function cronCheck() {
    checkZoom();
    client.channels.fetch(config.updateChannel).then((channel) => {
        sendCurrentZoomInfo(channel);
    });
}

client.on("ready", () => {
    console.log("connected");
    checkZoom();
    new CronJob("0 */6 * * *", cronCheck).start();
});

client.on("message", msg => {
    if (msg.content === "~!zoomInfo") {
        sendCurrentZoomInfo(msg.channel);
    } else if (msg.content === "~!forceUpdate" && config.authorizedUsers.includes(msg.author.id)) {
        checkZoom();
        sendCurrentZoomInfo(msg.channel);
    }
});

client.login(config.token);
