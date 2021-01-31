const { updateLanguageCode } = require('../../loaders/languagesBase')

module.exports = {
    name: 'language',
    aliases: ['lang'],
    async execute(message, strings, args) {
        updateLanguageCode(message, strings, args)
    }
}