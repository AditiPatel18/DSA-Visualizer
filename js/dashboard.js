(function () {
    function updateDashboardMetrics(user) {
        if (!user) return;
        const profile = user.progress || {};
        const welcomeText = document.getElementById('welcomeText');
        const loginTime = document.getElementById('loginTime');
        const streakCount = document.getElementById('streakCount');
        const algorithmsLearned = document.getElementById('algorithmsLearned');
        const totalTime = document.getElementById('totalTime');
        const activeDays = document.getElementById('activeDays');
        const achievements = document.getElementById('achievements');

        if (welcomeText) welcomeText.textContent = `Welcome back, ${user.username || 'Student'}!`;
        if (loginTime) loginTime.textContent = `Last login: ${new Date(user.lastLogin || Date.now()).toLocaleString()}`;
        if (streakCount) streakCount.textContent = profile.streak || 0;
        if (algorithmsLearned) algorithmsLearned.textContent = profile.algorithmsLearned || 0;
        if (totalTime) totalTime.textContent = profile.totalHours || '0h 0m';
        if (activeDays) activeDays.textContent = profile.activeDays || 0;
        if (achievements) achievements.textContent = profile.achievements || 0;
    }

    document.addEventListener('DOMContentLoaded', async function () {
        const user = await window.AuthApp?.readCurrentUser?.();
        updateDashboardMetrics(user);
    });
})();
