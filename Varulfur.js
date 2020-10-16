const Discord = require("discord.js")

exports.time_until_start = 15000;
exports.players_to_start = 3;

exports.types = [{id: 0, type: "villager", team: 0}, 
                {id: 1, type: "werewolf", team: 1}, 
                {id: 2, type: "minion", team: 1}, 
                {id: 3 , type: "mason", team: 1}, 
                {id: 4 , type: "seer", team: 0}, 
                {id: 5 , type: "robber", team: 0}, 
                {id: 6 , type: "troublemaker", team: 0}, 
                {id: 7 , type: "drunk", team: 0}, 
                {id: 8 , type: "hunter", team: 0}, 
                {id: 9 , type: "insomniac", team: 0},
                {id: 10 , type: "tanner", team: 3},
                {id: 11 , type: "doppelgänger", team: 4}];

class game{

    /**
     * @param {Number} stage 
     * @param {Discord.TextChannel} channel 
     * @param {object} options 
     */
    constructor(stage, channel, options){
        this.stage = stage;
        this.channel = channel;
        switch(stage){
            case 0:
                this.PlayerSelection();
                break;
            case 1:

                break;
            case 2:
                
                break;
        }
    }

    async PlayerSelection(){
        const embeded = new Discord.MessageEmbed()
            .setColor('#800000')
            .setTitle("New Game")
            .setURL()
            .setAuthor('Varúlfur', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/Kirill-iceland/voting-bot')
            .setDescription('To join the game press ☑. To start the game press ✅.')
            .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
            .addFields(
                { name: 'Thw game will automaticly start in:', value: (exports.time_until_start / 1000) + "sek.", inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
        var join_message
        await this.channel.send(embeded).then((embeded_msg) => {
            embeded_msg.react('☑')
            embeded_msg.react('✅')
            join_message = embeded_msg;

            const filter = (reaction, user) => reaction.emoji.name === '✅';
            const collector = embeded_msg.createReactionCollector(filter, {time: exports.time_until_start});
            collector.on('collect', r => {if(r.count > 1) {
                collector.stop('NoEnd');
                this.DeckSelection();
            }});
            collector.on('end', (collected, reason) => {if(reason != 'NoEnd'){this.DeckSelection()}});  
        })
        .catch(()=>{});
        this.join_message = join_message;
    }

    DeckSelection(){
        this.players = this.join_message.reactions.resolve('✅').users.cache.array()
        this.join_message.delete();
        if(this.players.length < exports.players_to_start){
            this.join_message.channel.send("```\nSorry there are not enough people to start the game.\nYou need atleast " + exports.players_to_start + " people to start the game!\n```")
            return 0;
        }
        for(var i = 0; i < this.players.length; i++){
            if(this.players[i].id == this.join_message.author.id){
                this.players.splice(i,1)
            }
        }
        console.log(this.players);
    }

    Start(){
        this.start_message.delete();
    }
}
exports.game = game;

class card{
    /**
     * @param {String} type 
     */
    constructor(type = "villager"){
        type = type.toLowerCase();
        switch(type){
            case exports.types[0].type:
                this.type = 0;
                break;
            case exports.types[1].type:
                this.type = 1;
                break;
            case exports.types[2].type:
                this.type = 2;
                break;
            case exports.types[3].type:
                this.type = 3;
                break;
            case exports.types[4].type:
                this.type = 4;
                break;
            case exports.types[5].type:
                this.type = 5;
                break;
            case exports.types[6].type:
                this.type = 6;
                break;
            case exports.types[7].type:
                this.type = 7;
                break;
            case exports.types[8].type:
                this.type = 8;
                break;
            case exports.types[9].type:
                this.type = 9;
                break;
            case exports.types[10].type:
                this.type = 10;
                break;
            case exports.types[11].type:
                this.type = 11;
                break;
            default:
                this.type = 0;
        }
    }
}
exports.card = card;