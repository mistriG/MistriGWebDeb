/**
 * MistriG Worker Dashboard JavaScript
 * Handles worker status toggling, location sharing, and other dashboard functionality
 */

// Constants
const API_BASE_URL_ORIGINAL = 'https://api.mistrig.com/v1'; // Original constant kept for backwards compatibility

// DOM Elements
let statusToggle;
let offlineStatus;
let onlineStatus;
let statusLoader;
let map;
let userMarker;
let currentWorkerId = 1; // Default worker ID for demo

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth('worker')) {
        return;
    }
    
    // Get DOM elements
    statusToggle = document.getElementById('statusToggle');
    offlineStatus = document.getElementById('offlineStatus');
    onlineStatus = document.getElementById('onlineStatus');
    statusLoader = document.getElementById('statusLoader');
    
    // Initialize map
    initializeMap();
    
    // Initialize status toggle
    initializeStatusToggle();
    
    // Initialize other dashboard components
    initializeUserDropdown();
    initializeJobActions();
    
    // Check for saved status
    const savedStatus = localStorage.getItem('workerStatus');
    if (savedStatus === 'online') {
        statusToggle.checked = true;
        updateStatusDisplay(true);
        startLocationSharing();
    }
    
    // Load job requests
    loadJobRequests();
});

/**
 * Load job requests from API and update UI
 */
async function loadJobRequests() {
    const jobRequests = await apiService.getJobRequests(currentWorkerId);
    const jobRequestsContainer = document.querySelector('.job-requests');
    
    if (jobRequestsContainer && jobRequests.length > 0) {
        // Clear existing content except the heading
        const heading = jobRequestsContainer.querySelector('h3');
        jobRequestsContainer.innerHTML = '';
        jobRequestsContainer.appendChild(heading);
        
        // Add job requests to container
        jobRequests.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.dataset.jobId = job.id;
            
            jobCard.innerHTML = `
                <h4>${job.title}</h4>
                <p><strong>Customer:</strong> ${job.customer}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Price:</strong> ₹${job.price}</p>
                <div class="job-actions">
                    <button class="btn-accept" data-job-id="${job.id}">Accept</button>
                    <button class="btn-reject" data-job-id="${job.id}">Reject</button>
                </div>
            `;
            
            jobRequestsContainer.appendChild(jobCard);
        });
        
        // Re-initialize job action buttons
        initializeJobActions();
    }
}

/**
 * Initialize the map component
 */
function initializeMap() {
    // Initialize map with default location (India)
    map = L.map('map').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

/**
 * Initialize the status toggle functionality
 */
function initializeStatusToggle() {
    if (!statusToggle) return;
    
    statusToggle.addEventListener('change', function() {
        // Show loader
        statusLoader.style.display = 'inline-block';
        
        const isOnline = this.checked;
        
        // Call API to update status
        updateWorkerStatus(isOnline)
            .then(() => {
                // Update UI based on status
                updateStatusDisplay(isOnline);
                
                // Handle location sharing based on status
                if (isOnline) {
                    startLocationSharing();
                } else {
                    stopLocationSharing();
                }
                
                // Save status to localStorage
                localStorage.setItem('workerStatus', isOnline ? 'online' : 'offline');
            })
            .catch(error => {
                console.error('Failed to update status:', error);
                
                // Revert toggle state on error
                this.checked = !isOnline;
                updateStatusDisplay(!isOnline);
                
                // Show error message
                alert('Failed to update your status. Please try again.');
            })
            .finally(() => {
                // Hide loader
                statusLoader.style.display = 'none';
            });
    });
}

/**
 * Update the UI to display current status
 * @param {boolean} isOnline - Whether the worker is online or offline
 */
function updateStatusDisplay(isOnline) {
    if (isOnline) {
        offlineStatus.style.display = 'none';
        onlineStatus.style.display = 'inline-block';
    } else {
        onlineStatus.style.display = 'none';
        offlineStatus.style.display = 'inline-block';
    }
}

/**
 * API call to update worker status
 * @param {boolean} isOnline - Whether the worker is online or offline
 * @returns {Promise} - Promise resolving when the status is updated
 */
function updateWorkerStatus(isOnline) {
    // Return a promise for handling async operations
    return new Promise((resolve, reject) => {
        console.log('Updating worker status:', isOnline ? 'Online' : 'Offline');
        
        // Create status update object
        const statusUpdate = new StatusUpdate(
            currentWorkerId,
            isOnline ? 'online' : 'offline'
        );
        
        // Call API service
        apiService.updateStatus(statusUpdate)
            .then(success => {
                if (success) {
                    resolve({ success: true, message: 'Status updated successfully' });
                } else {
                    reject(new Error('Failed to update status'));
                }
            })
            .catch(error => reject(error));
    });
}

/**
 * Start sharing the worker's location
 */
function startLocationSharing() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Center map on user location
                map.setView([lat, lng], 15);
                
                // Create custom pulsing marker
                const pulsingIcon = L.divIcon({
                    html: `
                        <div class="pulsing-marker">
                            <img src="${localStorage.getItem('userProfileImage') || 'https://randomuser.me/api/portraits/men/32.jpg'}" alt="Worker">
                        </div>
                    `,
                    className: 'worker-marker',
                    iconSize: [40, 40]
                });
                
                // Add marker to map
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                userMarker = L.marker([lat, lng], {
                    icon: pulsingIcon
                }).addTo(map);
                
                // Initial update of location to server
                updateWorkerLocation(lat, lng);
                
                // Watch position changes
                const watchId = navigator.geolocation.watchPosition(
                    function(position) {
                        const newLat = position.coords.latitude;
                        const newLng = position.coords.longitude;
                        
                        // Update marker position
                        userMarker.setLatLng([newLat, newLng]);
                        
                        // Update worker location in backend
                        updateWorkerLocation(newLat, newLng);
                    },
                    function(error) {
                        console.error('Error watching position:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 30000,
                        timeout: 27000
                    }
                );
                
                // Save watch ID for later cleanup
                localStorage.setItem('locationWatchId', watchId);
            },
            // Error callback
            function(error) {
                console.error('Error getting location:', error);
                
                let errorMessage = 'Unable to access your location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access was denied. Please enable location services to go online.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please try again later.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get your location timed out. Please try again.';
                        break;
                }
                
                // Alert the user
                alert(errorMessage);
                
                // Turn toggle back off
                statusToggle.checked = false;
                updateStatusDisplay(false);
                localStorage.setItem('workerStatus', 'offline');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        alert('Geolocation is not supported by this browser. You cannot go online without sharing your location.');
        
        // Turn toggle back off
        statusToggle.checked = false;
        updateStatusDisplay(false);
        localStorage.setItem('workerStatus', 'offline');
    }
}

/**
 * Stop sharing the worker's location
 */
function stopLocationSharing() {
    // Clear the watch position
    const watchId = localStorage.getItem('locationWatchId');
    if (watchId) {
        navigator.geolocation.clearWatch(Number(watchId));
        localStorage.removeItem('locationWatchId');
    }
    
    // Remove marker from map
    if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
}

/**
 * API call to update worker location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function updateWorkerLocation(lat, lng) {
    // Create location update object
    const locationUpdate = {
        id: currentWorkerId,
        latitude: lat,
        longitude: lng
    };
    
    // Call API service
    apiService.updateWorkerLocation(locationUpdate)
        .then(success => {
            if (success) {
                console.log('Location updated successfully:', lat, lng);
            } else {
                console.error('Failed to update location');
            }
        })
        .catch(error => console.error('Error updating location:', error));
}

/**
 * Initialize user profile dropdown
 */
function initializeUserDropdown() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', function() {
            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            dropdown.innerHTML = `
                <ul>
                    <li><a href="/src/pages/worker-profile.html">My Profile</a></li>
                    <li><a href="/src/pages/worker-settings.html">Settings</a></li>
                    <li><a href="#" id="logoutDropdownBtn">Logout</a></li>
                </ul>
            `;
            
            // Position the dropdown
            const rect = userProfileBtn.getBoundingClientRect();
            dropdown.style.position = 'absolute';
            dropdown.style.top = `${rect.bottom + 5}px`;
            dropdown.style.right = '20px';
            dropdown.style.backgroundColor = 'white';
            dropdown.style.borderRadius = '4px';
            dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            dropdown.style.zIndex = '1000';
            
            // Add styles for dropdown items
            const style = document.createElement('style');
            style.innerHTML = `
                .profile-dropdown ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .profile-dropdown li {
                    padding: 0;
                }
                .profile-dropdown a {
                    display: block;
                    padding: 10px 15px;
                    color: #333;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .profile-dropdown a:hover {
                    background: #f5f5f5;
                }
            `;
            document.head.appendChild(style);
            
            // Check if dropdown already exists and remove it
            const existingDropdown = document.querySelector('.profile-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
            } else {
                // Add dropdown to document
                document.body.appendChild(dropdown);
                
                // Add event listener for logout
                document.getElementById('logoutDropdownBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && e.target !== userProfileBtn) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }
        });
    }
    
    // Also initialize the main logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * Initialize job action buttons
 */
function initializeJobActions() {
    // Accept job buttons
    document.querySelectorAll('.btn-accept').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.dataset.jobId || this.closest('.job-card').dataset.jobId;
            const jobCard = this.closest('.job-card');
            const jobTitle = jobCard.querySelector('h4').textContent;
            
            // Show confirmation
            if (confirm(`Are you sure you want to accept the job: ${jobTitle}?`)) {
                // Add loading state
                this.textContent = 'Accepting...';
                this.disabled = true;
                
                // Call API to accept job
                apiService.acceptJob(jobId, currentWorkerId)
                    .then(success => {
                        if (success) {
                            // Update UI to show job accepted
                            jobCard.style.backgroundColor = '#e8f5e9';
                            jobCard.innerHTML = `
                                <h4>${jobTitle}</h4>
                                <p><strong>Status:</strong> <span style="color: #4CAF50;">Accepted</span></p>
                                <p>You have accepted this job. The customer has been notified.</p>
                                <p>Please check your <a href="worker-orders.html" style="color: #1a237e;">Orders page</a> for details.</p>
                            `;
                        } else {
                            // Show error message
                            alert('Failed to accept job. Please try again.');
                            this.textContent = 'Accept';
                            this.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Error accepting job:', error);
                        alert('Failed to accept job. Please try again.');
                        this.textContent = 'Accept';
                        this.disabled = false;
                    });
            }
        });
    });
    
    // Reject job buttons
    document.querySelectorAll('.btn-reject').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.dataset.jobId || this.closest('.job-card').dataset.jobId;
            const jobCard = this.closest('.job-card');
            const jobTitle = jobCard.querySelector('h4').textContent;
            
            // Show confirmation
            if (confirm(`Are you sure you want to reject the job: ${jobTitle}?`)) {
                // Add loading state
                this.textContent = 'Rejecting...';
                this.disabled = true;
                
                // Call API to reject job
                apiService.rejectJob(jobId, currentWorkerId)
                    .then(success => {
                        if (success) {
                            // Simply remove the card for demo purposes
                            jobCard.remove();
                        } else {
                            // Show error message
                            alert('Failed to reject job. Please try again.');
                            this.textContent = 'Reject';
                            this.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Error rejecting job:', error);
                        alert('Failed to reject job. Please try again.');
                        this.textContent = 'Reject';
                        this.disabled = false;
                    });
            }
        });
    });
}

/**
 * Logout the user
 */
function logout() {
    // Stop location sharing if active
    stopLocationSharing();
    
    // Clear local storage
    localStorage.removeItem('workerToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('workerStatus');
    localStorage.removeItem('locationWatchId');
    
    // Redirect to homepage
    window.location.href = '/';
}

/**
 * Update the dashboard with worker data
 * In a real app, this would fetch data from the API
 */
function updateDashboardWithWorkerData() {
    // This function would normally fetch the worker's data from the API
    // and update the dashboard UI accordingly
    
    // For demo purposes, we're using hardcoded data
    const workerData = {
        name: 'Rahul Sharma',
        profession: 'Plumber',
        completionRate: '97%',
        earningsGrowth: '+28%',
        achievement: 'Gold Partner',
        achievementDescription: 'Congratulations! You\'ve achieved Gold Partner status with 50+ completed jobs.',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    };
    
    // Update profile image and name if available
    document.querySelectorAll('.user-profile img').forEach(img => {
        img.src = workerData.profileImage;
    });
    
    document.querySelectorAll('.user-profile span').forEach(span => {
        span.textContent = workerData.name;
    });
}

/**
 * Register a new worker
 * This is a demo function to show how to register a new worker using the API
 * In a real application, this would be called from a registration form
 * @param {Object} workerData - The worker data
 * @returns {Promise} - Promise resolving when the worker is registered
 */
async function registerWorker(workerData = null) {
    try {
        // Use provided worker data or create default demo data
        const newWorkerData = workerData || {
            id: Math.floor(Math.random() * 1000) + 10, // Generate random ID for demo
            name: "Amit Patel",
            profession: "Plumber",
            phone: "+919876543210",
            latitude: 28.7041,
            longitude: 77.1025
        };
        
        // Create new worker request
        const newWorker = new NewWorkerRequest(
            newWorkerData.id,
            newWorkerData.name,
            newWorkerData.profession,
            newWorkerData.phone,
            newWorkerData.latitude,
            newWorkerData.longitude
        );
        
        // Call API service
        await apiService.addWorker(newWorker);
        console.log("Worker registered successfully:", newWorker);
        
        // In a real application, you might want to:
        // 1. Show a success message
        // 2. Redirect to login page
        // 3. Automatically log in the worker
        // 4. Update the UI to show the new worker
        
        return true;
    } catch (error) {
        console.error("Error registering worker:", error);
        return false;
    }
} 