require("dotenv").config()
const Discord = require("discord.js")
const Varulfur = require("./Varulfur")
const colors = require('colors');
const client = new Discord.Client()

const prefix = ".";

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag.green}!`);
})
client.on("message", msg => {
    if (msg.content.substring(0, 5) === prefix + "game") {
        msg.reply(new Varulfur.game(0, msg.channel, msg.content.substring(6)));
    }
})
client.login(process.env.BOT_TOKEN)
    .then()
    .catch(e => console.log(e))