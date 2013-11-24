var mongoose = require('mongoose');
var config = require('../config');
require('express-mongoose');

var listSchema = new mongoose.Schema({
	owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	title: String,
	text: String,
	createdDate: Date,
	words: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word' }]
});

listSchema.methods.getOwners = function (callback) {
  return this.model('owners').find({ _id: this._id }, callback);
};

listSchema.methods.getWords = function (callback) {
  return this.model('List').find({ _id: this._id }, callback);
};

listSchema.statics.getList = function (id, callback) {
  return this.findOne({ _id: id}, callback);
};

listSchema.statics.getListOwnedByUser = function (user, callback) {
  return this.find({ 'owners': { $in: [ user ] } }, callback);
};

module.exports = mongoose.model('List', listSchema);