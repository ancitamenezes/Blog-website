import { Github, Target, Flame, Cpu, Star, Loader2 } from 'lucide-react';
import useGitHubStats from '../../hooks/useGitHubStats';

const GitHubStatsCard = ({ username }) => {
    const { stats, loading, error } = useGitHubStats(username);

    if (!username) return null;

    if (loading) {
        return (
            <div className="glass-card p-6 border border-white/10 flex flex-col items-center justify-center min-h-[200px] gap-3 text-purple-400">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Analyzing GitHub Signals...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6 border border-red-500/20 bg-red-500/5 min-h-[200px] flex flex-col items-center justify-center text-center">
                <Github size={32} className="text-red-400 mb-2 opacity-50" />
                <p className="text-red-400 font-medium">Failed to connect to GitHub</p>
                <p className="text-xs text-red-400/70 mt-1">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="glass-card p-6 border border-white/10 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-500" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Github className="text-white" size={24} />
                    <h3 className="text-lg font-bold text-white tracking-tight">Developer Stats</h3>
                </div>
                <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors font-mono"
                >
                    @{username}
                </a>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                {/* Streak Metric */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-orange-400">
                        <Flame size={16} />
                        <span className="text-xs font-mono uppercase tracking-wider">Coding Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.codingStreak} <span className="text-sm font-normal text-gray-500">Days</span>
                    </div>
                </div>

                {/* Most Used Language */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Cpu size={16} />
                        <span className="text-xs font-mono uppercase tracking-wider">Top Language</span>
                    </div>
                    <div className="text-xl font-bold text-white truncate">
                        {stats.mostUsedLanguage}
                    </div>
                </div>

                {/* Complexity Score */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-purple-400">
                        <Target size={16} />
                        <span className="text-xs font-mono uppercase tracking-wider">Complexity Score</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.complexityScore} <span className="text-sm font-normal text-gray-500">pts</span>
                    </div>
                </div>

                {/* Open Source Impact */}
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-yellow-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Star size={16} />
                        <span className="text-xs font-mono uppercase tracking-wider">OS Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.totalStars} <span className="text-sm font-normal text-gray-500">Stars</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 font-mono">
                <span>{stats.publicRepos} Public Repos</span>
                <span>{stats.followers} Followers</span>
            </div>
        </div>
    );
};

export default GitHubStatsCard;
