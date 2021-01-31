const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

const functions = require('../utils/functions')
const { getLanguageCode } = require('./languages-base')

const commands = new Discord.Collection
const { prefix, colorRed, colorOrange, colorGreen } = require('../config.json')

module.exports = async (client) => {
    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file))
            } else {
                const command = require(path.join(__dirname, dir, file))
                commands.set(command.name, command)
            }
        }
    }
    readCommands('../commands')

    client.on('message', (message) => {

        if(!message.content.startsWith(prefix) || message.author.bot) return

        const args = message.content.slice(prefix.length).split(' ')
        const commandName = args.shift().toLowerCase()
        const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        if(!command) return

        let {
            name = '',
            group = '',
            aliases = [],
            description = '',
            examples = [],
            ownerOnly = false,
            allowingDM = false,
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
            execute,
        } = command

        const langCode = getLanguageCode(message)
        const strings = require('../res/values-' + langCode + '/strings.json')

		if(perms = functions.requiredBotPerms(client, message, requiredBotPerms, strings)) {
			const embed = new Discord.MessageEmbed()
			.setColor(colorRed)
			if(perms.length === 1) {
				embed
				.setTitle(strings.functions.requiredBotPerms.title.one)
				.setDescription(strings.functions.requiredBotPerms.description.one.replace('%%perm%%', perms))
			} else {
				embed
				.setTitle(strings.functions.requiredBotPerms.title.many)
				.setDescription(strings.functions.requiredBotPerms.description.many.replace('%%perms%%', perms.join(', ')))
			}
			message.channel.send(embed)
			return
        }
        
        if(!functions.commandUseAllowing(message, rolesBlacklist, rolesWhitelist, channelsBlacklist, channelsWhitelist, requiredPerms, ownerOnly, allowingDM)) {
            if(message.channel.type === 'dm') return
            message.react('❌')
            setTimeout(() => {
                if(!message.deleted) message.delete()
            }, 3000)
            return
        }

        try {
            execute(message, strings, args, functions, client)
        } catch (error) {
            console.error(error);
            const embed = new Discord.MessageEmbed()
            .setTitle(strings.errors.runningCommand.title)
            .setDescription(strings.errors.runningCommand.description.replace('%%developer%%', 'Syjalo#6046'))
            .setColor(colorRed)
            message.channel.send(embed)
        }
    })
}