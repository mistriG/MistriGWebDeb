import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const workerSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First Name Must be at least 3 characters'],
        },
        lastname: {
            type: String,
            minlength: [3, 'Last Name Must be at least 3 characters'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Email Must be at least 5 characters'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true,  
        select: false,   
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    profession: {
        type: String,
        required: true,
        enum: ['electrician', 'plumber', 'carpenter', 'painter', 'mason', 'gardener', 'cleaner', 'mechanic', 'other']
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    jobsCompleted: {
        type: Number,
        default: 0
    },
    socketId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

workerSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, type: 'worker'}, process.env.JWT_SECRET);
    return token;
};

workerSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

workerSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
};

const workerModel = mongoose.model('worker', workerSchema);
export default workerModel; 