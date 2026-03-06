import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import PostCard from '../components/feed/PostCard';
import FollowsModal from '../components/profile/FollowsModal';
import GitHubStatsCard from '../components/profile/GitHubStatsCard';
import { MapPin, Link as LinkIcon, Calendar, Loader2, ArrowLeft, Github } from 'lucide-react';

const PublicProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, following, fetchFollowing } = useAppContext();

    const [profileUser, setProfileUser] = useState(null);
    const [profilePosts, setProfilePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Follows Modal State
    const [isFollowsModalOpen, setIsFollowsModalOpen] = useState(false);
    const [followsModalType, setFollowsModalType] = useState('followers');

    // If the viewed profile is the logged-in user, redirect to their private /profile
    useEffect(() => {
        if (currentUser && profileUser && currentUser.username === profileUser.username) {
            navigate('/profile', { replace: true });
        }
    }, [currentUser, profileUser, navigate]);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Fetch User Details by Username
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .single();

                if (userError || !userData) {
                    throw new Error("User not found.");
                }

                // Map avatar_url to avatar for consistency
                const userObj = { ...userData, avatar: userData.avatar_url };
                setProfileUser(userObj);

                // 2. Fetch User's Posts
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        author:users(id, name, username, avatar_url),
                        likes(user_id),
                        bookmarks(user_id),
                        comments(id),
                        parent_post:parent_post_id(
                            id,
                            title,
                            author:users(name, username, avatar_url)
                        )
                    `)
                    .eq('user_id', userObj.id)
                    .order('created_at', { ascending: false });

                if (!postError && postData) {
                    const formattedPosts = postData.map(post => {
                        const plainTextSnippet = (post.content || '').replace(/<[^>]*>?/gm, '');
                        return {
                            id: post.id,
                            title: post.title,
                            snippet: plainTextSnippet.substring(0, 150) + (plainTextSnippet.length > 150 ? '...' : ''),
                            fullContent: post.content,
                            coverImage: post.cover_image,
                            createdAt: new Date(post.created_at).toLocaleDateString(),
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
                            tags: [],
                            likes_count: post.likes ? post.likes.length : 0,
                            likes_data: post.likes || [],
                            bookmarks_data: post.bookmarks || [],
                            comments: post.comments ? post.comments.length : 0
                        };
                    });
                    setProfilePosts(formattedPosts);
                }

                // 3. Fetch Follower Counts
                const { count: followers, error: followersErr } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', userObj.id);
                if (!followersErr) setFollowersCount(followers || 0);

                const { count: followingCountData, error: followingErr } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', userObj.id);
                if (!followingErr) setFollowingCount(followingCountData || 0);

            } catch (err) {
                console.error("Error fetching public profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfileData();
        }
    }, [username]);

    // Animations
    useGSAP(() => {
        if (!loading && profileUser) {
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

            gsap.fromTo('.profile-info',
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: 0.1
                }
            );

            gsap.fromTo('.post-stagger',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    delay: 0.3
                }
            );
        }
    }, [loading, profileUser]);


    const isFollowing = profileUser && following?.includes(profileUser.id);

    const handleFollowToggle = async () => {
        if (!currentUser) return alert("You must be logged in to follow users.");
        if (!profileUser) return;

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from('follows')
                    .delete()
                    .match({ follower_id: currentUser.id, following_id: profileUser.id });
                setFollowersCount(prev => prev - 1);
            } else {
                // Follow
                await supabase
                    .from('follows')
                    .insert({ follower_id: currentUser.id, following_id: profileUser.id });
                setFollowersCount(prev => prev + 1);
            }
            // Refresh global following state
            await fetchFollowing(currentUser.id);
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    const openFollowsModal = (type) => {
        setFollowsModalType(type);
        setIsFollowsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-primary">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="text-gray-400 font-medium tracking-wide">Looking up user...</p>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-white mb-4">User Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-md">We couldn't find a bloq space for <span className="text-primary">@{username}</span>.</p>
                <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const joinDate = new Date(profileUser.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0f0f11] font-sans pb-32">
            {/* Banner */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative group">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 z-50 p-2 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all transform hover:-translate-x-1"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] to-transparent z-10" />
                <div className="profile-banner absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-70" />

                {/* Abstract patterns in banner */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] mix-blend-overlay" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-20 -mt-24 md:-mt-32">
                {/* Profile Header */}
                <div className="profile-info flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end mb-8 border-b border-white/5 pb-10">
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 blur-md opacity-50" />
                        <img
                            src={profileUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                            alt={profileUser.name}
                            className="relative size-32 md:size-48 rounded-full border-4 border-[#0f0f11] object-cover"
                        />
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{profileUser.name}</h1>
                                <p className="text-xl text-gray-500">@{profileUser.username}</p>
                            </div>

                            {/* Follow Button */}
                            {currentUser && (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`!py-2 !px-8 flex items-center gap-2 transition-all ${isFollowing
                                        ? 'bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/10'
                                        : 'btn-primary'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>

                        <p className="text-lg text-gray-300 font-paragraph mb-6 max-w-2xl">
                            {profileUser.bio || "No bio supplied."}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-400 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} /> {profileUser.location_city || 'Earth'}
                            </div>
                            {profileUser.github_username && (
                                <div className="flex items-center gap-2">
                                    <Github size={16} /> <a href={`https://github.com/${profileUser.github_username}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline">{profileUser.github_username}</a>
                                </div>
                            )}
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
                        <div className="grid grid-cols-2 gap-4 glass-card p-6">
                            <div
                                onClick={() => openFollowsModal('followers')}
                                className="text-center cursor-pointer hover:bg-white/5 rounded-xl transition-colors p-2 -m-2"
                            >
                                <div className="text-2xl font-bold text-white mb-1 transition-colors hover:text-primary">{followersCount}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Followers</div>
                            </div>
                            <div
                                onClick={() => openFollowsModal('following')}
                                className="text-center border-l border-white/5 cursor-pointer hover:bg-white/5 rounded-xl transition-colors p-2"
                            >
                                <div className="text-2xl font-bold text-white mb-1 transition-colors hover:text-primary">{followingCount}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Following</div>
                            </div>
                        </div>

                        {/* GitHub Stats */}
                        {profileUser.github_username && (
                            <GitHubStatsCard username={profileUser.github_username} />
                        )}

                        {/* Tech Stack */}
                        {profileUser.tech_stack && profileUser.tech_stack.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white tracking-tight">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profileUser.tech_stack.map(tech => (
                                        <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-purple-300">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: User's Posts */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/5 inline-block">
                            Bloqs <span className="text-gray-500 font-normal text-sm ml-2">{profilePosts.length}</span>
                        </h3>

                        {profilePosts.length > 0 ? (
                            <div className="space-y-8">
                                {profilePosts.map((post, i) => (
                                    <div key={post.id} className="post-stagger">
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 glass-card">
                                <p className="mb-2">@{profileUser.username} hasn't published any bloqs yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Follows Modal Overlay */}
            {profileUser && (
                <FollowsModal
                    isOpen={isFollowsModalOpen}
                    onClose={() => setIsFollowsModalOpen(false)}
                    userId={profileUser.id}
                    type={followsModalType}
                    initialCount={followsModalType === 'followers' ? followersCount : followingCount}
                />
            )}
        </div>
    );
};

export default PublicProfile;
