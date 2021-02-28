const Discord = require('discord.js')

const { colorRed, colorOrange, colorGreen } = require('@root/config.json')

module.exports = {
	name: 'ping',
	group: 'misc',
	allowingInDm: true,
    async execute(message, getString, args, client) {
		const executedBy = getString(message, 'global', 'executedBy').replace('%%member%%', message.author.tag)

        const pingEmbed = new Discord.MessageEmbed()
        .setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '.'))
        .setColor(colorOrange)
		let ping
        await message.channel.send(pingEmbed)
		.then(m => m.edit(pingEmbed.setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '..'))))
		.then(m => m.edit(pingEmbed.setTitle(getString(message, 'ping', 'defining').replace('%%loading%%', '...'))))
		.then(m => { ping = Math.ceil((m.editedTimestamp - message.createdTimestamp) / 3); if(!m.deleted) m.delete() })
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
		const resultEmbed = new Discord.MessageEmbed()
		.setTitle(getString(message, 'ping', 'title'))
		.setDescription(getString(message, 'ping', 'description').replace('%%botPing%%', ping).replace('%%apiPing%%', client.ws.ping))
		.setFooter(executedBy, message.author.displayAvatarURL('png', true))
		.setColor(color)
		message.channel.send(resultEmbed)
		return
    },
}