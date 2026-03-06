import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, User, Bell, Search, LogOut, MapPin, MessageCircle, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getActivityStatus, getAvatarGlowClass } from '../../utils/activityUtils';

const NavBar = () => {
    const { user, signOut, unreadNotificationsCount } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    // Highlight active link
    const linkClass = ({ isActive }) =>
        `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
            ? 'bg-primary text-white shadow-[0_0_15px_var(--color-primary-glow)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    // Hide nav on landing and auth
    if (location.pathname === '/' || location.pathname === '/auth') return null;

    return (
        <>
            {/* Top Navbar Mobile */}
            <nav className="md:hidden fixed top-0 w-full z-50 bg-[#0f0f11]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
                <div className="text-xl font-bold tracking-tighter">BLOQ.</div>
                <div className="flex items-center gap-4">
                    <Search size={20} className="text-gray-400" />
                    {user && <img src={user.avatar} className={`size-8 rounded-full ${getAvatarGlowClass(getActivityStatus(user.id))}`} alt="avatar" />}
                </div>
            </nav>

            {/* Sidebar Desktop / Bottom Bar Mobile */}
            <nav className="fixed bottom-0 md:bottom-auto md:top-0 md:left-0 w-full md:w-[88px] hover:md:w-64 h-16 md:h-screen z-50 bg-[#0f0f11]/95 md:bg-[#0f0f11]/80 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col justify-around md:justify-start group transition-all duration-300 ease-spring overflow-hidden">

                <div className="hidden md:flex text-3xl font-bold tracking-tighter text-white mb-10 mt-8 px-7 whitespace-nowrap">
                    <span className="md:hidden group-hover:md:block transition-all duration-300">BLOQ.</span>
                    <span className="hidden md:block group-hover:md:hidden transition-all duration-300">B.</span>
                </div>

                <div className="flex md:flex-col w-full md:gap-2 justify-around md:justify-start px-2 md:px-4">
                    <NavLink to="/feed" className={linkClass}>
                        <Home size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Home</span>
                    </NavLink>
                    <NavLink to="/create" className={linkClass}>
                        <PenTool size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Write</span>
                    </NavLink>

                    <NavLink to="/explore" className={linkClass}>
                        <Search size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Explore</span>
                    </NavLink>

                    <NavLink to="/map" className={linkClass}>
                        <MapPin size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Radar</span>
                    </NavLink>

                    <NavLink to="/collab" className={linkClass}>
                        <Users size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Teams</span>
                    </NavLink>

                    <NavLink to="/messages" className={linkClass}>
                        <MessageCircle size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Messages</span>
                    </NavLink>

                    <NavLink to="/notifications" className={linkClass}>
                        <div className="relative">
                            <Bell size={24} className="shrink-0" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#18181b]"></span>
                                </span>
                            )}
                        </div>
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap flex-1 flex items-center justify-between">
                            Notifications
                            {unreadNotificationsCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadNotificationsCount}
                                </span>
                            )}
                        </span>
                    </NavLink>

                    <NavLink to="/profile" className={linkClass}>
                        <User size={24} className="shrink-0" />
                        <span className="hidden md:block overflow-hidden max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">Profile</span>
                    </NavLink>
                </div>

                <div className="hidden md:flex mt-auto w-full px-2 md:px-4 mb-4 md:mb-8">
                    <div className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default overflow-hidden">
                        {user ? (
                            <>
                                <img src={user.avatar} className={`size-10 rounded-full shrink-0 ${getAvatarGlowClass(getActivityStatus(user.id))}`} alt={user.name} />
                                <div className="flex-1 overflow-hidden opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[120px] transition-all duration-300">
                                    <p className="font-bold text-white text-sm truncate">{user.name}</p>
                                    <p className="text-gray-500 text-xs truncate">@{user.username}</p>
                                </div>
                                <button onClick={handleSignOut} className="text-gray-500 hover:text-red-400 transition-colors p-2 shrink-0 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[40px] duration-300" title="Sign Out">
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="animate-pulse flex items-center gap-3 w-full">
                                <div className="size-10 rounded-full bg-white/10 shrink-0" />
                                <div className="flex-1 space-y-2 opacity-0 max-w-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-300">
                                    <div className="h-4 bg-white/10 rounded w-full" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
