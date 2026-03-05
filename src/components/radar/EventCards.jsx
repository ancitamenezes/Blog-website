import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const EVENTS = [
    { id: 1, title: 'AI Hackathon Mumbai', location: 'Navi Mumbai', date: 'Sat, 10:00 AM', tech: 'AI/ML' },
    { id: 2, title: 'React JS Meetup', location: 'Bandra West', date: 'Sun, 4:00 PM', tech: 'Frontend' },
    { id: 3, title: 'Open Source Contribution Day', location: 'Virtual', date: 'Next Wed, 6:00 PM', tech: 'All Stacks' },
];

const EventCards = () => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-6">
                <Calendar className="text-primary" size={20} /> Upcoming Events
            </h3>

            <div className="grid gap-4">
                {EVENTS.map((event) => (
                    <div key={event.id} className="glass-card hover:bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden">
                        {/* Hover Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono">
                                    {event.tech}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} className="text-gray-500" /> {event.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-500" /> {event.date}
                                </div>
                            </div>

                            <button className="mt-4 w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:text-primary">
                                Join Event <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventCards;
