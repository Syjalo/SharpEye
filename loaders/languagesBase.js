const Discord = require('discord.js')
const languages = new Discord.Collection

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
    if(languages.has('current-' + message.guild.id + '-' + message.author.id)) return languages.get('current-' + guildId + '-' + memberId)
    if(languages.has('all-' + message.author.id)) return languages.get('all-' + message.author.id)
    if(languages.has('server-' + message.guild.id)) return languages.get('server-' + message.guild.id)
    return 'en'
}

function updateLanguageCode(message, strings, args) {
    const executedBy = strings.global.executedBy.replace('%%member%%', message.author.tag)
    if(args[0] === 'set') {
        if(args[1] === 'current') {
            findOneAndUpdate('current-' + message.guild.id + '-' + message.member.id, args[2])
        }
        if(args[1] === 'all') {
            findOneAndUpdate('all-' + message.member.id, args[2])
        }
        if(args[1] === 'server') {
            if(message.channel.type === 'dm') {
                return
            }
            if(!message.member.hasPermission('ADMINISTRATOR')) {
                return
            }
            findOneAndUpdate('server-' + message.guild.id, args[2])
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