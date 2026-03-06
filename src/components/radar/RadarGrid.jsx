import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Twitter, MapPin, UserPlus, Check, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getActivityStatus, getAvatarGlowClass } from '../../utils/activityUtils';

const RadarGrid = ({ developers, loading }) => {
    // Generate static positions for the demo if none provided by real data
    const [points, setPoints] = useState([]);

    useEffect(() => {
        // Map developers to random angles and scaled distances from center
        const mapped = developers.map((dev, i) => {
            const angle = Math.random() * Math.PI * 2;
            // Distribute items closer to center (0) to edge (50)
            const radius = 10 + Math.random() * 35;
            return {
                ...dev,
                top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                delay: i * 0.1,
            };
        });
        setPoints(mapped);
    }, [developers]);

    const getColorClass = (category) => {
        switch (category) {
            case 'Frontend': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]';
            case 'Backend': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
            case 'AI/ML': return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]';
            case 'Mobile': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]';
            default: return 'bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.8)]';
        }
    };

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/10 flex items-center justify-center">
            {/* The Radar Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-full h-[1px] bg-primary/50 absolute" />
                <div className="h-full w-[1px] bg-primary/50 absolute" />
            </div>

            {/* Radar Rings rings */}
            {[100, 75, 50, 25].map((size, i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-primary/20 pointer-events-none"
                    style={{ width: `${size}%`, height: `${size}%` }}
                />
            ))}

            {/* Scanning Sweep Line */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full animate-spin-slow origin-center" style={{ animationDuration: '4s' }}>
                <div className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left bg-gradient-to-br from-primary/30 to-transparent" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
            </div>

            {/* Developer Dots */}
            {points.map((dev) => (
                <motion.div
                    key={dev.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: dev.delay, type: 'spring', stiffness: 200, damping: 10 }}
                    className="absolute group z-10 cursor-pointer"
                    style={{ top: dev.top, left: dev.left, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="relative">
                        {/* Dot */}
                        <div className={`w-3 h-3 rounded-full ${getColorClass(dev.category)}`} />
                        {/* Ping effect */}
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-50 ${getColorClass(dev.category)}`} style={{ animationDelay: `${dev.delay}s` }} />

                        {/* Mini Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-[#18181b] border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex gap-2">
                                <img src={dev.avatar} className={`w-4 h-4 rounded-full ${getAvatarGlowClass(getActivityStatus(dev.id)).replace('ring-offset-[#0a0a0c]', '')}`} />
                                <span className="text-white font-medium text-xs truncate max-w-[120px]">{dev.name}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            <div className="absolute bottom-4 left-4 text-[10px] sm:text-xs text-primary/50 font-mono tracking-widest uppercase animate-pulse">
                System Scanning...
            </div>
        </div>
    );
};

export default RadarGrid;
