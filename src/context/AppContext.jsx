import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatSmartDate } from '../utils/dateUtils';
import { playSound } from '../utils/soundUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Real Supabase user profile
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]); // Fetch from Supabase
    const [postsLoading, setPostsLoading] = useState(true);
    const [following, setFollowing] = useState([]); // Array of user IDs the current user is following
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

    // Late Night Mode State
    const [isLateNightMode, setIsLateNightMode] = useState(() => {
        const savedMode = localStorage.getItem('lateNightModeOverride');
        if (savedMode !== null) return JSON.parse(savedMode);

        const hour = new Date().getHours();
        return hour >= 0 && hour < 5; // Midnight to 5 AM
    });

    // Auto-check time periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const savedMode = localStorage.getItem('lateNightModeOverride');
            if (savedMode === null) {
                const hour = new Date().getHours();
                setIsLateNightMode(hour >= 0 && hour < 5);
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const toggleLateNightMode = (value) => {
        setIsLateNightMode(value);
        localStorage.setItem('lateNightModeOverride', JSON.stringify(value));
    };

    useEffect(() => {
        // Fetch current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
                fetchFollowing(session.user.id);
                fetchUnreadNotificationsCount(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes (Login, Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                if (session?.user) {
                    fetchUserProfile(session.user.id);
                    fetchFollowing(session.user.id);
                    fetchUnreadNotificationsCount(session.user.id);
                } else {
                    setUser(null);
                    setFollowing([]);
                    setUnreadNotificationsCount(0);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Global Notification Listener for Sounds
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`app_notifications_${user.id} `)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id = eq.${user.id} ` },
                (payload) => {
                    // Update the badge silently
                    setUnreadNotificationsCount(prev => prev + 1);

                    // The Like component might trigger its own optimistic 'pop',
                    // but for background notifications (or comments/follows while elsewhere), play a sound
                    if (payload.new.type !== 'like') {
                        playSound('notification');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch Posts whenever session changes (could also be triggered manually)
    useEffect(() => {
        if (session) {
            fetchPosts();
        } else {
            setPosts([]);
            setPostsLoading(false);
        }
    }, [session]);

    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
    *,
    author: users(id, name, username, avatar_url),
        likes(user_id),
        bookmarks(user_id),
        comments(id),
        parent_post: parent_post_id(
            id,
            title,
            author: users(name, username, avatar_url)
        )
            `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Format data to match our UI expectations
            const formattedPosts = data.map(post => {
                const plainTextSnippet = (post.content || '').replace(/<[^>]*>?/gm, '');
                return {
                    id: post.id,
                    title: post.title,
                    snippet: plainTextSnippet.substring(0, 150) + (plainTextSnippet.length > 150 ? '...' : ''),
                    fullContent: post.content,
                    coverImage: post.cover_image,
                    createdAt: formatSmartDate(post.created_at),
                    author: {
                        id: post.author.id,
                        name: post.author.name,
                        username: post.author.username,
                        avatar: post.author.avatar_url,
                    },
                    parent_post_id: post.parent_post_id,
                    parent_post: post.parent_post ? {
                        id: post.parent_post.id,
                        title: post.parent_post.title,
                        author: {
                            name: post.parent_post.author.name,
                            username: post.parent_post.author.username,
                            avatar: post.parent_post.author.avatar_url,
                        }
                    } : null,
                    tags: [], // Tags not implemented in schema yet
                    likes_count: post.likes ? post.likes.length : 0,
                    likes_data: post.likes || [],
                    bookmarks_data: post.bookmarks || [],
                    comments: post.comments ? post.comments.length : 0
                };
            });

            setPosts(formattedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            // Map Supabase 'avatar_url' to 'avatar' for compatibility with existing UI
            setUser({ ...data, avatar: data.avatar_url });
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId);

            if (error) throw error;

            // Map into a simple array of IDs
            const followingIds = data.map(item => item.following_id);
            setFollowing(followingIds);
        } catch (error) {
            console.error('Error fetching following list:', error);
        }
    };

    const fetchUnreadNotificationsCount = async (userId) => {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            setUnreadNotificationsCount(count || 0);
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AppContext.Provider value={{
            user, session, loading, posts, postsLoading, following, unreadNotificationsCount,
            fetchPosts, fetchUserProfile, fetchFollowing, fetchUnreadNotificationsCount, signOut,
            isLateNightMode, toggleLateNightMode
        }}>
            {!loading && children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
