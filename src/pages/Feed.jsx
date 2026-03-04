import { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAppContext } from '../context/AppContext';
import PostCard from '../components/feed/PostCard';
import { Flame, Clock, Users, Loader2 } from 'lucide-react';

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
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl font-medium text-white mb-2">
                            {activeTab === 'following' ? "You aren't following anyone yet." : "No posts found."}
                        </p>
                        <p>
                            {activeTab === 'following'
                                ? "Switch to 'Latest' or 'Hot' to discover amazing creators!"
                                : "Check back later for new content."}
                        </p>
                    </div>
                )}
            </div>

            {/* End of feed indicator */}
            {!postsLoading && filteredPosts.length > 0 && (
                <div className="mt-16 text-center text-gray-500 font-paragraph">
                    <div className="w-12 h-1 bg-white/10 mx-auto rounded-full mb-4" />
                    You've caught up with your feed!
                </div>
            )}
        </div>
    );
};

export default Feed;
