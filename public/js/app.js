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
	 * OtherProfileView
	 * The OtherProfileView is displayed from the MatchView
	 * when the user clicks on a match. This leads to the match's
	 * profile page.
	 */

	 var OtherProfileView = Parse.View.extend({
	 	events: {
	 		"click #back": "gotoMatches"
	 	},
	 	el: ".content",
	 	template: _.template($('#other-profile-template').html()),
	 	initialize: function() {
	 		_.bindAll(this, "gotoMatches");
	 		this.render();
	 	},
	 	render: function() {
	 		$(this.el).html(this.template);
			this.delegateEvents();
	 	},
	 	gotoMatches: function() {
	 		new MatchView();
			this.undelegateEvents();
			delete this;
	 	}
	 })

/*
* Person object constructor -- made so that we can pass person information 
* between the the matches view and the match's profile view.
*/
function person(obj) {
	this.obj = obj;
	this.destinations = new Array();
}

/*
* Simple helper function to see if an object is in a list.
* If it is in the list, return its index. If not, return -1.
*/
function containsObject(obj, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return i;
        }
    }
    return -1;
}

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
			"click #profile": "gotoProfile",
			"click #proximity": "sortResults",
			"click #dist": "sortResults",
			"click #otherprofile": "gotoOtherProfile"
		},
		el: ".content",
		template: _.template($('#home-view-template').html()),
		initialize: function() {
			_.bindAll(this, "gotoProfile", "sortResults");
			this.render();
		},
		render: function() {
			// Set up the queries
			var TopDestination = Parse.Object.extend("TopDestination");
        	var query1 = new Parse.Query(TopDestination);

        	var current = Parse.User.current();
        	
        	//matches.length = 0; // clear the matches array to display new matches

        	var topDest; // Will hold the current user's top destination after first query
        	
        	// First query gets all of current user's TopDestinations, using their FBId.
        	query1.equalTo("parentFbId", current.get("facebookId")).find({
        		success: function(result) {
        			
					//Matches array holds all of the person objects for passing between 
					//matches view and the match's profile view.
        			var matches = new Array();
        			var max = result.length - 1;
        			for (var i in result) {
        				topDest = result[i].get("topDest");
        				console.log(topDest);
        				var query2 = new Parse.Query(TopDestination);
        				query2.equalTo("topDest", topDest).include("parent").find({
        				success: function(result) {
        					console.log("success block reached for matchView");
        					var temp = new Array(); // will hold the person objects
        					for (var x in result) {
        						var dest = result[x];
        						var match = dest.get("parent");
        						if (match.attributes.email != current.getEmail()) {
        							var p = new person(match);
        							var index = containsObject(p, temp);
        							if (index != -1) {
        								temp[index].destinations.push(topDest);
        							} else {
        								p.destinations.push(topDest);
        								temp.push(p);
        							}
        						}
        					}
        					for (var n in temp) {
        						var o = temp[n];
        						matches.push(o);
        					}
        				if (i == max) {
	        				var template = $('#home-view-template');
							var container = template.context.getElementById("matches");
							for (var index in matches) {
					        	var match = matches[index];

					        	// Row div
					        	var row = document.createElement("div");
						        row.class = "row";
						        row.id = "otherprofile";
					    	    
					    	    // Image div
					    	    var imageDiv = document.createElement("div");
					        	imageDiv.class = "col-xs-4";
					        	imageDiv.style.display="inline-block";
					        	var image = document.createElement("img");
						        var matchImg = match.obj.get("imageUrl");
					    	    image.src = matchImg;
					        	image.alt = matchImg;
						        image.class = "img-thumbnail";
					    	    image.style.height="100px";
					        	image.style.width="100px";
					        	imageDiv.appendChild(image);
					        	
					        	// Info div, with name and destinatons					
						        var infoDiv = document.createElement("div");
					    	    infoDiv.class = "col-xs-8";
					        	infoDiv.style.display="inline-block";
						        infoDiv.style.padding="2%";
					        					
								var nameText = document.createElement("p");
					        	nameText.style.font="bold";
								var name = document.createTextNode(match.obj.attributes.firstName + " " + match.obj.attributes.lastName);
					        	nameText.appendChild(name);
								
					        	var headText = document.createElement("p");
					        	var headTextNode = document.createTextNode("Matched destinations:");
					        	headText.appendChild(headTextNode);
					        	infoDiv.appendChild(nameText);
					        	infoDiv.appendChild(headText);

							for (var dest in match.destinations) {	        						
						        var destText = document.createElement("p");
					    	    var destination = document.createTextNode(match.destinations[dest]);
					        	destText.appendChild(destination);
				    			infoDiv.appendChild(destText);
				    		}
					        row.appendChild(imageDiv);
				    	    row.appendChild(infoDiv);

				        	container.appendChild(row);
				        	}
				        }
	        		},
    	    		error: function(error) {
        				console.log(error);
        			}
	        		});
        		
    	    	}},
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
			},
			gotoOtherProfile: function() {
				new OtherProfileView();
				this.undelegateEvents();
				delete this;
			},
		sortResults: function() {
			console.log("sorting");
			var TopDestination = Parse.Object.extend("TopDestination");
        	var query1 = new Parse.Query(TopDestination);
        	var query2 = new Parse.Query(TopDestination);

        	var current = Parse.User.current();
        	var topDest;
        	var lat2;	//user
        	var long2;	//user 
        	var objs = [];
        	var num = 0;
			var r = 3958;
     		var pi = 3.14159265359;
     		var dPerR = 57.29578; 	// Number of degrees/radian (for conversion)


        	query1.equalTo("parentFbId", current.get("facebookId")).first({
        		success: function(result) {
        			topDest = result.get("topDest");
        		query2.equalTo("topDest", topDest).include("parent").find({
        			success: function(result) {
        				$('#matches div').empty(); // clear div for new matches, if any.
        				for (var x in result) {
        					var dest = result[x];
        					var match = dest.get("parent");
        					if (match.attributes.email == current.getEmail()) {
        						long2 = match.get("location")._longitude;
        						lat2 = match.get("location")._latitude;
        					}
        				}
        				for (var x in result) {
        					var dest = result[x];
        					var match = dest.get("parent");
        					if (match.attributes.email != current.getEmail()) {
								var lat1 = match.get("location")._latitude;
								var long1 = match.get("location")._longitude;
								objs[num] = {
									Name: match.attributes.firstName + " " + match.attributes.lastName, 
									Dest: dest.get("topDest"), 
									Distance: r*pi*Math.sqrt(Math.pow((lat1-lat2), 2)+
										Math.cos(lat1/dPerR)*Math.cos(lat2/dPerR)*
										Math.pow((long1-long2),2))/180, 
									Img: match.get("imageUrl")
								};
								num++;
							}
						}
						objs.sort(
							function(a,b) {
								return (a.Distance > b.Distance) ? 1 : ((b.Distance > a.Distance) ? -1 : 0);
							} 
						);
						for (var i in objs){
							var template = $('#home-view-template');
							var container = template.context.getElementById("matches");
        					var row = document.createElement("div");
	        				row.class = "row";
    	    				var imageDiv = document.createElement("div");
        					imageDiv.class = "col-xs-4";
        					imageDiv.style.display="inline-block";
       						var image = document.createElement("img");
       						var matchImg = objs[i].Img;
        					image.src = matchImg;
        					image.alt = matchImg;
							image.class = "img-thumbnail";
	        				image.style.height="100px";
        					image.style.width="100px";
        					imageDiv.appendChild(image);    	    			
    				
    						var infoDiv = document.createElement("div");
        					infoDiv.class = "col-xs-8";
        					infoDiv.style.display="inline-block";
	       					infoDiv.style.padding="2%";

        					var nameText = document.createElement("p");
        					nameText.style.font="bold";
        					var name = document.createTextNode(objs[i].Name);
        					nameText.appendChild(name);
        			
        					var destText = document.createElement("p");
        					var destination = document.createTextNode(objs[i].Dest);
        					destText.appendChild(destination);
        					
        					var disText = document.createElement("p");
        					var distNum = parseFloat(objs[i].Distance.toPrecision(3));
        					var distance = document.createTextNode(distNum+" km away");
        					disText.appendChild(distance);
	        				
	        				infoDiv.appendChild(nameText);
    	    				infoDiv.appendChild(destText);
							infoDiv.appendChild(disText);
							
							row.appendChild(imageDiv);
        					row.appendChild(infoDiv);
        					container.appendChild(row);
        						
						}
        		},
        		error: function(error) {
        			console.log(error);
        		}
        	});
        	},
        	error: function(error) {
        		console.log(error);
        	}
        });
		$(this.el).html(this.template);
		this.delegateEvents();
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
				myTopDest.set("parent", Parse.User.current());
				myTopDest.save(null, {
					success: function(myTopDest) {
						console.log("top destination info successfully saved");
						new ProfileView();
						self.undelegateEvents();
						delete self;
					},
					error: function(myTopDest, error) {
						console.log("Error: " + error.code + error.message);
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