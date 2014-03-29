$(function(){
	Parse.$ = jQuery;

	//Initialize Parse
	Parse.initialize("ygllhC3rTkJ6tXIVmYSjeoyFX5f3qzgt6l1zHko6", "mnkxvrJwTcSkgxm492Aa41LoUlLuoKavX6vq403K");

	//Initialize Facebook
	window.fbAsyncInit = function() {
	  // init the FB JS SDK
	  Parse.FacebookUtils.init({
	    appId      : '772451966098433', // Facebook App ID
	    channelUrl : '//travelbuddydev.parseapp.com/channel.html', // Channel File
	    status     : true, // check login status
	    cookie     : true, // enable cookies to allow Parse to access the session
	    xfbml      : true  // parse XFBML
	  });
	};

	//Async load FB JS SDK
	(function(d, debug){
	  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	  if (d.getElementById(id)) {return;}
	  js = d.createElement('script'); js.id = id; js.async = true;
	  js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
	  ref.parentNode.insertBefore(js, ref);
	}(document, /*debug*/ false));

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
			Parse.User.logOut();
			if(!Parse.User.current()) {
				new LogInView();
				self.undelegateEvents();
				delete self;
			} else {
				alert("This is a problem logging out!");
			}
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
			Parse.FacebookUtils.logIn("email", {
  			success: function(user) {
    			if (!user.existed()) {
      			alert("User signed up and logged in through Facebook!");
    			} else {
      			alert("User logged in through Facebook!");
    			}
    			console.log("Current user is: " + Parse.User.current());
    			new ProfileView();
          self.undelegateEvents();
          delete self;
  			},
  			error: function(user, error) {
    			alert("User cancelled the Facebook login or did not fully authorize.");
  			}
			});
			return false;
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