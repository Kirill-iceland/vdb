require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client()
const colors = require('colors');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
    msg.react('☑')
})
client.login("Token");