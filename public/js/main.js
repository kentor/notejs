var Ember       = require('ember');
var Firebase    = require('firebase');
var DS          = require('ember-data');
                  require('emberfire');
var moment      = require('moment');
var randomColor = require('./pastel.js');
var Markdown    = require('pagedown');
var Hammer      = require('hammerjs');

Ember.TEMPLATES['index'] = require('./templates/index.hbs');
Ember.TEMPLATES['login'] = require('./templates/login.hbs');
Ember.TEMPLATES['note'] = require('./templates/note.hbs');

App = Ember.Application.create();

App.authRequired = true;

App.set('user', JSON.parse(localStorage.getItem('user')));

App.firebaseRef = new Firebase('https://qdsndc.firebaseio.com');

App.ApplicationRoute = Ember.Route.extend({
  activate: function() {
    if (!App.authRequired) return;

    App.firebaseRef.onAuth(function(user) {
      if (user) {
        App.set('user', user);
        localStorage.setItem('user', JSON.stringify(user));
        this.transitionTo('index');
      } else {
        App.set('user', null);
        localStorage.removeItem('user');
        this.transitionTo('login');
      }
    }.bind(this));
  },
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: App.firebaseRef,
});

App.Note = DS.Model.extend({
  content: DS.attr('string'),
  hidden: DS.attr('boolean', { defaultValue: false }),
  createdAt: DS.attr('date'),

  init: function() {
    this._super();
    this.set('localHidden', this.get('hidden'));
    this.set('backgroundGenerator', new App.Utils.BackgroundGenerator());
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

App.Router.map(function() {
  this.route('login');
  this.route('logout');
});

App.AuthenticatedRoute = Ember.Route.extend({
  beforeModel: function() {
    if (App.authRequired && !App.user) {
      this.transitionTo('login');
    }
  },
});

App.LoginRoute = Ember.Route.extend({
  actions: {
    login: function() {
      App.firebaseRef.authWithOAuthRedirect('twitter', Ember.K);
    },
  },
});

App.LogoutRoute = Ember.Route.extend({
  beforeModel: function() {
    App.firebaseRef.unauth();
  },
});

App.IndexRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.store.findAll('note');
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

  loggedIn: function() {
    return App.get('user');
  }.property('App.user'),

  actions: {
    postNote: function() {
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

App.NoteTextareaComponent = Ember.TextArea.extend({
  keyDown: function(e) {
    if (e.keyCode == 13 && e.ctrlKey) {
      this.sendAction();
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

  classNames: ['note'],
  attributeBindings: ['style', 'onclick'],
  classNameBindings: ['swiped'],

  didInsertElement: function() {
    new Hammer(this.element, {
      cssProps: {
        userSelect: true
      }
    })
    .on('swipeleft', function() {
      this.set('swiped', true);
    }.bind(this))
    .on('swiperight', function() {
      this.set('swiped', false);
    }.bind(this));
  },

  style: function() {
    return this.get('context.backgroundGenerator').toCSS();
  }.property(),

  onclick: function() {
    return '';
  }.property(),

  click: function(e) {
    if (Ember.isBlank(window.getSelection().toString()) && !e.target.tagName.match(/^[ai]$/i)) {
      this.get('controller').send('toggleLocalHidden', this.get('context'));
    }
  },
});

App.Utils = {
  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
};

App.Utils.BackgroundGenerator = function BackgroundGenerator() {
  this.color = randomColor();
  this.pattern = this.PATTERNS[Math.floor(Math.random()*this.PATTERNS.length)];
};

App.Utils.BackgroundGenerator.prototype = {
  PATTERNS: ['checkerboard', 'dots', 'striped'],

  toCSS: function() {
    if (this.css) {
      return this.css;
    }

    var cssObj = this['_' + this.pattern]();
    this.css = this._toCSS(cssObj);
    return this.css;
  },

  _checkerboard: function() {
    var backgroundImage = 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 75%, transparent 75%, transparent)';
    backgroundImage = backgroundImage + ',' + backgroundImage;
    return {
      'background-color': this.color,
      'background-image': backgroundImage,
      'background-position': '0 0, 15px 15px',
      'background-size': '30px 30px',
    };
  },

  _dots: function() {
    var backgroundImage = 'radial-gradient(rgba(255,255,255,.1) 25%, transparent 25%)';
    backgroundImage = backgroundImage + ',' + backgroundImage;
    return {
      'background-color': this.color,
      'background-image': backgroundImage,
      'background-position': '0 0, 15px 15px',
      'background-size': '30px 30px',
    };
  },

  _striped: function() {
    return {
      'background-color': this.color,
      'background-image': 'repeating-linear-gradient(135deg, transparent, transparent 11px, rgba(255,255,255,.1) 11px, rgba(255,255,255,.1) 22px)',
    };
  },

  _toCSS: function(cssObj) {
    var css = '';
    for (var key in cssObj) {
      css += '%@:%@;'.fmt(key, cssObj[key]);
    }
    return css;
  },
};
