App = Ember.Application.create();

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase('https://qdsndc.firebaseio.com'),
});

App.Note = DS.Model.extend({
  content: DS.attr('string'),
  hidden: DS.attr('boolean', { defaultValue: false }),
  createdAt: DS.attr('date'),

  init: function() {
    this._super();
    this.set('localHidden', this.get('hidden'));
  },

  hiddenStateLabel: function() {
    return this.get('hidden') ? '☼' : '☀';
  }.property('hidden'),

  timeAgo: function() {
    return moment(this.get('createdAt')).fromNow().replace(' ago', '');
  }.property('createdAt'),

  formattedContent: function() {
    return Markdown.getSanitizingConverter().makeHtml(this.get('content'));
  }.property('content'),

  toggleLocalHidden: function() {
    this.set('localHidden', !this.get('localHidden'));
  },

  toggleHidden: function() {
    this.set('hidden', !this.get('hidden'));
    this.save();
  },

  hiddenObserver: function() {
    this.set('localHidden', this.get('hidden'));
  }.observes('hidden'),
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    store = this.store;
    return this.store.findAll('note');
  },

  actions: {
    deleteNote: function(note) {
      note.destroyRecord();
    }
  },
});

App.IndexController = Ember.ArrayController.extend({
  sortProperties: ['createdAt'],
  sortAscending: false,

  filteredNotes: function() {
    var filter = this.get('filterText');

    if (Ember.isBlank(filter)) {
      return this;
    }

    var filterRegexp = new RegExp(App.Utils.escapeRegExp(filter), 'i');

    return this.filter(function(note) {
      return note.get('content').match(filterRegexp);
    });
  }.property('filterText', '@each'),

  notesCount: function() {
    return this.get('length');
  }.property('length'),

  filteredNotesCount: function() {
    return this.get('filteredNotes.length');
  }.property('filteredNotes.length'),

  actions: {
    postNote: function() {
      whatdafuq = this;
      if (Ember.isBlank(this.get('newNoteContent'))) {
        return;
      }

      var newNote = this.store.createRecord('note');

      newNote.setProperties({
        content: this.get('newNoteContent'),
        createdAt: new Date(),
      });
      newNote.save();
      this.set('newNoteContent', '');
    }
  },
});

App.NewNoteTextArea = Ember.TextArea.extend({
  keyDown: function(e) {
    if (e.keyCode == 13 && e.ctrlKey) {
      this.get('parentView.controller').send('postNote');
      e.preventDefault(); // prevents new line from pressing enter
    }
  },
});

App.NoteController = Ember.ObjectController.extend({
  actions: {
    destroy: function() {
      this.get('content').destroyRecord();
    },

    toggleLocalHidden: function() {
      this.get('content').toggleLocalHidden();
    },

    toggleHidden: function() {
      this.get('content').toggleHidden();
    },
  },
});

App.NoteView = Ember.View.extend({
  tagName: 'li',

  attributeBindings: ['style', 'onclick'],

  style: function() {
    return 'background:%@'
      .fmt(randomColor({luminosity: 'light'}));
  }.property(),

  onclick: function() {
    return ''
  }.property(),

  click: function(e) {
    if (Ember.isBlank(window.getSelection().toString()) && !e.target.tagName.match(/^[ai]$/i)) {
      this.get('controller').send('toggleLocalHidden', this.get('context'));
    }
  }
});

App.Utils = {
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
}
