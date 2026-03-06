export const getActivityStatus = (userId) => {
    if (!userId) return 'offline';

    // Deterministic mock based on ID length & characters
    const str = userId.toString();
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mod = hash % 10;

    if (mod < 3) return 'active'; // 30%
    if (mod < 6) return 'recent'; // 30%
    return 'offline'; // 40%
};

export const getAvatarGlowClass = (status) => {
    if (status === 'active') {
        return 'ring-2 ring-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-offset-2 ring-offset-[#0a0a0c]';
    }
    if (status === 'recent') {
        return 'ring-2 ring-primary/60 shadow-[0_0_15px_rgba(139,92,246,0.4)] ring-offset-2 ring-offset-[#0a0a0c]';
    }
    return 'border border-white/10';
};
