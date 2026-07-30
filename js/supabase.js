(function (window) {
    const SUPABASE_URL = window.SUPABASE_URL || 'https://xykamucyxnludysumghz.supabase.co';
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_T1ThM64oPvY66kXBgqCd6g_EMk8Lycn';

    window.SupabaseConfig = {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY
    };

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        window.SupabaseApp = {
            clientReady: false,
            lastError: 'Supabase JS SDK is not loaded. Add the Supabase script before this file.'
        };
        return;
    }

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });

    async function ensureUserProfile(user, metadata = {}) {
        if (!user?.id) return null;
        const profilePayload = {
            id: user.id,
            email: user.email || metadata.email || null,
            full_name: metadata.full_name || metadata.username || user.user_metadata?.full_name || user.user_metadata?.username || 'Student',
            username: metadata.username || user.user_metadata?.username || user.email?.split('@')[0] || 'student',
            avatar_url: metadata.avatar_url || null,
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' }).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to sync profile with Supabase.', error);
            return null;
        }
    }

    async function loadUserProfile(userId) {
        if (!userId) return null;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to load profile from Supabase.', error);
            return null;
        }
    }

    async function getCurrentSessionUser() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session?.user) {
                return { user: null, session: null, profile: null };
            }
            const user = session.user;
            const profile = await loadUserProfile(user.id);
            return { user, session, profile };
        } catch (error) {
            console.warn('Unable to get current session user.', error);
            return { user: null, session: null, profile: null };
        }
    }

    async function saveProfile(updates) {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const payload = {
            id: user.id,
            full_name: updates.full_name ?? null,
            username: updates.username ?? null,
            email: updates.email || user.email || null,
            avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : null,
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select().single();
            if (error) throw error;

            if (updates.email && updates.email !== user.email) {
                await supabase.auth.updateUser({ email: updates.email });
            }

            return data;
        } catch (error) {
            console.warn('Unable to save profile to Supabase.', error);
            return null;
        }
    }

    async function changePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message || 'Unable to update password.' };
        }
    }

    async function loadProgress(userId) {
        if (!userId) return null;
        try {
            const { data, error } = await supabase.from('learning_progress').select('*').eq('user_id', userId);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Unable to load learning progress.', error);
            return [];
        }
    }

    async function saveProgress(progressRecord) {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const payload = {
            user_id: user.id,
            algorithm_name: progressRecord.algorithm_name,
            category: progressRecord.category || 'general',
            completed: Boolean(progressRecord.completed),
            progress_value: progressRecord.progress_value ?? 0,
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('learning_progress').upsert(payload, { onConflict: 'user_id,algorithm_name' }).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to save progress.', error);
            return null;
        }
    }

    async function loadFavorites(userId) {
        if (!userId) return [];
        try {
            const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Unable to load favorites.', error);
            return [];
        }
    }

    async function toggleFavorite(userId, item) {
        if (!userId || !item?.name) return null;
        const favoritePayload = {
            user_id: userId,
            item_name: item.name,
            item_type: item.type || 'algorithm',
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('favorites').upsert(favoritePayload, { onConflict: 'user_id,item_name' }).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to save favorite.', error);
            return null;
        }
    }

    async function loadLearningStats(userId) {
        if (!userId) return null;
        try {
            const { data, error } = await supabase.from('learning_statistics').select('*').eq('user_id', userId).maybeSingle();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to load learning statistics.', error);
            return null;
        }
    }

    async function saveLearningStats(updates) {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const payload = {
            user_id: user.id,
            algorithms_learned: updates.algorithms_learned ?? 0,
            streak: updates.streak ?? 0,
            active_days: updates.active_days ?? 0,
            total_hours: updates.total_hours ?? '0h 0m',
            achievements: updates.achievements ?? 0,
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('learning_statistics').upsert(payload, { onConflict: 'user_id' }).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to save learning statistics.', error);
            return null;
        }
    }

    async function loadRecentActivity(userId, limit = 10) {
        if (!userId) return [];
        try {
            const { data, error } = await supabase
                .from('recent_activity')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Unable to load recent activity.', error);
            return [];
        }
    }

    async function logActivity(actionType, algorithmName, category = 'general', details = '') {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const payload = {
            user_id: user.id,
            action_type: actionType,
            algorithm_name: algorithmName,
            category: category,
            details: details,
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('recent_activity').insert(payload).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to log activity.', error);
            return null;
        }
    }

    async function markAlgorithmCompleted(algorithmName, category = 'general') {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const progressData = await saveProgress({
            algorithm_name: algorithmName,
            category: category,
            completed: true,
            progress_value: 100
        });

        const allProgress = await loadProgress(user.id);
        const completedCount = (allProgress || []).filter(p => p.completed).length;

        const currentStats = await loadLearningStats(user.id);
        await saveLearningStats({
            algorithms_learned: completedCount,
            streak: Math.max(currentStats?.streak || 1, 1),
            active_days: Math.max(currentStats?.active_days || 1, 1),
            total_hours: currentStats?.total_hours || '1h 0m',
            achievements: Math.floor(completedCount / 2) + 1
        });

        await logActivity('completed', algorithmName, category, `Completed ${algorithmName} algorithm`);
        return progressData;
    }

    async function markAlgorithmViewed(algorithmName, category = 'general') {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        try {
            const { data: existing } = await supabase
                .from('learning_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('algorithm_name', algorithmName)
                .maybeSingle();

            if (!existing) {
                await saveProgress({
                    algorithm_name: algorithmName,
                    category: category,
                    completed: false,
                    progress_value: 25
                });
                await logActivity('started', algorithmName, category, `Started learning ${algorithmName}`);
            } else {
                await logActivity('revisited', algorithmName, category, `Revisited ${algorithmName}`);
            }
        } catch (err) {
            console.warn('Unable to track algorithm view.', err);
        }
    }

    async function toggleAlgorithmFavorite(algorithmName, category = 'general') {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        try {
            const { data: existing } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id)
                .eq('item_name', algorithmName)
                .maybeSingle();

            if (existing) {
                await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_name', algorithmName);
                await logActivity('unfavorited', algorithmName, category, `Removed ${algorithmName} from favorites`);
                return { favorited: false };
            } else {
                await supabase.from('favorites').insert({
                    user_id: user.id,
                    item_name: algorithmName,
                    item_type: 'algorithm',
                    updated_at: new Date().toISOString()
                });
                await logActivity('favorited', algorithmName, category, `Added ${algorithmName} to favorites`);
                return { favorited: true };
            }
        } catch (err) {
            console.warn('Unable to toggle favorite.', err);
            return null;
        }
    }

    function subscribeToDashboardUpdates(userId, callback) {
        if (!userId || typeof callback !== 'function') return null;
        try {
            const channel = supabase.channel(`user-dashboard-${userId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_progress', filter: `user_id=eq.${userId}` }, callback)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${userId}` }, callback)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_statistics', filter: `user_id=eq.${userId}` }, callback)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'recent_activity', filter: `user_id=eq.${userId}` }, callback)
                .subscribe();
            return channel;
        } catch (err) {
            console.warn('Unable to subscribe to dashboard realtime updates.', err);
            return null;
        }
    }

    window.SupabaseApp = {
        client: supabase,
        clientReady: true,
        config: { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
        ensureUserProfile,
        loadUserProfile,
        saveProfile,
        loadProgress,
        saveProgress,
        loadFavorites,
        toggleFavorite,
        loadLearningStats,
        saveLearningStats,
        getCurrentSessionUser,
        loadRecentActivity,
        logActivity,
        markAlgorithmCompleted,
        markAlgorithmViewed,
        toggleAlgorithmFavorite,
        subscribeToDashboardUpdates,
        changePassword
    };
})(window);

