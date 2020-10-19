const Discord = require("discord.js")

exports.time_until_join = 15000;
exports.time_until_deck = 120000;
exports.players_to_start = 1;

exports.types = [{id: 0, type: "villager", basic_latin: "villager", team: 0}, 
                {id: 1, type: "werewolf", basic_latin: "werewolf", team: 1}, 
                {id: 2, type: "minion", basic_latin: "minion", team: 1}, 
                {id: 3 , type: "mason", basic_latin: "mason", team: 1}, 
                {id: 4 , type: "seer", basic_latin: "seer", team: 0}, 
                {id: 5 , type: "robber", basic_latin: "robber", team: 0}, 
                {id: 6 , type: "troublemaker", basic_latin: "troublemaker", team: 0}, 
                {id: 7 , type: "drunk", basic_latin: "drunk", team: 0}, 
                {id: 8 , type: "hunter", basic_latin: "hunter", team: 0}, 
                {id: 9 , type: "insomniac", basic_latin: "insomniac", team: 0},
                {id: 10 , type: "tanner", basic_latin: "tanner", team: 3},
                {id: 11 , type: "doppelgänger", basic_latin: "doppelganger", team: 4}];

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
                { name: 'Thw game will automaticly start in:', value: (exports.time_until_join / 1000) + "sek.", inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
        var join_message
        await this.channel.send(embeded).then((embeded_msg) => {
            embeded_msg.react('☑')
            embeded_msg.react('✅')
            join_message = embeded_msg;

            const filter = (reaction, user) => reaction.emoji.name === '✅';
            const collector = embeded_msg.createReactionCollector(filter, {time: exports.time_until_join});
            collector.on('collect', r => {if(r.count > 1) {
                collector.stop('NoEnd');
                this.DeckSelection();
            }});
            collector.on('end', (collected, reason) => {if(reason != 'NoEnd'){this.DeckSelection()}});  
        })
        .catch(()=>{});
        this.join_message = join_message;
    }
    
    async DeckSelection(){
        this.deck = [];
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
        const embeded = new Discord.MessageEmbed()
            .setColor('#A0A000')
            .setTitle("New Game")
            .setURL()
            .setAuthor('Varúlfur', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/Kirill-iceland/voting-bot')
            .setDescription('Select deck and press ✅ to start the game. To reset deck press ❌')
            .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
            .addFields(
                { name: 'Thw game will automaticly start in:', value: (exports.time_until_deck / 1000) + "sek.", inline: false },
                { name: 'Werewolfs team:', value: "\u200b", inline: true },
                { name: 'Villagers team:', value:  "\u200b", inline: true },
                { name: 'Others:', value: "\u200b", inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');

        await this.channel.send(embeded).then(async (embeded_msg) => {
            for(var i = 0; i < exports.types.length; i++){
                var reaction = embeded_msg.guild.emojis.cache.find(reaction => reaction.name == 'vdb_' + exports.types[i].basic_latin);
                if(reaction){
                    embeded_msg.react(reaction)
                }else{
                    await embeded_msg.guild.emojis.create('./img/reactions/' + exports.types[i].type + '.png', 'vdb_' + exports.types[i].basic_latin).then().catch(e => console.error(e));
                    await embeded_msg.react(embeded_msg.guild.emojis.cache.find(reaction => reaction.name == 'vdb_' + exports.types[i].basic_latin)).then().catch(e => console.error(e));
                }
            }
            this.deck_message1 = embeded_msg;

            const filter = (reaction, user) => {
                for(var i = 0; i < exports.types.length; i++){
                    if(reaction.emoji.name === 'vdb_' + exports.types[i].basic_latin){
                        return true
                    }
                }
                return false;
            };
            const collector = embeded_msg.createReactionCollector(filter, {time: exports.time_until_deck});
            collector.on('collect', (r, user) => {
                if(r.count > 1){
                    console.log(r.emoji.name);
                    if(this.deck.length < this.players.length + 3){
                        this.addCard(r.emoji.name.substring(4));
                    }
                    r.users.remove(user);
                }
            }); 
        })
        .catch(()=>{});

        await this.channel.send('➖').then(async (embeded_msg) => {
            for(var i = 0; i < exports.types.length; i++){
                var reaction1 = embeded_msg.guild.emojis.cache.find(reaction => reaction.name == 'vdb_not_' + exports.types[i].basic_latin);
                if(reaction1){
                    embeded_msg.react(reaction1)
                }else{
                    await embeded_msg.guild.emojis.create('./img/reactions/not/' + exports.types[i].type + '.png', 'vdb_not_' + exports.types[i].basic_latin).then().catch(e => {console.error(e); return 0});
                    await embeded_msg.react(embeded_msg.guild.emojis.cache.find(reaction => reaction.name == 'vdb_not_' + exports.types[i].basic_latin)).then().catch(e => console.error(e));
                }
            }
            await embeded_msg.react('❌')
            await embeded_msg.react('✅')
            this.deck_message2 = embeded_msg;

            const filter = (reaction, user) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
            const collector = embeded_msg.createReactionCollector(filter, {time: exports.time_until_deck});
            collector.on('collect', (r, user) => {if(r.count > 1) {
                if(r.emoji.name == '✅'){
                    collector.stop('NoEnd');
                    this.Start();
                }else{
                    this.deck = [];
                    this.update_deck_message()
                }
                r.users.remove(user);
            }});
            collector.on('end', (collected, reason) => {if(reason != 'NoEnd'){this.Start()}});  
            
            const filter1 = (reaction, user) => {
                for(var i = 0; i < exports.types.length; i++){
                    if(reaction.emoji.name === 'vdb_not_' + exports.types[i].basic_latin){
                        return true
                    }
                }
                return false;
            };
            const collector1 = embeded_msg.createReactionCollector(filter1, {time: exports.time_until_deck});
            collector1.on('collect', (r, user) => {
                if(r.count > 1){
                    console.log(r.emoji.name.substring(8));
                    if(this.deck.length != 0){
                        this.removeCard(r.emoji.name.substring(8));
                    }
                    r.users.remove(user);
                }
            });
        })
        .catch(()=>{});
        console.log(this.players);
    }

    addCard(CardName){
        this.deck.push(new exports.card(CardName))
        console.log(this.deck)
        this.update_deck_message()
    }

    removeCard(CardName){
        for(var i = 0; i < this.deck.length; i++){
            if(this.deck[i].name == CardName){
                this.deck.splice(i,1)
                console.log(this.deck)
                this.update_deck_message()
                return true;
            }
        }
    }

    update_deck_message(){
          
        var werewolfs = "";
        var villagers = "";
        var others = "";
        console.log(this.deck)
        for(var i = 0; i < this.deck.length; i++){
            var E = this.channel.client.emojis.cache.find(emoji => emoji.name === `vdb_${this.deck[i].name}`).toString()
            if(this.deck[i].team == 0){
                villagers += `${E}`
            }else if(this.deck[i].team == 1){
                werewolfs += `${E}`
            }else{
                others += `${E}`
            }
        }
        const embeded = new Discord.MessageEmbed()
            .setColor('#A0A000')
            .setTitle("New Game")
            .setURL()
            .setAuthor('Varúlfur', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/Kirill-iceland/voting-bot')
            .setDescription('Select a deck and press ✅ to start the game. To reset deck press ❌')
            .setThumbnail('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
            .addFields(
                { name: 'Thw game will automaticly start in:', value: (exports.time_until_deck / 1000) + "sek.", inline: false },
                { name: 'Werewolfs team:', value: "\u200b" + werewolfs, inline: true },
                { name: 'Villagers team:', value:  "\u200b" + villagers, inline: true },
                { name: 'Others:', value: "\u200b" + others, inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
        this.deck_message1.edit(embeded)
    }

    Start(){
        this.deck_message1.delete()
        this.deck_message2.delete()
    }
}
exports.game = game;

class card{
    /**
     * @param {String} type 
     */
    constructor(type = "villager"){
        type = type.toLowerCase();
        this.name = type;
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
            case exports.types[11].basic_latin:
                this.type = 11;
                break;
            default:
                this.type = 0;
                this.name = "villager";
        }
        this.team = exports.types[this.type].team;
    }
}
exports.card = card;