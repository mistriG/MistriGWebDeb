import workerModel from '../models/worker.model.js';

export const createWorker = async (workerData) => {
    try {
        // Log incoming email
        console.log('Attempting to create worker with email:', workerData.email);
        
        // Convert email to lowercase for consistent comparison
        const email = workerData.email.toLowerCase();
        
        // Check if worker already exists with case-insensitive email
        const existingWorker = await workerModel.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });
        
        if (existingWorker) {
            console.log('Worker already exists with email:', existingWorker.email);
            throw new Error('Worker with this email already exists');
        }

        // Create new worker with lowercase email
        const worker = new workerModel({
            fullname: {
                firstname: workerData.firstname,
                lastname: workerData.lastname
            },
            email: email, // Store email in lowercase
            password: workerData.password,
            phoneNumber: workerData.phoneNumber,
            profession: workerData.profession,
            experience: workerData.experience,
            location: workerData.location,
            bio: workerData.bio || ''
        });

        // Save worker
        await worker.save();
        console.log('Successfully created new worker with email:', email);
        
        // Return worker without password
        return worker;
    } catch (error) {
        console.error('Error in createWorker:', error);
        throw error;
    }
};

export const findWorkerByEmail = async (email) => {
    try {
        return await workerModel.findOne({ email });
    } catch (error) {
        throw error;
    }
};

export const findWorkerById = async (id) => {
    try {
        return await workerModel.findById(id);
    } catch (error) {
        throw error;
    }
};

export const updateWorker = async (id, updateData) => {
    try {
        return await workerModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const findWorkersByProfession = async (profession) => {
    try {
        return await workerModel.find({ profession });
    } catch (error) {
        throw error;
    }
};

export const findWorkersByLocation = async (location) => {
    try {
        // Simple location-based search
        // In a real app, you might want to use geolocation
        return await workerModel.find({ 
            location: { $regex: location, $options: 'i' } 
        });
    } catch (error) {
        throw error;
    }
}; 