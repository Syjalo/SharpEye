const Discord = require('discord.js')
const mongo = require('../utils/mongo')

const { prefix, colorRed, colorOrange } = require('../config.json')
const cooldowns = new Discord.Collection()

const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ]

    for(const permission of permissions) {
        if(!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}"`)
        }
    }
}

module.exports = (client, commandOptions) => {
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
        requiredBotPerms = [],
        requiredPerms = [],
        rolesWhitelist = [],
        rolesBlacklist = [],
        channelsWhitelist = [],
        channelsBlacklist = [],
        immunityPerms = ['ADMINISTRATOR'],
        immunityRoles = [],
        callback,
    } = commandOptions

    // Ensure the command and aliases are in an array
    if (typeof aliases === 'string') {
        aliases = [aliases]
    }

    // Ensure the permissions are in an array and are all valid
    if (requiredBotPerms.length) {
        if (typeof requiredBotPerms === 'string') {
            requiredBotPerms = [requiredBotPerms]
        }
        validatePermissions(requiredBotPerms)
    }
    if (requiredPerms.length) {
        if (typeof requiredPerms === 'string') {
            requiredPerms = [requiredPerms]
        }
        validatePermissions(requiredPerms)
    }
    if (immunityPerms.length) {
        if (typeof immunityPerms === 'string') {
            immunityPerms = [immunityPerms]
        }
        validatePermissions(immunityPerms)
    }

    // Listen for messages
    client.on('message', (message) => {
        //Check for bot
        if(message.author.bot) {
            return
        }

        for(const alias of aliases) {
            const command = `${prefix}${alias.toLowerCase()}`
            if(message.content.toLowerCase().startsWith(`${command} `) || message.content.toLowerCase() === command) {
                // System for checking perms to execute the command
                // Roles Whitelist and Blacklist
                let allowed = true
                if(rolesBlacklist.length) {
                    rolesBlacklist.forEach(roles => {
                        if(message.member.roles.cache.has(roles)) allowed = false
                    })
                }
                if(rolesWhitelist.length) {
                    rolesWhitelist.forEach(roles => {
                        if(message.member.roles.cache.has(roles)) allowed = true
                    })
                }
                // Channel Whitelist and Blacklist
                if(channelsBlacklist.length) {
                    channelsBlacklist.forEach(channels => {
                        if(message.channel.id === channels) allowed = false
                    })
                }
                if(channelsWhitelist.length) {
                    channelsWhitelist.forEach(channels => {
                        if(message.channel.id === channels) allowed = true
                    })
                }
                // Required permissions
                if(requiredPerms.length) {
                    requiredPerms.forEach(perms => {
                        if(!message.member.hasPermission(perms)) allowed = false
                    })
                }
                // Give perm to admins
                if(message.member.hasPermission('ADMINISTRATOR')) allowed = true
                // Check ownerOnly flag
                if(ownerOnly === true) {
                    if(!message.member.id === '406028548034396160') allowed = false
                }
                // Checking
                if(!allowed) {
                    message.react('❌')
                    setTimeout(() => {
                        if(!message.deleted) message.delete()
                    }, 3000)
                    return
                }

                // Check the bot permissions
                let flag = false
                requiredBotPerms.forEach(perms => {
                    const bot = message.guild.members.cache.get(client.user.id)
                    if(!bot.hasPermission(perms)) flag = true
                })
                if(flag) {
                    const embed = new Discord.MessageEmbed()
                    .setTitle('Bot don\'t have perms')
                    .setFooter(`Executed by ${message.author.tag}`, message.author.displayAvatarURL())
                    .setTimestamp()
                    .setColor(colorRed)
                    message.channel.send(embed)
                    return
                }

                // Cooldown
                flag = false
                immunityPerms.forEach(perms => {
                    if(message.member.hasPermission(perms)) flag = true
                })
                immunityRoles.forEach(roles => {
                    if(message.member.roles.cache.has(roles)) flag = true
                })
                if(!flag) {
                    if(duration > 0) {
                        let timetamp
                        const now = Date.now()
                        const cAmount = duration * 500
                        const cTimetampKey = `${message.guild.id}-${message.author.id}-${alias}-timetamp`
                        const cUsageKey = `${message.guild.id}-${message.author.id}-${alias}-usage`
                        if(!cooldowns.has(cTimetampKey)) {
                            cooldowns.set(cTimetampKey, now + cAmount)
                            cooldowns.set(cUsageKey, 0)
                        }
                        const cUsageCount = cooldowns.get(cUsageKey)
                        const expirationTime = cooldowns.get(cTimetampKey) + cAmount
                        if(cUsageCount < usage) {
                            cooldowns.set(cUsageKey, cUsageCount + 1)
                        } else if(now < expirationTime) {
                            const timeLeft = (expirationTime - now) / 1000
                            const embed = new Discord.MessageEmbed()
                            .setTitle('Cooldown exist')
                            .setDescription(`Please wait ${Math.ceil(timeLeft)}s`)
                            .setFooter(`Executed by ${message.author.tag}`, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setColor(colorOrange)
                            message.channel.send(embed)
                            return
                        } else {
                            cooldowns.set(cTimetampKey, now + cAmount)
                            cooldowns.set(cUsageKey, 1)
                        }
                        timetamp = cooldowns.get(cTimetampKey)
                        if(now > expirationTime) {
                                
                        }
                    }
                }

                // Args
                const args = message.content.split(' ')
                args.shift()
                if(args.length < minArgs || (args.length > maxArgs && maxArgs !== null)) {
                    const embed = new Discord.MessageEmbed()
                    .setTitle('Incorrect syntax!')
                    .setDescription(`Use ${prefix}${alias} ${expectedArgs}`)
                    .setFooter(`Executed by ${message.author.tag}`, message.author.displayAvatarURL())
                    .setTimestamp()
                    .setColor(colorRed)
                    message.channel.send(embed)
                    return
                }

                callback(message, args, client)
                return
            }
        }
    })
}