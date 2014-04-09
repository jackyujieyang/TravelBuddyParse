describe("LoginView", function() {
    it("Testing LoginView", function() {
        Parse.initialize("ygllhC3rTkJ6tXIVmYSjeoyFX5f3qzgt6l1zHko6", "mnkxvrJwTcSkgxm492Aa41LoUlLuoKavX6vq403K");
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(User);

        Parse.User.logIn("alex", "test", {
				success: function(user) {
					console.log("login success");
				},

				error: function(user, error) {
					console.log("login error");
				}
			});



        query.matches("username","[A-Za-z]*").find({
        //query.equalTo("username","jackyujieyang").find({ 
        	success: function(results) { 
        			var obj = Parse.User.current();
        			console.log("success block reached");
        	},
        	error: function(error){
        		console.log(error);
        	}
        });
        expect(true);
    });
});

/*describe("Test AppView spy", function() {
    var login = new LoginView;

    spyOn(login, signup);

    it("Signup test", function() {
        expect(self).toBeNull();
    });
});*/
