import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Code2, MapPin, ExternalLink, MessageSquare, UserPlus, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { playSound } from '../../utils/soundUtils';
import { getActivityStatus, getAvatarGlowClass } from '../../utils/activityUtils';
import ActivityBadge from '../profile/ActivityBadge';

// Required for leaflet markers to work in React
delete L.Icon.Default.prototype._getIconUrl;

// Custom Icons based on tech stack
const createCustomIcon = (colorClass, pulseColor) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
    <div class="relative flex items-center justify-center w-6 h-6">
                <!--Outer Pulse-->
                <div class="absolute inset-0 rounded-full animate-ping opacity-20 bg-${pulseColor}-500"></div>
                <!--Inner Glow-->
                <div class="absolute inset-0 rounded-full blur-[4px] bg-${pulseColor}-500/50"></div>
                <!--Solid Core-->
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
                playSound('follow');
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
        <div className="p-3 min-w-[200px] max-w-[240px] text-white">
            {/* Avatar + Info row */}
            <div className="flex items-center gap-2.5 mb-2">
                <img
                    src={dev.avatar}
                    alt={dev.name}
                    className={`w-9 h-9 rounded-full border border-[#27272a] shrink-0 ${getAvatarGlowClass(getActivityStatus(dev.id))}`}
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                        <h3 className="font-bold text-xs m-0 leading-tight truncate">{dev.name}</h3>
                        {isCurrentUser && <span className="text-[8px] text-primary font-bold bg-primary/15 px-1 py-0.5 rounded-full shrink-0">You</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 m-0">{dev.role}</p>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1 mb-2">
                {dev.stack.slice(0, 3).map(tech => (
                    <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-400">
                        {tech}
                    </span>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 w-full">
                <Link
                    to={`/u/${dev.username}`}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 no-underline"
                >
                    <User size={11} /> Profile
                </Link>
                {!isCurrentUser && (
                    <button
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${isFollowing ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-primary hover:bg-primary-hover text-white'}`}
                    >
                        {isFollowLoading ? '...' : isFollowing ? <><Check size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
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

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={40}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    iconCreateFunction={(cluster) => {
                        const count = cluster.getChildCount();
                        return L.divIcon({
                            html: `<div style="
                                background: rgba(139,92,246,0.85);
                                border: 2px solid rgba(139,92,246,0.4);
                                border-radius: 50%;
                                width: 36px;
                                height: 36px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                font-size: 12px;
                                color: white;
                                box-shadow: 0 0 15px rgba(139,92,246,0.5);
                            ">${count}</div>`,
                            className: 'custom-leaflet-icon',
                            iconSize: L.point(36, 36, true),
                        });
                    }}
                >
                    {developers.map((dev) => (
                        <Marker
                            key={dev.id}
                            position={[dev.lat, dev.lng]}
                            icon={ICONS[dev.category] || ICONS.Default}
                        >
                            <Popup className="custom-dark-popup">
                                <ProfilePopup dev={dev} currentUserId={currentUserId} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>

            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
