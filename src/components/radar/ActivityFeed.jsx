import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, Activity, UserPlus, Megaphone, Terminal } from 'lucide-react';

// Simulated event templates
const EVENT_TEMPLATES = [
    { type: 'commit', icon: GitCommit, color: 'text-blue-400', bg: 'bg-blue-400/10', text: (dev) => `${dev.name} pushed 4 commits to an open-source repo` },
    { type: 'join', icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10', text: (dev) => `New ${dev.category} developer joined nearby` },
    { type: 'hackathon', icon: Terminal, color: 'text-purple-400', bg: 'bg-purple-400/10', text: () => `Weekend Hackathon starting in 3 hours!` },
    { type: 'collab', icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-400/10', text: (dev) => `${dev.name} is looking for a UI/UX Designer` },
    { type: 'activity', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-400/10', text: (dev) => `${dev.name} starred a trending Next.js repository` }
];

const generateRandomEvent = (developers) => {
    const dev = developers[Math.floor(Math.random() * developers.length)] || { name: 'A developer', category: 'Frontend' };
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

    return {
        id: Math.random().toString(36).substr(2, 9),
        icon: template.icon,
        color: template.color,
        bg: template.bg,
        text: template.text(dev),
        time: 'Just now'
    };
};

const ActivityFeed = ({ developers }) => {
    const [events, setEvents] = useState([]);

    // Initialize with a few events
    useEffect(() => {
        if (developers.length > 0 && events.length === 0) {
            setEvents([
                generateRandomEvent(developers),
                generateRandomEvent(developers),
                generateRandomEvent(developers)
            ]);
        }
    }, [developers, events.length]);

    // Simulate real-time updates
    useEffect(() => {
        if (developers.length === 0) return;

        const interval = setInterval(() => {
            setEvents(prev => {
                const newEvent = generateRandomEvent(developers);
                // Keep max 5 events
                return [newEvent, ...prev].slice(0, 5);
            });
        }, Math.random() * 5000 + 5000); // New event every 5-10 seconds

        return () => clearInterval(interval);
    }, [developers]);

    return (
        <div className="glass-card border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Live Activity</h3>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-[#18181b] to-transparent z-10" />
                <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#18181b] to-transparent z-10" />

                <div className="space-y-4 pt-2">
                    <AnimatePresence initial={false}>
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="flex gap-4 items-start group"
                            >
                                <div className={`shrink-0 p-2 rounded-xl border border-white/5 ${event.bg} ${event.color} transition-transform group-hover:scale-110`}>
                                    <event.icon size={16} />
                                </div>
                                <div className="space-y-1 mt-0.5">
                                    <p className="text-sm text-gray-300 font-medium leading-tight group-hover:text-white transition-colors">
                                        {event.text}
                                    </p>
                                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{event.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
