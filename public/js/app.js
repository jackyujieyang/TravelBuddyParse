$(function() {
	Parse.$ = jQuery;

	//Initialize Parse
	Parse.initialize("ygllhC3rTkJ6tXIVmYSjeoyFX5f3qzgt6l1zHko6", "mnkxvrJwTcSkgxm492Aa41LoUlLuoKavX6vq403K");

	//Initialize Facebook
	window.fbAsyncInit = function() {
		// init the FB JS SDK
		Parse.FacebookUtils.init({
			appId: '772451966098433', // Facebook App ID
			channelUrl: '//travelbuddydev.parseapp.com/channel.html', // Channel File
			//status     : true, // check login status
			cookie: true, // enable cookies to allow Parse to access the session
			xfbml: true // parse XFBML
		});
	};

	//Async load FB JS SDK
	(function(d, debug) {
		var js, id = 'facebook-jssdk',
			ref = d.getElementsByTagName('script')[0];
		if (d.getElementById(id)) {
			return;
		}
		js = d.createElement('script');
		js.id = id;
		js.async = true;
		js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
		ref.parentNode.insertBefore(js, ref);
	}(document, /*debug*/ false));

	/* 
	 * EditProfileView
	 * The user can change his name, email or top destination
	 * in the form, and submit the form. Or he can clikc the
	 * cancel button to return to his profile View.
	 */
	var EditProfileView = Parse.View.extend({});

	/*
	 * ProfileView
	 * The user can see his prfile picture, name, email, and
	 * top destination. He can click edit button to edit go
	 * to the page where he can edit his basic information.
	 * He can click on the edit button below his profile
	 * picture to upload a new profile picture. Or he can
	 * click on the logout button to logout and return to
	 * the LoginView.
	 */
	var ProfileView = Parse.View.extend({
		events: {
			"click #logout": "logout",
			"click #edit": "editProfile",
			"click #match": "gotoMatch"
		},
		el: ".content",
		template: _.template($('#profile-template').html()),
		initialize: function() {
			_.bindAll(this, "logout", "editProfile", "gotoMatch");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
			var user = Parse.User.current();
			var name, first, last, email, topDest;
			first = user.get("firstName");
			last = user.get("lastName");
			email = user.getEmail();
			topDest = user.get("topDest");
			name = first + " " + last;
			console.log("name: " + name);
			console.log("email:" + email);
			console.log("top dest: " + topDest);
			this.$(".name").html(name).show();
			this.$(".email").html(email).show();
			this.$(".top-dest").html(topDest).show();
		},
		editProfile: function() {
			new OldInfoView();
			this.undelegateEvents();
			delete this;
		},
		logout: function() {
			Parse.User.logOut();
			if (!Parse.User.current()) {
				new LoginView();
				this.undelegateEvents();
				delete this;
			} else {
				alert("There's an error logging out!");
			}
		},
		gotoMatch: function() {
			new MatchView();
			this.undelegateEvents();
			delete this;
		}
	});

	/* 
	 * MatchView
	 * The MatchView display a collection of matches
	 * to the user. The user can click on any of the
	 * record to see profiles of matched travlers.
	 * He can also tab Profile on the Nav bar to go see
	 * and edit his own profile.
	 */
	var MatchView = Parse.View.extend({
		events: {
			"click #profile": "gotoProfile"
		},
		el: ".content",
		template: _.template($('#home-view-template').html()),
		initialize: function() {
			_.bindAll(this, "gotoProfile");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
		},
		gotoProfile: function() {
			new ProfileView();
			this.undelegateEvents();
			delete this;
		}
	});

	/*
	 * TopDestView
	 * If the user is just signed up, he will come to this
	 * page to enter his top destination. The system will
	 * match travlers based on this information.
	 */
	var TopDestView = Parse.View.extend({});


	/*
	 * oldInfoView
	 * For testing only. Ask user to complete his information
	 */
	var OldInfoView = Parse.View.extend({
		events: {
			"submit form.enterinfo-form": "submit"
		},
		el: ".content",
		template: _.template($('#oldInfo-template').html()),
		initialize: function() {
			_.bindAll(this, "submit");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
		},
		submit: function(e) {
			var self = this;
			var firstName = this.$("#first-name").val();
			var lastName = this.$("#last-name").val();
			var email = this.$("#email").val();
			var topDest = this.$("#top-dest").val();
			
			var user = Parse.User.current();
			user.set("firstName", firstName);
			user.set("lastName", lastName);
			user.setEmail(email);
			user.set("topDest", topDest);
			user.set("picture",picture);

			///////////////////////////test
			var fileUploadControl = this.$("#picture")[0];
			if (fileUploadControl.files.length > 0){
				var file = fileUploadControl.files[0];
				var name = "photo.png";
				var picture = new Parse.File(name, pic);
				picture.save().then(function(picture){
					var url = picture.url();
					user.set("image",url);
				})
			}
						
			user.save(null, {
				success: function(user) {
					alert("successfully saved user info.");
					new ProfileView();
					self.undelegateEvents();
					delete self;
				},
				error: function(user, error) {
					alert("Error: " + error.code + error.message);
					console.log(error);
				}
			});
			return false;
		}
	});

	/*
	 * Login View
	 * If user is not currently signed in, he comes to this
	 * page first. The user can login with Facebook
	 */
	var LoginView = Parse.View.extend({
		events: {
			"submit form.login-form": "login",
			"submit form.signup-form": "signup"
		},
		el: ".content",
		template: _.template($('#oldLogin-template').html()),
		initialize: function() {
			_.bindAll(this, "login", "signup");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
		},
		login: function(e) {
			var self = this;
			var username = this.$("#login-username").val();
			var password = this.$("#login-password").val();

			Parse.User.logIn(username, password, {
				success: function(user) {
					new ProfileView();
					self.undelegateEvents();
					delete self;
				},

				error: function(user, error) {
					self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
					self.$(".login-form button").removeAttr("disabled");
				}
			});

			this.$(".login-form button").attr("disabled", "disabled");

			return false;
		},
		signup: function() {
			var self = this;
			var username = this.$("#signup-username").val();
			var password = this.$("#signup-password").val();

			Parse.User.signUp(username, password, {
				ACL: new Parse.ACL()
			}, {
				success: function(user) {
					new OldInfoView();
					self.undelegateEvents();
					delete self;
				},

				error: function(user, error) {
					self.$(".signup-form .error").html(error.message).show();
					self.$(".signup-form button").removeAttr("disabled");
				}
			});

			this.$(".signup-form button").attr("disabled", "disabled");

			return false;
		}
	});

	function helloJS() {
    	return "GOOD";
	}
	
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