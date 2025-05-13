import { database, ref, get } from './firebase.js';
import { showPopupWithType } from './script.js';

export async function getLeaderboardData({limit = 10, showPopup}) {
    const usersRef = ref(database, 'users');
    try {
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) return [];

        const users = Object.entries(snapshot.val()).map(([uid, data]) => ({
            uid,
            username: data.username || 'Student',
            xp: parseInt(data.xp || 0)
        }));

        users.sort((a, b) => b.xp - a.xp);
        return users.slice(0, limit);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        showPopupWithType("Error fetching leaderboard data. Try again later.", false);
        return [];
    }
}