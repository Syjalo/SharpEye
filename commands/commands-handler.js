const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

const commands = new Discord.Collection
const cooldowns = new Discord.Collection
const { prefix, colorRed, colorOrange, colorGreen } = require('../config.json')
const permsName = require('../utils/perms-name')

module.exports = (client) => {
    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file))
            } else if (file !== 'commands-handler.js') {
                const command = require(path.join(__dirname, dir, file))
                commands.set(command.name, command)
            }
        }
    }

    readCommands('.')

    client.on('message', (message) => {
        if(!message.content.startsWith(prefix) || message.author.bot) return

        const args = message.content.slice(prefix.length).split(' ')
        const commandName = args.shift().toLowerCase()
        const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        if(!command) return

        const handlerStrings = require('../res/strings/strings-en/commands-handler.json')
        const globalStrings = require('../res/strings/strings-en/global.json')
        const strings = require('../res/strings/strings-en/' + command.name + '.json')
        const executedBy = globalStrings.executedBy.replace('%%member%%', message.author.tag)

        let {
            name = '',
            group = '',
            aliases = [],
            description = '',
            examples = [],
            ownerOnly = false,
            minArgs = 0,
            maxArgs = null,
            expectedArgs = '',
            usage = 0,
            duration = 0,
            requiredBotPerms = ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'MANAGE_NICKNAMES'],
            requiredPerms = [],
            rolesWhitelist = [],
            rolesBlacklist = [],
            channelsWhitelist = [],
            channelsBlacklist = [],
            immunityPerms = ['ADMINISTRATOR'],
            immunityRoles = [],
            callback,
        } = command

        let perms = []
        if(requiredBotPerms.length) {
            requiredBotPerms.forEach(perm => {
                const bot = message.guild.members.cache.get(client.user.id)
                if(!bot.hasPermission(perm)) perms.push(perm)
            })
        }
        if(perms.length) {
            let embedTitle
            let embedDesc
            if(perms.length > 1) {
                embedTitle = handlerStrings.noRequiredBotPerms
                embedDesc = handlerStrings.requiredPerms.replace('%%perms%%', permsName(globalStrings, perms))
            } else {
                embedTitle = handlerStrings.noRequiredBotPerm
                embedDesc = handlerStrings.requiredPerm.replace('%%perm%%', permsName(globalStrings, perms))
            }
            const embed = new Discord.MessageEmbed()
            .setTitle(embedTitle)
            .setDescription(embedDesc)
            .setFooter(executedBy, message.author.displayAvatarURL())
            .setColor(colorRed)
            message.channel.send(embed)
            return
        }

        let allowed = true
        if(rolesBlacklist.length) {
            rolesBlacklist.forEach(role => {
                if(message.member.roles.cache.has(role)) allowed = false
            })
        }
        if(rolesWhitelist.length) {
            rolesWhitelist.forEach(role => {
                if(message.member.roles.cache.has(role)) allowed = true
            })
        }
        if(channelsBlacklist.length) {
            channelsBlacklist.forEach(channel => {
                if(message.channel.id === channel) allowed = false
            })
        }
        if(channelsWhitelist.length) {
            channelsWhitelist.forEach(channel => {
                if(message.channel.id === channel) allowed = true
            })
        }
        if(requiredPerms.length) {
            requiredPerms.forEach(perm => {
                if(!message.member.hasPermission(perm)) allowed = false
            })
        }
        if(message.member.hasPermission('ADMINISTRATOR')) allowed = true
        if(ownerOnly) allowed = false

        if(!allowed) {
            message.react('❌')
            setTimeout(() => {
                if(!message.deleted) message.delete()
            }, 3000)
            return
        }

        let immunity = false
        if(immunityPerms) {
            immunityPerms.forEach(perm => {
                if(message.member.hasPermission(perm)) immunity = true
            })
        }
        if(immunityRoles) {
            immunityRoles.forEach(role => {
                if(message.member.roles.cache.has(role)) immunity = true
            })
        }
        const cTimetampKey = `${message.guild.id}-${message.author.id}-${commandName}-timetamp`
        const cUsageKey = `${message.guild.id}-${message.author.id}-${commandName}-usage`
        const cUsageCount = cooldowns.get(cUsageKey) || 0
        if(!immunity) {
            if(duration && duration > 0) {
                const now = Date.now()
                const cAmount = duration * 1000
                if(!cooldowns.has(cTimetampKey)) {
                    cooldowns.set(cTimetampKey, now + cAmount)
                    cooldowns.set(cUsageKey, 0)
                }
                const expirationTime = cooldowns.get(cTimetampKey)
                if(cUsageCount < usage) {
                    cooldowns.set(cUsageKey, cUsageCount + 1)
                } else if(now < expirationTime) {
                    let timeLeft = Math.ceil((expirationTime - now) / 1000)
                    let timeLeftString
                    if(timeLeft % 10 === 1) {
                        timeLeftString = handlerStrings.timeLeftSec.one.replace('%%time%%', timeLeft).replace('%%command%%', prefix + commandName)
                    } else {
                        timeLeftString = handlerStrings.timeLeftSec.many.replace('%%time%%', timeLeft).replace('%%command%%', prefix + commandName)
                    }
                    const embed = new Discord.MessageEmbed()
                    .setTitle(handlerStrings.cooldownExist)
                    .setDescription(timeLeftString)
                    .setFooter(executedBy, message.author.displayAvatarURL())
                    .setColor(colorOrange)
                    const embedMsg = message.channel.send(embed)
                    setTimeout(() => {
                        console.log(embedMsg.message)
                    }, 3000)
                    return
                } else {
                    cooldowns.set(cTimetampKey, now + cAmount)
                    cooldowns.set(cUsageKey, 1)
                }
            }
        }

        if((minArgs > args.length) || (maxArgs < args.length && maxArgs !== null)) {
            let description
            if(expectedArgs) {
                description = handlerStrings.argsError.description.replace('%%command%%', prefix + commandName + ' ' + expectedArgs)
            } else {
                description = handlerStrings.argsError.description.replace('%%command%%', prefix + commandName)
            }
            const embed = new Discord.MessageEmbed()
            .setTitle(handlerStrings.argsError.title)
            .setDescription(description)
            message.channel.send(embed)
            return
        }

        callback(message, globalStrings, strings, args)
        return
    })
}