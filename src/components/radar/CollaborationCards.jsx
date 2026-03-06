import { Users, Code, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CollaborationCards = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentRooms = async () => {
            try {
                const { data, error } = await supabase
                    .from('collab_rooms')
                    .select(`
                        id,
                        title,
                        description,
                        admin:users!collab_rooms_admin_id_fkey(name),
                        roles:collab_roles(title)
                    `)
                    .eq('status', 'recruiting')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;

                // Format the data to match the card UI
                const formatted = (data || []).map(room => ({
                    id: room.id,
                    title: room.title,
                    need: room.roles[0]?.title || 'Any Role', // Just picking the first open role to display
                    count: room.roles.length,
                    author: room.admin?.name || 'Anonymous'
                }));

                setRequests(formatted);
            } catch (error) {
                console.error("Error fetching collab rooms for radar:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentRooms();
    }, []);

    // Smart Empty State Examples
    const MOCK_EXAMPLES = [
        { id: 'mock-1', title: 'Building a SaaS in 48 hours', need: 'React dev + Designer', author: 'Alex Rivera' },
        { id: 'mock-2', title: 'Web3 Open Source Analytics', need: 'Go Backend Dev', author: 'Sarah Chen' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-6">
                <Users className="text-orange-400" size={20} /> Looking for Teammates
            </h3>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />)}
                </div>
            ) : requests.length > 0 ? (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req.id} onClick={() => navigate('/collab')} className="glass-card hover:bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden">
                            {/* Hover Gradient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col h-full">
                                <h4 className="font-bold text-white text-sm mb-1">{req.title}</h4>
                                <p className="text-xs text-gray-400 mb-3">Posted by {req.author}</p>

                                <div className="mt-auto space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-orange-200/70 font-medium bg-orange-500/10 px-2 py-1.5 rounded-lg border border-orange-500/20">
                                        <Code size={12} className="shrink-0" />
                                        <span className="truncate">Need: {req.need}</span>
                                        {req.count > 1 && <span className="ml-auto bg-orange-500/20 px-1.5 rounded">+{req.count - 1}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={() => navigate('/collab')} className="mt-2 w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2 group">
                        View All Teams <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            ) : (
                /* Smart Empty State */
                <div className="grid gap-4">
                    <div className="glass-card bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-5 text-center">
                        <div className="size-10 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                            <Sparkles size={20} />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-2">No Open Teams Yet</h4>
                        <p className="text-xs text-gray-400 mb-4 px-2 leading-relaxed">
                            Be the first to start a project! Here are examples of what you could build with others:
                        </p>

                        <div className="space-y-3 mb-5 text-left opacity-60 pointer-events-none">
                            {MOCK_EXAMPLES.map((mock) => (
                                <div key={mock.id} className="bg-black/40 border border-white/5 rounded-lg p-3">
                                    <h5 className="text-xs font-bold text-white mb-1">{mock.title}</h5>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <Code size={10} /> Need: {mock.need}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/collab/create')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Start a Project
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaborationCards;
