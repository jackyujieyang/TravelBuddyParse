	function helloJS() {
    	return "GOOD";
	}

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
		js.src = "http://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
		ref.parentNode.insertBefore(js, ref);
	}(document, /*debug*/ false));

	/* 
	 * EditProfileView
	 * The user can change his name, email or top destination
	 * in the form, and submit the form. Or he can clikc the
	 * cancel button to return to his profile View.
	 */
	var EditProfileView = Parse.View.extend({
		events: {
			"submit form.enterinfo-form": "submit",
			"click #back": "back"
		},
		el: ".content",
		template: _.template($('#editProfile-template').html()),
		initialize: function() {
			_.bindAll(this, "submit", "back");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			var user = Parse.User.current();
			$("#first-name").attr("placeholder", user.get("firstName"));
			$("#last-name").attr("placeholder", user.get("lastName"));
			$("#email").attr("placeholder", user.get("email"));
			$("#top-dest").attr("placeholder", user.get("topDest"));
			this.delegateEvents();
		},
		back: function() {
			new ProfileView();
			this.undelegateEvents();
			delete self;
		},
		submit: function(e) {
			var self = this;
			var firstName = this.$("#first-name").val();
			var lastName = this.$("#last-name").val();
			var email = this.$("#email").val();
			var topDest = this.$("#top-dest").val();
			
			var user = Parse.User.current();
			if (firstName != "") {
				user.set("firstName", firstName);
			}
			if (lastName != "") {
				user.set("lastName", lastName);
			}
			if (email != "") {
				user.setEmail(email);
			}
			if (topDest != "") {
				user.set("topDest", topDest);
			}
			
			///////////////////////////test
			var fileUploadControl = $("#picture")[0];
			if (fileUploadControl.files.length > 0){
				var file = fileUploadControl.files[0];
				var name = "photo.png";
				var picture = new Parse.File(name, file);
				user.set("picture",picture);
			};

			user.save(null, {
				success: function(user) {
					//console.log("successfully saved user info.");
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
	 * getLocation
	 * Get current location, and save it to the cloud
	 */
	var getLocation = function(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(location) {
				callback(new Parse.GeoPoint({latitude: location.coords.latitude, longitude: location.coords.longitude}));
			});
		} else {
			throw new Error("Your browser doesn't support geolocation");
		}
	};

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
			var name, first, last, email, topDest, profilePhoto;
			first = user.get("firstName");
			last = user.get("lastName");
			email = user.getEmail();
			topDest = user.get("topDest");
			name = first + " " + last;
			profilePhoto = user.get("picture");
			$("#profileImg")[0].src = profilePhoto.url();
			console.log("name: " + name);
			console.log("email:" + email);
			console.log("top dest: " + topDest);
			this.$(".name").html(name).show();
			this.$(".email").html(email).show();
			this.$(".top-dest").html(topDest).show();
			getLocation(function(point) {
				user.set("location", point);
				user.save(null, {
					success: function(user) {
						console.log("location updated successfully");
					},
					error: function(user, error) {
						console.log("error: " + error.code + error.meesage);
					}
				});
			});
		},
		editProfile: function() {
			new EditProfileView();
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
			var User = Parse.Object.extend("User");
        	var query = new Parse.Query(User);

        	var current = Parse.User.current();
        	var dest = current.get("topDest");
        	query.equalTo("topDest", dest);

        	query.limit(100).find({
        		success: function(result) {
        			console.log("success block reached for matchView");
        			$('#matches div').empty(); // clear div for new matches, if any.
        			for (var x in result) {
        				var match = result[x];
        				//if (match.attributes.email != current.getEmail()) {
        					var template = $('#home-view-template');
							var container = template.context.getElementById("matches");
        					var row = document.createElement("div");
        					row.class = "row";
        					var imageDiv = document.createElement("div");
        					imageDiv.class = "col-xs-4";
        					var image = document.createElement("img");
        					var matchImg = match.get("picture");
        					image.src = matchImg.url;
        					image.alt = matchImg.url;
        					image.class = "img-thumbnail";
        					imageDiv.appendChild(image);
        					
        					var infoDiv = document.createElement("div");
        					infoDiv.class = "col-xs-8";
        					
        					var nameText = document.createElement("p");
        					nameText.style.font="bold";
        					var name = document.createTextNode(match.attributes.firstName + " " + match.attributes.lastName);
        					nameText.appendChild(name);
        					
        					var destText = document.createElement("p");
        					var destination = document.createTextNode(match.attributes.topDest);
        					destText.appendChild(destination);

        					infoDiv.appendChild(nameText);
        					infoDiv.appendChild(destText);

        					row.appendChild(imageDiv);
        					row.appendChild(infoDiv);

        					container.appendChild(row);
        				//}
        			}

        		},
        		error: function(error) {
        			console.log(error);
        		}
        	});

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
			//var picture = this.$("#picture");
			//var name = "photo.png"
			
			var user = Parse.User.current();
			user.set("firstName", firstName);
			user.set("lastName", lastName);
			user.setEmail(email);
			user.set("topDest", topDest);
			
			///////////////////////////test
			var fileUploadControl = $("#picture")[0];
			if (fileUploadControl.files.length > 0){
				var file = fileUploadControl.files[0];
				var name = "photo.png";
				var picture = new Parse.File(name, file);
				user.set("picture",picture);
				/*picture.save().then(function(picture){
					var url = picture.url();
					user.set("image",url);
				});
				picture.save().then(function(){
					alert("picture saved!!!!!!");
				}, function(error){
					alert("there is error!");
				});*/
			};

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