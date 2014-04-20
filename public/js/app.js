	function helloJS() {
    	return "GOOD";
	}

	var getGoogleLocation = function(callback) {
		var user = Parse.User.current();
		if (user) {
			var location = user.get("location");
			console.log(location);
			callback(new google.maps.LatLng(location._latitude, location._longitude));
		} else {
			throw new Error("Your browser doesn't support geolocation");
		}
	};
	function toggleBounce() {
	  if (marker.getAnimation() != null) {
	    marker.setAnimation(null);
	  } else {
	    marker.setAnimation(google.maps.Animation.BOUNCE);
	  }
	}

	function loadScript() {
		console.log("Loading Google map JS SDK...");
	  var script = document.createElement('script');
	  script.type = 'text/javascript';
	  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBB56byTSi_4iHy_hqH8zN3FQPgb2pm7UQ&sensor=false&' +
	      'callback=initialize';
	  document.body.appendChild(script);
	}

	function initialize() {
		getGoogleLocation(function(loc) {
			myLocation = loc;
			console.log(loc);
		  var mapOptions = {
		    zoom: 2,
		    center: myLocation
		  };

		  map = new google.maps.Map(document.getElementById('map-canvas'),
		      mapOptions);

		  console.log("I'm initializing google maps");

		  marker = new google.maps.Marker({
	      position: myLocation,
	      map: map,
	      draggable: true,
	      animation: google.maps.Animation.DROP,
	      title: 'Hello World!'
	  	});

		  console.log("marker succesfully created!");

	  	google.maps.event.addListener(marker, 'click', toggleBounce);
		});
	}

	function loadScript() {
		console.log("Loading Google map JS SDK...");
	  var script = document.createElement('script');
	  script.type = 'text/javascript';
	  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBB56byTSi_4iHy_hqH8zN3FQPgb2pm7UQ&sensor=false&' +
	      'callback=initialize';
	  document.body.appendChild(script);
	}

$(function() {
	Parse.$ = jQuery;

	/*
	 * getFacebookId
	 * get facebookId from the User table
	 */
	var getFacebookId = function(callback) {
		callback(Parse.User.current().get("authData").facebook.id);
	}

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

	/*********************
	*
	*    MapView
	*
	**********************/
	var MapView = Parse.View.extend({
		events: {
			"click #back": "back"
		},
		el: ".content",
		template: _.template($('#map-template').html()),
		initialize: function() {
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
			loadScript();
		},
		back: function() {
			new ProfileView();
			this.undelegateEvents();
			delete this;
		}
	});

	/*********************
	*
	*    EditProfileView
	*
	**********************/
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
			this.delegateEvents();
		},
		back: function() {
			new ProfileView();
			this.undelegateEvents();
			delete this;
		},
		submit: function(e) {
			var self = this;

			var firstName = this.$("#first-name").val();
			var lastName = this.$("#last-name").val();
			var email = this.$("#email").val();
			var fileUploadControl = this.$("#picture")[0];

			var user = Parse.User.current();
			if (fileUploadControl.files.length > 0){
				var file = fileUploadControl.files[0];
				var name = "photo.png";
				var picture = new Parse.File(name, file);
				var Images = Parse.Object.extend("Images");
				var images = new Images();
				images.set("picture", picture);
				images.set("parentFbId", user.get("facebookId"));
				images.save(null, {
					success: function(images) {
						console.log("new image successfully saved");
						if (firstName != "") {
							user.set("firstName", firstName);
						}
						if (lastName != "") {
							user.set("lastName", lastName);
						}
						if (email != "") {
							user.setEmail(email);
						}
						user.set("imageUrl", images.get("picture").url());
						user.save(null, {
							success: function(user) {
								console.log("successfully updated user info.");
								new ProfileView();
								self.undelegateEvents();
								delete self;
							},
							error: function(user, error) {
								console.log("Error: " + error.code + error.message);
							}
						});
					},
					error: function(images, error) {
						console.log("Error: " + error.code + " " + error.message);
					}
				});
			};
			return false;
		}
	});

	/*********************
	*
	*    ProfileView
	*
	**********************/
	var ProfileView = Parse.View.extend({
		events: {
			"click #logout": "logout",
			"click #edit": "editProfile",
			"click #add-top-dest": "addTopDest", 
			"click #match": "gotoMatch",
			"click #map": "gotoMap"
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

			var name, first, last, email, topDest, imageUrl;

			var TopDest = Parse.Object.extend("TopDestination");
			var query = new Parse.Query(TopDest);
			query.equalTo("parentFbId", user.get("facebookId"));
			query.find({
				success: function(results) {
					console.log("Successfully retrieved " + results.length + " topDests.");
					for (var i = 0; i < results.length; i++) {
						var object = results[i];
						if (topDest) {
							topDest = topDest + " " + object.get("topDest");
						} else {
							topDest = object.get("topDest");
						}
						first = user.get("firstName");
						last = user.get("lastName");
						email = user.getEmail();
						imageUrl = user.get("imageUrl");
						name = first + " " + last;

						console.log("name: " + name);
						console.log("email:" + email);
						console.log("top dest: " + topDest);

						this.$("#profileImg")[0].src = imageUrl;
						this.$(".name").html(name).show();
						this.$(".email").html(email).show();
						this.$(".top-dest").html(topDest).show();
					}
				},
				error: function(error) {
					console.log("Error: " + error.code + " " + error.message);
				}
			})

		},
		addTopDest: function() {
			new TopDestView();
			this.undelegateEvents();
			delete this;
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
		},
		gotoMap: function() {
			new MapView();
			this.undelegateEvents();
			delete this;
		}
	});

	/*********************
	*
	*    TopDestView
	*
	**********************/
	var TopDestView = Parse.View.extend({
		events: {
			"submit form.enterinfo-form": "submit"
		},
		el: ".content",
		template: _.template($('#top-dest-template').html()),
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
			var topDest = this.$("#top-dest").val();
			if (!topDest) {
				new ProfileView();
				self.undelegateEvents();
				delete self;
			} else {
				var parentFbId = Parse.User.current().get("facebookId");
				var TopDest = Parse.Object.extend("TopDestination");
				var myTopDest = new TopDest();
				myTopDest.set("topDest", topDest);
				myTopDest.set("parentFbId", parentFbId);
				myTopDest.save(null, {
					success: function(myTopDest) {
						console.log("top destination info successfully saved");
						new ProfileView();
						self.undelegateEvents();
						delete self;
					},
					error: function(myTopDest, error) {
						alert("Error: " + error.code + error.message);
						console.log(error);
					}
				});
				return false;
			}
		}
	});

	/*********************
	*
	*    LoginView
	*
	**********************/
	var LoginView = Parse.View.extend({
		events: {
			"click #login": "login"
		},
		el: ".content",
		template: _.template($('#login-template').html()),
		initialize: function() {
			_.bindAll(this, "login");
			this.render();
		},
		render: function() {
			$(this.el).html(this.template);
			this.delegateEvents();
		},
		login: function() {
			var self = this;
			Parse.FacebookUtils.logIn("email", {
				success: function(user) {
			    if (!user.existed()) {
			    	getFacebookId(function(id) {
			    		FB.api(id, {fields: 'email, first_name, last_name, picture.height(961)'}, function(response) {
								user.set("facebookId", response.id);
								user.set("email", response.email);
								user.set("firstName", response.first_name);
								user.set("lastName", response.last_name);
								user.set("imageUrl", response.picture.data.url);
								user.save(null, {
									success: function(user) {
										console.log("facebookId and info saved successfully");
									},
									error: function(user, error) {
										console.log("error: " + error.code + error.meesage);
									}
								});
							});
			    	});
				    console.log("User signed up and logged in through Facebook!");
				    new TopDestView();
						self.undelegateEvents();
						delete this;
			    } else {
			      console.log("User logged in through Facebook!");
			      new ProfileView();
						self.undelegateEvents();
						delete this;
			    }
				},
				error: function(user, error) {
			    alert("User cancelled the Facebook login or did not fully authorize.");
			  }
			});
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