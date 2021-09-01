const express = require('express');
const Task = require('../models/task')
const auth = require('../middleware/auth');
const router = express.Router();
const bodyParser = require('body-parser')
const User = require('../models/user')
var jsonParser = bodyParser.json()

router.post('/api/task', auth, jsonParser, async (req, res) => {

    
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try{
        await task.save();
        res.status(201).send(task)
    }catch(err){
        res.status(400).send(err)
    }
})



// fetch task with authenticated user only
// limit, match and options
// GET task/?limit=""&skip=""
// GET /tasks/sortBy="createdAt"
router.get('/api/tasks', auth, async (req, res) => {
    const match = {};

    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    
        if(req.query.sortBy){
            const parts = req.query.sortBy.split("_")
            sort[parts[0]] = parts[1] === 'desc' ?  -1 : 1 ;
        }

       
    
    try{
        const user = await User.findById(req.user._id);
        await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();


        res.send(req.user.tasks)
      

    }catch(err){
        res.status(500).send();
    }
})


// fetch task by id
router.get('/api/task/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const task = await Task.findOne({_id, author: req.user._id});
    
    try{
        if(!task){
            return res.status(404).send()
        }

        res.status(201).send(task)
    }catch(err){
        res.status(500);
    }
})


// update task
router.patch('/api/task/:id', auth, jsonParser, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdate = ['description', 'completed']

    const isValidUpdate = updates.every(update => allowedUpdate.includes(update));
    
    if(!isValidUpdate){
      return res.send({error: 'Invalid update'});
    }

    try{
        const task = await Task.findOne({_id:req.params.id, author: req.user._id});
        if(!task){
            return res.status(401).send()
        }
        
        updates.forEach((update) => task[update] = req.body[update])


        await task.save();
        res.status(201).send(task)
    }catch(e){
        res.status(500).send()
    }
})


router.delete('/api/tasks/:id', auth,  async (req, res) =>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, author: req.user._id});

        if(!task) {
            res.status(401).send();
        }
        res.send(task)
    }catch(err){
        res.status(500).send();
    }
})

module.exports = router;