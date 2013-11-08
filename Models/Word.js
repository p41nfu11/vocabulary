var mongoose = require('mongoose');
var config = require('../config');

var wordSchema = new mongoose.Schema({
	word: String,
	translations: [String],
	wordClass: String,
	createdDate: Date,
	tries: Number,
	correct: Number,
	guesses: [String],
	examples: [String]
});

module.exports = mongoose.model('Word', wordSchema);