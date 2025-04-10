// API Configuration
const API_URL = 'http://localhost:3002/api';

// Global non-export version for direct script use
async function registerWorker(workerData) {
    try {
        // Restructure the data to match backend expectations
        const formattedData = {
            fullname: workerData.fullname,
            email: workerData.email,
            password: workerData.password,
            phoneNumber: workerData.phoneNumber || workerData.phone,
            profession: workerData.profession,
            experience: Number(workerData.experience),
            location: workerData.location,
            hourlyRate: Number(workerData.hourlyRate),
            bio: workerData.description || workerData.bio || '',
            skills: workerData.skills || []
        };

        // Add address if provided
        if (workerData.address) {
            formattedData.address = workerData.address;
        }

        console.log('Sending worker registration data:', JSON.stringify(formattedData));
        
        const response = await fetch(`${API_URL}/workers/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Clear any existing tokens or user data
            localStorage.removeItem('token');
            localStorage.removeItem('workerToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userFirstName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userMobileNumber');
            
            // Set new worker information
            localStorage.setItem('workerToken', data.token);
            localStorage.setItem('userType', 'worker');
            
            // Save worker data for displaying in UI
            if (data.worker && data.worker.fullname && data.worker.fullname.firstname) {
                localStorage.setItem('userFirstName', data.worker.fullname.firstname);
            } else if (formattedData.fullname && formattedData.fullname.firstname) {
                localStorage.setItem('userFirstName', formattedData.fullname.firstname);
            }
            
            if (data.worker && data.worker.fullname && data.worker.fullname.lastname) {
                localStorage.setItem('userLastName', data.worker.fullname.lastname);
            } else if (formattedData.fullname && formattedData.fullname.lastname) {
                localStorage.setItem('userLastName', formattedData.fullname.lastname);
            }
            
            if (data.worker && data.worker.email) {
                localStorage.setItem('userEmail', data.worker.email);
            } else {
                localStorage.setItem('userEmail', formattedData.email);
            }

            if (data.worker && data.worker.phoneNumber) {
                localStorage.setItem('userMobileNumber', data.worker.phoneNumber);
            } else if (formattedData.phoneNumber) {
                localStorage.setItem('userMobileNumber', formattedData.phoneNumber);
            }
            
            if (data.worker && data.worker.location) {
                localStorage.setItem('location', data.worker.location);
                localStorage.setItem('userLocation', data.worker.location);
            } else if (formattedData.location) {
                localStorage.setItem('location', formattedData.location);
                localStorage.setItem('userLocation', formattedData.location);
            }
            
            if (data.worker && data.worker.profession) {
                localStorage.setItem('profession', data.worker.profession);
            } else if (formattedData.profession) {
                localStorage.setItem('profession', formattedData.profession);
            }
            
            if (data.worker && data.worker.experience) {
                localStorage.setItem('experience', data.worker.experience.toString());
            } else if (formattedData.experience) {
                localStorage.setItem('experience', formattedData.experience.toString());
            }
            
            if (data.worker && data.worker.hourlyRate) {
                localStorage.setItem('hourlyRate', data.worker.hourlyRate.toString());
            } else if (formattedData.hourlyRate) {
                localStorage.setItem('hourlyRate', formattedData.hourlyRate.toString());
            }
            
            if (data.worker && data.worker.profileImage) {
                localStorage.setItem('userProfileImage', data.worker.profileImage);
            } else {
                // Set default profile image
                localStorage.setItem('userProfileImage', 'https://randomuser.me/api/portraits/men/32.jpg');
            }
            
            // Set default worker status
            localStorage.setItem('workerStatus', 'offline');
            
            console.log('Worker registered successfully:', data.worker ? data.worker.fullname : formattedData.fullname);
            
            // Log all localStorage for debugging
            console.log('localStorage contents after registration:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`${key}: ${localStorage.getItem(key)}`);
            }
            
            window.location.href = '/src/pages/worker-dashboard.html';
            return data;
        }
        
        // Handle validation errors array from backend
        if (data.errors && Array.isArray(data.errors)) {
            const errorMessage = data.errors.map(err => err.msg).join('\n');
            throw new Error(errorMessage);
        }
        
        throw new Error(data.message || 'Registration failed');
    } catch (error) {
        console.error('Worker registration error:', error);
        throw error;
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const workerToken = localStorage.getItem('workerToken');
    const userType = localStorage.getItem('userType');
    
    // For pages that just need any authentication
    if (token || workerToken) {
        return true;
    }
    return false;
}


// Check if user is a client
function isClient() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    return token && (!userType || userType === 'client');
}

// Check if user is a worker
function isWorker() {
    const workerToken = localStorage.getItem('workerToken');
    const userType = localStorage.getItem('userType');
    return workerToken && userType === 'worker';
}

// Load worker information from localStorage and update UI elements
function loadWorkerInfo() {
    // Get all worker data from localStorage
    const userFirstName = localStorage.getItem('userFirstName') || '';
    const userLastName = localStorage.getItem('userLastName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userMobileNumber = localStorage.getItem('userMobileNumber') || '';
    const userLocation = localStorage.getItem('userLocation') || '';
    const profession = localStorage.getItem('profession') || '';
    const experience = localStorage.getItem('experience') || '0';
    const hourlyRate = localStorage.getItem('hourlyRate') || '';
    const userBio = localStorage.getItem('userBio') || '';
    
    // Combine first and last name if both exist
    const userFullName = userFirstName + (userLastName ? ` ${userLastName}` : '');
    
    console.log('Loading worker info - Name:', userFullName);
    console.log('Loading worker info - Profession:', profession);
    
    // Update user name in header
    const userProfileName = document.getElementById('userProfileName');
    if (userProfileName) {
        userProfileName.textContent = userFullName || 'Worker';
    }
    
    // Update user name in dashboard welcome (if exists)
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userFirstName || 'Worker';
    }
    
    // Update profession display (if exists)
    const professionElement = document.getElementById('userProfession');
    if (professionElement) {
        professionElement.textContent = profession.charAt(0).toUpperCase() + profession.slice(1) || 'Professional';
    }
    
    // Update location display (if exists)
    const locationElement = document.getElementById('userLocation');
    if (locationElement) {
        locationElement.textContent = userLocation.charAt(0).toUpperCase() + userLocation.slice(1) || 'Your Location';
    }
    
    // Update experience display (if exists)
    const experienceElement = document.getElementById('userExperience');
    if (experienceElement) {
        const expYears = parseInt(experience);
        experienceElement.textContent = expYears > 0 ? `${expYears} Years` : 'Entry Level';
    }
    
    // Update hourly rate display (if exists)
    const hourlyRateElement = document.getElementById('userHourlyRate');
    if (hourlyRateElement) {
        hourlyRateElement.textContent = hourlyRate ? `₹${hourlyRate}/hr` : 'Not Set';
    }
    
    // Update bio display (if exists)
    const bioElement = document.getElementById('userBio');
    if (bioElement) {
        bioElement.textContent = userBio || 'No bio provided';
    }
    
    // Update profile image if available (if exists)
    const userProfileImage = localStorage.getItem('userProfileImage') || sessionStorage.getItem('userProfileImage');
    
    // Look for all profile image elements with common IDs
    const profileImageSelectors = [
        '#userProfileImage',
        '#profilePicturePreview',
        '.worker-profile-image',
        '.profile-image'
    ];
    
    if (userProfileImage) {
        profileImageSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.src !== userProfileImage) {
                    element.src = userProfileImage;
                    console.log(`Updated profile image for element ${selector}`);
                }
            });
        });
    } else {
        // Set default avatar if no profile image is available
        const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';
        profileImageSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.src || element.src.includes('randomuser.me')) {
                    element.src = defaultAvatar;
                }
            });
        });
    }
    
    // Update worker profile full name (if exists)
    const workerProfileFullName = document.getElementById('workerProfileFullName');
    if (workerProfileFullName) {
        workerProfileFullName.textContent = userFullName || 'Worker';
    }
    
    // Update worker full name in profile (if exists)
    const workerFullName = document.getElementById('workerFullName');
    if (workerFullName) {
        workerFullName.textContent = userFullName || 'Not Available';
    }
    
    // Update worker email in profile (if exists)
    const workerEmail = document.getElementById('workerEmail');
    if (workerEmail) {
        workerEmail.textContent = userEmail || 'Not Available';
    }
    
    // Update worker phone number in profile (if exists)
    const workerPhone = document.getElementById('workerPhone');
    if (workerPhone) {
        workerPhone.textContent = userMobileNumber || 'Not Available';
    }
    
    // Update worker stats cards with the latest information
    updateWorkerStats();
}

// Function to update worker stats based on registration data
function updateWorkerStats() {
    const profession = localStorage.getItem('profession') || '';
    const experience = localStorage.getItem('experience') || '0';
    const hourlyRate = localStorage.getItem('hourlyRate') || '0';
    
    // Update profession card if it exists
    const professionCard = document.querySelector('.stat-card-profession');
    if (professionCard) {
        const professionValue = professionCard.querySelector('.stat-value');
        if (professionValue) {
            professionValue.textContent = profession.charAt(0).toUpperCase() + profession.slice(1) || 'Professional';
        }
    }
    
    // Update experience card if it exists
    const experienceCard = document.querySelector('.stat-card-experience');
    if (experienceCard) {
        const experienceValue = experienceCard.querySelector('.stat-value');
        if (experienceValue) {
            const expYears = parseInt(experience);
            experienceValue.textContent = expYears > 0 ? `${expYears} Years` : 'Entry Level';
        }
    }
    
    // Update hourly rate card if it exists
    const rateCard = document.querySelector('.stat-card-rate');
    if (rateCard) {
        const rateValue = rateCard.querySelector('.stat-value');
        if (rateValue) {
            rateValue.textContent = hourlyRate ? `₹${hourlyRate}/hr` : 'Not Set';
        }
    }
    
    // Update stats in any other cards that might exist
    const completedJobsCard = document.querySelector('.stat-card-completed');
    if (completedJobsCard) {
        const completedValue = completedJobsCard.querySelector('.stat-value');
        if (completedValue && !completedValue.dataset.realValue) {
            // Only update if it doesn't have real data
            completedValue.textContent = '0';
        }
    }
    
    const earningsCard = document.querySelector('.stat-card-earnings');
    if (earningsCard) {
        const earningsValue = earningsCard.querySelector('.stat-value');
        if (earningsValue && !earningsValue.dataset.realValue) {
            // Only update if it doesn't have real data
            earningsValue.textContent = '₹0';
        }
    }
    
    const ratingCard = document.querySelector('.stat-card-rating');
    if (ratingCard) {
        const ratingValue = ratingCard.querySelector('.stat-value');
        if (ratingValue && !ratingValue.dataset.realValue) {
            // Only update if it doesn't have real data
            ratingValue.textContent = 'No Ratings';
        }
    }
}

// Redirect to appropriate login if not authenticated
function requireAuth(type = 'any') {
    if (type === 'worker' && !isWorker()) {
        window.location.href = '/src/pages/worker-login.html';
        return false;
    } else if (type === 'client' && !isClient()) {
        window.location.href = '/src/pages/login.html';
        return false;
    } else if (type === 'any' && !checkAuth()) {
        // If coming from find-work, direct to worker login, otherwise client login
        if (window.location.pathname.includes('find-work')) {
            window.location.href = '/src/pages/worker-login.html';
        } else {
            window.location.href = '/src/pages/login.html';
        }
        return false;
    }
    return true;
}

// Authentication functions
async function login(email, password) {
    try {
        // Clear any existing tokens and data first
        localStorage.removeItem('token');
        localStorage.removeItem('workerToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userMobileNumber');

        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'client');
            
            // Save user data for displaying in UI
            if (data.user && data.user.fullname && data.user.fullname.firstname) {
                localStorage.setItem('userFirstName', data.user.fullname.firstname);
            }
            if (data.user && data.user.email) {
                localStorage.setItem('userEmail', data.user.email);
            }
            if (data.user && data.user.mobileNumber) {
                localStorage.setItem('userMobileNumber', data.user.mobileNumber);
            }
            
            console.log('Client logged in successfully:', data.user ? data.user.fullname : email);
            return data;
        }
        throw new Error(data.message);
    } catch (error) {
        throw error;
    }
}

async function register(userData) {
    try {
        // Clear any existing tokens and data first
        localStorage.removeItem('token');
        localStorage.removeItem('workerToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userMobileNumber');

        console.log('Sending registration data:', JSON.stringify(userData));
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'client');
            
            // Save user data for displaying in UI
            if (data.user && data.user.fullname && data.user.fullname.firstname) {
                localStorage.setItem('userFirstName', data.user.fullname.firstname);
            } else if (userData.fullname && userData.fullname.firstname) {
                localStorage.setItem('userFirstName', userData.fullname.firstname);
            }
            
            if (data.user && data.user.email) {
                localStorage.setItem('userEmail', data.user.email);
            } else if (userData.email) {
                localStorage.setItem('userEmail', userData.email);
            }
            
            if (data.user && data.user.mobileNumber) {
                localStorage.setItem('userMobileNumber', data.user.mobileNumber);
            } else if (userData.mobileNumber) {
                localStorage.setItem('userMobileNumber', userData.mobileNumber);
            }
            
            console.log('Client registered successfully:', data.user ? data.user.fullname : userData.fullname);
            return data;
        }
        // Handle validation errors array from backend
        if (data.errors && Array.isArray(data.errors)) {
            const errorMessage = data.errors.map(err => err.msg).join('\n');
            throw new Error(errorMessage);
        }
        throw new Error(data.message || 'Registration failed');
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Worker Authentication functions
async function workerLogin(email, password) {
    try {
        // Clear any existing tokens and data first
        localStorage.removeItem('token');
        localStorage.removeItem('workerToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userMobileNumber');

        const response = await fetch(`${API_URL}/workers/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            // Set worker token and user type
            localStorage.setItem('workerToken', data.token);
            localStorage.setItem('userType', 'worker');
            
            // Save worker info for UI display
            if (data.worker && data.worker.fullname && data.worker.fullname.firstname) {
                localStorage.setItem('userFirstName', data.worker.fullname.firstname);
            }
            if (data.worker && data.worker.email) {
                localStorage.setItem('userEmail', data.worker.email);
            }
            if (data.worker && data.worker.phoneNumber) {
                localStorage.setItem('userMobileNumber', data.worker.phoneNumber);
            }
            
            console.log('Worker logged in successfully:', data.worker ? data.worker.fullname : email);
            return data;
        }
        throw new Error(data.message);
    } catch (error) {
        throw error;
    }
}

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const spans = mobileMenuBtn.querySelectorAll('span');
  spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : '';
  spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
  spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(6px, -6px)' : '';
});
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
  // Update navigation to reflect logged-in status
  updateNavigation();
  
  // Set up hero button to scroll to services
  const hireWorkerHeroBtn = document.querySelector('.hero-buttons .btn-primary');
  if (hireWorkerHeroBtn) {
    hireWorkerHeroBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const servicesSection = document.querySelector('.services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If on a different page, redirect to the homepage services section
        window.location.href = '/#services';
      }
    });
  }
  
  // Make service cards clickable
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0) {
    serviceCards.forEach(card => {
      card.style.cursor = 'pointer';
      
      card.addEventListener('click', function() {
        // Get the service type from the card's heading
        const serviceType = card.querySelector('h3').innerText.split(' ')[0].toLowerCase();
        
        // Redirect to map page with service type as query parameter
        if (checkAuth()) {
          window.location.href = '/src/pages/map.html?service=' + serviceType;
        } else {
          // If not logged in, redirect to login page first
          localStorage.setItem('redirectAfterLogin', '/src/pages/map.html?service=' + serviceType);
          window.location.href = '/src/pages/login.html';
        }
      });
    });
  }
  
  // If on map page, check for service parameter and activate the correct filter
  if (window.location.pathname.includes('/map.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    
    if (service) {
      // Find and click the appropriate filter button
      setTimeout(() => {
        const filterButton = document.querySelector(`.filter-button[data-service="${service}"]`);
        if (filterButton) {
          filterButton.click();
        }
      }, 1000); // Small delay to ensure the map has loaded
    }
  }
});

// Form Submission Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Get forms by ID instead of selecting all forms
    const loginForm = document.getElementById('loginForm');
    const workerLoginForm = document.getElementById('workerLoginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Handle client login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                await login(email, password);
                // Redirect to the intended page or dashboard
                const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard.html';
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } catch (error) {
                alert(error.message || 'Login failed. Please check your credentials.');
            }
        });
    }
    
    // Handle worker login form
    if (workerLoginForm) {
        workerLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                await workerLogin(email, password);
                // Redirect to the intended page or worker dashboard
                const redirectUrl = localStorage.getItem('redirectUrl') || '/src/pages/worker-dashboard.html';
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } catch (error) {
                alert(error.message || 'Login failed. Please check your credentials.');
            }
        });
    }
    
    // Handle client registration form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const firstname = document.getElementById('firstname').value;
                const lastname = document.getElementById('lastname').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const mobileNumber = document.getElementById('mobileNumber').value;
                
                if (!firstname || !lastname || !email || !password || !mobileNumber) {
                    throw new Error('Please fill in all required fields');
                }
                
                const userData = {
                    fullname: {
                        firstname: firstname,
                        lastname: lastname
                    },
                    email: email,
                    password: password,
                    mobileNumber: mobileNumber
                };
                
                await register(userData);
                localStorage.setItem('userType', 'client');
                window.location.href = '/dashboard.html';
            } catch (error) {
                alert(error.message || 'Registration failed. Please try again.');
            }
        });
    }
});

// Handle protected route clicks
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a worker protected page
    if (window.location.pathname.includes('find-work.html')) {
        if (!isWorker()) {
            localStorage.setItem('redirectUrl', window.location.pathname);
            window.location.href = '/src/pages/worker-login.html';
            return;
        }
    }
    
    // Check if we're on a client protected page
    if (window.location.pathname.includes('hire-workers.html')) {
        if (!isClient()) {
            localStorage.setItem('redirectUrl', window.location.pathname);
            window.location.href = '/src/pages/login.html';
            return;
        }
    }

    // Protect worker-specific links
    const workerLinks = document.querySelectorAll('a[href*="find-work.html"]');
    workerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isWorker()) {
                e.preventDefault();
                localStorage.setItem('redirectUrl', link.getAttribute('href'));
                window.location.href = '/src/pages/worker-login.html';
            }
        });
    });
    
    // Protect client-specific links
    const clientLinks = document.querySelectorAll('a[href*="hire-workers.html"]');
    clientLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isClient()) {
                e.preventDefault();
                localStorage.setItem('redirectUrl', link.getAttribute('href'));
                window.location.href = '/src/pages/login.html';
            }
        });
    });

    // Update navigation based on login status
    updateNavigation();
});

// Intersection Observer for Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Add animation to sections
document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'all 0.6s ease-out';
  observer.observe(section);
});

// Service Cards Hover Effect
document.querySelectorAll('.service-card, .job-card, .category-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});

// Location and Worker Finding functionality
// Remove the import statement that's causing errors
// import lottie from 'lottie-web';

// Initialize location modal and animation
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('locationModal');
    const allowBtn = document.getElementById('allowLocation');
    const denyBtn = document.getElementById('denyLocation');
    const animationContainer = document.getElementById('locationAnimation');

    if (animationContainer) {
        // Simple CSS animation instead of lottie
        animationContainer.innerHTML = '<div class="pulsing-dot"></div>';
    }

    // Handle category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        const findButton = card.querySelector('.btn-primary');
        if (findButton) {
            findButton.addEventListener('click', (e) => {
                e.preventDefault();
                const profession = card.dataset.profession;
                if (modal) modal.classList.add('active');
            });
        }
    });

    // Handle location permission
    if (allowBtn) {
        allowBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
            requestLocation();
        });
    }

    if (denyBtn) {
        denyBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }
});

// Function to request location
function requestLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Show loading animation
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay active';
                loadingOverlay.innerHTML = '<div class="animation-container"></div>';
                document.body.appendChild(loadingOverlay);

                try {
                    // Here you would typically make an API call to find workers
                    // const response = await fetch(`${API_URL}/workers/nearby`, {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
                    //     },
                    //     body: JSON.stringify({
                    //         latitude: position.coords.latitude,
                    //         longitude: position.coords.longitude
                    //     })
                    // });
                    
                    // Simulate API call for now
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    loadingOverlay.remove();
                    alert('Workers found in your area! We\'ll connect you with them shortly.');
                } catch (error) {
                    loadingOverlay.remove();
                    alert('Error finding workers. Please try again later.');
                }
            },
            (error) => {
                alert('Unable to access location. Please try again or enter your location manually.');
            }
        );
    } else {
        alert('Location services are not available in your browser.');
    }
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const error = formGroup.querySelector('.error');
    input.classList.add('error');
    error.textContent = message;
    error.style.display = 'block';
}

function clearError(input) {
    const formGroup = input.parentElement;
    const error = formGroup.querySelector('.error');
    input.classList.remove('error');
    error.style.display = 'none';
}

// Worker Registration form validation
const workerRegisterForm = document.getElementById('workerRegisterForm');
if (workerRegisterForm) {
    workerRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form inputs
        const firstname = document.getElementById('firstname');
        const lastname = document.getElementById('lastname');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const phoneNumber = document.getElementById('phoneNumber');
        const profession = document.getElementById('profession');
        const experience = document.getElementById('experience');
        const location = document.getElementById('location');
        const bio = document.getElementById('bio');
        
        // Clear previous errors
        [firstname, lastname, email, password, confirmPassword, phoneNumber, profession, experience, location, bio].forEach(input => {
            if (input) clearError(input);
        });
        
        // Validate inputs
        let isValid = true;
        
        if (firstname && !firstname.value.trim()) {
            showError(firstname, 'Please enter your first name');
            isValid = false;
        }
        
        if (lastname && !lastname.value.trim()) {
            showError(lastname, 'Please enter your last name');
            isValid = false;
        }
        
        if (email && !validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (password && !validatePassword(password.value)) {
            showError(password, 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        if (confirmPassword && password && password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
        
        if (phoneNumber && !phoneNumber.value.trim()) {
            showError(phoneNumber, 'Please enter your phone number');
            isValid = false;
        }
        
        if (profession && profession.value === '') {
            showError(profession, 'Please select your profession');
            isValid = false;
        }
        
        if (experience && (experience.value === '' || experience.value < 0)) {
            showError(experience, 'Please enter valid years of experience');
            isValid = false;
        }
        
        if (location && !location.value.trim()) {
            showError(location, 'Please enter your location');
            isValid = false;
        }
        
        if (!isValid) return;
        
        try {
            const workerData = {
                fullname: {
                    firstname: firstname.value.trim(),
                    lastname: lastname.value.trim()
                },
                email: email.value.trim(),
                password: password.value,
                phoneNumber: phoneNumber ? phoneNumber.value.trim() : '',
                profession: profession ? profession.value : '',
                experience: experience ? Number(experience.value) : 0,
                location: location ? location.value.trim() : '',
                bio: bio ? bio.value.trim() : ''
            };
            
            await registerWorker(workerData);
        } catch (error) {
            alert(error.message);
        }
    });
}

// Function to update navigation based on login status
function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const joinButton = navLinks.querySelector('a[href="/src/pages/login.html"]');
    if (!joinButton) return;

    // Find the "Find Work" and "Hire Workers" navigation links
    const findWorkLink = navLinks.querySelector('a[href="/src/pages/find-work.html"]');
    const hireWorkersLink = navLinks.querySelector('a[href*="hire-workers.html"], a[href*="/#services"]');

    if (checkAuth()) {
        // User is logged in, replace Join Now button with user info
        const userType = localStorage.getItem('userType');
        const dashboardUrl = userType === 'worker' ? '/src/pages/worker-dashboard.html' : '/dashboard.html';
        
        // Create a new user profile element
        const userProfileElement = document.createElement('a');
        userProfileElement.href = dashboardUrl;
        userProfileElement.className = 'user-profile-link';
        
        // Try to get user name from localStorage if available
        const userFirstName = localStorage.getItem('userFirstName');
        userProfileElement.textContent = userFirstName ? `Hello, ${userFirstName}` : 'My Profile';
        
        // Replace the join button with the user profile element
        joinButton.parentElement.replaceChild(userProfileElement, joinButton);
        
        // Show/hide appropriate links based on user type
        if (findWorkLink) {
            findWorkLink.style.display = userType === 'worker' ? 'block' : 'none';
        }
        
        if (hireWorkersLink) {
            hireWorkersLink.style.display = userType === 'client' ? 'block' : 'none';
        }
        
        // Add logout button if it doesn't exist
        if (!navLinks.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Use our proper logout function
                logout();
            });
            navLinks.appendChild(logoutBtn);
        }
    } else {
        // User is not logged in, show appropriate links
        if (findWorkLink) findWorkLink.style.display = 'block';
        if (hireWorkersLink) hireWorkersLink.style.display = 'block';
        
        // Remove logout button if it exists
        const logoutBtn = navLinks.querySelector('.logout-btn');
        if (logoutBtn) {
            navLinks.removeChild(logoutBtn);
        }
    }
}

// Add a proper logout function
export function logout() {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('workerToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobileNumber');
    localStorage.removeItem('redirectUrl');
    localStorage.removeItem('redirectAfterLogin');
    
    // Redirect to home page
    window.location.href = '/';
}



