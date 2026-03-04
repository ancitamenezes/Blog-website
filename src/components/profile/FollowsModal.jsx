import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Loader2, UserPlus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const FollowsModal = ({ isOpen, onClose, userId, type, initialCount }) => {
    // type: 'followers' | 'following'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user: currentUser, following: currentUserFollowing, fetchFollowing } = useAppContext();

    useEffect(() => {
        if (!isOpen || !userId) return;
        fetchUsers();
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let data = [];
            let error = null;

            if (type === 'followers') {
                // Get people who follow the userId
                const response = await supabase
                    .from('follows')
                    .select(`
                        follower:users!follower_id(id, name, username, avatar_url, bio)
                    `)
                    .eq('following_id', userId);
                data = response.data;
                error = response.error;
            } else {
                // Get people the userId is following
                const response = await supabase
                    .from('follows')
                    .select(`
                        following:users!following_id(id, name, username, avatar_url, bio)
                    `)
                    .eq('follower_id', userId);
                data = response.data;
                error = response.error;
            }

            if (error) throw error;

            // Normalize the nested data structure from joins
            const formattedUsers = data ? data.map(item => item.follower || item.following) : [];
            setUsers(formattedUsers);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        onClose();
        if (currentUser?.username === username) {
            navigate('/profile');
        } else {
            navigate(`/u/${username}`);
        }
    };

    const handleFollowToggle = async (e, targetUserId) => {
        e.stopPropagation(); // prevent navigating to profile
        if (!currentUser) return;

        const isFollowing = currentUserFollowing.includes(targetUserId);

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from('follows')
                    .delete()
                    .match({ follower_id: currentUser.id, following_id: targetUserId });
            } else {
                // Follow
                await supabase
                    .from('follows')
                    .insert({ follower_id: currentUser.id, following_id: targetUserId });
            }
            // Update global context
            fetchFollowing(currentUser.id);
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card max-w-md w-full max-h-[80vh] flex flex-col relative animate-in zoom-in-95 duration-200 shadow-2xl shadow-purple-900/20">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white capitalize">
                            {type}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {initialCount} {initialCount === 1 ? 'person' : 'people'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List Container */}
                <div className="p-4 overflow-y-auto flex-1 min-h-[300px] custom-scrollbar">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-primary">
                            <Loader2 size={32} className="animate-spin" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-4">
                            {users.map((u, i) => {
                                const isCurrentUser = currentUser?.id === u.id;
                                const isFollowing = currentUserFollowing.includes(u.id);

                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => handleUserClick(u.username)}
                                        className="flex items-center gap-4 group p-2 -mx-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        <img
                                            src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                                            alt={u.username}
                                            className="size-12 rounded-full border border-white/10"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-[15px] truncate group-hover:text-primary transition-colors">
                                                {u.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">@{u.username}</p>
                                        </div>

                                        {!isCurrentUser && currentUser && (
                                            <button
                                                onClick={(e) => handleFollowToggle(e, u.id)}
                                                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${isFollowing
                                                        ? 'bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-white/10 text-white'
                                                        : 'bg-primary hover:bg-primary-hover text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                                    }`}
                                            >
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                            <UserPlus size={48} className="mb-4 opacity-50 text-purple-400" />
                            <p className="font-medium text-white mb-1">
                                No {type} yet.
                            </p>
                            <p className="text-sm">
                                {type === 'followers'
                                    ? "When people follow this user, they'll show up here."
                                    : "When this user follows people, they'll show up here."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowsModal;
