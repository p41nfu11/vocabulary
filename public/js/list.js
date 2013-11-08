// Here's my data model
function ListViewModel() {
    self = this;

    self.listId = ko.observable();
    self.users = ko.observableArray();
    self.words = ko.observableArray();
    
    self.word = ko.observable('');
    self.translation = ko.observable('');
    self.wordClass = ko.observable('');

    self.selectedWord = ko.observable();
    self.newTranslation = ko.observable('');

    self.guess = ko.observable('');
    self.quizWords = [];
    self.quizIndex = 0;
    self.quiz = ko.observable(false);
    self.quizWord = ko.observable();
    self.answered = ko.observable(-1);

    self.init = function(){
        self.listId(parameter.id);

    	$.get('/api/user/', function(data) {
    		data.forEach(function (user){
    			self.users.push(user);	
    		});
    	});

        $.get('/api/words/' + parameter.id, function(data) {
            data.forEach(function (word){
                word.editActive = ko.observable(false);
                self.words.push(word);
            });
        });        
    };

    self.init();

    self.removeWordFromList = function(word){
            var index = self.words.indexOf(word);
            self.words.splice(index, 1);
    }

    self.addWordWasClicked = function(){
        var newWord = {word: self.word(), createdDate: new Date(), translation: self.translation()};
        $.post('/api/word', {word:newWord, listId: parameter.id}, function(data) {
            data.editActive = ko.observable(false);
            self.words.push(data);
            self.clearAddForm();
        }); 
    };

    self.addTranslationWasClicked = function(){
        var newTranslation = {wordId: self.selectedWord()._id, translation: self.newTranslation()};
        $.post('/api/addTranslation/', newTranslation, function(data) {
            data.editActive = ko.observable(false);
            self.newTranslation('');

            var index = self.words.indexOf(self.selectedWord());
            if (index >= 0){
                self.words.splice(index, 1);
                self.words.splice(index, 0, data);
            }

            self.selectedWord(data);
        }); 
    }

    self.clearAddForm = function(){
        self.word('');
        self.translation('');
        self.wordClass('');
    }

    self.editButtonWasClicked = function(word){
        if (!word.editActive()){
            word.editActive(true);
            
        }
        else{
            self.editWord(word);
            word.editActive(false);
        }
    };

    self.editWord = function(word){
        $.post('/api/updateWord/', word, function() {
            //self.removeWordFromList(word);
            //self.addWordToList(word);
        }); 
    }

    self.removeWord = function(word){
        $.post('/api/removeWord/', word, function() {
            self.removeWordFromList(word);
            self.selectedWord('');
        });
    }

    self.selectWord = function(word){
        self.selectedWord(word);
    }

    self.removeTranslation = function(word, translationToRemove){
        var toRemove = {'word':word, 'translationToRemove': translationToRemove};
        $.post('/api/removeTranslation/', toRemove, function(updatedWord) {
            updatedWord.editActive = ko.observable(true);
            self.selectedWord(updatedWord);
            var index = self.words.indexOf(word);
            if (index >= 0){
                self.words.splice(index, 1);
                self.words.splice(index, 0, updatedWord);
            }
        });   
    }

    self.startQuiz = function(){
        self.initQuiz();
        self.quiz(true);

    }

    self.initQuiz = function(){
        var clone = self.words.slice(0);
        clone.sort(function(){ return Math.random()-0.5; }); 
        self.quizWords = clone;
        self.quizWord(self.quizWords[self.quizIndex++]);
        self.answered(-1);
    }

    self.resetQuiz = function(){
        self.quizWords = [];
        self.quizWord('');
        self.answered(-1);
    }

    self.nextQuestion = function(){
        if (self.quizWords.length > self.quizIndex){
            self.quizWord(self.quizWords[self.quizIndex++]);
        }
        else{
            self.quiz(false);
            self.resetQuiz();
        }
        self.guess('');
        self.answered(-1);
    }

    self.answer = function(){
        var g = self.guess().toUpperCase();
        var hit = false;
        self.quizWord().translations.forEach(function(translation){
            if (translation.toUpperCase() == g)
                hit = true;
        });

        $.post('/api/guess/', {'word': self.quizWord(), 'guess': self.guess()}, function(updatedWord) {
            self.answered(hit?1:0);
        });   

    }
};

ko.applyBindings(new ListViewModel());
