module.exports = {
	name: 'ban',
	description: 'Tag a member and ban them.',
    guildOnly: true,
    cooldown: 5,
	execute(message) {
		if (!message.mentions.users.size) {
			return 0;
        }
        
        const { member, mentions } = message;
        const pingExecuter = `<@${member.id}>`;
        const pingTarget = `<@${mentions.users.first().id}>`

        if (member.hasPermission('ADMINISTRATOR') || member.hasPermission('BAN_MEMBERS')) {
            const target = mentions.users.first();
            if (target) {
                const targetMember = message.guild.members.cache.get(target.id)
                targetMember.ban();
                message.channel.send(`${pingTarget} has been banned`);
            } else {
                message.channel.send(`${pingExecuter}, please specify someone to ban.`);
            }
        } else {
        message.channel.send(`${pingExecuter}, you don't have permission to use this command.`);
        }
	},
};