import mongoose from "mongoose";
import Credits from "../../client/src/pages/Credits";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    Credits: {type: Number, default: 20},
})

// Hash password before saving
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

const User = mongoose.model('User', userSchema);

export default User;
