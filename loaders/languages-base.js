const Discord = require('discord.js')
const languages = new Discord.Collection

const { prefix, colorRed, colorOrange, colorGreen } = require('../config.json')
const mongo = require('../utils/mongo')
const languagesSchema = require('../schemas/languages-schema')

module.exports = {
    loadLanguages,
    getLanguageCode,
    updateLanguageCode
}

async function loadLanguages() {
    await mongo().then(async (mongoose) => {
        try {
            const language = await languagesSchema.find()
            for(let i = 0; i < language.length; i++) {
                languages.set(language[i].key, language[i].langCode)
            }
        } finally {
            mongoose.connection.close()
        }
    })
}

function getLanguageCode(message) {
    if(message.channel.type === 'dm') {
        if(languages.has('all-' + message.author.id)) return languages.get('all-' + message.author.id)
    } else {
        if(languages.has('current-' + message.guild.id + '-' + message.author.id)) return languages.get('current-' + message.guild.id + '-' + message.author.id)
        if(languages.has('all-' + message.author.id)) return languages.get('all-' + message.author.id)
        if(languages.has('server-' + message.guild.id)) return languages.get('server-' + message.guild.id)
    }
    return 'en'
}

function updateLanguageCode(message, strings, args) {
    const updatedStrings = require('../res/values-' + args[2] + '/strings.json')
    const executedBy = updatedStrings.global.executedBy.replace('%%member%%', message.author.tag)
    if(args[0] === 'set') {
        if(args[1] === 'current') {
            if(message.channel.type === 'dm') {
                const embed = new Discord.MessageEmbed()
                .setTitle(strings.global.useInDmNotAllowed.title)
                .setDescription(strings.global.useInDmNotAllowed.description.replace('%%command%%', strings.help.language.usageInDm))
                .setFooter(executedBy, message.author.displayAvatarURL())
                .setColor(colorRed)
                message.channel.send(embed)
                return
            }
            findOneAndUpdate('current-' + message.guild.id + '-' + message.author.id, args[2])
            const embed = new Discord.MessageEmbed()
            .setTitle(updatedStrings.language.set.current.title.replace('%%langName%%', updatedStrings.global[args[2]]))
            .setFooter(executedBy, message.author.displayAvatarURL())
            .setColor(colorGreen)
            message.channel.send(embed)
        }
        if(args[1] === 'all') {
            findOneAndUpdate('all-' + message.author.id, args[2])
            const embed = new Discord.MessageEmbed()
            .setTitle(updatedStrings.language.set.all.title.replace('%%langName%%', updatedStrings.global[args[2]]))
            .setFooter(executedBy, message.author.displayAvatarURL())
            .setColor(colorGreen)
            message.channel.send(embed)
        }
        if(args[1] === 'server') {
            if(message.channel.type === 'dm') {
                const embed = new Discord.MessageEmbed()
                .setTitle(strings.global.useInDmNotAllowed.title)
                .setDescription(strings.global.useInDmNotAllowed.description.replace('%%command%%', strings.help.language.usageInDm))
                .setFooter(executedBy, message.author.displayAvatarURL())
                .setColor(colorRed)
                message.channel.send(embed)
                return
            }
            if(!message.member.hasPermission('ADMINISTRATOR')) {
                const embed = new Discord.MessageEmbed()
                .setTitle(strings.global.noPermToUseCommand.replace('%%perm%%', strings.global.ADMINISTRATOR))
                .setFooter(executedBy, message.author.displayAvatarURL())
                .setColor(colorRed)
                message.channel.send(embed)
                return
            }
            findOneAndUpdate('server-' + message.guild.id, args[2])
            const embed = new Discord.MessageEmbed()
            .setTitle(updatedStrings.language.set.server.title.replace('%%langName%%', updatedStrings.global[args[2]]))
            .setFooter(executedBy, message.author.displayAvatarURL())
            .setColor(colorGreen)
            message.channel.send(embed)
        }
    }
}



async function findOneAndUpdate(key, langCode) {
    await mongo().then(async (mongoose) => {
        try {
            await languagesSchema.findOneAndUpdate({
                key
            },
            {
                key,
                langCode
            },
            {
                upsert: true
            })
        } finally {
            mongoose.connection.close()
        }
    })
    languages.set(key, langCode)
}
