const Discord = require('discord.js')

const { langsdb } = require('../../config.json')
const { updateLanguageCode } = require('../../loaders/languages-base')

module.exports = {
    name: 'language',
    allowingDM: true,
    aliases: ['lang'],
    async execute(message, strings, args) {
        if(langsdb[args[2]]) updateLanguageCode(message, strings, args)
        else {
            const embed = new Discord.MessageEmbed()
            .setTitle(strings.language.unknownLangCode.title)
            .setDescription(strings.language.unknownLangCode.description.replace('%%langCode%%', args[2]).replace('%%langCodes%%', Object.keys(langsdb).join(', ')))
            message.channel.send(embed)
        }
    }
}