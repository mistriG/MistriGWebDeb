import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First Name Must be at least 3 characters'],
        },
        lastname:{
            type: String,
            minlength: [3, 'Last Name Must be at least 3 characters'],
        }
    },
    email:{
        type: String,
        required: true,
        unique:true,
        minlength: [5, 'Email Must be at least 5 characters'],
    },
    mobileNumber: {
        type: String,
        minlength: [10, 'Mobile number must be at least 10 digits']
    },
    password:{
        type: String,
        required: true,  
        select: false,   
    },
    socketId:{
        type: String
    },
    location: {
        type: String
    }
})





userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET)
    return token;
}

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

const userModel = mongoose.model('user', userSchema);
export default userModel;