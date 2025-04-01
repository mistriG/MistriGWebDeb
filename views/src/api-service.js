/**
 * MistriG API Service
 * Provides models and API service functions for interacting with the backend
 */

// Data Models
class Worker {
    constructor(id, name, profession, phone, status, latitude, longitude) {
        this.id = id;
        this.name = name;
        this.profession = profession;
        this.phone = phone;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class Customer {
    constructor(id, name, email, phone, address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}

class Job {
    constructor(id, title, description, price, customerId, workerId, status, location) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.customerId = customerId;
        this.workerId = workerId;
        this.status = status;
        this.location = location;
    }
}

class StatusUpdate {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
}

class LocationUpdate {
    constructor(id, latitude, longitude) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class NewWorkerRequest {
    constructor(id, name, profession, phone, latitude, longitude) {
        this.id = id;
        this.name = name;
        this.profession = profession;
        this.phone = phone;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

// API Service - Uses Axios for HTTP requests
const API_BASE_URL = "https://api.mistrig.com/v1/"; // Replace with actual API URL when deployed

const apiService = {
    // Authentication methods
    login: async (email, password, userType = 'worker') => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}auth/login`, {
            //     email,
            //     password,
            //     userType
            // });
            // 
            // Store token and user info
            // localStorage.setItem('token', response.data.token);
            // localStorage.setItem('userType', userType);
            // localStorage.setItem('userId', response.data.userId);
            // 
            // return response.data;
            
            // Simulated response for demo
            const userId = userType === 'worker' ? 1 : 101;
            const token = `demo-token-${userType}-${Date.now()}`;
            
            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userType', userType);
            localStorage.setItem('userId', userId);
            
            return {
                success: true,
                token,
                userId,
                message: 'Logged in successfully'
            };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    },
    
    register: async (userData, userType = 'worker') => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}auth/register`, {
            //     ...userData,
            //     userType
            // });
            // return response.data;
            
            // Simulated response for demo
            console.log(`Registering ${userType}:`, userData);
            return {
                success: true,
                message: 'Registration successful'
            };
        } catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('workerStatus');
        localStorage.removeItem('locationWatchId');
    },
    
    // Worker methods
    getWorkers: async () => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.get(`${API_BASE_URL}workers`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data;
            
            // Simulated response for demo
            return [
                {
                    id: 1,
                    name: "Rahul Sharma",
                    profession: "Plumber",
                    phone: "+919876543210",
                    status: "online",
                    latitude: 28.6139,
                    longitude: 77.2090
                },
                {
                    id: 2,
                    name: "Amit Kumar",
                    profession: "Electrician",
                    phone: "+918765432109",
                    status: "offline",
                    latitude: 28.5355,
                    longitude: 77.3910
                }
            ];
        } catch (error) {
            console.error("Error fetching workers:", error);
            return [];
        }
    },
    
    getWorkerById: async (workerId) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.get(`${API_BASE_URL}workers/${workerId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data;
            
            // Simulated response for demo
            if (workerId === 1) {
                return {
                    id: 1,
                    name: "Rahul Sharma",
                    profession: "Plumber",
                    phone: "+919876543210",
                    status: "online",
                    latitude: 28.6139,
                    longitude: 77.2090,
                    ratings: 4.8,
                    reviews: 32,
                    jobsCompleted: 93
                };
            }
            return null;
        } catch (error) {
            console.error(`Error fetching worker with ID ${workerId}:`, error);
            return null;
        }
    },
    
    updateStatus: async (statusUpdate) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}workers/status`, statusUpdate, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log("Worker status updated successfully:", statusUpdate);
            return true;
        } catch (error) {
            console.error("Error updating status:", error);
            return false;
        }
    },
    
    updateWorkerLocation: async (locationUpdate) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}workers/location`, locationUpdate, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log("Worker location updated successfully:", locationUpdate);
            return true;
        } catch (error) {
            console.error("Error updating location:", error);
            return false;
        }
    },
    
    addWorker: async (newWorker) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}workers`, newWorker, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log("Worker added successfully:", newWorker);
            return true;
        } catch (error) {
            console.error("Error adding worker:", error);
            return false;
        }
    },
    
    // Job methods
    getJobRequests: async (workerId) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.get(`${API_BASE_URL}jobs/requests/${workerId}`, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data;
            
            // Simulated response for demo
            return [
                {
                    id: "job123",
                    title: "Plumbing Repair",
                    customer: "Amit Patel",
                    location: "Dwarka Sector 12, New Delhi",
                    price: 1200
                },
                {
                    id: "job124",
                    title: "Pipe Fitting",
                    customer: "Priya Sharma",
                    location: "Vasant Kunj, New Delhi",
                    price: 1500
                }
            ];
        } catch (error) {
            console.error("Error fetching job requests:", error);
            return [];
        }
    },
    
    getWorkerJobs: async (workerId, status = null) => {
        try {
            // For demo purposes, uncomment this when API is available
            // let url = `${API_BASE_URL}jobs/worker/${workerId}`;
            // if (status) {
            //     url += `?status=${status}`;
            // }
            // const response = await axios.get(url, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data;
            
            // Simulated response for demo
            let jobs = [
                {
                    id: "job121",
                    title: "Water Heater Installation",
                    customer: "Rajesh Khanna",
                    location: "Greater Kailash, New Delhi",
                    price: 2500,
                    status: "completed",
                    date: "2025-04-14"
                },
                {
                    id: "job122",
                    title: "Bathroom Sink Repair",
                    customer: "Anil Kumar",
                    location: "Saket, New Delhi",
                    price: 900,
                    status: "completed",
                    date: "2025-04-08"
                },
                {
                    id: "job125",
                    title: "Leaky Faucet Repair",
                    customer: "Sanjay Gupta",
                    location: "Malviya Nagar, New Delhi",
                    price: 800,
                    status: "accepted",
                    date: "2025-04-18"
                }
            ];
            
            // Filter by status if provided
            if (status) {
                jobs = jobs.filter(job => job.status === status);
            }
            
            return jobs;
        } catch (error) {
            console.error("Error fetching worker jobs:", error);
            return [];
        }
    },
    
    acceptJob: async (jobId, workerId) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}jobs/accept`, {
            //     jobId,
            //     workerId
            // }, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log(`Job ${jobId} accepted by worker ${workerId}`);
            return true;
        } catch (error) {
            console.error("Error accepting job:", error);
            return false;
        }
    },
    
    rejectJob: async (jobId, workerId) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}jobs/reject`, {
            //     jobId,
            //     workerId
            // }, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log(`Job ${jobId} rejected by worker ${workerId}`);
            return true;
        } catch (error) {
            console.error("Error rejecting job:", error);
            return false;
        }
    },
    
    completeJob: async (jobId, workerId) => {
        try {
            // For demo purposes, uncomment this when API is available
            // const response = await axios.post(`${API_BASE_URL}jobs/complete`, {
            //     jobId,
            //     workerId
            // }, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // return response.data.success;
            
            console.log(`Job ${jobId} completed by worker ${workerId}`);
            return true;
        } catch (error) {
            console.error("Error completing job:", error);
            return false;
        }
    }
}; 