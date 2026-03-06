import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Loader2, Users, MessageSquare, CheckSquare, Plus, Check, X as XIcon, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSmartDate } from '../utils/dateUtils';

const CollabDashboard = () => {
    const { id: roomId } = useParams();
    const { user } = useAppContext();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [roles, setRoles] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const MESSAGES_PER_PAGE = 50;

    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'tasks';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Fetch Room & Admin
                const { data: roomData, error: roomErr } = await supabase
                    .from('collab_rooms')
                    .select('*, admin:users!collab_rooms_admin_id_fkey(name, username)')
                    .eq('id', roomId)
                    .single();
                if (roomErr) throw roomErr;
                setRoom(roomData);

                // 2. Fetch Roles (with the user who filled them)
                const { data: rolesData, error: rolesErr } = await supabase
                    .from('collab_roles')
                    .select('*, user:users!collab_roles_user_id_fkey(name, username, avatar_url)')
                    .eq('room_id', roomId);
                if (rolesErr) throw rolesErr;
                setRoles(rolesData || []);

                // 3. Fetch Tasks
                const { data: tasksData } = await supabase
                    .from('collab_tasks')
                    .select('*, assignee:users!collab_tasks_assigned_to_fkey(name, avatar_url)')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: false });
                setTasks(tasksData || []);

                // 4. Fetch Messages (Last 50)
                const { data: msgsData } = await supabase
                    .from('collab_messages')
                    .select('*, sender:users!collab_messages_user_id_fkey(name, avatar_url)')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: false })
                    .limit(MESSAGES_PER_PAGE);
                if (msgsData) {
                    setMessages(msgsData.reverse());
                    if (msgsData.length < MESSAGES_PER_PAGE) setHasMoreMessages(false);
                }

                // 5. If Admin, fetch pending requests
                if (roomData.admin_id === user.id) {
                    const { data: reqsData } = await supabase
                        .from('collab_requests')
                        .select('*, target_role:collab_roles(title), applicant:users!collab_requests_user_id_fkey(id, name, username, avatar_url, bio, tech_stack)')
                        .eq('room_id', roomId)
                        .eq('status', 'pending');
                    setRequests(reqsData || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard:", error);
                alert("Room not found or you don't have access.");
                navigate('/collab');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Realtime Subscriptions
        const channel = supabase.channel(`room_${roomId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'collab_messages', filter: `room_id=eq.${roomId}` },
                async (payload) => {
                    // Make sure we don't duplicate optimistic msgs
                    setMessages(prev => {
                        if (prev.some(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new]; // Real info fetched lazily or next load
                    });
                }
            )
            .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_tasks', filter: `room_id=eq.${roomId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTasks(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
                    } else if (payload.eventType === 'DELETE') {
                        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [roomId, user, navigate]);

    // Auto-scroll chat only when at bottom or newly loaded
    useEffect(() => {
        // If we just loaded more messages and aren't at the very bottom, don't force scroll
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const loadMoreMessages = async () => {
        if (!hasMoreMessages || loadingMoreMessages || messages.length === 0) return;
        setLoadingMoreMessages(true);

        try {
            const oldestMessageTime = messages[0].created_at;
            const { data } = await supabase
                .from('collab_messages')
                .select('*, sender:users!collab_messages_user_id_fkey(name, avatar_url)')
                .eq('room_id', roomId)
                .lt('created_at', oldestMessageTime)
                .order('created_at', { ascending: false })
                .limit(MESSAGES_PER_PAGE);

            if (data) {
                if (data.length < MESSAGES_PER_PAGE) setHasMoreMessages(false);

                // Record scroll height before prepending
                const scrollNode = chatContainerRef.current;
                const prevScrollHeight = scrollNode?.scrollHeight || 0;

                setMessages(prev => [...data.reverse(), ...prev]);

                // Adjust scroll position after render so it doesn't jerk
                setTimeout(() => {
                    if (scrollNode) {
                        scrollNode.scrollTop = scrollNode.scrollHeight - prevScrollHeight;
                    }
                }, 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMoreMessages(false);
        }
    };

    const handleChatScroll = (e) => {
        if (e.target.scrollTop === 0) {
            loadMoreMessages();
        }
    };

    const isAdmin = room?.admin_id === user?.id;
    // Check if user is an accepted member by seeing if they occupy a role
    const isMember = roles.some(r => r.user_id === user?.id) || isAdmin;

    const handleKillRoom = async () => {
        if (!window.confirm("Are you sure you want to end and delete this collaboration room? All tasks and chats will be permanently lost.")) return;
        try {
            await supabase.from('collab_rooms').delete().eq('id', room.id);
            navigate('/collab');
        } catch (error) {
            console.error(error);
            alert("Failed to end the room.");
        }
    };

    const handleAcceptRequest = async (request) => {
        try {
            // 1. Update request status
            await supabase.from('collab_requests').update({ status: 'accepted' }).eq('id', request.id);
            // 2. Update role to filled
            await supabase.from('collab_roles').update({ user_id: request.applicant.id, is_filled: true }).eq('id', request.role_id);
            // 3. Remove other pending requests for this specific role
            await supabase.from('collab_requests').update({ status: 'rejected' }).eq('role_id', request.role_id).eq('status', 'pending');

            // Update local state mentally to prevent full reload
            setRequests(requests.filter(r => r.id !== request.id && r.role_id !== request.role_id));
            setRoles(roles.map(r => r.id === request.role_id ? { ...r, is_filled: true, user_id: request.applicant.id, user: request.applicant } : r));
        } catch (error) {
            console.error(error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await supabase.from('collab_requests').update({ status: 'rejected' }).eq('id', requestId);
            setRequests(requests.filter(r => r.id !== requestId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const optimisticTask = {
            id: crypto.randomUUID(),
            room_id: room.id,
            title: newTaskTitle.trim(),
            status: 'todo',
            created_at: new Date().toISOString()
        };

        setTasks(prev => [optimisticTask, ...prev]);
        const titleToSave = newTaskTitle.trim();
        setNewTaskTitle('');

        try {
            const { data, error } = await supabase.from('collab_tasks').insert({
                room_id: room.id,
                title: titleToSave,
                status: 'todo'
            }).select().single();
            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === optimisticTask.id ? data : t));
        } catch (error) {
            console.error(error);
            setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        try {
            await supabase.from('collab_tasks').update({ status: newStatus }).eq('id', taskId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = newMessage;
        setNewMessage('');

        const optimisticMsg = {
            id: crypto.randomUUID(),
            room_id: room.id,
            user_id: user.id,
            content: msg,
            created_at: new Date().toISOString(),
            sender: { name: user.name, avatar_url: user.avatar }
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data, error } = await supabase.from('collab_messages').insert({
                room_id: room.id,
                user_id: user.id,
                content: msg
            }).select('*, sender:users!collab_messages_user_id_fkey(name, avatar_url)').single();
            if (error) throw error;
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-primary" /></div>;
    }

    if (!isMember && !isAdmin) {
        return (
            <div className="p-20 text-center">
                <Users size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-400">You must be accepted into this room to view the dashboard.</p>
                <button onClick={() => navigate('/collab')} className="mt-6 text-primary underline">Go back to Explore</button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col bg-[#0f0f11] text-white">
            {/* Header */}
            <div className="h-16 md:h-20 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between px-6 shrink-0">
                <div>
                    <h1 className="text-xl font-bold truncate">{room.title}</h1>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                        Hosted by @{room.admin.username}
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        {roles.filter(r => r.is_filled).length}/{roles.length} Members
                    </p>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex bg-white/5 rounded-xl p-1 shrink-0">
                    <button onClick={() => setActiveTab('tasks')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <CheckSquare size={16} /> Tasks
                    </button>
                    <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <MessageSquare size={16} /> Chat
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                <Users size={16} /> Requests
                                {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>}
                            </button>
                            <button onClick={handleKillRoom} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-red-500 hover:bg-red-500/20 hover:text-red-400 ml-2 border border-transparent hover:border-red-500/30">
                                <Trash2 size={16} /> Kill Room
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- TASKS TAB --- */}
                {activeTab === 'tasks' && (
                    <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-8">
                        {/* Add Task Form */}
                        <form onSubmit={handleCreateTask} className="flex gap-2">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Add a new task..."
                                className="glass-input flex-1 !rounded-xl"
                            />
                            <button type="submit" disabled={!newTaskTitle.trim()} className="bg-primary text-white px-4 rounded-xl disabled:opacity-50"><Plus size={20} /></button>
                        </form>

                        {/* Kanban Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['todo', 'in-progress', 'done'].map(statusColumn => {
                                const columnTasks = tasks.filter(t => t.status === statusColumn);
                                const titles = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Complete' };
                                return (
                                    <div key={statusColumn} className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-4 flex flex-col h-[500px]">
                                        <h3 className="font-bold text-gray-400 mb-4 capitalize flex items-center justify-between">
                                            {titles[statusColumn]}
                                            <span className="bg-white/5 text-white px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                            <AnimatePresence>
                                                {columnTasks.map(task => (
                                                    <motion.div
                                                        key={task.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-colors"
                                                    >
                                                        <p className="text-sm font-medium mb-3">{task.title}</p>

                                                        <div className="flex justify-between items-center text-xs">
                                                            <select
                                                                className="bg-black text-gray-400 rounded-md p-1 border border-white/10 outline-none"
                                                                value={task.status}
                                                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                                            >
                                                                <option value="todo">To Do</option>
                                                                <option value="in-progress">Building</option>
                                                                <option value="done">Done</option>
                                                            </select>
                                                            <span className="text-gray-600">{formatSmartDate(task.created_at)}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- CHAT TAB --- */}
                {activeTab === 'chat' && (
                    <div className="flex h-full max-w-5xl mx-auto w-full border-x border-white/5 bg-[#0a0a0c]">
                        <div className="flex-1 flex flex-col relative w-full h-full">
                            <div
                                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
                                ref={chatContainerRef}
                                onScroll={handleChatScroll}
                            >
                                {loadingMoreMessages && (
                                    <div className="flex justify-center my-4">
                                        <Loader2 size={24} className="animate-spin text-gray-400" />
                                    </div>
                                )}
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, index) => {
                                        const isMine = msg.user_id === user.id;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}
                                            >
                                                {!isMine && <img src={msg.sender?.avatar_url} className="w-8 h-8 rounded-full border border-white/10 shrink-0" />}
                                                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                    {!isMine && <span className="text-xs text-primary font-bold mb-1 ml-1">{msg.sender?.name}</span>}
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary text-white rounded-tr-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'}`}>
                                                        {msg.content}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="absolute bottom-0 w-full p-4 bg-[#0a0a0c] border-t border-white/5 backdrop-blur-md">
                                <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message team..."
                                        className="glass-input w-full !py-3 !pl-4 !pr-16 !rounded-full shrink-0 min-w-0" // prevent flex overflow
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-2 p-2 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors disabled:opacity-50"
                                    >
                                        <Send size={16} className="ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right sidebar for chat showing roles */}
                        <div className="hidden lg:block w-64 border-l border-white/5 p-4 bg-black/20">
                            <h3 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wider">The Team</h3>
                            <div className="space-y-4">
                                {roles.map(role => (
                                    <div key={role.id} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full border border-white/10 shrink-0 flex items-center justify-center ${role.is_filled ? '' : 'bg-white/5 text-gray-500 border-dashed'}`}>
                                            {role.is_filled ? <img src={role.user?.avatar_url} className="rounded-full w-full h-full" /> : '?'}
                                        </div>
                                        <div className="flex-1 truncate min-w-0">
                                            <p className="text-xs font-medium text-white truncate">{role.title}</p>
                                            <p className="text-[10px] text-primary truncate">{role.is_filled ? `@${role.user?.username}` : 'Open'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ADMIN TAB --- */}
                {isAdmin && activeTab === 'admin' && (
                    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Manage Join Requests</h2>

                        {requests.length === 0 ? (
                            <div className="text-center p-12 glass-card rounded-2xl border border-white/5">
                                <CheckSquare size={40} className="mx-auto text-emerald-500 opacity-50 mb-4" />
                                <h3 className="text-lg font-bold mb-1">Inbox Zero</h3>
                                <p className="text-gray-400">You don't have any pending requests to join your room.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {requests.map((req, index) => (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="glass-card p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center"
                                        >
                                            <img src={req.applicant.avatar_url} className="w-12 h-12 rounded-full border border-white/10 shrink-0" />

                                            <div className="flex-1 min-w-0 md:mr-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-bold text-white text-lg truncate">{req.applicant.name} <span className="text-gray-500 font-normal text-sm">@{req.applicant.username}</span></h3>
                                                </div>
                                                <p className="text-sm font-bold text-primary mb-2">Applied for: {req.target_role?.title}</p>
                                                <p className="text-xs text-gray-400 line-clamp-2">{req.applicant.bio || 'No bio provided.'}</p>
                                            </div>

                                            <div className="flex w-full md:w-auto gap-2 md:flex-col shrink-0">
                                                <button
                                                    onClick={() => handleAcceptRequest(req)}
                                                    className="flex-1 md:w-full bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/50 text-emerald-400 hover:text-white px-4 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all"
                                                >
                                                    <Check size={16} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="flex-1 md:w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all"
                                                >
                                                    <XIcon size={16} /> Decline
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden h-16 border-t border-white/5 bg-[#0a0a0c] flex justify-around items-center shrink-0 pb-safe">
                <button onClick={() => setActiveTab('tasks')} className={`p-2 ${activeTab === 'tasks' ? 'text-primary' : 'text-gray-500'}`}><CheckSquare size={24} /></button>
                <button onClick={() => setActiveTab('chat')} className={`p-2 ${activeTab === 'chat' ? 'text-primary' : 'text-gray-500'}`}><MessageSquare size={24} /></button>
                {isAdmin && (
                    <>
                        <button onClick={() => setActiveTab('admin')} className={`p-2 relative ${activeTab === 'admin' ? 'text-primary' : 'text-gray-500'}`}>
                            <Users size={24} />
                            {requests.length > 0 && <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2" />}
                        </button>
                        <button onClick={handleKillRoom} className="p-2 text-red-500 hover:text-red-400">
                            <Trash2 size={24} />
                        </button>
                    </>
                )}
            </div>
        </div >
    );
};

export default CollabDashboard;
