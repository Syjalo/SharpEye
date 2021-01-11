const Discord = require('discord.js')
const client = new Discord.Client()

const { token } = require('../secret/config.json')
const loadCommands = require('./commands/load-commands')
const loadFeatures = require('./features/load-features')



client.on('ready', async () => {
    console.log('The client is ready!')

    loadCommands(client)
    console.log('Commands registered!')

    // loadFeatures(client)
    // console.log('Features loaded!')
})

client.login(token)