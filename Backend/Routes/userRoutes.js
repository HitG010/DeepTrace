const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/getUserDetails', (req, res) => {
    if (req.isAuthenticated()) {
        console.log("User: ", req.user);
        const { username, email } = req.user;
        res.json({ username, email });
    } else {
        // res.status(401).json({ msg: 'You are not authenticated' });
        console.log("User not authenticated");
        res.send(null);
    }
});

module.exports = router;