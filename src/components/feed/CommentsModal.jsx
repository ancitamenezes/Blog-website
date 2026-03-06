import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';
import { X, Send, Loader2 } from 'lucide-react';
import { formatSmartDate } from '../../utils/dateUtils';
import ActivityBadge from '../profile/ActivityBadge';

const CommentsModal = ({ post, onClose, onCommentAdded }) => {
    const { user } = useAppContext();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchComments();
    }, [post.id]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    id,
                    content,
                    created_at,
                    users(id, name, username, avatar_url)
                `)
                .eq('post_id', post.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setErrorMsg('Failed to load comments.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const { data: newCommentData, error } = await supabase
                .from('comments')
                .insert({
                    user_id: user.id,
                    post_id: post.id,
                    content: newComment.trim()
                })
                .select(`
                    id,
                    content,
                    created_at,
                    users(id, name, username, avatar_url)
                `)
                .single();

            if (error) throw error;

            setNewComment('');
            setComments(prev => [newCommentData, ...prev]);

            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            setErrorMsg('Failed to post comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 origin-top">
            <div className="flex flex-col max-h-[400px]">

                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        Comments <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{comments.length}</span>
                    </h3>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                            <p className="font-paragraph text-lg">No comments yet.</p>
                            <p className="text-sm">Be the first to start the conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-4">
                                    <img
                                        src={comment.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                                        alt={comment.users?.name || 'User'}
                                        className="size-8 rounded-full border border-white/10 shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">{comment.users?.name || 'Anonymous'}</span>
                                            <ActivityBadge user={comment.users} className="scale-[0.80] origin-left" />
                                            <span className="text-xs text-gray-500">@{comment.users?.username || 'user'}</span>
                                            <span className="text-xs text-gray-600">• {formatSmartDate(comment.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 font-paragraph break-words whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Input Area */}
                <div className="pt-4 mt-auto">
                    {user ? (
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <img
                                src={user.avatar}
                                alt="You"
                                className="absolute left-3 size-8 rounded-full border border-white/10"
                            />
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="glass-input w-full pl-14 pr-12 py-3 rounded-full text-sm bg-black/20"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="absolute right-2 p-2 text-primary hover:text-purple-400 disabled:opacity-50 disabled:hover:text-primary transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-sm text-gray-400">Sign in to leave a comment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentsModal;
