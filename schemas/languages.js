const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const languagesSchema = mongoose.Schema({
    key: reqString,
    langCode: reqString
})

module.exports = mongoose.model('languages', languagesSchema)