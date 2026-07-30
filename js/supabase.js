(function (window) {
    const SUPABASE_URL = window.SUPABASE_URL || 'https://yhttps://xykamucyxnludysumghz.supabase.coour-project-ref.supabase.co';
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

    async function saveProfile(updates) {
        const session = await supabase.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user?.id) return null;

        const payload = {
            id: user.id,
            full_name: updates.full_name || null,
            username: updates.username || null,
            email: updates.email || user.email || null,
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select().single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Unable to save profile to Supabase.', error);
            return null;
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

    async function getCurrentSessionUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user || null;
            if (!user?.id) return { user: null, profile: null, session: null };

            const profile = await loadUserProfile(user.id);
            return { user, profile, session };
        } catch (error) {
            console.warn('Unable to load the active Supabase session.', error);
            return { user: null, profile: null, session: null };
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
        getCurrentSessionUser
    };
})(window);
