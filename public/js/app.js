$(function(){
	Parse.$ = jQuery;

	//Initialize Parse
	Parse.initialize("ygllhC3rTkJ6tXIVmYSjeoyFX5f3qzgt6l1zHko6", "mnkxvrJwTcSkgxm492Aa41LoUlLuoKavX6vq403K");

	var ProfileView = Parse.View.extend({
		events: {
			"click #logout": "logout"
		},
		el: ".content",
		template: _.template($('#profile-template').html()),
		initialize: function() {
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
		},
		logout: function() {
			new LoginView();
			delete self;
		}
	});

	var LoginView = Parse.View.extend({
		events: {
			"click #login": "login"
		},
		el: ".content",
		template: _.template($('#login-template').html()),
		initialize: function() {
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
		},
		login: function() {
			new ProfileView();
			delete self;
		}
	});

	var AppView = Parse.View.extend({
		el: $("#app"),
		initialize: function() {
			this.render();
		},
		render: function() {
			if (Parse.User.current()) {
				new ProfileView();
			} else {
				new LoginView();
			}
		}
	});

	new AppView;

});