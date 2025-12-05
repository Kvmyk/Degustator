import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const useFollow = (targetUserId: string) => {
  const [following, setFollowing] = useState<boolean>(false);

  // Pobieranie statusu follow
  const checkFollowing = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/follow/is-following/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setFollowing(data.following);
    } catch (err) {
      console.error('Error checking following:', err);
    }
  };

  // Follow / Unfollow
  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const method = following ? 'DELETE' : 'POST';

      const res = await fetch(`${API_URL}/api/follow/${targetUserId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Follow error:', errorData);
        return;
      }

      setFollowing(!following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // automatyczne pobranie przy montowaniu
  useEffect(() => {
    checkFollowing();
  }, [targetUserId]);

  return {
    following,
    toggleFollow,
    refreshFollowStatus: checkFollowing,
  };
};
