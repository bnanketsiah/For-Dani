// js/auth.js - Firebase Authentication Manager (ES Module)

// Wait for Firebase to be available (loaded via CDN scripts in index.html)
function waitForFirebase(timeout = 8000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (window.firebase && window.firebase.auth) {
                resolve(window.firebase);
            } else if (Date.now() - start > timeout) {
                reject(new Error('Firebase not available after timeout'));
            } else {
                setTimeout(check, 150);
            }
        };
        check();
    });
}

async function initAuth() {
    try {
        const firebase = await waitForFirebase();

        // Initialize Firebase app if not already done
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp({
                apiKey: "AIzaSyExample",
                authDomain: "loveplanet.firebaseapp.com",
                projectId: "loveplanet",
                storageBucket: "loveplanet.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abc123"
            });
        }

        const auth = firebase.auth();

        // === UI ELEMENTS ===
        const userLogoContainer = document.getElementById('userLogoContainer');
        const userLogo = document.getElementById('userLogo');
        const userDropdown = document.getElementById('userDropdown');
        const userAvatar = document.getElementById('userAvatar');
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const logoutBtn = document.getElementById('logoutBtn');
        const googleLoginBtn = document.getElementById('googleLoginBtn');

        // Toggle dropdown on logo click
        if (userLogo) {
            userLogo.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userDropdown) {
                    userDropdown.style.display =
                        userDropdown.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (userDropdown) {
                userDropdown.style.display = 'none';
            }
        });

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await auth.signOut();
                    if (userDropdown) userDropdown.style.display = 'none';
                    console.log('✅ Signed out');
                } catch (error) {
                    console.error('❌ Sign out error:', error);
                }
            });
        }

        // Google Login handler
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', async () => {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    await auth.signInWithPopup(provider);
                } catch (error) {
                    console.error('❌ Google login error:', error);
                }
            });
        }

        // Auth state observer
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                if (userLogoContainer) {
                    userLogoContainer.style.display = 'block';
                    userLogoContainer.classList.remove('hidden');
                }
                if (googleLoginBtn) {
                    googleLoginBtn.style.display = 'none';
                    googleLoginBtn.classList.add('hidden');
                }

                // Set avatar and info
                const photoURL = user.photoURL ||
                    'https://anitamyworld-gamma.vercel.app/assets/images/planet.png';
                if (userLogo) userLogo.src = photoURL;
                if (userAvatar) userAvatar.src = photoURL;
                if (userNameEl) userNameEl.textContent = user.displayName || 'User';
                if (userEmailEl) userEmailEl.textContent = user.email || '';

                // Save user info for other modules
                localStorage.setItem('user_uid', user.uid);
                localStorage.setItem('customerEmail', user.email || '');

                console.log('✅ User signed in:', user.displayName || user.email);
            } else {
                // User signed out
                if (userLogoContainer) {
                    userLogoContainer.style.display = 'none';
                }
                if (googleLoginBtn) {
                    googleLoginBtn.style.display = 'flex';
                    googleLoginBtn.classList.remove('hidden');
                }
                localStorage.removeItem('user_uid');
                localStorage.removeItem('customerEmail');
                console.log('ℹ️ No user signed in');
            }
        });

        console.log('✅ Auth module initialized');
    } catch (error) {
        console.warn('⚠️ Auth module: Firebase not available, running without auth:', error.message);
        // App continues to work without auth - this is fine for local/offline use
    }
}

// Initialize auth when the module loads
initAuth();
