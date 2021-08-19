const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// api/profile/me
router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});

router.post('/', [ auth, [
    check('status', 'status is required')
    .not()
    .isEmpty(),
    check('skills','skills is required')
    .not()
    .isEmpty()
]
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {company, website,location, bio, status, skills, youtube, facebook, twitter, instagram, linkedin} = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile){
            profile = await Profile.findOneAndUpdate({ user: req.user.id}, { $set: profileFields }, { new: true} );
            return res.json(profile);
        }
        profile = new Profile(profileFields)
        await profile.save;
        res.json.apply(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});

router.get('/user/:user_id', async (req,res) => {
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('User', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }
        res.json(profile);
    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'profile not found'})
        }
        res.status(500).send('server error');
    }
});

router.delete('/', auth, async (req, res) => {
    try{
        // removing profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // removing user
        await User.findOneAndRemove({ _id: req.user.id })
        res.json({ msg: 'User deleted' });
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});

// put api/profile/experience
// add profile experience
//private

router.put('/experience', auth,
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'company is required')
    .not()
    .isEmpty(),
    check('from', 'from if required')
    .not()
    .isEmpty()

, 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
    const newExp = {
        title,
        company,
        location,
        from, 
        to,
        current,
        description
    }
    try{
        const profile = await Profile.findOne({user: req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error')
    }
});

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id});
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    }
})

router.put('/education', [auth,[
    check('school', 'school is required')
    .not()
    .isEmpty(),
    check('degree', 'degree is required')
    .not()
    .isEmpty(),
    check('field', 'field is required')
    .not()
    .isEmpty(),
    check('from', 'from date is required')
    .not()
    .isEmpty()
]
],
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const{
        school,
        degree,
        field,
        from,
        to,
        current,
        description
    } = req.body;
    const newEdu = {
        school,
        degree,
        field,
        from, 
        to,
        current,
        description
    };
    try{
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }

});

router.delete('/education/:edu_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id});
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    }
})


module.exports = router;