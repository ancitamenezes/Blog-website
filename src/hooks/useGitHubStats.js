import { useState, useEffect } from 'react';

const useGitHubStats = (username) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }

        const fetchGitHubData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch basic profile info
                const userRes = await fetch(`https://api.github.com/users/${username}`);
                if (!userRes.ok) throw new Error('GitHub user not found');
                const userData = await userRes.json();

                // Fetch public repositories
                const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
                if (!reposRes.ok) throw new Error('Failed to fetch repositories');
                const repos = await reposRes.json();

                // 1. Calculate Open Source Impact (Total Stars)
                const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

                // 2. Calculate Most Used Language
                const languageCounts = {};
                repos.forEach(repo => {
                    if (repo.language) {
                        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                    }
                });

                let mostUsedLanguage = 'N/A';
                let maxCount = 0;
                for (const [lang, count] of Object.entries(languageCounts)) {
                    if (count > maxCount) {
                        mostUsedLanguage = lang;
                        maxCount = count;
                    }
                }

                // 3. Calculate Complexity Score (Arbitrary algorithm: Size * Forks * Watchers)
                const complexityScore = repos.reduce((acc, repo) => {
                    // Small weight on size, higher weight on community engagement
                    const score = Math.floor((repo.size / 1000) + (repo.forks_count * 5) + (repo.watchers_count * 2));
                    return acc + score;
                }, 0);

                // 4. Calculate Coding Streak (using events API)
                let currentStreak = 0;
                try {
                    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
                    if (eventsRes.ok) {
                        const events = await eventsRes.json();
                        const pushEvents = events.filter(e => e.type === 'PushEvent' || e.type === 'PullRequestEvent');

                        // Extract unique dates of activity
                        const activeDays = new Set(pushEvents.map(e => e.created_at.split('T')[0]));
                        const sortedDays = Array.from(activeDays).sort((a, b) => new Date(b) - new Date(a));

                        let dateToCheck = new Date();

                        // Let's see if there's activity today or yesterday to start the streak
                        const todayStr = dateToCheck.toISOString().split('T')[0];
                        dateToCheck.setDate(dateToCheck.getDate() - 1);
                        const yesterdayStr = dateToCheck.toISOString().split('T')[0];

                        if (activeDays.has(todayStr) || activeDays.has(yesterdayStr)) {
                            // Reset dateToCheck to today for the loop
                            dateToCheck = new Date();
                            // If they missed today but have yesterday, start checking from yesterday
                            if (!activeDays.has(todayStr)) {
                                dateToCheck.setDate(dateToCheck.getDate() - 1);
                            }

                            for (let i = 0; i < sortedDays.length; i++) {
                                const checkStr = dateToCheck.toISOString().split('T')[0];
                                if (activeDays.has(checkStr)) {
                                    currentStreak++;
                                    dateToCheck.setDate(dateToCheck.getDate() - 1); // Go back one day
                                } else {
                                    break; // Streak broken
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch GitHub events for streak calculation", e);
                }

                setStats({
                    totalStars,
                    mostUsedLanguage,
                    complexityScore,
                    codingStreak: currentStreak,
                    publicRepos: userData.public_repos,
                    followers: userData.followers
                });

            } catch (err) {
                console.error("Error fetching GitHub stats:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, [username]);

    return { stats, loading, error };
};

export default useGitHubStats;
