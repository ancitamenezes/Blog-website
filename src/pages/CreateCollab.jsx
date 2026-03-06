import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Users, Plus, X, Loader2, Target } from 'lucide-react';

const CreateCollab = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();

    const [title, setTitle] = useState('Build a Spotify Clone in 48 Hrs');
    const [description, setDescription] = useState('Looking for a solid team to build a working prototype of Spotify using React and Supabase. Fast paced hackathon style.');

    const [roles, setRoles] = useState(['Frontend Developer', 'UI Designer', 'Backend Developer']);
    const [newRole, setNewRole] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddRole = (e) => {
        e.preventDefault();
        if (newRole.trim() && !roles.includes(newRole.trim())) {
            setRoles([...roles, newRole.trim()]);
            setNewRole('');
        }
    };

    const handleRemoveRole = (roleToRemove) => {
        setRoles(roles.filter(r => r !== roleToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || roles.length === 0 || !user) return;

        setIsSubmitting(true);
        try {
            // 1. Create the Room
            const { data: roomData, error: roomError } = await supabase
                .from('collab_rooms')
                .insert({
                    admin_id: user.id,
                    title: title.trim(),
                    description: description.trim(),
                    status: 'recruiting'
                })
                .select()
                .single();

            if (roomError) throw roomError;

            // 2. Create the Roles
            const rolesToInsert = roles.map(roleTitle => ({
                room_id: roomData.id,
                title: roleTitle
            }));

            const { error: rolesError } = await supabase
                .from('collab_roles')
                .insert(rolesToInsert);

            if (rolesError) throw rolesError;

            // Redirect to the newly created room dashboard
            navigate(`/collab/${roomData.id}`);

        } catch (error) {
            console.error("Error creating collab room:", error);
            alert("Failed to create room. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 pt-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center text-primary">
                    <Target size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter">Start a Project Room</h1>
                    <p className="text-gray-400">Define your project and recruit the perfect team.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                    <div>
                        <label className="block font-medium mb-2">Project Thesis</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Build a Spotify Clone in 48 Hrs"
                            className="glass-input w-full text-lg font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Details & Goals</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what you are building and what the expectations are..."
                            className="glass-input w-full min-h-[120px] resize-none"
                            required
                        />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Users size={20} className="text-primary" /> Roles Needed
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">What kind of teammates do you need?</p>

                        {/* List of current roles */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {roles.map((role, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm">
                                    {role}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRole(role)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {roles.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No roles added yet. You must add at least one.</p>
                            )}
                        </div>

                        {/* Add new role input */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                placeholder="e.g. Data Scientist"
                                className="glass-input flex-1"
                                onKeyDown={(e) => { if (e.key === 'Enter') { handleAddRole(e); } }}
                            />
                            <button
                                type="button"
                                onClick={handleAddRole}
                                disabled={!newRole.trim()}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/collab')}
                        className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || roles.length === 0 || !title.trim()}
                        className="px-6 py-3 bg-primary text-white hover:bg-primary/80 rounded-xl transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={20} className="animate-spin" /> Creating...</>
                        ) : (
                            'Create Room & Recruit'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCollab;
