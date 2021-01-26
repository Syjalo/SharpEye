module.exports = (strings, perms) => {
    permsString = []
    perms.forEach(perm => {
        permsString.push(strings[perm])
    })
    return permsString.join(', ')
}