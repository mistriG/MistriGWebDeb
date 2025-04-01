// API Configuration
const API_URL = 'http://localhost:3002/api';

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
            
            return data;
        }
        throw new Error(data.message);
    } catch (error) {
        throw error;
    }
}

async function register(userData) {
    try {
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
            if (userData.fullname && userData.fullname.firstname) {
                localStorage.setItem('userFirstName', userData.fullname.firstname);
            }
            if (userData.email) {
                localStorage.setItem('userEmail', userData.email);
            }
            if (userData.mobileNumber) {
                localStorage.setItem('userMobileNumber', userData.mobileNumber);
            }
            
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
            
            return data;
        }
        throw new Error(data.message);
    } catch (error) {
        throw error;
    }
}

async function workerRegister(workerData) {
    try {
        const response = await fetch(`${API_URL}/workers/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workerData)
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('workerToken', data.token);
            localStorage.setItem('userType', 'worker');
            
            // Save first name for displaying in UI
            if (workerData.fullname && workerData.fullname.firstname) {
                localStorage.setItem('userFirstName', workerData.fullname.firstname);
            }
            
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
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
        try {
            if (form.id === 'loginForm') {
                await login(data.email, data.password);
                localStorage.setItem('userType', 'client');
                // Redirect to the intended page or dashboard
                const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard.html';
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } else if (form.id === 'workerLoginForm') {
                await workerLogin(data.email, data.password);
                // Redirect to the intended page or worker dashboard
                const redirectUrl = localStorage.getItem('redirectUrl') || '/worker-dashboard.html';
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } else if (form.id === 'registerForm') {
                await register({
                    fullname: {
                        firstname: data.firstname,
                        lastname: data.lastname
                    },
                    email: data.email,
                    password: data.password,
                    mobileNumber: data.mobileNumber
                });
                localStorage.setItem('userType', 'client');
                window.location.href = '/dashboard.html';
            } else if (form.id === 'workerRegisterForm') {
                await workerRegister({
                    fullname: {
                        firstname: data.firstname,
                        lastname: data.lastname
                    },
                    email: data.email,
                    password: data.password,
                    phoneNumber: data.phoneNumber,
                    profession: data.profession,
                    experience: Number(data.experience),
                    location: data.location,
                    bio: data.bio
                });
                window.location.href = '/worker-dashboard.html';
            } else if (form.id === 'hireForm') {
                if (!isClient()) {
                    localStorage.setItem('redirectUrl', '/src/pages/hire-workers.html');
                    window.location.href = '/src/pages/login.html';
                    return;
                }

                const response = await fetch(`${API_URL}/jobs/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        serviceType: data.serviceType,
                        location: data.location,
                        budget: data.budget,
                        date: data.date,
                        description: data.description
                    })
                });

                if (response.ok) {
                    alert('Job posted successfully!');
    form.reset();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
            }
        } catch (error) {
            alert(error.message);
        }
    });
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
            
            await workerRegister(workerData);
            window.location.href = '/worker-dashboard.html';
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
    const hireWorkersLink = navLinks.querySelector('a[href="/src/pages/hire-workers.html"]');

    if (checkAuth()) {
        // User is logged in, replace Join Now button with user info
        const userType = localStorage.getItem('userType');
        const dashboardUrl = userType === 'worker' ? '/worker-dashboard.html' : '/dashboard.html';
        
        // Create a new user profile element
        const userProfileElement = document.createElement('a');
        userProfileElement.href = dashboardUrl;
        userProfileElement.className = 'user-profile-link';
        
        // Try to get user name from localStorage if available
        const userFirstName = localStorage.getItem('userFirstName');
        userProfileElement.textContent = userFirstName ? `Hello, ${userFirstName}` : 'My Profile';
        
        // Replace the join button with the user profile element
        joinButton.parentElement.replaceChild(userProfileElement, joinButton);
        
        // Hide "Find Work" and "Hire Workers" links for logged in users as requested
        if (findWorkLink) findWorkLink.style.display = 'none';
        if (hireWorkersLink) hireWorkersLink.style.display = 'none';
        
        // Add logout button if it doesn't exist
        if (!navLinks.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear authentication data
                localStorage.removeItem('token');
                localStorage.removeItem('workerToken');
                localStorage.removeItem('userType');
                localStorage.removeItem('userFirstName');
                // Redirect to home page
                window.location.href = '/';
            });
            navLinks.appendChild(logoutBtn);
        }
    }
}



