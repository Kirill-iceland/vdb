const Discord = require("discord.js")
const colors = require('colors');

exports.time_until_join = 3600000;
exports.time_until_deck = 120000;
exports.players_to_start = 1;
exports.order_number = 6;

exports.types = [{id: 0, order: -1, type: "villager", basic_latin: "villager", team: 0}, 
                {id: 1, order: 1, type: "werewolf", basic_latin: "werewolf", team: 1}, 
                {id: 2, order: -1, type: "minion", basic_latin: "minion", team: 1}, 
                {id: 3, order: -1, type: "mason", basic_latin: "mason", team: 1}, 
                {id: 4, order: 2, type: "seer", basic_latin: "seer", team: 0}, 
                {id: 5, order: 3, type: "robber", basic_latin: "robber", team: 0}, 
                {id: 6, order: 4, type: "troublemaker", basic_latin: "troublemaker", team: 0}, 
                {id: 7, order: 5, type: "drunk", basic_latin: "drunk", team: 0}, 
                {id: 8, order: -1, type: "hunter", basic_latin: "hunter", team: 0}, 
                {id: 9, order: 6, type: "insomniac", basic_latin: "insomniac", team: 0},
                {id: 10, order: -1, type: "tanner", basic_latin: "tanner", team: 2},
                {id: 11, order: 0, type: "doppelgänger", basic_latin: "doppelganger", team: 3}];

                
//-----------------------------------------------------------------------------------------------------------------------

class game{

    /**
     * @param {Number} stage 
     * @param {Discord.TextChannel} channel 
     * @param {object} options 
     */
    constructor(stage, channel, options = ""){
        this.stage = stage;
        this.channel = channel;
        this.options = {};
        var NoErr = true;
        
        if(options != ""){
            this.options = JSON.parse(options);
            if(this.options.deck){
                var deck = this.options.deck.split(",")
                console.log(deck);
                for(var i = 0; i < deck.length; i++){
                    switch(deck[i].toLowerCase()){
                        case "v":
                            deck[i] = new card("villager");
                            break;
                        case "w":
                            deck[i] = new card("werewolf");
                            break;
                        case "mi":
                            deck[i] = new card("minion");
                            break;
                        case "ma":
                            deck[i] = new card("mason");
                            break;
                        case "s":
                            deck[i] = new card("seer");
                            break;
                        case "r":
                            deck[i] = new card("robber");
                            break;
                        case "tr":
                            deck[i] = new card("troublemaker");
                            break;
                        case "dr":
                            deck[i] = new card("drunk");
                            break;
                        case "h":
                            deck[i] = new card("hunter");
                            break;
                        case "i":
                            deck[i] = new card("insomniac");
                            break;
                        case "ta":
                            deck[i] = new card("tanner");
                            break;
                        case "do":
                            deck[i] = new card("doppelgänger");
                            break;
                        default:
                            this.channel.send("This deck is invalid!")
                            NoErr = false;
                    }
                    this.options.players = {min: deck.length - 3, max: deck.length - 3};
                    this.options.deck = deck;
                }
            }
        }

        if(NoErr){
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
    }

    async PlayerSelection(){
        const embeded = new Discord.MessageEmbed()
            .setColor('#800000')
            .setTitle("New Game")
            .setURL()
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('To join the game press ☑. To start the game press ✅.')
            .addFields(
                { name: 'The game will automaticly start in:', value: (exports.time_until_join / 1000) + "sek.", inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');
        await this.channel.send(embeded).then((embeded_msg) => {
            embeded_msg.react('☑')
            embeded_msg.react('✅')
            this.join_message = embeded_msg;

            const filter = (reaction, user) => reaction.emoji.name === '✅';
            const collector = embeded_msg.createReactionCollector(filter, {time: exports.time_until_join});
            collector.on('collect', r => {
                if(r.count > 1) {
                    collector.stop('NoEnd');
                    this.DeckSelection();
                }
            });
            collector.on('end', (collected, reason) => {if(reason != 'NoEnd'){this.DeckSelection()}});  
        })
        .catch(()=>{});
    }
    
    async DeckSelection(){
        this.deck = [];
        this.players = (await this.join_message.reactions.resolve('☑').users.fetch()).array()
        this.join_message.delete();
        if(this.players.length < exports.players_to_start){
            this.join_message.channel.send("```\nSorry there aren't enough players to start the game.\nYou need at least " + exports.players_to_start + " players to start the game!\n```")
            return 0;
        }
        if(this.options.players){
            if(this.players.length < this.options.players.min + 1){
                this.join_message.channel.send("```\nSorry there are not enough people to start the game.\nYou need at least " + this.options.players.min + " people to start the game!\n```")
                return 0;
            }else if(this.players.length > this.options.players.max + 1){
                console.log(this.players.length + " " + this.options.players.max)
                this.join_message.channel.send("```\nSorry there are too many people to start the game.\nNot more then " + this.options.players.max + " people to start the game!\n```")
                return 0;
            }
        }

        for(var i = 0; i < this.players.length; i++){
            if(this.players[i].id == this.join_message.author.id){
                this.players.splice(i,1)
            }
        }
        
        console.log(`A new game was created and `.green)
        for(var i = 0; i < this.players.length; i++){
            console.log(this.players[i].username.red)
        }
        console.log(`joined the game.\n`.green)

        if(this.options.deck){
            console.log(this.options.deck)
            this.deck = this.options.deck;
            this.Start(true)
            return 1;
        }

        // console.log(this.players)
        const embeded = new Discord.MessageEmbed()
            .setColor('#A0A000')
            .setTitle("New Game")
            .setURL()
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('Select deck and press ✅ to start the game. To reset deck press ❌')
            .addFields(
                // { name: 'The game will automaticly start in:', value: (exports.time_until_deck / 1000) + "sek.", inline: false },
                { name: 'Werewolfs team:', value: "\u200b", inline: true },
                { name: 'Villagers team:', value:  "\u200b", inline: true },
                { name: 'Others:', value: "\u200b", inline: true }
            )
            .setTimestamp()
            .setFooter('Thanks for joining!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');

        await this.channel.send(embeded).then(async (embeded_msg) => {
            for(var i = 0; i < exports.types.length; i++){
                var reaction = embeded_msg.guild.emojis.cache.find(reaction => reaction.name == 'vdb_' + exports.types[i].basic_latin);
                if(reaction){
                    // if(reaction.name === "vdb_doppelganger" || reaction.name === "vdb_seer" || reaction.name === "vdb_werewolf"){
                        embeded_msg.react(reaction)
                    // }
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
            const collector = embeded_msg.createReactionCollector(filter/*, {time: exports.time_until_deck}*/);
            collector.on('collect', (r, user) => {if(r.count > 1) {
                if(r.emoji.name == '✅'){
                    if(this.deck.length != this.players.length + 3){
                        this.channel.send("```Sorry, there aren't enough cards to start the game.```")
                        r.users.remove(user);
                        return 0;
                    }
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
                    if(this.deck.length != 0){
                        this.removeCard(r.emoji.name.substring(8));
                    }
                    r.users.remove(user);
                }
            });
        })
        .catch(()=>{});
    }

    addCard(CardName){
        this.deck.push(new exports.card(CardName))
        this.update_deck_message()
    }

    removeCard(CardName){
        for(var i = 0; i < this.deck.length; i++){
            if(this.deck[i].basic_latin == CardName){
                this.deck.splice(i,1)
                this.update_deck_message()
                return true;
            }
        }
    }

    update_deck_message(){
          
        var werewolfs = "";
        var villagers = "";
        var others = "";
        for(var i = 0; i < this.deck.length; i++){
            var E = this.channel.client.emojis.cache.find(emoji => emoji.name === `vdb_${this.deck[i].basic_latin}`).toString()
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
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('Select a deck and press ✅ to start the game. To reset deck press ❌')
            .addFields(
                // { name: 'The game will automaticly start in:', value: (exports.time_until_deck / 1000) + "sek.", inline: false },
                { name: 'Werewolfs team:', value: "\u200b" + werewolfs, inline: true },
                { name: 'Villagers team:', value:  "\u200b" + villagers, inline: true },
                { name: 'Others:', value: "\u200b" + others, inline: true }
            )
            .setTimestamp()
            .setFooter('Thank you for joining!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');
        this.deck_message1.edit(embeded)
    }

    /**
     * 
     * @param {Boolean} NoDelete 
     */
    async Start(NoDelete = false){
        if(!NoDelete){
            this.deck_message1.delete()
            this.deck_message2.delete()
        }
        
        const embeded = new Discord.MessageEmbed()
            .setColor('#00A000')
            .setTitle("The game has started")
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('You should get a dm from the bot with your card.')
            .setFooter("Thanks for playing!", "https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png");

        this.start_message = await this.channel.send(embeded);
        this.layout = new exports.layout(this.deck, this);
        this.layout.shuffle()
        console.log(`The deck has been selected and shuffled. Here's the deck:`.green)
        for(var i = 0; i < this.layout.players.length; i++){
            console.log(this.layout.players[i].card.name.yellow + " --- ".green + this.layout.players[i].user.username.red)
        }
        console.log("And cards in the center are:\n".green + this.layout.center[0].name.yellow + "\n" + this.layout.center[1].name.yellow + "\n" + this.layout.center[2].name.yellow + "\n")
        console.log("The game has started!".green)

        await this.layout.send_starting_card()
        this.final_layout = this.layout.copy(); 
        this.move()
        //this.layout.players[1].card.move(this.layout, this.layout.players[1].user, 1)
    }

    async move(){
        this.layout.numberofmove++;
        if(this.layout.numberofmove > this.layout.order.length) {
            this.Meeting();
            return true;
        }
        this.layout.order[this.layout.numberofmove - 1].card.move(
            this.layout, 
            this.layout.order[this.layout.numberofmove - 1].user, 
            this.layout.order[this.layout.numberofmove - 1].id);
    }

    async Meeting(){
        console.log("The meeting has started!".green)
        this.start_message.delete()

        var fields = [];
        this.voters = [];
        for(var i = 0; i < this.players.length; i++){
            fields.push({name: i + ": " + this.players[i].username + ": 0 votes", value: "\u200b", inline: false })
            this.voters.push({user: this.players[i], vote: -1, votes: 0, id: i})
        }
        const embeded = new Discord.MessageEmbed()
            .setColor('#00A000')
            .setTitle("Meeting")
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('Time to choose who to vote out. If there is a tie the player will be chosen randomly')
            .addFields(fields)
            .setFooter('Thank you for joining!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');
        
        this.meeting_message = await this.channel.send(embeded);

        var filter = msg => !Number.isNaN(parseInt(msg)) && parseInt(msg) >=-1 && parseInt(msg) < this.players.length;
        var collector = this.channel.createMessageCollector(filter)
            .on("collect", msg => {
                var number = parseInt(msg);
                for(var i = 0; i < this.voters.length; i++){
                    if(msg.author.id == this.voters[i].user.id){
                        this.voters[i].vote = number;
                    }
                }
                if(this.update_meeting_message()){
                    collector.stop()
                }
            })
    }

    End(){
        this.meeting_message.delete()

        var HScore = [{votes: 0}];
        for(var i = 0; i < this.voters.length; i++){
            if(this.voters[i].votes > HScore[0].votes){
                HScore = [this.voters[i]]
            }else if(this.voters[i].votes == HScore[0].votes){
                HScore.push(this.voters[i])
            }
        }

        if(HScore.length > 1){
            var r = Math.floor(Math.random() * (HScore.length - 0.1))
            HScore = HScore[r]
        }else{
            HScore = HScore[0]
        }

        var end_msg = "";
        var color = "";
        var img = "";
        var werewolfs_in_game = 0

        for(var i = 0; i < this.final_layout.players.length; i++){
            if(i != HScore.id && this.final_layout.players[i].card.name == "werewolf"){
                werewolfs_in_game++;
            }
        }
        if(this.final_layout.players[HScore.id].card.name == "tanner"){
            end_msg = "Tanner won!";
            color = "#FFFF00";
            img = 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/tanner.png';
        }else if(werewolfs_in_game > 0 && this.final_layout.players[HScore.id].card.name != "werewolf"){
            end_msg = "Werewolfs won!";
            color = "#FF0000";
            img = 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/werewolf.png';
        }else{
            end_msg = "Villagers won!";
            color = "#00FF00";
            img = 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/villager.png';
        }

        var fields = [{name: "Pleyers are:", value: ""}];
        for(var i = 0; i < this.final_layout.players.length; i++){
            fields[0].value += this.final_layout.players[i].user.username + ": " + this.final_layout.players[i].card.name + "\n";
        }
        fields.push({name: "And cards in the center are:", value: this.final_layout.center[0].name + "\n" + this.final_layout.center[1].name + "\n" + this.final_layout.center[2].name})

        const embeded = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle("End")
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription(HScore.user.username + " was voted out!\n" + end_msg)
            .addFields(fields)
            .setImage(img)
            .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');
        
        this.meeting_message = this.channel.send(embeded);

        console.log(HScore.user.username.red + " was voted out!".green);
        console.log(end_msg.green + "\n");
        console.log(`The final layout was:`.green)
        for(var i = 0; i < this.final_layout.players.length; i++){
            console.log(this.final_layout.players[i].card.name.yellow + " --- ".green + this.final_layout.players[i].user.username.red)
        }
        console.log("And cards in the center are:\n".green + this.final_layout.center[0].name.yellow + "\n" + this.final_layout.center[1].name.yellow + "\n" + this.final_layout.center[2].name.yellow + "\n")
    }

    update_meeting_message(){
        var fields = [];
        var skip = false;
        for(var i = 0; i < this.voters.length; i++){
            this.voters[i].votes = 0;
            for(var j = 0; j < this.voters.length; j++){
                if(i == this.voters[j].vote){
                    this.voters[i].votes++;
                }
            }
            skip = skip || this.voters[i].vote == -1;
            fields.push({name: i + ": " + this.players[i].username + ": " +  this.voters[i].votes + " votes", value: "\u200b", inline: false })
        }
        

        this.meeting_message.edit(new Discord.MessageEmbed()
            .setColor('#00A000')
            .setTitle("Meeting")
            .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
            .setDescription('Time to choose who to vote out. If there is a tie the player will be chosen randomly')
            .addFields(fields)
            .setFooter('Thanks for joining!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
        );

        if(!skip){
            this.End()
            return true;
        }
        return false;
    }
}
exports.game = game;

//-----------------------------------------------------------------------------------------------------------------------

class layout{
    /**
     * @param {card[]} deck - deck of the game
     * @param {game} game - Parrent game
     * @param {Number} test
     */
    constructor(deck, game){
        this.shuffled = false;
        this.deck = deck;
        this.game = game;
        this.users = this.game.players;
        this.players = [];
        this.order = [];
        this.numberofmove = 0;
    }

    shuffle(){
        var deck = this.deck;
        for(var i = 0; i < this.users.length; i++){
            var r = Math.floor(Math.random() * (deck.length - 0.1));
            this.players.push({card: deck[r], user: this.users[i], message: undefined, id: i});
            deck.splice(r,1);
        }
        this.center = deck;
        // console.log(this.center)
        // console.log(this.players)
        this.shuffled = true;

        for(var i = 0; i <= exports.order_number; i++){
            for(var j = 0; j < this.players.length; j++){
                if(exports.types[this.players[j].card.type].order == i){
                    this.order.push(this.players[j]);
                }
            }
        }
        this.numberofmove = 0;
    }
    
    async send_starting_card(){
        if(!this.shuffled){
            console.error("The deck is not shufled!")
            return false;
        }
        for(var i = 0; i < this.players.length; i++){
            if(this.players[i].user.bot)return false;
            var color;
            switch(this.players[i].card.team){
                case 0:
                    color = '#00ff00';
                    break;
                case 1:
                    color = '#ff0000';
                    break;
                case 2:
                    color = '#ffff00';
                    break;
                case 3:
                    color = '#ff00ff';
                    break;
            }
            const embeded = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle("You are a " + this.players[i].card.name)
                .setURL()
                .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                .setImage('https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/' + this.players[i].card.basic_latin + ".png")
                .setTimestamp()
                .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png');

            this.players[i].message = await this.players[i].user.send(embeded);
        }
    }

    /**
     * @param {Number} first 
     * negative = center
     * @param {Number} second 
     * negative = center
     */
    swap(first, second){
        if(first >= 0 && second >= 0){
            var c = this.players[first].card;
            this.players[first].card = this.players[second].card;
            this.players[second].card = c;
        }else if(first < 0 && second >= 0){
            var c = this.center[-first];
            this.center[-first] = this.players[second].card;
            this.players[second].card = c;
        }else if(first >= 0 && second < 0){
            var c = this.players[first].card;
            this.players[first].card = this.center[-second];
            this.center[-second] = c;
        }else{
            var c = this.center[-first];
            this.center[-first] = this.center[-second];
            this.center[-second] = c;
        }
    }

    /**
     * @returns {layout} layout
     */
    copy(){
        var copy = new layout(this.deck, this.game)
        copy.players = this.players.slice(0);
        for(var i = 0; i < this.players.length; i++){
            copy.players[i] = Object.assign({}, this.players[i]);
        }
        copy.order = this.order.slice(0);
        copy.center = this.center.slice(0);
        copy.shuffled = !(!this.shuffled);
        copy.numberofmove = this.numberofmove * 1;

        return(copy);
    }
}
exports.layout = layout;

//-----------------------------------------------------------------------------------------------------------------------

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
                this.name = exports.types[11].type;
                break;
            default:
                this.type = 0;
                this.name = "villager";
        }
        this.team = exports.types[this.type].team;
        this.basic_latin = exports.types[this.type].basic_latin;
    }

    /**
     * @param {layout} layout 
     * @param {Discord.User} user 
     * @param {Number} id 
     */
    async move(layout, user, id){

        if(user.bot){
            // for(var i = 0; i < layout.game.final_layout.players.length; i++){
            //     console.log(layout.game.final_layout.players[i].card.name.yellow + " --- ".green + layout.game.final_layout.players[i].user.username.red)
            // }
            // console.log("And cards in the middle are:\n".green + layout.game.final_layout.center[0].name.yellow + "\n" + layout.game.final_layout.center[1].name.yellow + "\n" + layout.game.final_layout.center[2].name.yellow + "\n")
            
            layout.game.move()
            return false
        }

        this.user = user;
        this.layout = layout;
        
        // for(var i = 0; i < this.layout.game.final_layout.players.length; i++){
        //     console.log(this.layout.game.final_layout.players[i].card.name.yellow + " --- ".green + this.layout.game.final_layout.players[i].user.username.red)
        // }
        // console.log("And cards in the middle are:\n".green + this.layout.game.final_layout.center[0].name.yellow + "\n" + this.layout.game.final_layout.center[1].name.yellow + "\n" + this.layout.game.final_layout.center[2].name.yellow + "\n")

        if(this.type == 4 || this.type == 5 || this.type == 6 || this.type == 11){
            var other_people = layout.players.slice(0);
            other_people.splice(id, 1);
            for(var i = 0; i < other_people.length; i++){
                other_people[i] = i + ": " + other_people[i].user.username;
            }
            other_people.join("\n");
            

        }else if(this.type == 1){
            var other_people = layout.game.final_layout.players.slice(0);
            other_people.splice(id, 1);
            var other_werewolfs = [];
            for(var i = 0; i < other_people.length; i++){
                if(other_people[i].card.type == 1){
                    other_werewolfs.push(other_people[i].user.username);
                }
            }
            other_werewolfs.join("\n");
            if(other_werewolfs == ""){
                other_werewolfs = "There are no other werewolfs!"
            }
        }

        switch(this.type){
            case exports.types[0].id:
                this.layout.game.move()
                break;
            case exports.types[1].id:
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .addField(" Other werewolfs are:", other_werewolfs)
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                layout.game.move()
                break;
            case exports.types[2].id:
                break;
            case exports.types[3].id:
                break;
            case exports.types[4].id: //seer
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .setDescription("To see a card of a user write a number that's infront of the user. If you want to check cards in middle write two different numbers from 1-3 with a space between. Example: 0 or 1 2")
                    .addField(" Here are the users:", other_people)
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                    );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                var collector = this.user.dmChannel.createMessageCollector(msg => !msg.author.bot)
                    .on("collect", msg => {
                        var numbers = msg.content.split(" ");
                        if(numbers.length > 2){
                            msg.channel.send("There are too many numbers.")
                        }else if(numbers.length == 1){
                            
                            var number = parseInt(numbers[0])
                            if(!Number.isNaN(number) && number >= 0 && number < this.layout.players.length - 1){
                                if(number >= id){
                                    number++;
                                }

                                msg.channel.send(this.layout.game.final_layout.players[number].user.username + " has a **" + this.layout.players[number].card.name + "** card.")
                                console.log(user.username.red + " checked ".green + this.layout.players[number].user.username.red + " card".green)

                                collector.stop();
                                this.layout.game.move()
                            }else{
                                msg.channel.send(msg.content + " is an invalid number.")
                            }
                        
                        }else if(numbers.length == 2){

                            numbers[0] = parseInt(numbers[0])
                            numbers[1] = parseInt(numbers[1]) 

                            if(Number.isNaN(numbers[0]) || numbers[0] > 3 || numbers[0] < 1){
                                msg.channel.send(msg.content.split(" ")[0] + " is an invalid number.")
                            }else if(Number.isNaN(numbers[1]) || numbers[1] > 3 || numbers[1] < 1){
                                msg.channel.send(msg.content.split(" ")[1] + " is an invalid number.")
                            }else if(numbers[0] == numbers[1]){
                                msg.channel.send(numbers[0] + " and " + numbers[1] + " are the same numbers.")
                            }else{
                                msg.channel.send("The cards in the center are:\n" + this.layout.game.final_layout.center[numbers[0] - 1].name + " and " +this.layout.game.final_layout.center[numbers[1] - 1].name)
                                console.log(user.username.red + " checked ".green + numbers[0] + " and ".green + numbers[1] + " cards in the center".green)
                                
                                collector.stop();
                                this.layout.game.move()
                            }
                        }
                    });
                break;
            case exports.types[5].id: //robber
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .setDescription("To swap cards with the user write a number that is infront of the user.")
                    .addField(" Please choose one of the folloing people to swap your card with:", other_people)
                    .setURL()
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                var collector = this.user.dmChannel.createMessageCollector(msg => !msg.author.bot)
                    .on("collect", msg => {
                        var number = parseInt(msg.content);
                        // console.log(this.layout.game.final_layout.players)
                        if(!Number.isNaN(number) && number >= 0 && number < this.layout.players.length - 1){
                            if(number >= id){
                                number++;
                            }
                            this.layout.game.final_layout.swap(id, number)
                            // console.log(this.layout.game.final_layout.players)
                            console.log(user.username.red + " swapped cards with ".green + this.layout.players[number].user.username.red)

                            var color;
                            switch(this.layout.game.final_layout.players[id].card.team){
                                case 0:
                                    color = '#00ff00';
                                    break;
                                case 1:
                                    color = '#ff0000';
                                    break;
                                case 2:
                                    color = '#ffff00';
                                    break;
                                case 3:
                                    color = '#ff00ff';
                                    break;
                            }
                            this.layout.players[id].message.edit(new Discord.MessageEmbed()
                                .setColor(color)
                                .setTitle("You are now " + this.layout.game.final_layout.players[id].card.name)
                                .setDescription("This is card you got from " + this.layout.players[number].user.username + ". Thanks for making a move")
                                .setURL()
                                .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                                .setImage('https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/' + this.layout.game.final_layout.players[id].card.basic_latin + ".png")
                                .setTimestamp()
                                .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                            );

                            collector.stop();
                            this.layout.game.move()
                        }else{
                            msg.channel.send(msg.content + " is an invalid number.")
                        }
                    });
                break;
            case exports.types[6].id://trublemaker
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .setDescription("To swap cards between two users write two numbers that are infront of them with a space in between. Example: 0 1")
                    .addField(" Here are users:", other_people)
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                var collector = this.user.dmChannel.createMessageCollector(msg => !msg.author.bot)
                    .on("collect", msg => {
                        var numbers = msg.content.split(" ");
                        if(numbers.length > 2){
                            msg.channel.send("There are too many numbers.")
                        }else if(numbers.length < 2){
                            msg.channel.send("There are too few numbers.")
                        }else if(numbers.length == 2){

                            numbers[0] = parseInt(numbers[0])
                            numbers[1] = parseInt(numbers[1]) 
                            
                            if(Number.isNaN(numbers[0]) || numbers[0] < 0 || numbers[0] >= this.layout.players.length - 1){
                                msg.channel.send(msg.content.split(" ")[0] + " is a invalid number.")
                            }else if(Number.isNaN(numbers[1]) || numbers[1] < 0 || numbers[1] >= this.layout.players.length - 1){
                                msg.channel.send(msg.content.split(" ")[1] + " is a invalid number.")
                            }else if(numbers[0] == numbers[1]){
                                msg.channel.send(numbers[0] + " and " + numbers[1] + " are the same numbers.")
                            }else{
                                if(numbers[0] >= id){
                                    numbers[0]++;
                                }
                                if(numbers[1] >= id){
                                    numbers[1]++;
                                }
                                this.layout.game.final_layout.swap(numbers[0], numbers[1])
                                msg.channel.send("You swapped cards between " + this.layout.game.final_layout.players[numbers[0]].user.username + " and " + this.layout.game.final_layout.players[numbers[1]].user.username)
                                console.log(user.username.red + " swapped cards between ".green + this.layout.game.final_layout.players[numbers[0]].user.username.red + " and ".green + this.layout.game.final_layout.players[numbers[1]].user.username.red)
                                
                                collector.stop();
                                this.layout.game.move()
                            }
                        }
                    });
                break;
            case exports.types[7].id://drunk
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .setDescription("To swap your card with a card in the center choose a number between 1-3.")
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                var collector = this.user.dmChannel.createMessageCollector(msg => !msg.author.bot)
                    .on("collect", msg => {

                        var number = parseInt(msg.content)
                        
                        if(Number.isNaN(number) || number < 1 || number > 3){
                            msg.channel.send(msg.content + " is a invalid number.")
                        }else{
                            this.layout.game.final_layout.swap(id, 1 - number)
                            msg.channel.send("You swapped your card with " + number.toString() + " card in the midle")
                            console.log(user.username.red + " swapped his card with ".green + number + " card in the middle.".green)
                            
                            collector.stop();
                            this.layout.game.move()
                        }
                        
                    });
                break;
            case exports.types[8].id:
                break;
            case exports.types[9].id://insomniac
                var color;
                switch(this.layout.game.final_layout.players[id].card.team){
                    case 0:
                        color = '#00ff00';
                        break;
                    case 1:
                        color = '#ff0000';
                        break;
                    case 2:
                        color = '#ffff00';
                        break;
                    case 3:
                        color = '#ff00ff';
                        break;
                }
                await this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle("You are now " + this.layout.game.final_layout.players[id].card.name)
                    .setDescription("This card you currenly have")
                    .setURL()
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage('https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/' + this.layout.game.final_layout.players[id].card.basic_latin + ".png")
                    .setTimestamp()
                    .setFooter('Thank you for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.layout.game.move()
                break;
            case exports.types[10].id://Tanner
                this.layout.game.move()
                break;
            case exports.types[11].id://doppleganger
                this.layout.players[id].message.edit(new Discord.MessageEmbed()
                    .setColor(this.layout.players[id].message.embeds[0].color)
                    .setTitle(this.layout.players[id].message.embeds[0].title)
                    .setDescription("To copy someones card choose a number that is in front of the user.")
                    .addField(" Please choose one of the following people to copy from:", other_people)
                    .setURL()
                    .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                    .setImage(this.layout.players[id].message.embeds[0].image.url)
                    .setTimestamp()
                    .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                );
                this.user.send(this.user.toString())
                    .then((message) => {
                        message.delete()
                    })
                var collector = this.user.dmChannel.createMessageCollector(msg => !msg.author.bot)
                    .on("collect", async msg => {
                        var number = parseInt(msg.content);
                        // console.log(this.layout.game.final_layout.players)
                        if(!Number.isNaN(number) && number >= 0 && number < this.layout.players.length - 1){
                            if(number >= id){
                                number++;
                            }
                            this.layout.game.final_layout.players[id].card = this.layout.game.final_layout.players[number].card
                            // console.log(this.layout.game.final_layout.players)
                            console.log(user.username.red + " copied card from ".green + this.layout.players[number].user.username.red)

                            var color;
                            switch(this.layout.game.final_layout.players[id].card.team){
                                case 0:
                                    color = '#00ff00';
                                    break;
                                case 1:
                                    color = '#ff0000';
                                    break;
                                case 2:
                                    color = '#ffff00';
                                    break;
                                case 3:
                                    color = '#ff00ff';
                                    break;
                            }
                            await this.layout.players[id].message.edit(new Discord.MessageEmbed()
                                .setColor(color)
                                .setTitle("You are now " + this.layout.game.final_layout.players[id].card.name)
                                .setDescription("This is the card you copied from " + this.layout.players[number].user.username + ". Thank you for making a move")
                                .setURL()
                                .setAuthor('Varúlfur', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png', 'https://github.com/Kirill-iceland/vdb')
                                .setImage('https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/cb/' + this.layout.game.final_layout.players[id].card.basic_latin + ".png")
                                .setTimestamp()
                                .setFooter('Thanks for playing!', 'https://raw.githubusercontent.com/Kirill-iceland/vdb/master/img/reactions/werewolf.png')
                            );

                            collector.stop();
                            this.layout.game.final_layout.players[id].card.move(layout, user, id)
                        }else{
                            msg.channel.send(msg.content + " is an invalid number.")
                        }
                    });
                break;
        }
    }
}
exports.card = card;