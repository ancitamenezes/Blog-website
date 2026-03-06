import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Users, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const LateNightToast = () => {
    const { isLateNightMode, toggleLateNightMode } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);
    const [activeDevs, setActiveDevs] = useState(0);

    useEffect(() => {
        // Only show if it's late night mode AND we haven't dismissed it this session
        const hasSeenToast = sessionStorage.getItem('hasSeenLateNightToast');

        if (isLateNightMode && !hasSeenToast) {
            // Generate a random believable number of active devs
            setActiveDevs(Math.floor(Math.random() * (350 - 80 + 1) + 80));

            // Slight delay before popping up
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isLateNightMode]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenLateNightToast', 'true');
    };

    const handleDisable = () => {
        setIsVisible(false);
        toggleLateNightMode(false);
        sessionStorage.setItem('hasSeenLateNightToast', 'true');
    };

    if (!isLateNightMode) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] max-w-sm w-[calc(100vw-2rem)]"
                >
                    <div className="relative overflow-hidden bg-[#09090b] border border-purple-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex gap-3">
                                <div className="mt-0.5 p-2 bg-purple-500/20 text-purple-400 rounded-xl shrink-0">
                                    <Moon size={20} className="fill-purple-400/20" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold tracking-tight">Night Grind Mode Activated</h4>
                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-white/5 rounded-full px-2 py-0.5 w-max">
                                        <Users size={12} className="text-emerald-400" />
                                        <span className="text-emerald-400 font-mono">{activeDevs}</span> actively coding
                                    </div>

                                    <div className="mt-3 flex gap-3">
                                        <button
                                            onClick={handleDismiss}
                                            className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Embrace the dark
                                        </button>
                                        <button
                                            onClick={handleDisable}
                                            className="text-xs font-medium text-gray-400 hover:text-white px-2 py-1.5 transition-colors"
                                        >
                                            Turn off
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LateNightToast;
