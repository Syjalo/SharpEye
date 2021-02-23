const { loadLanguagesCodes } = require('@libraries/languages')
const { botOwnerId } = require('@root/config.json')

module.exports = (client) => {
    client.once('ready', () => {
        // Set bot owner
        client.owner = client.users.cache.get(botOwnerId)

        // Load languages
        loadLanguagesCodes(client)

        // Set status
        client.user.setActivity('you', { type: 'WATCHING' })
        console.log('Ready!')
    })
}