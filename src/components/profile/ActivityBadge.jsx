import { getActivityStatus } from '../../utils/activityUtils';

const ActivityBadge = ({ user, className = '' }) => {
    if (!user || !user.id) return null;

    // Optional: Local ghost mode check
    // We can store their global ghost mode preference in localStorage if this is their own profile, 
    // or just assume mock data doesn't care about ghost mode across browsers.
    const isGhostMode = localStorage.getItem(`ghost_mode_${user.id}`) === 'true';
    if (isGhostMode) return null;

    const mockStatus = getActivityStatus(user.id);

    let activeStatus = 'offline';
    let text = 'Offline';
    let colorClass = 'bg-gray-500';

    if (mockStatus === 'active') {
        activeStatus = 'online';
        text = 'Online now';
        colorClass = 'bg-emerald-500';
    } else if (mockStatus === 'recent') {
        activeStatus = 'recent';
        // Arbitrarily pick a mocked relative time based on ID length or just say recently
        text = `Active recently`;
        colorClass = 'bg-purple-500';
    } else {
        return null;
    }

    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/5 bg-black/40 ${className}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colorClass} ${activeStatus === 'online' ? 'animate-pulse shadow-[0_0_5px_currentColor]' : ''}`} />
            <span className="text-gray-300 truncate">{text}</span>
        </div>
    );
};

export default ActivityBadge;
