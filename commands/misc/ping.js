const Discord = require('discord.js')

const { colorRed, colorOrange, colorGreen } = require('@root/config.json')

module.exports = {
	name: 'ping',
	group: 'misc',
	allowingInDm: true,
    async execute(message, getString) {
		const executedBy = getString(message, 'global', 'executedBy').replace('%%member%%', message.author.tag)

        let embedPing = new Discord.MessageEmbed()
        .setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '.'))
        .setColor(colorOrange)
        const pingMsg = await message.channel.send(embedPing)
        embedPing.setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '..'))
        await pingMsg.edit(embedPing)
        embedPing.setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '...'))
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
		.setTitle(getString(message, 'ping', 'title'))
		.setDescription(getString(message, 'ping', 'description').replace('%%ping%%', ping))
		.setFooter(executedBy, message.author.displayAvatarURL('png', true))
		.setColor(color)
		pingMsg.edit(embedPing)
		return
    },
}