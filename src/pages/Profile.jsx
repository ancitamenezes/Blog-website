import { useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import PostCard from '../components/feed/PostCard';
import FollowsModal from '../components/profile/FollowsModal';
import { MapPin, Link as LinkIcon, Calendar, Edit3, Settings, Loader2, X } from 'lucide-react';

const Profile = () => {
    const { user, posts, postsLoading, following, fetchUserProfile } = useAppContext();

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [modalType, setModalType] = useState('edit'); // 'edit' or 'settings'
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editTechStack, setEditTechStack] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Follower Stats
    const [followersCount, setFollowersCount] = useState(0);
    const [isFollowsModalOpen, setIsFollowsModalOpen] = useState(false);
    const [followsModalType, setFollowsModalType] = useState('followers');

    useEffect(() => {
        if (!user) return;

        const fetchFollowersCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id);

                if (!error) setFollowersCount(count || 0);
            } catch (err) {
                console.error("Error fetching followers:", err);
            }
        };

        const attemptReverseGeocode = async () => {
            // Only auto-geocode if we have coords but the city is still the default or null
            if (user.last_lat && user.last_lng && (!user.location_city || user.location_city === 'Earth')) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${user.last_lat}&lon=${user.last_lng}&zoom=10`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Earth';

                        await supabase
                            .from('users')
                            .update({ location_city: city })
                            .eq('id', user.id);

                        // Refresh user data silently to grab the newly saved city
                        fetchUserProfile(user.id);
                    }
                } catch (err) {
                    console.error("Geocoding failed:", err);
                }
            }
        };

        fetchFollowersCount();
        attemptReverseGeocode();
    }, [user]);

    const openModal = (type) => {
        setModalType(type);
        if (type === 'edit') {
            setEditName(user?.name || '');
            setEditUsername(user?.username || '');
            setEditBio(user?.bio || '');
            setEditTechStack(user?.tech_stack?.join(', ') || '');
            setEditLocation(user?.location_city || 'Earth');
        }
        setError('');
        setIsEditing(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const techArray = editTechStack.split(',').map(t => t.trim()).filter(Boolean);

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: editName,
                    username: editUsername,
                    bio: editBio,
                    location_city: editLocation,
                    tech_stack: techArray
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Refresh the context user
            await fetchUserProfile(user.id);
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const openFollowsModal = (type) => {
        setFollowsModalType(type);
        setIsFollowsModalOpen(true);
    };

    // Filter posts for the current user
    const userPosts = posts?.filter(p => p.author.id === user?.id) || [];
    useGSAP(() => {
        // Parallax banner effect
        gsap.to('.profile-banner', {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '500px top',
                scrub: true
            },
            y: 100,
            scale: 1.1
        });

        gsap.from('.profile-info', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.2
        });

        gsap.from('.profile-stats div', {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.5)',
            delay: 0.4
        });
    });

    if (!user) return null; // Wait for user to be available

    // Format join date
    const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0f0f11] font-sans pb-32">
            {/* Banner */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] to-transparent z-10" />
                <div className="profile-banner absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-emerald-500 opacity-80" />

                {/* Abstract patterns in banner */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] mix-blend-overlay" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-20 -mt-24 md:-mt-32">
                {/* Profile Header */}
                <div className="profile-info flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end mb-8 border-b border-white/5 pb-10">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 blur-md opacity-50" />
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="relative size-32 md:size-48 rounded-full border-4 border-[#0f0f11] object-cover"
                        />
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{user.name}</h1>
                                <p className="text-xl text-gray-500">@{user.username}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => openModal('settings')} className="btn-secondary !py-2 !px-4 flex items-center gap-2">
                                    <Settings size={18} /> Settings
                                </button>
                                <button onClick={() => openModal('edit')} className="btn-primary !py-2 !px-6 flex items-center gap-2">
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            </div>
                        </div>

                        <p className="text-lg text-gray-300 font-paragraph mb-6 max-w-2xl">
                            {user.bio || "No bio yet. Write something about yourself!"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} /> {user.location_city || 'Earth'}
                            </div>
                            <div className="flex items-center gap-2">
                                <LinkIcon size={16} /> <a href="#" className="text-blue-400 hover:underline">bloq.space</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} /> Joined {joinDate}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left Column: Stats & Stack */}
                    <div className="w-full md:w-1/3 space-y-8">

                        {/* Follower Stats */}
                        <div className="profile-stats grid grid-cols-2 gap-4 glass-card p-6">
                            <div
                                onClick={() => openFollowsModal('followers')}
                                className="text-center cursor-pointer hover:bg-white/5 rounded-xl transition-colors p-2 -m-2"
                            >
                                <div className="text-2xl font-bold text-white transition-colors hover:text-primary">{followersCount}</div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Followers</div>
                            </div>
                            <div
                                onClick={() => openFollowsModal('following')}
                                className="text-center border-l border-white/5 cursor-pointer hover:bg-white/5 rounded-xl transition-colors p-2"
                            >
                                <div className="text-2xl font-bold text-white transition-colors hover:text-primary">{following ? following.length : 0}</div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Following</div>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        {user.tech_stack && user.tech_stack.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.tech_stack.map(tech => (
                                        <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-purple-300">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: User's Posts */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/5 inline-block">Published Bloqs <span className="text-gray-500 font-normal text-sm ml-2">{userPosts.length}</span></h3>

                        {postsLoading ? (
                            <div className="flex justify-center items-center py-10 text-primary">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : userPosts.length > 0 ? (
                            <div className="space-y-8">
                                {userPosts.map((post, i) => (
                                    <div key={post.id} className="post-stagger" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 glass-card">
                                <p className="mb-2">You haven't published any bloqs yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
                            {modalType === 'edit' ? 'Edit Profile' : 'Account Settings'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {modalType === 'edit' ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="glass-input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="glass-input w-full min-h-[100px] resize-y"
                                        placeholder="Tell the world about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Location / City</label>
                                    <input
                                        type="text"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="Earth"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Tech Stack (comma separated)</label>
                                    <input
                                        type="text"
                                        value={editTechStack}
                                        onChange={(e) => setEditTechStack(e.target.value)}
                                        className="glass-input w-full font-mono text-sm"
                                        placeholder="e.g. React, Node.js, Python"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn-secondary !px-6"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex items-center gap-2 !px-6"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6 text-gray-300">
                                <p className="font-paragraph">Settings are coming soon. Manage account security and notifications here.</p>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 opacity-50 cursor-not-allowed">
                                        <div>
                                            <p className="font-bold text-white">Dark Mode</p>
                                            <p className="text-xs text-gray-500">Always on, it's a lifestyle.</p>
                                        </div>
                                        <div className="w-10 h-6 bg-primary rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 opacity-50 cursor-not-allowed">
                                        <div>
                                            <p className="font-bold text-white">Email Notifications</p>
                                            <p className="text-xs text-gray-500">Get pinged when people interact.</p>
                                        </div>
                                        <div className="w-10 h-6 bg-white/20 rounded-full relative">
                                            <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="btn-secondary !px-6"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Follows Modal Overlay */}
            <FollowsModal
                isOpen={isFollowsModalOpen}
                onClose={() => setIsFollowsModalOpen(false)}
                userId={user.id}
                type={followsModalType}
                initialCount={followsModalType === 'followers' ? followersCount : (following?.length || 0)}
            />
        </div>
    );
};

export default Profile;
