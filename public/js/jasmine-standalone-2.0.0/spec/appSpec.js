describe("HelloJS", function() {
    it("says GOOD", function() {
        expect(helloJS()).toEqual("GOOD");
    });
});

describe("Test AppView spy", function() {
    var login = new LoginView;

    spyOn(login, signup);

    it("Signup test", function() {
        expect(self).toBeNull();
    });
});