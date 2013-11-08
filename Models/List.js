var mongoose = require('mongoose');
var config = require('../config');

var listSchema = new mongoose.Schema({
	owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	title: String,
	text: String,
	createdDate: Date,
	words: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word' }]
});


module.exports = mongoose.model('List', listSchema);