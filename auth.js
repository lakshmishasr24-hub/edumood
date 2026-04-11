import { createUserWithEmailAndPassword, signInWithEmailAndPassword, browserSessionPersistence, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const btnShowSignup = document.getElementById('show-signup');
    const btnShowLogin = document.getElementById('show-login');
    const errorBanner = document.getElementById('auth-error');
    const errorText = document.getElementById('auth-error-text');

    // On load, check if already signed in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'index.html';
        }
    });

    // Password Toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            const icon = e.currentTarget.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Form Toggles
    btnShowSignup.addEventListener('click', () => {
        hideError();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    btnShowLogin.addEventListener('click', () => {
        hideError();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    function showError(message) {
        errorText.textContent = message;
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
            btn.classList.add('opacity-80', 'cursor-not-allowed');
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalHtml;
            btn.classList.remove('opacity-80', 'cursor-not-allowed');
            btn.disabled = false;
        }
    }

    // ------------------------------------
    // Firebase Auth Logic
    // ------------------------------------

    // Signup Logic
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        if (!name || !email || !password || !confirm) {
            showError("All fields are required.");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirm) {
            showError("Passwords do not match.");
            return;
        }

        try {
            setLoading(submitBtn, true);
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });

            // Redirect will happen automatically via onAuthStateChanged
        } catch (error) {
            setLoading(submitBtn, false);
            if (error.code === 'auth/email-already-in-use') {
                showError("An account with this email already exists.");
            } else {
                showError("Signup failed: " + error.message);
            }
        }
    });

    // Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('login-remember').checked;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            showError("Email and password are required.");
            return;
        }

        try {
            setLoading(submitBtn, true);
            // Set persistence based on "Remember me"
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect happens via onAuthStateChanged
        } catch (error) {
            setLoading(submitBtn, false);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showError("Invalid email or password.");
            } else {
                showError("Login failed: " + error.message);
            }
        }
    });
});
