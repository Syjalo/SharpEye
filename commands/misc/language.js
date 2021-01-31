const { updateLanguageCode } = require('../../loaders/languages-base')

module.exports = {
    name: 'language',
    aliases: ['lang'],
    async execute(message, strings, args) {
        updateLanguageCode(message, strings, args)
    }
}