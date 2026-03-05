import { Users, Code, ArrowRight } from 'lucide-react';

const REQUESTS = [
    { id: 1, title: 'Building an AI Resume Analyzer', need: 'React dev + ML engineer', count: 2, author: 'Rohit M.' },
    { id: 2, title: 'Open Source DevOps Dashboard', need: 'Go backend dev', count: 1, author: 'Ancita' },
    { id: 3, title: 'Web3 Next.js Starter Kit', need: 'Solidity Expert', count: 1, author: 'Om K.' },
];

const CollaborationCards = () => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-6">
                <Users className="text-orange-400" size={20} /> Looking for Teammates
            </h3>

            <div className="grid gap-4">
                {REQUESTS.map((req) => (
                    <div key={req.id} className="glass-card hover:bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden">
                        {/* Hover Gradient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col h-full">
                            <h4 className="font-bold text-white text-sm mb-1">{req.title}</h4>
                            <p className="text-xs text-gray-500 mb-3">Posted by {req.author}</p>

                            <div className="mt-auto space-y-2">
                                <div className="flex items-center gap-2 text-xs text-orange-200/70 font-medium bg-orange-500/10 px-2 py-1.5 rounded-lg border border-orange-500/20">
                                    <Code size={12} className="shrink-0" />
                                    <span className="truncate">Need: {req.need}</span>
                                </div>
                            </div>

                            <button className="mt-4 w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:text-orange-300">
                                Collaborate <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollaborationCards;
