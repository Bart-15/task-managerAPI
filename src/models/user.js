const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')


const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be greater then zero')
            }
        }
    },
    avatar: {
        type:Buffer
    },
    tokens : [{
        token: {
            type:String,
            required:true,
        }
    }]

}, {
    timestamps:true
})


userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'author'
})

//toJSON
userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();

    delete userObj.tokens;
    delete userObj.password;
    delete userObj.avatar;


    return userObj;
}




userSchema.pre('save', async function(next){
    const user = this;

    //hash the password 
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    } 

    next();
})

// login logic
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Credential not found');
    }

    const passMatch = await bcrypt.compare(password, user.password);

    if(!passMatch) {
        throw new Error('Crednetial not found')
    }

    return user;

}




// generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    
    const token = jwt.sign({_id: user._id.toString() }, 'bartproject')
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token;
}

// delete task when user is removed
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({author: user._id})
 

    next();
})


const User = mongoose.model('User', userSchema)



module.exports = User;
