const Discord = require('discord.js')
const client = new Discord.Client()


const { loadLanguages } = require('./loaders/languages-base')
const commandsHandler = require('./loaders/commands-handler')
const loadFeatures = require('./loaders/load-features')



client.on('ready', async () => {
    console.log('The client is ready!')

    await loadLanguages()
    console.log('Languages loaded!')

    commandsHandler(client)
    console.log('Commands registered!')

    loadFeatures(client)
    console.log('Features loaded!')

})

client.login(process.env.token)