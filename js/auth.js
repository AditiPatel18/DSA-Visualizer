(function () {
    const STORAGE_KEYS = {
        rememberedEmail: 'dsa_remembered_email'
    };

    function getRootPath(target) {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const depth = Math.max(segments.length - 1, 0);
        return '../'.repeat(depth) + target;
    }

    function ensureSupabaseReady() {
        if (!window.SupabaseApp?.clientReady) {
            return { success: false, message: 'Supabase client is not configured yet. Add your project URL and anon key to the page.' };
        }
        return { success: true };
    }

    function validatePassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    }

    async function readCurrentUser() {
        const sessionResult = await window.SupabaseApp?.getCurrentSessionUser?.();
        return sessionResult?.user ? {
            id: sessionResult.user.id,
            email: sessionResult.user.email,
            username: sessionResult.profile?.full_name || sessionResult.profile?.username || sessionResult.user.user_metadata?.full_name || 'Student',
            createdAt: sessionResult.profile?.created_at || sessionResult.user.created_at || new Date().toISOString(),
            progress: sessionResult.profile?.progress || {},
            lastLogin: new Date().toISOString()
        } : null;
    }

    async function register({ username, email, password, rememberMe }) {
        const ready = ensureSupabaseReady();
        if (!ready.success) return ready;

        if (!username || !email || !password) {
            return { success: false, message: 'Please fill in all fields.' };
        }

        if (!validatePassword(password)) {
            return {
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
            };
        }

        try {
            const { data, error } = await window.SupabaseApp.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: username.trim(),
                        username: username.trim()
                    }
                }
            });

            if (error) throw error;
            if (data.user) {
                await window.SupabaseApp.ensureUserProfile(data.user, {
                    full_name: username.trim(),
                    username: username.trim(),
                    email
                });
                await window.SupabaseApp.saveLearningStats({
                    algorithms_learned: 0,
                    streak: 0,
                    active_days: 0,
                    total_hours: '0h 0m',
                    achievements: 0
                });
            }

            if (rememberMe) {
                localStorage.setItem(STORAGE_KEYS.rememberedEmail, email.trim().toLowerCase());
            } else {
                localStorage.removeItem(STORAGE_KEYS.rememberedEmail);
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message || 'Unable to create your account right now.' };
        }
    }

    async function login({ email, password, rememberMe }) {
        const ready = ensureSupabaseReady();
        if (!ready.success) return ready;

        try {
            const { data, error } = await window.SupabaseApp.client.auth.signInWithPassword({ email, password });
            if (error) throw error;

            if (rememberMe) {
                localStorage.setItem(STORAGE_KEYS.rememberedEmail, email.trim().toLowerCase());
            } else {
                localStorage.removeItem(STORAGE_KEYS.rememberedEmail);
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message || 'Unable to sign in right now.' };
        }
    }

    async function logout() {
        await window.SupabaseApp.client.auth.signOut();
        window.location.href = getRootPath('login.html');
    }

    function updateNavigation(user) {
        const loginLink = document.querySelector('.btn-login');
        const registerLink = document.querySelector('.btn-register');
        const logoutLink = document.getElementById('logoutBtn');

        if (user) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'inline-block';
        } else {
            if (loginLink) loginLink.style.display = 'inline-block';
            if (registerLink) registerLink.style.display = 'inline-block';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    function getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    async function protectRoute() {
        const page = getCurrentPage();
        const user = await readCurrentUser();
        const isProtected = page === 'dashboard.html' || page === 'profile.html';
        const isAuthPage = page === 'login.html' || page === 'register.html';

        if (isProtected && !user) {
            window.location.replace(getRootPath('login.html'));
            return null;
        }

        if (isAuthPage && user) {
            window.location.replace(getRootPath('dashboard.html'));
            return user;
        }

        return user;
    }

    function bindPasswordToggles() {
        const toggles = document.querySelectorAll('.toggle-password');
        toggles.forEach((toggle) => {
            toggle.addEventListener('click', function () {
                const container = this.closest('.password-input');
                const input = container?.querySelector('input');
                const icon = this.querySelector('i');
                if (!input || !icon) return;

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
    }

    function bindAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const logoutButtons = document.querySelectorAll('#logoutBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const email = document.getElementById('email')?.value || '';
                const password = document.getElementById('password')?.value || '';
                const rememberMe = document.getElementById('remember')?.checked || false;
                const result = await login({ email, password, rememberMe });

                if (result.success) {
                    window.location.href = getRootPath('dashboard.html');
                } else {
                    alert(result.message);
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const username = document.getElementById('username')?.value || '';
                const email = document.getElementById('email')?.value || '';
                const password = document.getElementById('password')?.value || '';
                const rememberMe = document.getElementById('remember')?.checked || false;
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';

                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                    return;
                }

                const result = await register({ username, email, password, rememberMe });
                if (result.success) {
                    window.location.href = getRootPath('dashboard.html');
                } else {
                    alert(result.message);
                }
            });
        }

        logoutButtons.forEach((button) => {
            button.addEventListener('click', async function (event) {
                event.preventDefault();
                await logout();
            });
        });
    }

    function populateRememberedEmail() {
        const emailField = document.getElementById('email');
        if (emailField) {
            const rememberedEmail = localStorage.getItem(STORAGE_KEYS.rememberedEmail);
            if (rememberedEmail) {
                emailField.value = rememberedEmail;
                const rememberBox = document.getElementById('remember');
                if (rememberBox) rememberBox.checked = true;
            }
        }
    }

    async function initializeProfilePage(user) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const fullName = document.getElementById('fullName');
        const userEmail = document.getElementById('userEmail');
        const joinDate = document.getElementById('joinDate');
        const editButton = document.querySelector('.btn-edit-profile');

        if (!user) return;

        const safeName = user.username || 'Student';
        const safeEmail = user.email || 'student@dsa.com';
        const createdAt = new Date(user.createdAt || Date.now());

        if (profileName) profileName.textContent = safeName;
        if (profileEmail) profileEmail.textContent = safeEmail;
        if (fullName) fullName.textContent = safeName;
        if (userEmail) userEmail.textContent = safeEmail;
        if (joinDate) {
            joinDate.textContent = createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (editButton) {
            editButton.addEventListener('click', async function () {
                const name = prompt('Enter your full name', safeName);
                const email = prompt('Enter your email address', safeEmail);
                if (!name && !email) return;

                const updatedProfile = await window.SupabaseApp.saveProfile({
                    full_name: name?.trim() || safeName,
                    username: name?.trim() || safeName,
                    email: email?.trim().toLowerCase() || safeEmail
                });

                if (updatedProfile) {
                    await initializeProfilePage({
                        ...user,
                        username: updatedProfile.full_name || updatedProfile.username || safeName,
                        email: updatedProfile.email || safeEmail,
                        createdAt: updatedProfile.created_at || user.createdAt
                    });
                }
            });
        }
    }

    async function init() {
        const user = await protectRoute();
        updateNavigation(user);
        bindPasswordToggles();
        bindAuthForms();
        populateRememberedEmail();

        if (user) {
            await initializeProfilePage(user);
        }
    }

    window.AuthApp = {
        init,
        register,
        login,
        logout,
        validatePassword,
        readCurrentUser,
        getRootPath
    };

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
})();
