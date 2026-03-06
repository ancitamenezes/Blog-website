import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Code2, MapPin, ExternalLink, MessageSquare, UserPlus, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

// Required for leaflet markers to work in React
delete L.Icon.Default.prototype._getIconUrl;

// Custom Icons based on tech stack
const createCustomIcon = (colorClass, pulseColor) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div class="relative flex items-center justify-center w-6 h-6">
                <!-- Outer Pulse -->
                <div class="absolute inset-0 rounded-full animate-ping opacity-20 bg-${pulseColor}-500"></div>
                <!-- Inner Glow -->
                <div class="absolute inset-0 rounded-full blur-[4px] bg-${pulseColor}-500/50"></div>
                <!-- Solid Core -->
                <div class="relative w-3 h-3 rounded-full border border-[rgba(255,255,255,0.8)] shadow-[0_0_10px_currentColor] text-${pulseColor}-400 bg-current"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

const ICONS = {
    Frontend: createCustomIcon('blue', 'blue'),
    Backend: createCustomIcon('green', 'emerald'),
    'AI/ML': createCustomIcon('purple', 'purple'),
    Mobile: createCustomIcon('orange', 'orange'),
    'UI/UX': createCustomIcon('pink', 'pink'),
    Default: createCustomIcon('gray', 'gray')
};

import { Link } from 'react-router-dom';

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const ProfilePopup = ({ dev, currentUserId }) => {
    const isCurrentUser = dev.id === currentUserId;
    const { following, fetchFollowing } = useAppContext();
    const isFollowing = following?.includes(dev.id);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const handleFollowToggle = async () => {
        if (!currentUserId) return;
        if (dev.id.toString().startsWith('mock-')) {
            alert("This is a simulated user and cannot be followed.");
            return;
        }
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: dev.id });
            } else {
                await supabase.from('follows').insert({ follower_id: currentUserId, following_id: dev.id });
            }
            await fetchFollowing(currentUserId);
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    return (
        <div className="p-3 min-w-[200px] text-white">
            <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                <img src={dev.avatar} alt={dev.name} className="w-10 h-10 rounded-full border border-white/20" />
                <div>
                    <h3 className="font-bold text-sm m-0 leading-tight">
                        {dev.name} {isCurrentUser && <span className="text-[10px] text-primary ml-1">(You)</span>}
                    </h3>
                    <p className="text-xs text-gray-400 m-0">{dev.role}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
                {dev.stack.map(tech => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/5 font-mono">
                        {tech}
                    </span>
                ))}
            </div>

            {!isCurrentUser && (
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-4">
                    <MapPin size={12} /> {dev.distance} away
                </div>
            )}

            <div className="flex gap-2 w-full mt-3">
                <Link to={`/u/${dev.username}`} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 no-underline">
                    <User size={12} /> Profile
                </Link>

                {!isCurrentUser && (
                    <button
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`flex-1 text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 ${isFollowing ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-primary hover:bg-primary/80 text-white'}`}
                    >
                        {isFollowLoading ? '...' : isFollowing ? <><Check size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                    </button>
                )}
            </div>
        </div>
    );
};

const InteractiveMap = ({ center, developers, currentUserId }) => {
    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-0 group">

            {/* Dark Map Container Overlay */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none z-10" />

            <MapContainer
                center={center}
                zoom={12}
                className="w-full h-full bg-[#0f0f11] !font-sans"
                zoomControl={false}
                attributionControl={false}
            >
                <MapUpdater center={center} />

                {/* CartoDB Dark Matter tile layer - perfect for dark dashboards */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {developers.map((dev) => (
                    <Marker
                        key={dev.id}
                        position={[dev.lat, dev.lng]}
                        icon={ICONS[dev.category] || ICONS.Default}
                    >
                        {/* Leaflet Popups are injected into DOM, we must style them via global CSS or inline carefully */}
                        <Popup className="custom-dark-popup">
                            <ProfilePopup dev={dev} currentUserId={currentUserId} />
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
