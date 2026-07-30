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

    function validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email.trim());
    }

    function validatePassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    }

    async function readCurrentUser() {
        const sessionResult = await window.SupabaseApp?.getCurrentSessionUser?.();
        if (!sessionResult?.user) return null;

        let stats = null;
        if (window.SupabaseApp?.loadLearningStats) {
            stats = await window.SupabaseApp.loadLearningStats(sessionResult.user.id);
        }

        return {
            id: sessionResult.user.id,
            email: sessionResult.user.email,
            username: sessionResult.profile?.full_name || sessionResult.profile?.username || sessionResult.user.user_metadata?.full_name || sessionResult.user.email?.split('@')[0] || 'Student',
            createdAt: sessionResult.profile?.created_at || sessionResult.user.created_at || new Date().toISOString(),
            progress: {
                algorithmsLearned: stats?.algorithms_learned ?? 0,
                streak: stats?.streak ?? 0,
                activeDays: stats?.active_days ?? 0,
                totalHours: stats?.total_hours || '0h 0m',
                achievements: stats?.achievements ?? 0
            },
            lastLogin: sessionResult.user.last_sign_in_at || new Date().toISOString()
        };
    }

    async function register({ username, email, password, rememberMe }) {
        const ready = ensureSupabaseReady();
        if (!ready.success) return ready;

        const cleanUsername = (username || '').trim();
        const cleanEmail = (email || '').trim();

        if (!cleanUsername || !cleanEmail || !password) {
            return { success: false, message: 'Please fill in all fields.' };
        }

        if (!validateEmail(cleanEmail)) {
            return { success: false, message: 'Email address is invalid.' };
        }

        if (!validatePassword(password)) {
            return {
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
            };
        }

        try {
            const { data, error } = await window.SupabaseApp.client.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    data: {
                        full_name: cleanUsername,
                        username: cleanUsername
                    }
                }
            });

            if (error) throw error;
            if (data.user) {
                await window.SupabaseApp.ensureUserProfile(data.user, {
                    full_name: cleanUsername,
                    username: cleanUsername,
                    email: cleanEmail
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
                localStorage.setItem(STORAGE_KEYS.rememberedEmail, cleanEmail.toLowerCase());
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

        const cleanEmail = (email || '').trim();

        if (!cleanEmail || !password) {
            return { success: false, message: 'Please fill in all fields.' };
        }

        if (!validateEmail(cleanEmail)) {
            return { success: false, message: 'Email address is invalid.' };
        }

        try {
            const { data, error } = await window.SupabaseApp.client.auth.signInWithPassword({ email: cleanEmail, password });
            if (error) throw error;

            if (rememberMe) {
                localStorage.setItem(STORAGE_KEYS.rememberedEmail, cleanEmail.toLowerCase());
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

    function getCurrentPage() {
        const path = window.location.pathname.toLowerCase();
        const segments = path.split('/').filter(Boolean);
        const filename = segments.pop() || 'index.html';
        return filename;
    }

    function isProtectedHref(href) {
        if (!href || href === '#' || href.startsWith('javascript:')) return false;
        const cleanHref = href.split('?')[0].split('#')[0].toLowerCase();
        const filename = cleanHref.split('/').pop();
        if (!filename) return false;
        const publicFiles = ['index.html', 'login.html', 'register.html'];
        return !publicFiles.includes(filename);
    }

    async function protectRoute() {
        const page = getCurrentPage();
        const user = await readCurrentUser();

        const publicPages = ['index.html', 'login.html', 'register.html'];
        const authPages = ['login.html', 'register.html'];

        const isPublicPage = publicPages.includes(page);
        const isAuthPage = authPages.includes(page);

        if (!user && !isPublicPage) {
            window.location.replace(getRootPath('login.html'));
            return null;
        }

        if (user && isAuthPage) {
            window.location.replace(getRootPath('dashboard.html'));
            return user;
        }

        return user;
    }

    function updateNavigation(user) {
        const loginLinks = document.querySelectorAll('.btn-login');
        const registerLinks = document.querySelectorAll('.btn-register');
        const logoutButtons = document.querySelectorAll('#logoutBtn, .btn-logout');
        const categoryDropdowns = document.querySelectorAll('.nav-dropdown');
        const dashboardLinks = document.querySelectorAll('a[href*="dashboard.html"]');
        const profileLinks = document.querySelectorAll('a[href*="profile.html"]');

        if (user) {
            loginLinks.forEach((el) => (el.style.display = 'none'));
            registerLinks.forEach((el) => (el.style.display = 'none'));
            logoutButtons.forEach((el) => (el.style.display = 'inline-block'));
            categoryDropdowns.forEach((el) => (el.style.display = 'inline-block'));
            dashboardLinks.forEach((el) => {
                el.style.display = '';
                if (el.parentElement && el.parentElement.tagName === 'LI') {
                    el.parentElement.style.display = '';
                }
            });
            profileLinks.forEach((el) => {
                el.style.display = '';
                if (el.parentElement && el.parentElement.tagName === 'LI') {
                    el.parentElement.style.display = '';
                }
            });
        } else {
            loginLinks.forEach((el) => (el.style.display = 'inline-block'));
            registerLinks.forEach((el) => (el.style.display = 'inline-block'));
            logoutButtons.forEach((el) => (el.style.display = 'none'));
            categoryDropdowns.forEach((el) => (el.style.display = 'none'));
            dashboardLinks.forEach((el) => {
                el.style.display = 'none';
                if (el.parentElement && el.parentElement.tagName === 'LI') {
                    el.parentElement.style.display = 'none';
                }
            });
            profileLinks.forEach((el) => {
                el.style.display = 'none';
                if (el.parentElement && el.parentElement.tagName === 'LI') {
                    el.parentElement.style.display = 'none';
                }
            });

            document.addEventListener(
                'click',
                function (e) {
                    const link = e.target.closest('a');
                    if (link) {
                        const href = link.getAttribute('href');
                        if (isProtectedHref(href)) {
                            e.preventDefault();
                            window.location.href = getRootPath('login.html');
                            return;
                        }
                    }

                    const cardOrElem = e.target.closest('[onclick]');
                    if (cardOrElem) {
                        const onclickAttr = cardOrElem.getAttribute('onclick') || '';
                        if (onclickAttr.includes('location.href') && isProtectedHref(onclickAttr)) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = getRootPath('login.html');
                            return;
                        }
                    }
                },
                true
            );
        }
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
        const logoutButtons = document.querySelectorAll('#logoutBtn, .btn-logout');

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
        validateEmail,
        validatePassword,
        readCurrentUser,
        getRootPath
    };

    document.addEventListener('DOMContentLoaded', () => {
        init();

        const burger = document.getElementById('hamburgerMenu');
        const navLinks = document.querySelector('.nav-links');
        if (burger && navLinks) {
            burger.addEventListener('click', function () {
                navLinks.classList.toggle('mobile-active');
            });
        }

        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const parent = this.closest('.nav-dropdown');
                if (parent) parent.classList.toggle('active');
            });
        });

        // Close dropdown when selecting a category link or clicking outside
        document.addEventListener('click', function (e) {
            const activeDropdown = document.querySelector('.nav-dropdown.active');
            if (activeDropdown) {
                if (!activeDropdown.contains(e.target)) {
                    activeDropdown.classList.remove('active');
                }
            }
        });

        document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
            link.addEventListener('click', function () {
                const parent = this.closest('.nav-dropdown');
                if (parent) parent.classList.remove('active');
            });
        });
    });
})();
