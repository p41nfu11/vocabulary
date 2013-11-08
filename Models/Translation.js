var mongoose = require('mongoose');
var config = require('../config');

console.log(config);

var translationSchema = new mongoose.Schema({
	translation: String,
	createdDate: Date,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});


module.exports = mongoose.model('Translation', translationSchema);