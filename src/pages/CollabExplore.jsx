import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Users, Plus, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CollabExplore = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState({});

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Fetch recruiting rooms along with their roles and admin info
                const { data, error } = await supabase
                    .from('collab_rooms')
                    .select(`
                        *,
                        admin:users!collab_rooms_admin_id_fkey(name, username, avatar_url),
                        roles:collab_roles(*)
                    `)
                    .eq('status', 'recruiting')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRooms(data || []);
            } catch (error) {
                console.error("Error fetching collab rooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();

        // Subscribe to real-time room deletions to immediately sync the dashboard
        const channel = supabase.channel('public:collab_rooms')
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'collab_rooms' }, (payload) => {
                setRooms(prev => prev.filter(room => room.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleRequestJoin = async (roomId, roleId) => {
        if (!user) {
            alert('Please sign in to join a room.');
            return;
        }

        setLoadingRoles(prev => ({ ...prev, [roleId]: true }));

        try {
            const { error } = await supabase
                .from('collab_requests')
                .insert({
                    room_id: roomId,
                    role_id: roleId,
                    user_id: user.id,
                    status: 'pending'
                });

            if (error) {
                if (error.code === '23505') { // Unique constrained violation error code in Postgres
                    alert("You have already requested to join this role!");
                } else {
                    throw error;
                }
            } else {
                alert("Request sent to the admin successfully!");
            }
        } catch (error) {
            console.error("Error requesting to join:", error);
            alert("Failed to send request.");
        } finally {
            setLoadingRoles(prev => ({ ...prev, [roleId]: false }));
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 pt-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-2">Collaboration Rooms</h1>
                    <p className="text-gray-400">Join a team, build a project, and level up your skills.</p>
                </div>
                <button
                    onClick={() => navigate('/collab/create')}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] whitespace-nowrap"
                >
                    <Plus size={20} /> Create a Room
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center p-20 glass-card rounded-2xl border border-white/5">
                    <Users size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">No Open Rooms</h2>
                    <p className="text-gray-400 mb-6">Be the first to start a project and recruit a team.</p>
                    <button
                        onClick={() => navigate('/collab/create')}
                        className="text-primary hover:text-white transition-colors underline"
                    >
                        Create a Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <h2 className="text-xl font-bold leading-tight">{room.title}</h2>
                                {user?.id === room.admin_id && (
                                    <span className="bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-full border border-primary/30 shrink-0">Your Room</span>
                                )}
                            </div>

                            <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">{room.description}</p>

                            <div className="flex items-center gap-3 mb-6">
                                <img src={room.admin.avatar_url} alt={room.admin.name} className="w-8 h-8 rounded-full border border-white/10" />
                                <div className="text-xs">
                                    <p className="text-gray-500">Hosted by</p>
                                    <p className="text-white font-medium">@{room.admin.username}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <p className="text-sm font-bold text-gray-300 mb-3">Open Roles</p>
                                <div className="space-y-2">
                                    {room.roles.map(role => (
                                        <div key={role.id} className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                                            <span className="text-sm font-medium">{role.title}</span>

                                            {role.is_filled || role.user_id ? (
                                                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">Filled</span>
                                            ) : user?.id === room.admin_id ? (
                                                <button
                                                    onClick={() => navigate(`/collab/${room.id}`)}
                                                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Manage Requests
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRequestJoin(room.id, role.id)}
                                                    disabled={loadingRoles[role.id]}
                                                    className="bg-white/10 hover:bg-primary text-white text-xs px-4 py-1.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                >
                                                    {loadingRoles[role.id] ? <Loader2 size={12} className="animate-spin" /> : 'Request to Join'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(user?.id === room.admin_id || room.roles.some(r => r.user_id === user?.id)) && (
                                <button
                                    onClick={() => navigate(`/collab/${room.id}`)}
                                    className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
                                >
                                    Enter Dashboard <ArrowRight size={16} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollabExplore;
