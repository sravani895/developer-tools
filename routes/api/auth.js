const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const config = require('config')
const jwt = require('jsonwebtoken');
const {check, validationResult} = require("express-validator/check");
const User = require('../../models/User');


router.get('/',auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//post api/auth
// authenticate user and get token
// access public

router.post('/', 
[
    check('email', 'please include valid email').isEmail(),
    check('password', 'password is required').exists()
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;
try{
    let user = await User.findOne({ email });
    if(!user){
       return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
    }
    //return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(payload, 
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
        );

    // res.send('user registered');

}catch(err){
    console.log(err.message);
    res.status(500).send("server error");
}
    
    
});

module.exports = router;