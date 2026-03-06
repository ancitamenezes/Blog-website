import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Map as MapIcon, Radar, Loader2, Navigation } from 'lucide-react';

import { supabase } from '../lib/supabase'; // Ensure supabase client is imported
import FilterBar from '../components/radar/FilterBar';
import InteractiveMap from '../components/radar/InteractiveMap';
import RadarGrid from '../components/radar/RadarGrid';
import ActivityFeed from '../components/radar/ActivityFeed';
import EventCards from '../components/radar/EventCards';
import CollaborationCards from '../components/radar/CollaborationCards';

const DevMap = () => {
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'radar'
    const [filters, setFilters] = useState({
        tech: 'All',
        experience: 'All Levels',
        lookingFor: 'Anything',
        distance: 25
    });

    const [location, setLocation] = useState({ city: 'Scanning...', lat: 19.0760, lng: 72.8777 });
    const [isLoading, setIsLoading] = useState(true);
    const [developers, setDevelopers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Fetch real developer data from Supabase based on location
    useEffect(() => {
        const fetchRadarData = async () => {
            setIsLoading(true);
            try {
                // 1. Get Coordinates
                const getCoords = () => new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });

                let lat, lng;
                try {
                    const position = await getCoords();
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                } catch (geoError) {
                    console.warn("Geolocation denied/failed. Using default.");
                    lat = 19.0760; // Mumbai fallback
                    lng = 72.8777;
                }

                setLocation({ city: 'Live Tracking...', lat, lng });

                // 2. Update CURRENT user's location in database so others see them
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                    await supabase
                        .from('users')
                        .update({ last_lat: lat, last_lng: lng })
                        .eq('id', user.id);
                }

                // 3. Fetch all VISIBLE users from Supabase to plot on the map
                const { data: realDevs, error } = await supabase
                    .from('users')
                    .select('id, username, avatar_url, last_lat, last_lng, tech_stack')
                    .eq('is_visible_on_map', true)
                    .not('last_lat', 'is', null)
                    .not('last_lng', 'is', null);

                if (error) throw error;

                // 4. Map DB Format to the Frontend Format
                const formattedDevs = (realDevs || []).map(dev => {
                    // Fallbacks in case columns aren't populated yet by real users
                    const stack = Array.isArray(dev.tech_stack) && dev.tech_stack.length > 0 ? dev.tech_stack : ['Frontend'];
                    const category = stack[0];

                    return {
                        id: dev.id,
                        lat: dev.last_lat,
                        lng: dev.last_lng,
                        name: dev.username || 'Anonymous Hacker',
                        username: dev.username,
                        role: `${category} Engineer`,
                        category: category,
                        stack: stack,
                        distance: `1.2 km`, // To fully calculate distance perfectly we need a haversine function or PostGIS
                        avatar: dev.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.id}`
                    };
                });

                // For testing purposes right now (since you are the only user in DB), 
                // we'll append a few mock nearby devs so the map isn't totally empty!
                const mockDevs = Array.from({ length: 5 }).map((_, i) => ({
                    id: `mock-${i}`,
                    lat: lat + (Math.random() - 0.5) * 0.1,
                    lng: lng + (Math.random() - 0.5) * 0.1,
                    name: `Simulated User ${i}`,
                    username: `simulateduser${i}`,
                    role: `AI/ML Engineer`,
                    category: 'AI/ML',
                    stack: ['Python', 'TensorFlow'],
                    distance: `${(Math.random() * 5).toFixed(1)} km`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=mock${i}`
                }));

                setDevelopers([...formattedDevs, ...mockDevs]);

            } catch (error) {
                console.error("Failed to load map data from Supabase", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRadarData();

        // 5. Subscribe to Real-Time location updates
        const radarSubscription = supabase
            .channel('radar-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                console.log("Radar Real-Time Update Received:", payload);
                // In a production environment, you would parse the payload and selectively update the specific developer marker.
                // For safety and ensuring no stale UI, we simply refetch the entire visible network when a change occurs.
                fetchRadarData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(radarSubscription);
        };
    }, []);

    // Filter the developers before passing to map/radar
    const filteredDevs = developers.filter(dev => {
        if (filters.tech !== 'All' && dev.category !== filters.tech && !dev.stack.includes(filters.tech)) return false;
        if (parseFloat(dev.distance) > filters.distance) return false;
        return true;
    });

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 pb-32 min-h-screen font-sans bg-[#0f0f11]">

            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 relative z-20">
                <div className="space-y-4 relative">
                    {/* Animated glowing backdrop */}
                    <div className="absolute -inset-4 bg-primary/10 blur-xl rounded-full z-0 opacity-50 animate-pulse" />

                    <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary border border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.3)] relative"
                        >
                            <Compass size={40} className="relative z-10" />
                            {/* Radar sweep inside the icon box */}
                            <div className="absolute inset-0 border border-primary/50 rounded-2xl animate-ping opacity-20" />
                        </motion.div>

                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-1 drop-shadow-md">Developer Radar</h1>
                            <p className="text-gray-400 text-lg flex items-center gap-2">
                                <Navigation size={16} className="text-primary animate-pulse" /> Scanning {location.city}...
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex bg-[#18181b] p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                    >
                        <MapIcon size={16} /> Map
                    </button>
                    <button
                        onClick={() => setViewMode('radar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'radar' ? 'bg-primary/20 text-primary shadow-md' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Radar size={16} /> Radar
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="mb-6 relative z-30">
                <FilterBar filters={filters} setFilters={setFilters} />
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

                {/* Visualizer Column (Map / Radar) */}
                <div className="lg:col-span-8 xl:col-span-9 h-[600px] md:h-[700px] relative">
                    {isLoading ? (
                        <div className="w-full h-full glass-card border border-white/10 rounded-2xl flex flex-col items-center justify-center text-primary space-y-4">
                            <Radar size={48} className="animate-spin-slow" />
                            <p className="text-gray-400 animate-pulse font-mono uppercase tracking-widest text-sm">Targeting Local Network...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full h-full"
                            >
                                {viewMode === 'map' ? (
                                    <InteractiveMap center={[location.lat, location.lng]} developers={filteredDevs} currentUserId={currentUserId} />
                                ) : (
                                    <RadarGrid developers={filteredDevs} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Quick Stats Overlays (Internal to Map box) */}
                    <div className="absolute bottom-6 left-6 z-[400] flex gap-3 pointer-events-none">
                        <div className="glass-card bg-[#0f0f11]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex flex-col pointer-events-auto cursor-pointer hover:bg-white/10 transition">
                            <span className="text-2xl font-bold text-white">{filteredDevs.length}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Signals Found</span>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Feeds & Events) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-[700px]">
                    <div className="flex-1 min-h-[300px]">
                        <ActivityFeed developers={developers} />
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-6 pr-2 h-[300px]">
                        <EventCards />
                        <CollaborationCards />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DevMap;
