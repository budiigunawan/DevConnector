const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config")

// @route   POST api/users
// @desc    Register a new user
// @access  Public
router.post("/", [
    check("name","Name is required")
      .not()
      .isEmpty(),
    check("email","Please insert a valid email address").isEmail(),
    check("password","Please enter password with min 6 characters").isLength({min: 6})
],  async (req,res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {name,email,password} = req.body;

    try {
        ///See if user exist
        ///async try catch (await) dipake agar tidak perlu .then() .catch() atau callback
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ errors: [{msg: "User already exist"}] })
        }

        ///Get user gravatar
        const avatar = gravatar.url(email,{
            s: "200",
            r: "pg",
            d: "mm"
        })

        user = new User({
            name,
            email,
            password,
            avatar
        })

        ///Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        ///return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign( 
            payload, 
            config.get("jwtSecret"), 
            { expiresIn: "360000" },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ token })
            }
        )

    } catch (err) {
        return res.status(500).json({ msg: "Server error" })
    }
})

module.exports = router;
