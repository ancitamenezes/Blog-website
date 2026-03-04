import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Bell, Heart, MessageCircle, UserPlus, Loader2, Check } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Notifications = () => {
    const { user, fetchUnreadNotificationsCount } = useAppContext();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    id, 
                    type, 
                    is_read, 
                    created_at,
                    post_id,
                    actor:users!actor_id(id, name, username, avatar_url),
                    post:posts!post_id(id, title)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useGSAP(() => {
        if (!loading && notifications.length > 0) {
            gsap.from('.notification-item', {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out'
            });
        }
    }, [loading, notifications]);

    const markAsRead = async (notificationId) => {
        try {
            // Update local state first for immediate UI feedback
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );

            // Update DB
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            // Refresh badge count
            fetchUnreadNotificationsCount(user.id);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            fetchUnreadNotificationsCount(user.id);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read when clicked
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate based on type
        if (notification.type === 'follow') {
            navigate(`/u/${notification.actor.username}`);
        } else if (notification.post_id) {
            // In a real app we might navigate to a single post view.
            // For now, we'll just navigate to their profile so user can see it
            navigate(`/u/${notification.actor.username}`);
        }
    };

    const getNotificationContent = (notification) => {
        const actorName = notification.actor?.name || 'Someone';

        switch (notification.type) {
            case 'like':
                return {
                    icon: <Heart size={20} className="text-red-500 fill-red-500/20" />,
                    text: <><span className="font-bold text-white">{actorName}</span> liked your bloq <span className="text-gray-400 italic">"{notification.post?.title}"</span></>
                };
            case 'comment':
                return {
                    icon: <MessageCircle size={20} className="text-blue-500 fill-blue-500/20" />,
                    text: <><span className="font-bold text-white">{actorName}</span> commented on your bloq <span className="text-gray-400 italic">"{notification.post?.title}"</span></>
                };
            case 'follow':
                return {
                    icon: <UserPlus size={20} className="text-green-500" />,
                    text: <><span className="font-bold text-white">{actorName}</span> started following you</>
                };
            default:
                return {
                    icon: <Bell size={20} className="text-gray-400" />,
                    text: <span>New interaction from {actorName}</span>
                };
        }
    };

    const formatTimeAgo = (dateString) => {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'yr ago';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'mo ago';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd ago';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h ago';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm ago';
        return 'Just now';
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 pb-32 font-sans min-h-screen">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-white/5 text-purple-400">
                        <Bell size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Notifications</h1>
                </div>

                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                    >
                        <Check size={16} /> Mark all read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => {
                        const content = getNotificationContent(notification);
                        return (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`notification-item group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${notification.is_read
                                        ? 'glass-card hover:bg-white/5 border-white/5'
                                        : 'glass-card border-primary/30 bg-primary/10 hover:bg-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                    }`}
                            >
                                {/* Unread indicator dot */}
                                {!notification.is_read && (
                                    <div className="absolute top-4 right-4 size-2 rounded-full bg-primary" />
                                )}

                                {/* Actor Avatar */}
                                <div className="shrink-0 relative">
                                    <img
                                        src={notification.actor?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                                        alt="actor"
                                        className="size-12 rounded-full border border-white/10 dark:bg-gray-800"
                                    />
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#0f0f11] rounded-full border border-white/10">
                                        {content.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-[15px] text-gray-300 pr-6 leading-snug">
                                        {content.text}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        {formatTimeAgo(notification.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 glass-card">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 text-gray-400 mb-4 border border-white/10">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">All caught up</h3>
                        <p className="text-gray-400 font-paragraph">You don't have any new notifications right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
