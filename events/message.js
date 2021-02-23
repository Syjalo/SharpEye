const Discord = require('discord.js')

const { colorRed, colorOrange, colorGreen } = require('@root/config.json')
const { getLanguageCode } = require('@libraries/languages')

module.exports = (client) => {
    client.on('message', async (message) => {
        const prefix = '-'
        const mention = '<@!' + client.user.id + '>'

        if(message.author.bot || (!message.content.startsWith(prefix) && !message.content.startsWith(mention))) return
        const length = message.content.startsWith(prefix) ? prefix.length : mention.length + 1
        const args = message.content.slice(length).split(' ')
        const commandName = args.shift().toLowerCase()
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        if(!command) return

        const strings = require('@res/values-' + getLanguageCode(client, message) + '/strings.json')

        if(message.channel.type !== 'dm') {
            const bot = message.guild.members.cache.get(client.user.id)
            if(!bot.hasPermission('ADMINISTRATOR')) {
                let reqPerms = []
                const { requiredBotPerms = ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'MANAGE_NICKNAMES'] } = command
                requiredBotPerms.forEach(perm => {
                    if(!bot.hasPermission(perm)) reqPerms.push(strings.global[perm])
                })
                if(reqPerms) {
                    let title
                    let description
                    if(reqPerms.length === 1) {
                        title = strings.event.message.requiredBotPerms.title.one
                        description = strings.event.message.requiredBotPerms.description.one.replace('%%perm%%', reqPerms)
                    } else {
                        const last = reqPerms.splice(reqPerms.length - 1)
                        const permsNames = []
                        permsNames.push(reqPerms.join(strings.global.comma))
                        permsNames.push(last)
                        const string = permsNames.join(strings.global.and)
                        title = strings.event.message.requiredBotPerms.title.many
                        description = strings.event.message.requiredBotPerms.description.many.replace('%%perms%%', string)
                    }
                    const embed = new Discord.MessageEmbed()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor(colorRed)
                    message.channel.send(embed)
                    return
                }
            }
        }

        if(!command.allowingInDm && message.channel.type === 'dm') {
            return
        }
        if(message.channel.type !== 'dm') {
            let flag = true
            if(command.rolesBlacklist) {
                command.rolesBlacklist.forEach(roleId => {
                    if(message.member.roles.cache.filter(memberRole => memberRole.id === roleId).first()) flag = false
                })
            }
            if(command.rolesWhitelist) {
                command.rolesWhitelist.forEach(roleId => {
                    if(message.member.roles.cache.filter(memberRole => memberRole.id === roleId).first()) flag = true
                })
            }
            if(command.channelsBlacklist) {
                command.channelsBlacklist.forEach(channelId => {
                    if(message.channel.id === channelId) flag = false
                })
            }
            if(command.channelsWhitelist) {
                command.channelsWhitelist.forEach(channelId => {
                    if(message.channel.id === channelId) flag = true
                })
            }
            if(message.member.hasPermission('ADMINISTRATOR')) flag = true

            if(!flag) {
                message.react('❌')
                setTimeout(() => {
                    if(!message.deleted) message.delete()
                }, 3000)
                return
            }
        }

        const minArgs = command.minArgs || 0
        const maxArgs = command.maxArgs || null
        if((minArgs > args.length) || (maxArgs < args.length) && (maxArgs !== null)) {
            const embed = new Discord.MessageEmbed()
            .setTitle(strings.event.message.argsLength.title)
            .setDescription(strings.event.message.argsLength.description.replace('%%command%%', prefix + strings.command.help[command.name].usage))
            .setColor(colorRed)
            message.channel.send(embed)
            return
        }

        if(!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Discord.Collection())
        const now = Date.now()
        const timestamps = client.cooldowns.get(command.name)
        if(expirationTime = timestamps.get(message.author.id)) {
            if(now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000
                const embed = new Discord.MessageEmbed()
                .setTitle(strings.event.message.cooldown.title)
                .setDescription(strings.event.message.cooldown.description.replace('%%time%%', timeLeft.toFixed(1)).replace('%%command%%', prefix + command.name))
                .setColor(colorRed)
                message.channel.send(embed)
                .then(m => {
                    if(m.channel.type !== 'dm' && (m.guild.members.cache.get(client.user.id).hasPermission('MANAGE_MESSAGES') || m.guild.members.cache.get(client.user.id).hasPermission('ADMINISTRATOR'))) {
                        setTimeout(() => {
                            if(!message.deleted) message.delete()
                            if(!m.deleted) m.delete()
                        }, 10000)
                    }
                })
                return
            }
        }
        if(message.channel.type === 'dm' || !message.member.hasPermission('ADMINISTRATOR')) {
            const cooldownAmount = (command.cooldown || 3) * 1000
            timestamps.set(message.author.id, now + cooldownAmount)
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
        }

        try {
            await command.execute(message, strings, args, client)
        } catch (error) {
            message.channel.stopTyping(true)
            timestamps.set(message.author.id, now + 3000)
            let errorMessage
            if(error.stack) errorMessage = strings.error.systemError
            else errorMessage = strings.error.customError[error.name || error]
            const embed = new Discord.MessageEmbed()
            .setAuthor(strings.error.moduleName)
            .setTitle(errorMessage)
            .setColor(colorRed)
            message.channel.send(embed)
            .then(m => {
                if(m.channel.type !== 'dm' && (m.guild.members.cache.get(client.user.id).hasPermission('MANAGE_MESSAGES') || m.guild.members.cache.get(client.user.id).hasPermission('ADMINISTRATOR'))) {
                    setTimeout(() => {
                        if(!message.deleted) message.delete()
                        if(!m.deleted) m.delete()
                    }, 10000)
                }
            })
            if(error.stack && process.env.TERM_PROGRAM !== 'vscode') {
                const embed = new Discord.MessageEmbed()
                .setAuthor('Error Found')
                .setTitle(`Error found at ${command.name} command. Channel type: ${message.channel.type}. Executed by ${message.author.tag} (${message.author.id}).`)
                .setDescription(`Message content: ${message.content}\n${error.stack}`)
                .setColor(colorRed)
                client.owner.send(embed)
                console.error(`Error found at ${command.name} command. Channel type: ${message.channel.type}. Executed by ${message.author.tag} (${message.author.id}).\nMessage content: ${message.content}\n\nError:\n${error.stack}`)
                if(errorsLogChannel = client.channels.cache.get('813678563822927913')) {
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('Error Found')
                    .setTitle(errorMessage || error)
                    .setDescription(`Error found at ${command.name} command. Channel type: ${message.channel.type}. Executed by ${message.author.tag} (${message.author.id}).\nMessage content: ${message.content}`)
                    .setColor(colorRed)
                    if(error.stack) embed.addField('Error:', error.stack)
                    errosrLogChannel.send(embed)
                }
            }
        }
    })
}