import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PostCard from '../components/feed/PostCard';
import { Search, Compass, Loader2 } from 'lucide-react';

const Explore = () => {
    const { posts, postsLoading } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter posts based on search query
    const filteredPosts = posts.filter(post => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(q) ||
            post.snippet.toLowerCase().includes(q) ||
            post.author.name.toLowerCase().includes(q) ||
            post.author.username.toLowerCase().includes(q)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pb-32">

            {/* Header section */}
            <div className="mb-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 mb-2 border border-white/5">
                    <Compass size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Explore Bloq Space</h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover trending discussions, insightful articles, and connect with creative minds across the platform.</p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mt-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-[#18181b] border border-white/10 rounded-2xl p-2 pl-4 focus-within:border-primary/50 transition-colors">
                        <Search size={20} className="text-gray-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search posts, authors, or topics..."
                            className="bg-transparent border-none text-white w-full outline-none px-4 py-2 font-paragraph placeholder-gray-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {postsLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                    {filteredPosts.map((post, i) => (
                        <div key={post.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                            <PostCard post={post} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 text-gray-400 mb-4 border border-white/10">
                        <Search size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-gray-400 font-paragraph">We couldn't find any bloqs matching "{searchQuery}".</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-6 btn-secondary"
                    >
                        Clear Search
                    </button>
                </div>
            )}

        </div>
    );
};

export default Explore;
