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
	    //status     : true, // check login status
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

	/* 
	 * EditProfileView
	 * The user can change his name, email or top destination
	 * in the form, and submit the form. Or he can clikc the 
	 * cancel button to return to his profile View.
	 */
	var EditProfileView = Parse.View.extend({
	});

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
			this.undelegateEvents();
			delete this;
			/*
			Parse.User.logOut();
			if(!Parse.User.current()) {
				new LogInView();
				self.undelegateEvents();
				delete self;
			} else {
				alert("This is a problem logging out!");
			}
			*/
		}
	});

	/* 
	 * HomeView
	 * The HomeView display a collection of matches
	 * to the user. The user can click on any of the
	 * record to see profiles of matched travlers.
	 * He can also tab Profile on the Nav bar to go see
	 * and edit his own profile.
	 */
	var HomeView = Parse.View.extend({
	});

	/*
	 * TopDestView
	 * If the user is just signed up, he will come to this
	 * page to enter his top destination. The system will
	 * match travlers based on this information.
	 */
	var TopDestView = Parse.View.extend({
	});

	/*
	 * Login View
	 * If user is not currently signed in, he comes to this
	 * page first. The user can login with Facebook
	 */
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
			this.undelegateEvents();
			delete this;
			/*
			Parse.FacebookUtils.logIn("email", {
  			success: function(user) {
    			if (!user.existed()) {
      			alert("User signed up and logged in through Facebook!");
      			// Go to TopDestView
    			} else {
      			alert("User logged in through Facebook!");
      			// Go to HomeView
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
			*/
		}
	});

	var AppView = Parse.View.extend({
		el: $("#app"),
		initialize: function() {
			this.render();
		},
		render: function() {
			new LoginView();
			/*
			if (Parse.User.current()) {
				new ProfileView();
			} else {
				new LoginView();
			}
			*/
		}
	});

	new AppView;

});