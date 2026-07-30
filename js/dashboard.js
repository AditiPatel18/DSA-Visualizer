(function () {
    const TOTAL_PLATFORM_ALGORITHMS = 96;

    const CATEGORY_TOTALS = {
        'Arrays': 5,
        'Sorting': 12,
        'Searching': 4,
        'Linked List': 5,
        'Stack': 5,
        'Queue': 5,
        'Backtracking': 5,
        'Bit Manipulation': 5,
        'Sliding Window': 5,
        'Two Pointers': 5,
        'Binary Trees': 10,
        'BST': 5,
        'Greedy': 5,
        'Graph': 17,
        'DP': 5
    };

    function formatRelativeTime(dateString) {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'Just now';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
        if (diffSeconds < 172800) return 'Yesterday';
        return `${Math.floor(diffSeconds / 86400)} days ago`;
    }

    async function updateDashboardMetrics(user) {
        if (!user || !user.id) return;

        const userId = user.id;

        const [progressList, favoritesList, stats, recentActivities] = await Promise.all([
            window.SupabaseApp.loadProgress(userId),
            window.SupabaseApp.loadFavorites(userId),
            window.SupabaseApp.loadLearningStats(userId),
            window.SupabaseApp.loadRecentActivity(userId, 10)
        ]);

        const completedAlgorithms = (progressList || []).filter(p => p.completed);
        const inProgressAlgorithms = (progressList || []).filter(p => !p.completed);
        const completedCount = completedAlgorithms.length;
        const inProgressCount = inProgressAlgorithms.length;
        const favoritesCount = (favoritesList || []).length;

        const streak = stats?.streak ?? 0;
        const activeDays = stats?.active_days ?? 0;
        const totalHours = stats?.total_hours || '0h 0m';
        const achievements = stats?.achievements ?? 0;

        // Header info
        const welcomeText = document.getElementById('welcomeText');
        const loginTime = document.getElementById('loginTime');
        const streakCount = document.getElementById('streakCount');

        if (welcomeText) welcomeText.textContent = `Welcome back, ${user.username || 'Student'}!`;
        if (loginTime) loginTime.textContent = `Last login: ${new Date(user.lastLogin || Date.now()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
        if (streakCount) streakCount.textContent = streak;

        // Overall progress
        const algorithmsLearned = document.getElementById('algorithmsLearned');
        const progressFill = document.querySelector('.stat-card.primary .progress-fill');
        const progressText = document.querySelector('.stat-card.primary .progress-text');
        const completionPct = Math.round((completedCount / TOTAL_PLATFORM_ALGORITHMS) * 100);

        if (algorithmsLearned) algorithmsLearned.textContent = completedCount;
        if (progressFill) progressFill.style.width = `${completionPct}%`;
        if (progressText) progressText.textContent = `${completionPct}% of ${TOTAL_PLATFORM_ALGORITHMS} algorithms`;

        const totalTime = document.getElementById('totalTime');
        if (totalTime) totalTime.textContent = totalHours;

        const activeDaysEl = document.getElementById('activeDays');
        const streakTrend = document.querySelector('.stat-card.warning .trend');
        if (activeDaysEl) activeDaysEl.textContent = activeDays;
        if (streakTrend) streakTrend.innerHTML = `Current streak: <strong>${streak} days</strong>`;

        const achievementsEl = document.getElementById('achievements');
        if (achievementsEl) achievementsEl.textContent = achievements;

        // Continue Learning & Recently Visited Widget
        const lastActivity = (recentActivities || [])[0];
        const continueCard = document.querySelector('.actions-card');
        if (continueCard) {
            const nextAlgo = lastActivity ? lastActivity.algorithm_name : 'Quick Sort';
            const cat = lastActivity ? (lastActivity.category || 'Sorting') : 'Sorting';
            continueCard.innerHTML = `
                <h3><i class="fas fa-play-circle"></i> Continue Learning</h3>
                <p style="margin: 0.5rem 0;">Next up: <strong>${nextAlgo}</strong> (${cat})</p>
                <button class="action-btn" onclick="window.location.href='algorithm-details/${nextAlgo.toLowerCase().replace(/[^a-z]/g, '')}.html'"><i class="fas fa-play"></i> Resume Algorithm</button>
            `;
        }

        // Recommended Next Algorithm Widget
        const goalsList = document.querySelector('.goals-list');
        if (goalsList) {
            const uncompletedCats = Object.keys(CATEGORY_TOTALS).filter(cat => {
                const count = completedAlgorithms.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase()).length;
                return count < (CATEGORY_TOTALS[cat] || 5);
            });
            const recommendedCat = uncompletedCats[0] || 'Sorting';

            goalsList.innerHTML = `
                <div class="goal-item">
                    <div class="goal-content">
                        <p><strong>Recommended Topic</strong></p>
                        <span class="goal-progress">Explore ${recommendedCat} Category</span>
                    </div>
                </div>
                <div class="goal-item">
                    <div class="goal-content">
                        <p><strong>Daily Target Goal</strong></p>
                        <span class="goal-progress">${completedCount % 3} / 3 algorithms completed today</span>
                    </div>
                </div>
                <div class="goal-item">
                    <div class="goal-content">
                        <p><strong>Favorited Items</strong></p>
                        <span class="goal-progress">${favoritesCount} bookmarked</span>
                    </div>
                </div>
            `;
        }

        // Recently Completed Algorithms
        const completedListEl = document.getElementById('completedList');
        if (completedListEl) {
            if (!completedAlgorithms || completedAlgorithms.length === 0) {
                completedListEl.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="activity-content">
                            <p>No algorithms completed yet. Start learning!</p>
                        </div>
                    </div>
                `;
            } else {
                completedListEl.innerHTML = completedAlgorithms.slice(0, 5).map(item => `
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fas fa-check"></i></div>
                        <div class="activity-content">
                            <p><strong>${item.algorithm_name || 'Algorithm'}</strong></p>
                            <span class="activity-time">${item.category || 'DSA'}</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Recent Activity Feed
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            if (!recentActivities || recentActivities.length === 0) {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="activity-content">
                            <p>No activity recorded yet. Start exploring algorithms!</p>
                        </div>
                    </div>
                `;
            } else {
                activityList.innerHTML = recentActivities.slice(0, 10).map(act => {
                    let iconClass = 'fa-play-circle';
                    if (act.action_type === 'completed') iconClass = 'fa-check-circle';
                    else if (act.action_type === 'favorited') iconClass = 'fa-star';
                    else if (act.action_type === 'unfavorited') iconClass = 'fa-trash-alt';
                    else if (act.action_type === 'revisited') iconClass = 'fa-sync-alt';
                    else if (act.action_type === 'started') iconClass = 'fa-book-open';

                    const relTime = formatRelativeTime(act.created_at);
                    const desc = act.details || `${act.action_type} ${act.algorithm_name}`;

                    return `
                        <div class="activity-item">
                            <div class="activity-icon"><i class="fas ${iconClass}"></i></div>
                            <div class="activity-content">
                                <p><strong>${act.algorithm_name || 'Algorithm'}</strong>: ${desc}</p>
                                <span class="activity-time">${relTime}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        updateChartData(progressList);
    }

    function updateChartData(progressList) {
        const chartCanvas = document.getElementById('progressChart');
        if (!chartCanvas || !window.Chart) return;

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const counts = [0, 0, 0, 0, 0, 0, 0];

        (progressList || []).forEach(p => {
            if (p.updated_at) {
                const date = new Date(p.updated_at);
                const dayIndex = (date.getDay() + 6) % 7;
                counts[dayIndex] += 1;
            }
        });

        if (window.myDashboardChart) {
            window.myDashboardChart.data.datasets[0].data = counts;
            window.myDashboardChart.update();
        } else {
            const ctx = chartCanvas.getContext('2d');
            window.myDashboardChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Algorithms Interacted',
                        data: counts,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', async function () {
        const user = await window.AuthApp?.readCurrentUser?.();
        if (!user) return;

        await updateDashboardMetrics(user);

        if (window.SupabaseApp?.subscribeToDashboardUpdates) {
            window.SupabaseApp.subscribeToDashboardUpdates(user.id, async () => {
                const refreshedUser = await window.AuthApp.readCurrentUser();
                await updateDashboardMetrics(refreshedUser);
            });
        }
    });
})();
