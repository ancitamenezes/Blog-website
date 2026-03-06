import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, GitMerge, Loader2, ArrowRight } from 'lucide-react';
import { formatSmartDate } from '../../utils/dateUtils';
import { getActivityStatus, getAvatarGlowClass } from '../../utils/activityUtils';
import ActivityBadge from '../profile/ActivityBadge';
import { Link } from 'react-router-dom';

const ForkInfoModal = ({ post, onClose }) => {
    const [activeTab, setActiveTab] = useState('original'); // 'original' or 'chain'
    const [originalPost, setOriginalPost] = useState(null);
    const [forkChain, setForkChain] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchForkData();
    }, [post.id]);

    const fetchForkData = async () => {
        setLoading(true);
        setError('');
        try {
            // First, find the immediate parent IF we don't already have it fully populated.
            // But we actually need to trace all the way up. We'll do a simple iterative approach up to 5 levels max.

            let chain = [post]; // Start the chain with the current post
            let currentPostId = post.parent_post_id;
            let currentLevel = 0;
            const maxLevels = 5;

            while (currentPostId && currentLevel < maxLevels) {
                const { data: parentData, error: parentError } = await supabase
                    .from('posts')
                    .select(`
                        id,
                        title,
                        content,
                        created_at,
                        parent_post_id,
                        author:users(id, name, username, avatar_url)
                    `)
                    .eq('id', currentPostId)
                    .single();

                if (parentError) {
                    console.error("Could not fetch parent ID:", currentPostId);
                    // We might hit a deleted post. Stop tracing.
                    break;
                }

                if (parentData) {
                    chain.push(parentData);
                    currentPostId = parentData.parent_post_id; // Go up the chain
                } else {
                    break;
                }
                currentLevel++;
            }

            // The chain is currently [Current Post, Parent, Grandparent, ...]
            // Reverse it so it reads [Original (Grandparent), Parent, Current Post]
            const reversedChain = [...chain].reverse();

            setForkChain(reversedChain);

            // The original post is the first one in the reversed chain (the oldest ancestor we found)
            if (reversedChain.length > 1) {
                setOriginalPost(reversedChain[0]);
            } else {
                setOriginalPost(post.parent_post || null); // fallback to just the immediate parent from the prop
            }

        } catch (err) {
            console.error("Error fetching fork lineage:", err);
            setError("Could not trace the full fork lineage.");
        } finally {
            setLoading(false);
        }
    };

    if (!document.body) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#0f0f11] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
            >
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                            <GitMerge size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">Fork Details</h2>
                            <p className="text-sm text-gray-500">Inspiration lineage</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-white/5 shrink-0">
                    <button
                        onClick={() => setActiveTab('original')}
                        className={`py-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'original' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Original Post
                    </button>
                    <button
                        onClick={() => setActiveTab('chain')}
                        className={`py-4 px-2 ml-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'chain' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Fork Chain
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#0a0a0c]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-blue-500">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="text-sm text-gray-400">Tracing back the origin...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <div className="inline-flex w-16 h-16 rounded-full bg-red-500/10 items-center justify-center text-red-500 mb-4">
                                <X size={32} />
                            </div>
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : activeTab === 'original' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {originalPost ? (
                                <div className="glass-card p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10" />

                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <Link to={`/u/${originalPost.author?.username}`} className="shrink-0" onClick={onClose} >
                                            <img
                                                src={originalPost.author?.avatar_url || originalPost.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                                                alt={originalPost.author?.name}
                                                className={`w-10 h-10 rounded-full object-cover border border-white/10 ${getAvatarGlowClass(getActivityStatus(originalPost.author?.id))}`}
                                            />
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/u/${originalPost.author?.username}`} className="font-bold text-white hover:text-blue-400 transition-colors" onClick={onClose}>
                                                    {originalPost.author?.name}
                                                </Link>
                                                <ActivityBadge user={originalPost.author} className="scale-[0.80] origin-left" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                @{originalPost.author?.username} • {originalPost.created_at ? formatSmartDate(originalPost.created_at) : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold text-white mb-2 leading-snug">{originalPost.title}</h3>
                                        <p className="text-gray-300 text-sm font-paragraph leading-relaxed">
                                            {(originalPost.content || '').replace(/<[^>]*>?/gm, '') || "No text content available."}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">ORIGINAL</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    Original post data could not be fully loaded. It may have been deleted.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 py-2">
                            <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                {forkChain.map((chainItem, index) => {
                                    const isCurrent = chainItem.id === post.id;
                                    const isOriginal = index === 0;

                                    return (
                                        <div key={chainItem.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8 last:mb-0">
                                            {/* Icon/Dot in middle */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0c] bg-[#18181b] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                                                {isOriginal ? (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                ) : isCurrent ? (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                                                ) : (
                                                    <GitFork size={14} className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Card */}
                                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 transition-all duration-300 ${isCurrent ? 'border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' : 'hover:border-white/20'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Link to={`/u/${chainItem.author?.username}`} onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                                        <img
                                                            src={chainItem.author?.avatar_url || chainItem.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                                                            className="w-5 h-5 rounded-full"
                                                            alt={chainItem.author?.name}
                                                        />
                                                        <span className="text-sm font-bold text-white hover:text-blue-400 transition-colors">@{chainItem.author?.username}</span>
                                                    </Link>
                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                        {chainItem.created_at ? new Date(chainItem.created_at).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-300 font-paragraph line-clamp-2 leading-relaxed">
                                                    {chainItem.title}
                                                </p>

                                                <div className="mt-3 flex gap-2">
                                                    {isOriginal && <span className="text-[9px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">The Spark (Original)</span>}
                                                    {isCurrent && <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">This Post</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'original' && originalPost && (
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end shrink-0">
                        <button
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                            onClick={() => setActiveTab('chain')}
                        >
                            View how this evolved <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>,
        document.body
    );
};

export default ForkInfoModal;
