const languages = require('@libraries/languages')

module.exports = {
    getString
}

function getString(message, module, path, lang) {
    let enStrings = require(`@res/values-en/strings/${module}.json`)
    try { strings = require(`@res/values-${lang || languages.getLanguageCode(message)}/strings/${module}.json`) }
    catch { strings = require(`@res/values-en/strings/${module}.json`) }
    const splitPath = path.split('.')
    let string
    splitPath.forEach(pathPart => {
        try { strings = strings[pathPart]; enStrings = enStrings[pathPart] }
        catch { enStrings = enStrings[pathPart] }

        if(splitPath.indexOf(pathPart) === splitPath.length - 1) {
            if(strings) string = strings
            else string = enStrings
        }
    })
    return string
}