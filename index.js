require("dotenv").config()
const Discord = require("discord.js")
const Varulfur = require("./Varulfur")
const client = new Discord.Client()

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
    if (msg.content.substring(0, 6) === "!game") {
        msg.reply(new Varulfur.game(0, msg.channel));
    }
})
client.login(process.env.BOT_TOKEN);