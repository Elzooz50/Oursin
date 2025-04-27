// Main authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const signinContainer = document.getElementById('signinContainer');
    const welcomeContainer = document.getElementById('welcomeContainer');
    const welcomeName = document.getElementById('welcomeName');
    const welcomeStore = document.getElementById('welcomeStore');
    const signoutButton = document.getElementById('signoutButton');
    
    // Configuration - change to false for production use with real API
    const LOCAL_TESTING = true;
  
    // Check if user is already logged in
    checkAuthStatus();
  
    // Handle signin form submission
    if (signinForm) {
      signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        // Validate inputs
        if (!email || !password) {
          showError('Please fill in all fields');
          return;
        }
        
        // Send login request to API
        login(email, password);
      });
    }
  
    // Handle signout
    if (signoutButton) {
      signoutButton.addEventListener('click', function() {
        logout();
      });
    }
    
    // Function to show error messages
    function showError(message) {
      // Create error element if it doesn't exist
      let errorElement = document.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        signinForm.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  
    // Function to handle login
    function login(email, password) {
      if (LOCAL_TESTING) {
        // For local testing only - simulates a successful login
        console.log("Using local test mode - no API calls will be made");
        
        // Check if email and password match expected values
        if (email === "admin@gmail.com" && password === "Admin123") {
          // Use the token from your example
          const mockResponse = {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjFhMWZlNzM3LTkwNzctNGY5Yi1hNDdhLWVjNTAyN2JjZWY0YiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImFkbWluQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwiZXhwIjoxNzQ1OTcxOTgxLCJpc3MiOiJQcm9qZWN0MDEiLCJhdWQiOiJQcm9qZWN0MDEifQ.kKIVgokXQfoUPK0_tobsPcpwnrQHvIEx1HRtzZf2KyQ",
            isAdmin: true
          };
          
          // Store token in localStorage
          localStorage.setItem('authToken', mockResponse.token);
          localStorage.setItem('isAdmin', mockResponse.isAdmin);
          
          // Parse user info from token
          const user = parseJwt(mockResponse.token);

          window.location.href = "Dashboard.html";
          
          // Update UI
          showWelcomeScreen(user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]);
          
        } else {
          showError('Invalid email or password. Please try again.');
        }
      } else {
        // Production code - makes actual API call
        fetch('http://project01spiderx.runasp.net/api/Account/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Login failed');
          }
          return response.json();
        })
        .then(data => {
          // Store token in localStorage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('isAdmin', data.isAdmin);
          
          // Parse user info from token
          const user = parseJwt(data.token);
          
          // Update UI
          showWelcomeScreen(user.email);
        })
        .catch(error => {
          console.error('Error:', error);
          showError('Invalid email or password. Please try again.');
        });
      }
    }
  
    // Function to check authentication status
    function checkAuthStatus() {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Validate token (check expiration, etc.)
        try {
          const user = parseJwt(token);
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (user.exp && user.exp > currentTime) {
            // Token is valid
            showWelcomeScreen(user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]);
            return;
          }
        } catch (e) {
          console.error('Invalid token:', e);
        }
        
        // Token is invalid or expired
        logout();
      }
    }
  
    // Function to show welcome screen
    function showWelcomeScreen(email) {
      if (signinContainer) signinContainer.style.display = 'none';
      if (welcomeContainer) {
        welcomeContainer.style.display = 'block';
        
        // Extract username from email
        const username = email.split('@')[0];
        welcomeName.textContent = username;
        
        // Check if user is admin
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        welcomeStore.textContent = isAdmin ? 'Admin Dashboard' : 'Customer Portal';
      }
    }
  
    // Function to handle logout
    function logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAdmin');
      
      if (signinContainer) signinContainer.style.display = 'block';
      if (welcomeContainer) welcomeContainer.style.display = 'none';
      
      // Clear form fields
      if (document.getElementById('signin-email')) {
        document.getElementById('signin-email').value = '';
        document.getElementById('signin-password').value = '';
      }
      
      // Hide any error messages
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  
    // Function to parse JWT token
    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Error parsing JWT:', e);
        return {};
      }
    }
    
    
    function fillTestCredentials() {
      if (document.getElementById('signin-email') && document.getElementById('signin-password')) {
        document.getElementById('signin-email').value = 'admin@gmail.com';
        document.getElementById('signin-password').value = 'Admin123!';
      }
    }
  });