// auth.js
import { saveData } from './data.js';
import { showNotification } from './ui.js';

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isSignup = false;

export function setupAuth() {
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const nameField = document.getElementById('nameField');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const authName = document.getElementById('authName');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authToggle = document.getElementById('authToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  // Toggle between signup and login
  authToggle.addEventListener('click', e => {
    e.preventDefault();
    isSignup = !isSignup;
    authTitle.textContent = isSignup ? 'Sign Up' : 'Login';
    nameField.style.display = isSignup ? 'block' : 'none';
    authSubmitBtn.textContent = isSignup ? 'Sign Up' : 'Login';
    authToggle.innerHTML = isSignup
      ? 'Already have an account? <a href="#">Login</a>'
      : "Don't have an account? <a href='#'>Sign up</a>";
  });

  // Handle form submit
  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value.trim();

    if (isSignup) {
      const name = authName.value.trim();
      if (!name || !email || !password)
        return alert('Please fill all fields.');

      if (users.some(u => u.email === email))
        return alert('User already exists.');

      const newUser = {
        name,
        email,
        password,
        role: users.length === 0 ? 'admin' : 'member',
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Account created successfully! You can now log in.');
      isSignup = false;
      authTitle.textContent = 'Login';
      nameField.style.display = 'none';
      authSubmitBtn.textContent = 'Login';
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return alert('Invalid email or password.');

      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      authModal.style.display = 'none';
      document.querySelector('main').style.display = 'block';
      document.querySelector('header').style.display = 'flex';
      document.querySelector('.sidebar').style.display = 'flex';
      alert(`Welcome, ${user.name}!`);
    }
    authForm.reset();
  });

  // Logout
  logoutBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('currentUser');
      location.reload();
    }
  });

  // Check login on load
  window.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
      document.querySelector('main').style.display = 'none';
      document.querySelector('header').style.display = 'none';
      document.querySelector('.sidebar').style.display = 'none';
      authModal.style.display = 'flex';
    } else {
      authModal.style.display = 'none';
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}
