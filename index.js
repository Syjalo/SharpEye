const Discord = require('discord.js')
const client = new Discord.Client()

const { token } = require('../secret/config.json')
const commandsHandler = require('./commands/commands-handler')
const loadFeatures = require('./features/load-features')



client.on('ready', async () => {
    console.log('The client is ready!')

    commandsHandler(client)
    console.log('Commands registered!')

    // loadFeatures(client)
    // console.log('Features loaded!')
})

client.login(token)