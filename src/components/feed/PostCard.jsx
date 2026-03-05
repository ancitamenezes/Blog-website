import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, GitFork } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import CommentsModal from './CommentsModal';
import parse from 'html-react-parser';
import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark } from '@codesandbox/sandpack-themes';

const PostCard = ({ post }) => {
    const { user, following, fetchPosts, fetchFollowing } = useAppContext();
    const navigate = useNavigate();

    // Check if the current user has liked or bookmarked this post based on the aggregated array
    const hasLiked = user && post.likes_data ? post.likes_data.some(like => like.user_id === user.id) : false;
    const hasBookmarked = user && post.bookmarks_data ? post.bookmarks_data.some(bm => bm.user_id === user.id) : false;

    // Check if the current user is following the author of this post
    const isFollowing = following?.includes(post.author.id);

    const [isLiked, setIsLiked] = useState(hasLiked);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [commentsCount, setCommentsCount] = useState(post.comments || 0);
    const [isBookmarked, setIsBookmarked] = useState(hasBookmarked);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    const handleLike = async () => {
        if (!user) return alert("You must be logged in to like posts.");

        const previousLiked = isLiked;
        const previousCount = likesCount;

        // Optimistic update
        setIsLiked(!previousLiked);
        setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

        try {
            if (previousLiked) {
                // Unlike: Remove from database
                await supabase
                    .from('likes')
                    .delete()
                    .match({ user_id: user.id, post_id: post.id });
            } else {
                // Like: Insert into database
                await supabase
                    .from('likes')
                    .insert({ user_id: user.id, post_id: post.id });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert on failure
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
        }
    };

    const handleBookmark = async () => {
        if (!user) return alert("You must be logged in to bookmark posts.");

        const previousBookmarked = isBookmarked;

        // Optimistic update
        setIsBookmarked(!previousBookmarked);

        try {
            if (previousBookmarked) {
                await supabase
                    .from('bookmarks')
                    .delete()
                    .match({ user_id: user.id, post_id: post.id });
            } else {
                await supabase
                    .from('bookmarks')
                    .insert({ user_id: user.id, post_id: post.id });
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            setIsBookmarked(previousBookmarked);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this bloq?")) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id);
            if (error) throw error;

            // Refresh the feed
            await fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post.");
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
        }
    };

    const handleFollowToggle = async (e) => {
        e.stopPropagation();
        if (!user) return alert("You must be logged in to follow users.");

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from('follows')
                    .delete()
                    .match({ follower_id: user.id, following_id: post.author.id });
            } else {
                // Follow
                await supabase
                    .from('follows')
                    .insert({ follower_id: user.id, following_id: post.author.id });
            }
            // Refresh following list in global state
            await fetchFollowing(user.id);
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    if (isDeleting) {
        return <div className="glass-card animate-pulse h-64 opacity-50 flex items-center justify-center text-gray-500">Deleting...</div>;
    }

    const parseOptions = {
        replace: (domNode) => {
            if (domNode.attribs && domNode.attribs['data-type'] === 'sandpack') {
                const template = domNode.attribs.template || 'react';
                const code = domNode.attribs.code || '';

                return (
                    <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                        <div className="bg-[#0f0f11] px-4 py-2 text-xs font-mono text-emerald-400 border-b border-white/10 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live {template}
                        </div>
                        <Sandpack
                            template={template}
                            theme={atomDark}
                            files={{ "/App.js": code }}
                            options={{
                                showNavigator: false,
                                showLineNumbers: true,
                                editorHeight: 400,
                                classes: {
                                    "sp-layout": "!border-none !bg-[#1a1a1a]",
                                    "sp-wrapper": "!border-none",
                                }
                            }}
                            customSetup={{
                                dependencies: {
                                    "lucide-react": "latest",
                                    "framer-motion": "latest"
                                }
                            }}
                        />
                    </div>
                );
            }
        }
    };

    return (
        <article className="glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            {/* Cover Image */}
            {post.coverImage && (
                <div className="h-64 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent z-10" />
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover select-none"
                        loading="lazy"
                    />

                    {/* Tags floating on image */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="absolute bottom-4 left-6 z-20 flex gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-mono text-purple-300 border border-white/10 uppercase">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Forked Badge */}
                    {post.parent_post && (
                        <Link to={`/u/${post.parent_post.author.username}`} className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg border border-blue-400/30 transition-colors">
                            <GitFork size={14} /> Forked from @{post.parent_post.author.username}
                        </Link>
                    )}
                    {post.parent_post_id && !post.parent_post && (
                        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-blue-600/80 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg border border-blue-400/30">
                            <GitFork size={14} /> Forked Piece
                        </div>
                    )}
                </div>
            )}

            {/* If no cover image, still show fork badge if applicable */}
            {!post.coverImage && (
                <>
                    {post.parent_post && (
                        <div className="px-6 pt-4 pb-0">
                            <Link to={`/u/${post.parent_post.author.username}`} className="inline-flex px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded-full text-xs font-bold text-blue-400 items-center gap-1.5 border border-blue-500/20 transition-colors">
                                <GitFork size={14} /> Forked from @{post.parent_post.author.username}
                            </Link>
                        </div>
                    )}
                    {post.parent_post_id && !post.parent_post && (
                        <div className="px-6 pt-4 pb-0">
                            <div className="inline-flex px-3 py-1.5 bg-blue-600/20 rounded-full text-xs font-bold text-blue-400 items-center gap-1.5 border border-blue-500/20">
                                <GitFork size={14} /> Forked Piece
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="p-6">
                {/* Author Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/u/${post.author.username}`} className="shrink-0 relative group">
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="relative size-10 rounded-full border border-white/10"
                            />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link to={`/u/${post.author.username}`} className="font-bold text-white leading-none hover:text-primary transition-colors">
                                    {post.author.name}
                                </Link>
                                {user && user.id !== post.author.id && (
                                    <>
                                        <span className="text-gray-600 text-xs">•</span>
                                        <button
                                            onClick={handleFollowToggle}
                                            className={`text-xs font-bold leading-none ${isFollowing ? 'text-gray-400 hover:text-white' : 'text-blue-400 hover:text-blue-300'} transition-colors`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                <Link to={`/u/${post.author.username}`} className="hover:text-white transition-colors">
                                    @{post.author.username}
                                </Link> • {post.createdAt}
                            </p>
                        </div>
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#18181b] border border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
                                {user?.id === post.author.id && (
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete Bloq
                                    </button>
                                )}
                                <button
                                    className="w-full text-left px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Share2 size={16} /> Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2 cursor-pointer group">
                    <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                        {post.title}
                    </h2>
                    <div className="text-gray-400 font-paragraph line-clamp-3 leading-relaxed prose prose-invert prose-purple max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-lg">
                        {parse(post.fullContent || post.snippet, parseOptions)}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                        >
                            <Heart size={20} className={isLiked ? "fill-current" : ""} />
                            <span className="text-sm font-bold">{likesCount}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-2 transition-colors ${showComments ? 'text-blue-400' : 'hover:text-blue-400'}`}
                        >
                            <MessageCircle size={20} className={showComments ? "fill-blue-400/20" : ""} />
                            <span className="text-sm font-bold">{commentsCount}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (!user) return alert("You must be logged in to fork articles.");
                                navigate('/create', { state: { forkData: post } });
                            }}
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                            title="Fork this piece"
                        >
                            <GitFork size={20} />
                        </button>

                        <button
                            onClick={handleBookmark}
                            className={`transition-colors ${isBookmarked ? 'text-green-400' : 'hover:text-green-400'}`}
                        >
                            <Bookmark size={20} className={isBookmarked ? "fill-current" : ""} />
                        </button>
                        <button className="hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section (Inline) */}
            {showComments && (
                <CommentsModal post={post} onCommentAdded={() => setCommentsCount(c => c + 1)} />
            )}
        </article>
    );
};

export default PostCard;
