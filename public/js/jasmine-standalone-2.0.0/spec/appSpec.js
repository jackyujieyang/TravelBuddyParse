describe("LoginView", function() {
    it("Testing LoginView", function() {
    	Parse.initialize("ygllhC3rTkJ6tXIVmYSjeoyFX5f3qzgt6l1zHko6", 
    		"mnkxvrJwTcSkgxm492Aa41LoUlLuoKavX6vq403K");
        var User = Parse.Object.extend("User");
        //var user = new User();
        var query = new Parse.Query(User);
        var obj = null;
        query.get("fBO2BtcxZg", { 
        	success: function(user) { 
        			obj = user;
        			alert("success block reached");
        	},
        	error: function(object, error){
        		alert(error);
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
