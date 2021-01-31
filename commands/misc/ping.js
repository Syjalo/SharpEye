const Discord = require('discord.js')
const { colorRed, colorOrange, colorGreen } = require('../../config.json')

module.exports = {
	name: 'ping',
	allowingDM: true,
    async execute(message, strings, args, functions, client) {
		const executedBy = strings.global.executedBy.replace('%%member%%', message.author.tag)

        let embedPing = new Discord.MessageEmbed()
        .setTitle(strings.ping.determination.replace('%%loading%%', '.'))
        .setColor(colorOrange)
        const pingMsg = await message.channel.send(embedPing)
        embedPing.setTitle(strings.ping.determination.replace('%%loading%%', '..'))
        await pingMsg.edit(embedPing)
        embedPing.setTitle(strings.ping.determination.replace('%%loading%%', '...'))
        await pingMsg.edit(embedPing)
		let ping = Math.ceil((pingMsg.editedTimestamp - message.createdTimestamp) / 3)
		let color
		if(ping < 0) {
			color = colorOrange
		} else if(ping <= 250) {
			color = colorGreen
		} else if(ping <= 500) {
			color = colorOrange
		} else {
			color = colorRed
        }
		embedPing
		.setTitle(strings.ping.title)
		.setDescription(strings.ping.description.replace('%%ping%%', ping))
		.setFooter(executedBy, message.author.displayAvatarURL())
		.setColor(color)
		return pingMsg.edit(embedPing);
    },
}