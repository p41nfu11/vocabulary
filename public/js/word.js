function WordDetailsViewModel() {
    self = this;

    self.wordId = ko.observable();
    self.word = ko.observable();

    self.init = function(){
        self.wordId(parameter.wordId);
        $.get('/api/word/' + parameter.wordId, function(data) {
            self.word(data);
        });        
    };

    self.init();
};

ko.applyBindings(new WordDetailsViewModel());