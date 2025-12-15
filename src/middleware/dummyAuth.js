const dummyAuth = (req, res, next) => {
    // simulate firebase decoded token
    req.user = {
        uid: "dummy_uid_123",
        phoneNumber: "+919876543211",
        email: "dummy@test.com",
    };

    next();
};

module.exports = { dummyAuth };
