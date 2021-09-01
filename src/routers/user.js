const express = require('express');
const app = express();
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancellation} = require('../emails/account')
const router = new express.Router();


// multerconfig
const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 1000000 //1mb its up to you to set the upload size
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Invalid file name, upload image only'))
        } 

        

        cb(undefined, true)

    }


});

const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// add user
router.post('/user', jsonParser, async (req, res) => {
    const user = new User(req.body)

    try{
        const token = await user.generateAuthToken();

        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token});
    } catch(err){
        res.status(400).send(err)
    }
})


//fetch all users
router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)


    // try{ 
    //    const user =  await User.find({});
    //    res.status(200).send(user)
    // }catch(err) {
    //     res.status(500).send(err)
    // }




})

router.patch('/users/me', auth, jsonParser, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    
    
    const isValidUpdates = updates.every(update => allowedUpdates.includes(update)) 

    if(!isValidUpdates){
        return res.status(400).send({error: 'Invalid update'});
    }
    try{
        const user = req.user;
        if(!user) {
            return res.status(404).send()
        }


        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
    
        res.status(201).send(user)
        
     } catch(err){
        res.status(500).send(err);
    }
})


router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove();
        sendCancellation(req.user.email, req.user.name)
        res.send(req.user)
    } catch(err){
        res.status(500).send();
    }
})


// fetch all users from
router.get('/users', async (req, res) => {

    const user = await User.find({});

    if(!user){
        res.status(401).send();
    }

    res.send(user)
})

// Login
router.post('/users/login', jsonParser, async (req, res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token})
    }catch(err){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    }catch(err){
        res.status(500).send();
    }
})


router.post('/users/logout-all-session', auth, async (req, res) => {
    try{
       req.user.tokens = req.user.tokens = []
       await req.user.save()
       res.send();
    }catch(err){
        res.status(500).send();
    }
})


router.post('/users/me/avatar', jsonParser, auth, upload.single('avatar'),  async (req, res) => {
    
    try{
        if(!req.file){
            return res.send({error:"please provide image file"})
        }
        
        const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send(req.user)

    }catch(err){
        res.status(500)
    }
},(error, req, res, next) => {
    res.status(400).send({error: error.message});
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    
    await req.user.save();
    // res.send(req.user)
})


router.get('/users/:id/avatar',  async (req, res) => {
    
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(err){
        res.status(404).send();
    }
})

module.exports = router;