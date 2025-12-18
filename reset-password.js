const resetForm = document.getElementById('reset-form');

resetForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim().toLowerCase();
    const newPassword = document.getElementById('new-password').value;
    
    let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        // Update the password in the array
        users[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        alert("Password updated successfully! Please login.");
        window.location.href = 'login.html';
    } else {
        alert("Email not found. Please check your spelling or sign up.");
    }
});