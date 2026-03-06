import { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import PostCard from '../components/feed/PostCard';
import { Flame, Clock, Users, Loader2, Compass, UserPlus } from 'lucide-react';

const Feed = () => {
    const { posts, postsLoading, following } = useAppContext();
    const [activeTab, setActiveTab] = useState('following'); // 'following', 'latest', 'hot'
    useGSAP(() => {
        gsap.fromTo('.feed-header',
            { y: -20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            }
        );

        gsap.fromTo('.post-stagger',
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.2
            }
        );
    }, [activeTab, postsLoading]);

    // Filter and Sort Logic
    const getFilteredPosts = () => {
        if (!posts) return [];

        // Create a copy to avoid mutating original state when sorting
        let currentPosts = [...posts];

        if (activeTab === 'following') {
            currentPosts = currentPosts.filter(post => following?.includes(post.author.id));
        } else if (activeTab === 'hot') {
            currentPosts.sort((a, b) => b.likes_count - a.likes_count);
        }
        // 'latest' just uses the default order from AppContext

        return currentPosts;
    };

    const filteredPosts = getFilteredPosts();

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 pb-32 font-sans min-h-screen">

            {/* Feed Filters / Header */}
            <div className="feed-header flex items-center justify-between mb-10 pb-4 border-b border-white/5">
                <h1 className="text-3xl font-bold tracking-tight text-white">Your Feed</h1>

                <div className="flex bg-darker/50 rounded-full p-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'following' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Users size={16} className={activeTab === 'following' ? 'text-blue-400' : ''} /> Following
                    </button>
                    <button
                        onClick={() => setActiveTab('latest')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'latest' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Clock size={16} className={activeTab === 'latest' ? 'text-green-400' : ''} /> Latest
                    </button>
                    <button
                        onClick={() => setActiveTab('hot')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hidden sm:flex ${activeTab === 'hot' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Flame size={16} className={activeTab === 'hot' ? 'text-orange-500' : ''} /> Hot
                    </button>
                </div>
            </div>

            {/* The Feed */}
            <div className="space-y-12">
                {postsLoading ? (
                    <div className="flex justify-center items-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post, i) => (
                        <div key={post.id} className="post-stagger" style={{ opacity: 0, transform: 'translateY(50px)' }}>
                            <PostCard post={post} />
                        </div>
                    ))
                ) : null}
            </div>

            {/* End of feed indicator / Suggestions */}
            {!postsLoading && filteredPosts.length >= 5 && (
                <div className="mt-16 text-center text-gray-500 font-paragraph">
                    <div className="w-12 h-1 bg-white/10 mx-auto rounded-full mb-4" />
                    You've caught up with your feed!
                </div>
            )}

            {!postsLoading && filteredPosts.length < 5 && (
                <div className="mt-16 p-8 rounded-3xl glass-card border border-white/5 bg-gradient-to-br from-white/5 to-transparent text-center relative overflow-hidden backdrop-blur-xl">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Compass className="text-primary" size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        {filteredPosts.length === 0 ? "Your feed is quiet" : "Want to see more content?"}
                    </h3>

                    <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed font-paragraph">
                        Follow more developers to improve your feed and get inspired, or see what's trending right now.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/explore" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
                            <UserPlus size={18} />
                            Follow developers
                        </Link>
                        <button onClick={() => setActiveTab('hot')} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-white/20">
                            <Flame size={18} className="text-orange-500" />
                            Explore trending posts
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;
