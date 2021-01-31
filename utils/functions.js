const mongo = require('../utils/mongo')

module.exports = {
    requiredBotPerms,
    commandUseAllowing,
    pageMaker
}

function requiredBotPerms(client, message, perms, strings) {
    if(message.channel.type === 'dm') return false
    const bot = message.guild.members.cache.get(client.user.id)
    if(bot.hasPermission('ADMINISTRATOR')) return false
    let noPerms = []
    perms.forEach(perm => {
        if(!bot.hasPermission(perm)) noPerms.push(perm)
    })
    if(!noPerms) return false

    let permsString = []
    noPerms.forEach(perm => {
        permsString.push(strings.global[perm])
    })
    return permsString
}

function commandUseAllowing(message, rolesBlacklist, rolesWhitelist, channelsBlacklist, channelsWhitelist, requiredPerms, ownerOnly, allowingDM) {
    let allowed = true
    if(!allowingDM && message.channel.type === 'dm') return false
    if(allowingDM && message.channel.type === 'dm') return true
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
    if(ownerOnly) {
        if(!message.member.user.id === '406028548034396160') allowed = false
    }
    return allowed
}

function pageMaker(Discord, message, strings, memberId, executedBy, colorGreen, pages, page, infractions) {
    if(isNaN(page)) page = 0
    if(page < 0) page = 0
    if(page > pages) page = pages
    const embed = new Discord.MessageEmbed()
    .setTitle(strings.infractions.infractionsList.title)
    .setDescription(strings.infractions.infractionsList.description.replace('%%member%%', `<@${memberId}>`))
    .setFooter(executedBy + " | " + strings.infractions.infractionsList.pageNum.replace('%%num%%', page + 1).replace('%%total%%', pages + 1), message.author.displayAvatarURL())
    .setColor(colorGreen)
    for(let i = 0; i < 10; i++) {
        const caseNow = i + page * 10
        if(infractions[caseNow].reason === '') infractions[caseNow].reason = strings.infractions.infractionsList.reasonNotSpecified
        embed
        .addField(strings.infractions.infractionsList.fieldTitle.replace('%%num%%', caseNow + 1), strings.infractions.infractionsList.warnFieldDescription.replace('%%time%%', new Date(infractions[caseNow].timestamp).toLocaleDateString()).replace('%%moderator%%', `<@${infractions[caseNow].moderator}>`).replace('%%reason%%', infractions[caseNow].reason))
        if(!infractions[caseNow + 1]) break
    }
    return embed
}