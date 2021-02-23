const Discord = require('discord.js')
const { langsdb } = require('@root/config.json')
const languagesSchema = require('@schemas/languages')

module.exports = {
    loadLanguagesCodes,
    getLanguageCode,
    updateLanguageCode,
    getLanguagesNames
}

async function loadLanguagesCodes(client) {
    await client.mongo().then(async (mongoose) => {
        try {
            const language = await languagesSchema.find()
            for(let i = 0; i < language.length; i++) {
                client.languages.set(language[i].key, language[i].langCode)
            }
        } finally {
            mongoose.connection.close()
        }
    })
}

function getLanguageCode(client, message) {
    if(message.channel.type === 'news') {
        if(langCode = client.languages.get('server-' + message.guild.id)) if(langsdb[langCode]) return langCode
    } else if(message.channel.type === 'dm') {
        if(langCode = client.languages.get('general-' + message.author.id)) if(langsdb[langCode]) return langCode
    } else {
        if(langCode = client.languages.get('general-' + message.author.id)) if(langsdb[langCode]) return langCode
        if(langCode = client.languages.get('server-' + message.guild.id)) if(langsdb[langCode]) return langCode
        if(langCode = message.guild.preferredLocale.replace(/[-A-Z]/g, '')) if(langsdb[langCode]) return langCode
    }
    return 'en'
}

async function updateLanguageCode(client, key, langCode) {
    await client.mongo().then(async (mongoose) => {
        try {
            await languagesSchema.findOneAndUpdate({
                key
            }, {
                key,
                langCode
            }, {
                upsert: true
            })
        } finally {
            mongoose.connection.close()
            client.languages.set(key, langCode)
        }
    })
}

function getLanguagesNames(strings) {
    let langsCodes = Object.keys(langsdb)
    let langs = []
    for(let i = 0; i < langsCodes.length; i++) {
        langs.push(strings.command.language.name[langsCodes[i]] + ' (' + langsCodes[i] + ')')
    }
    const last = langs.sort().splice(langs.length - 1)
    let langsNames = []
    langsNames.push(langs.join(strings.global.comma))
    langsNames.push(last)
    const string = langsNames.join(strings.global.and)
    return string
}