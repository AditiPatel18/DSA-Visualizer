(function () {
    let currentUserData = null;

    const ALGO_MAP = {
        'Quick Sort': { file: 'quicksort.html', category: 'Sorting' },
        'Merge Sort': { file: 'mergesort.html', category: 'Sorting' },
        'Linear Search': { file: 'linearsearch.html', category: 'Searching' },
        'Binary Search': { file: 'binarysearch.html', category: 'Searching' },
        'Dijkstra\'s Algorithm': { file: 'dijkstra.html', category: 'Graph' },
        'Breadth First Search': { file: 'bfs.html', category: 'Graph' },
        'Depth First Search': { file: 'dfs.html', category: 'Graph' },
        '0/1 Knapsack': { file: 'knapsack.html', category: 'DP' },
        'Kruskal\'s Algorithm': { file: 'kruskal.html', category: 'Graph' },
        'Prim\'s Algorithm': { file: 'prim.html', category: 'Graph' },
        'Bellman-Ford Algorithm': { file: 'bellmanford.html', category: 'Graph' }
    };

    async function loadProfileData() {
        if (!window.SupabaseApp?.clientReady) return;

        const sessionRes = await window.SupabaseApp.getCurrentSessionUser();
        const user = sessionRes?.user;
        if (!user) return;

        const userId = user.id;

        const [profile, stats, progressList, favoritesList] = await Promise.all([
            window.SupabaseApp.loadUserProfile(userId),
            window.SupabaseApp.loadLearningStats(userId),
            window.SupabaseApp.loadProgress(userId),
            window.SupabaseApp.loadFavorites(userId)
        ]);

        const fullName = profile?.full_name || user.user_metadata?.full_name || 'Student';
        const username = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'student';
        const email = profile?.email || user.email;
        const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;
        const createdAt = new Date(profile?.created_at || user.created_at || Date.now());

        currentUserData = { user, profile, stats, fullName, username, email, avatarUrl, createdAt };

        // Render Hero & Info Card
        renderHeaderAndInfo(currentUserData);

        // Render Learning Stats Grid
        renderStatsGrid(stats, progressList);

        // Render Favorites List
        renderFavoritesList(favoritesList);

        // Render Completed Algorithms List
        renderCompletedList(progressList);

        // Render Achievements
        renderAchievements(stats, progressList);
    }

    function renderHeaderAndInfo(data) {
        const profileName = document.getElementById('profileName');
        const profileHandle = document.getElementById('profileHandle');
        const profileEmail = document.getElementById('profileEmail');
        const fullNameEl = document.getElementById('fullName');
        const usernameEl = document.getElementById('userUsername');
        const userEmailEl = document.getElementById('userEmail');
        const joinDateEl = document.getElementById('joinDate');
        const avatarContainer = document.getElementById('avatarContainer');

        if (profileName) profileName.textContent = data.fullName;
        if (profileHandle) profileHandle.textContent = `@${data.username}`;
        if (profileEmail) profileEmail.textContent = data.email;

        if (fullNameEl) fullNameEl.textContent = data.fullName;
        if (usernameEl) usernameEl.textContent = `@${data.username}`;
        if (userEmailEl) userEmailEl.textContent = data.email;

        if (joinDateEl) {
            joinDateEl.textContent = data.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (avatarContainer) {
            if (data.avatarUrl) {
                avatarContainer.innerHTML = `
                    <img src="${data.avatarUrl}" alt="Avatar" />
                    <div class="avatar-overlay"><i class="fas fa-camera"></i><span>Change</span></div>
                `;
            } else {
                avatarContainer.innerHTML = `
                    <i class="fas fa-user"></i>
                    <div class="avatar-overlay"><i class="fas fa-camera"></i><span>Upload</span></div>
                `;
            }
        }
    }

    function renderStatsGrid(stats, progressList) {
        const completedCount = (progressList || []).filter(p => p.completed).length;
        const streak = stats?.streak ?? 0;
        const activeDays = stats?.active_days ?? 0;
        const totalHours = stats?.total_hours || '0h 0m';

        const algosLearnedEl = document.getElementById('statsAlgosLearned');
        const streakEl = document.getElementById('statsStreak');
        const activeDaysEl = document.getElementById('statsActiveDays');
        const studyTimeEl = document.getElementById('statsStudyTime');

        if (algosLearnedEl) algosLearnedEl.textContent = completedCount;
        if (streakEl) streakEl.textContent = `${streak} days`;
        if (activeDaysEl) activeDaysEl.textContent = activeDays;
        if (studyTimeEl) studyTimeEl.textContent = totalHours;
    }

    function renderFavoritesList(favoritesList) {
        const container = document.getElementById('favoritesListContainer');
        if (!container) return;

        if (!favoritesList || favoritesList.length === 0) {
            container.innerHTML = `<p class="muted" style="padding: 1rem;">No favorites added yet. Click the star icon on any algorithm to add it!</p>`;
            return;
        }

        container.innerHTML = favoritesList.map(fav => {
            const name = fav.item_name;
            const info = ALGO_MAP[name] || { file: 'sorting.html', category: 'Algorithm' };
            const link = info.file.includes('sorting.html') ? `algorithms/${info.file}` : `algorithm-details/${info.file}`;
            const catClass = (info.category || 'general').toLowerCase();

            return `
                <div class="algo-list-item">
                    <a href="${link}" class="item-title"><i class="fas fa-star" style="color: #ffc107;"></i> ${name}</a>
                    <span class="algo-badge ${catClass}">${info.category}</span>
                </div>
            `;
        }).join('');
    }

    function renderCompletedList(progressList) {
        const container = document.getElementById('completedListContainer');
        if (!container) return;

        const completed = (progressList || []).filter(p => p.completed);

        if (completed.length === 0) {
            container.innerHTML = `<p class="muted" style="padding: 1rem;">No completed algorithms yet. Mark algorithms learned as you study!</p>`;
            return;
        }

        container.innerHTML = completed.map(p => {
            const name = p.algorithm_name;
            const info = ALGO_MAP[name] || { file: 'sorting.html', category: p.category || 'Sorting' };
            const link = info.file.includes('sorting.html') ? `algorithms/${info.file}` : `algorithm-details/${info.file}`;
            const catClass = (info.category || 'general').toLowerCase();

            return `
                <div class="algo-list-item">
                    <a href="${link}" class="item-title"><i class="fas fa-check-circle" style="color: #4CAF50;"></i> ${name}</a>
                    <span class="algo-badge ${catClass}">${info.category}</span>
                </div>
            `;
        }).join('');
    }

    function renderAchievements(stats, progressList) {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        const completedCount = (progressList || []).filter(p => p.completed).length;
        const streak = stats?.streak || 0;

        const achievements = [
            {
                title: 'First Step',
                desc: 'Completed your first algorithm',
                icon: 'fa-graduation-cap',
                tier: 'bronze',
                unlocked: completedCount >= 1
            },
            {
                title: '7-Day Streak',
                desc: 'Practiced algorithms for 7 days in a row',
                icon: 'fa-fire',
                tier: 'silver',
                unlocked: streak >= 7
            },
            {
                title: 'Algorithm Explorer',
                desc: 'Mastered 5 or more algorithms',
                icon: 'fa-brain',
                tier: 'gold',
                unlocked: completedCount >= 5
            }
        ];

        container.innerHTML = achievements.map(a => `
            <div class="achievement ${a.unlocked ? '' : 'locked'}" style="${a.unlocked ? '' : 'opacity: 0.5; filter: grayscale(100%);'}">
                <div class="achievement-icon ${a.tier}"><i class="fas ${a.icon}"></i></div>
                <div class="achievement-content">
                    <h4>${a.title}</h4>
                    <p>${a.desc}</p>
                </div>
            </div>
        `).join('');
    }

    function setupModalsAndActions() {
        const editModal = document.getElementById('editProfileModal');
        const passwordModal = document.getElementById('changePasswordModal');
        const avatarInput = document.getElementById('avatarFileInput');

        // Open Edit Profile Modal
        const editBtns = document.querySelectorAll('.btn-edit-profile');
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentUserData) {
                    document.getElementById('editFullName').value = currentUserData.fullName;
                    document.getElementById('editUsername').value = currentUserData.username;
                    document.getElementById('editEmail').value = currentUserData.email;
                }
                editModal?.classList.add('active');
            });
        });

        // Open Change Password Modal
        const passBtns = document.querySelectorAll('.btn-change-password');
        passBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                passwordModal?.classList.add('active');
            });
        });

        // Close Modals
        document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                editModal?.classList.remove('active');
                passwordModal?.classList.remove('active');
            });
        });

        // Avatar Upload Trigger
        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer && avatarInput) {
            avatarContainer.addEventListener('click', () => {
                avatarInput.click();
            });

            avatarInput.addEventListener('change', async function () {
                const file = this.files[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                    alert('Image size should be less than 2MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function (e) {
                    const dataUrl = e.target.result;
                    const updated = await window.SupabaseApp.saveProfile({ avatar_url: dataUrl });
                    if (updated) {
                        await loadProfileData();
                        alert('Avatar updated successfully!');
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        // Edit Profile Form Submit
        const editForm = document.getElementById('editProfileForm');
        if (editForm) {
            editForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const saveBtn = editForm.querySelector('button[type="submit"]');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';

                const newName = document.getElementById('editFullName').value.trim();
                const newUsername = document.getElementById('editUsername').value.trim();
                const newEmail = document.getElementById('editEmail').value.trim().toLowerCase();

                const updated = await window.SupabaseApp.saveProfile({
                    full_name: newName,
                    username: newUsername,
                    email: newEmail
                });

                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';

                if (updated) {
                    editModal?.classList.remove('active');
                    await loadProfileData();
                    alert('Profile updated successfully!');
                } else {
                    alert('Unable to update profile.');
                }
            });
        }

        // Change Password Form Submit
        const passForm = document.getElementById('changePasswordForm');
        if (passForm) {
            passForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const newPass = document.getElementById('newPassword').value;
                const confirmPass = document.getElementById('confirmNewPassword').value;

                if (newPass !== confirmPass) {
                    alert('Passwords do not match.');
                    return;
                }

                if (!window.AuthApp.validatePassword(newPass)) {
                    alert('Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.');
                    return;
                }

                const saveBtn = passForm.querySelector('button[type="submit"]');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Updating...';

                const res = await window.SupabaseApp.changePassword(newPass);

                saveBtn.disabled = false;
                saveBtn.textContent = 'Update Password';

                if (res.success) {
                    passForm.reset();
                    passwordModal?.classList.remove('active');
                    alert('Password updated successfully!');
                } else {
                    alert(res.message);
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await loadProfileData();
        setupModalsAndActions();
    });
})();
