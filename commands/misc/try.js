const Discord = require('discord.js')

const { colorRed, colorGreen } = require('@root/config.json')

module.exports = {
    name: 'try',
    group: 'misc',
    minArgs: 1,
    allowingInDm: true,
    execute(message, getString, args) {
        const executedBy = getString(message, 'global', 'executedBy').replace('%%member%%', message.author.tag)
        let result
        let color
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                result = getString(message, 'try', 'result')[0]
                color = colorGreen
                break
            case 1:
                result = getString(message, 'try', 'result')[1]
                color = colorRed
                break
        }
        const embed = new Discord.MessageEmbed()
        .setTitle(getString(message, 'try', 'title').replace('%%user%%', message.member.displayName))
        .setDescription(`${args.join(' ')} (${result})`)
        .setColor(color)
        .setFooter(executedBy, message.author.displayAvatarURL('png', true))
        message.channel.send(embed)
    }
}