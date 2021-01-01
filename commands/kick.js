module.exports = {
	name: 'kick',
	description: 'Tag a member and kick them.',
    guildOnly: true,
    cooldown: 5,
	execute(message) {
		if (!message.mentions.users.size) {
			return 0;
		}

		const { member, mentions } = message;
        const pingExecuter = `<@${member.id}>`;
        const pingTarget = `<@${mentions.users.first().id}>`


        if (member.hasPermission('ADMINISTRATOR') || member.hasPermission('KICK_MEMBERS')) {
            const target = mentions.users.first();
            if (target) {
                const targetMember = message.guild.members.cache.get(target.id)
                targetMember.kick();
                message.channel.send(`${pingTarget} has been kicked`);
            } else {
                message.channel.send(`${pingExecuter}, please specify someone to kick.`);
            }
        } else {
        message.channel.send(`${pingExecuter}, you don't have permission to use this command.`);
        }
	},
};