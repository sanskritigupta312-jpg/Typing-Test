const signupForm = document.getElementById('signup-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const sound = new Audio('click.mp3');
sound.volume = 0.5;

signupForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const email = emailInput.value.trim().toLowerCase();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userExists = existingUsers.find(user => user.email === email);

    if (userExists) {
        alert("An account with this email already exists. Redirecting to login...");
        window.location.href = 'login.html';
        return;
    }

    sound.play().catch(() => {});

    // Save user with password
    existingUsers.push({ username, email, password });
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // Set session
    localStorage.setItem('sessionStatus', 'authenticated');
    localStorage.setItem('userName', username);

    setTimeout(() => {
        window.location.href = 'home.html'; 
    }, 150);
});