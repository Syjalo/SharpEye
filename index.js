const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const secret = require('../secret/config.json')

client.on('ready', () => {
    console.log('Ready!')
})

client.login(secret.token)