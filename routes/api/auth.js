const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth")
const User = require("../../models/User")
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route   GET api/auth
// @desc    Check is user login yet
// @access  Token
router.get("/", auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({user});
    } catch (err) {
        console.log(err.message);
        res.status(500).json({msg:"Server error"})
    }
});

// @route   POST api/auth
// @desc    User login and get token
// @access  Public
router.post("/", [
    check("email","Please insert a valid email address").isEmail(),
    check("password","Password is required").exists()
],  async (req,res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;

    try {
        ///See if user exist
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{msg: "Invalid credentials"}] })
        }

        ///Decrypt password
        const isPass = await bcrypt.compare(password,user.password);

        if (!isPass) {
            return res.status(400).json({ errors: [{msg: "Invalid credentials"}] })
        }

        ///return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign( 
            payload, 
            config.get("jwtSecret"), 
            { expiresIn: "3600000" },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ token })
            }
        )

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ msg: "Server error" })
    }
})

module.exports = router;
