const Discord = require('discord.js')

const { colorRed, colorGreen } = require('@root/config.json')

module.exports = {
    name: 'try',
    group: 'misc',
    allowingInDm: true,
    execute(message, strings, args) {
        const executedBy = strings.global.executedBy.replace('%%member%%', message.author.tag)
        let result
        let color
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                result = strings.command.try.result[0]
                color = colorGreen
                break
            case 1:
                result = strings.command.try.result[1]
                color = colorRed
                break
        }
        const embed = new Discord.MessageEmbed()
        .setAuthor('Try')
        .setTitle(result)
        .setDescription(args.join(' '))
        .setColor(color)
        .setFooter(executedBy, message.author.displayAvatarURL())
        message.channel.send(embed)
    }
}