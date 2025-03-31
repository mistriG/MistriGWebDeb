import workerModel from '../models/worker.model.js';

export const createWorker = async (workerData) => {
    try {
        // Check if worker already exists
        const existingWorker = await workerModel.findOne({ email: workerData.email });
        if (existingWorker) {
            throw new Error('Worker with this email already exists');
        }

        // Create new worker
        const worker = new workerModel({
            fullname: {
                firstname: workerData.firstname,
                lastname: workerData.lastname
            },
            email: workerData.email,
            password: workerData.password,
            phoneNumber: workerData.phoneNumber,
            profession: workerData.profession,
            experience: workerData.experience,
            location: workerData.location,
            bio: workerData.bio || ''
        });

        // Save worker
        await worker.save();
        
        // Return worker without password
        return worker;
    } catch (error) {
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