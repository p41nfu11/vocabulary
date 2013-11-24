
/*
 * get API
 */

var List = require('../models/list');
var Word = require('../models/word');


exports.words = function(req, res){
  	process.nextTick(function(){
		var query = Word.find({'fbId': req.user.fbId});
		query.exec(function(err, words){
			res.send(words);
		});
	});
};

exports.lists = function(req, res){
  	process.nextTick(function(){
  		res.send(List.getListOwnedByUser(req.user));
	});
};

exports.wordsByList = function(req, res){
  	process.nextTick(function(){
  		var list = List.getList(req.params.id);
  		list.exec(function(err, list){
  			if(err){
  				res.send(404);
  			}
  			else{
  				res.send(list.getWords());
  			}
		});
	});
};

exports.wordById = function(req, res){
  	process.nextTick(function(){
		var query = Word.findOne({ '_id': req.params.id });
		query.exec(function(err, word){
			if(err)
			{
				res.send(404);
			}
			res.send(word);
		});
	});
};

exports.addList = function (request, response) {
    var listData = request.body;
    console.log(listData);
    var newList = new List();
    newList.title = listData.title || 'Default title';
    newList.text = listData.description || 'Default description';
    newList.createdDate = listData.createdDate || new Date();
    newList.owners.push(request.user);

    newList.save(function(err){
		if(err){
			throw err;
		}
		console.log("New word " + newList.title + " was created");
		response.send(200, newList);
	});	
};

exports.addWord = function (request, response) {
    var wordData = request.body.word;
    var listId = request.body.listId;
    
    var newWord = new Word();
    newWord.word = wordData.word || 'Default title';
    newWord.createdDate = wordData.createdDate || new Date();
    newWord.translations.push(wordData.translation);
    newWord.guesses = [];
    newWord.examples = [];
    newWord.tries = 0;
    newWord.correct = 0;

    newWord.save(function(err){
		if(err){
			throw err;
		}
		console.log("New word " + newWord.word + " was created");
		
	});	

    process.nextTick(function(){
		var query = List.findOne({ '_id': listId });
		query.exec(function(err, list){
			if(err)
			{
				console.log('err trying to find list');	
				response.send(404);
			}
			list.words.push(newWord);
			list.save(function(err){
				if(err){
					throw err;
				}
				console.log("list was saved");
			});	
		});
	});

	response.send(200, newWord);
};

exports.listAddOwner = function (request, response) {
	var userId = request.user._id; 
	var listId = request.body.listId;

	var query = List.findOne({ '_id': listId });
		query.exec(function(err, list){
			if(err)
			{
				console.log('err trying to find list');	
				response.send(404);
			}
			list.owners.push(userId);
			list.save(function(err){
				if(err){
					throw err;
				}
				console.log("list was saved");
			});	
		});
};

exports.updateWord = function(request, response){
	var data = request.body;
	Word.findOne({ _id:data._id },function(err,doc){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	console.log('found one. Updating...');
	    	doc.word = data.word;

	    	doc.save(function(err){
				if(err){
					throw err;
				}
				console.log("Updated word " + doc.title );
				response.send(200, doc);
			});	
	    }
	});
}

exports.addTranslation = function(request, response){
	var data = request.body;
	Word.findOne({ _id:data.wordId },function(err,doc){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	doc.translations.push(data.translation)

	    	doc.save(function(err){
				if(err){
					throw err;
				}
				console.log("Translation added" + data.translation );
				response.send(200, doc);
			});	
	    }
	});
}

exports.removeTranslation = function(request, response){
	var w = request.body.word;
	var t = request.body.translationToRemove;
	console.log(request.body);
	Word.findOne({ _id:w._id },function(err,doc){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	console.log(doc);
	    	var index = doc.translations.indexOf(t);
	    	console.log(t);
	    	console.log(index);
            if (index > -1) {
                doc.translations.splice(index, 1);
            }

	    	doc.save(function(err){
				if(err){
					throw err;
				}
				console.log("Translation removed");
				response.send(200, doc);
			});	
	    }
	});
}

exports.removeList = function(request, response){
	List.find({ _id:request.body._id },function(err,docs){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	console.log('found one. Deleting...');
	    	docs.forEach(function(doc){
	    		doc.remove();
	    	});
	    	response.send(200);
	    }
	});
}

exports.removeWord = function (request, response) {
	Word.find({ _id:request.body._id },function(err,docs){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	console.log('found one. Deleting...');
	    	docs.forEach(function(doc){
	    		doc.remove();
	    	});
	    	response.send(200);
	    }
	});	
};

exports.updateWordWithGuess = function(request, response){
	var wordToUpdate = request.body.word;
	var guess = request.body.guess;

	Word.findOne({ _id:wordToUpdate._id },function(err,w){
	    if(err)
	    {
	    	response.send(404);
	    }
	    else{
	    	var index = w.guesses.indexOf(guess);
	    	if (index < 0)
	    		w.guesses.push(guess);

	    	if (w.word.toUpperCase() === guess.toUpperCase())
	    		w.correct += 1;

	    	w.tries += 1;
    		console.log(w);
	    	w.save(function(err){
				if(err){
					throw err;
				}
				console.log("Updated word " + w.word );
				response.send(200, w);
			});	
	    }
	});
};
