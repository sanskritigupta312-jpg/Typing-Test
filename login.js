// login.js
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Sound feedback
const sound = new Audio('click.mp3');
sound.volume = 0.5;

loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page refresh
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // 1. Get the list of users from the "browser database"
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // 2. Try to find a user with this email AND password
    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (user) {
        // SUCCESS: Play sound and save session
        sound.play().catch(() => {});
        
        localStorage.setItem('sessionStatus', 'authenticated');
        localStorage.setItem('userName', user.username);

        // Redirect to home
        setTimeout(() => {
            window.location.href = 'home.html'; 
        }, 150);
    } else {
        // FAILURE: Check if the email exists at all
        const emailExists = registeredUsers.find(u => u.email === email);
        
        if (emailExists) {
            alert("Incorrect password. Try again or use 'Reset Password'.");
        } else {
            alert("No account found with this email. Please sign up first.");
            window.location.href = 'signup.html';
        }
    }
});