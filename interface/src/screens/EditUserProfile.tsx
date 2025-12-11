import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const EditUserProfileScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        let parsedUser: any = null;
        if (userData) {
          parsedUser = JSON.parse(userData);
          setUserId(parsedUser?.id ?? null);
          setName(parsedUser?.name ?? '');
          setEmail(parsedUser?.email ?? '');
          setPhotoUrl(parsedUser?.photo_url ?? '');
        }
        if (parsedUser?.id) {
          const token = await AsyncStorage.getItem('token');
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${API_URL}/api/users/${parsedUser.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setBio(String(data?.bio ?? ''));
            setPhotoUrl(String(data?.photo_url ?? ''));
          }
        }
      } catch {}
    })();
  }, []);

  const handleSave = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) { Alert.alert('Error', 'Not authenticated'); setLoading(false); return; }
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, bio, email, photo_url: photoUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Error', err.message || 'Failed to update profile');
      } else {
        const updated = await res.json().catch(() => null);
        const merged = { ...(updated || {}), id: userId } as any;
        if (photoUrl) merged.photo_url = photoUrl;
        await AsyncStorage.setItem('user', JSON.stringify(merged));
        Alert.alert('Success', 'Profile updated');
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Network issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={64} label={(name || 'GU').substring(0,2).toUpperCase()} style={{ backgroundColor: '#ccc' }} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{name || 'Your Name'}</Text>
          {!!email && <Text style={{ color: '#666' }}>{email}</Text>}
        </View>
      </View>
      <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" keyboardType="email-address" />
      <TextInput label="Profile picture URL" value={photoUrl} onChangeText={setPhotoUrl} style={styles.input} mode="outlined" />
      <TextInput label="Bio" value={bio} onChangeText={setBio} style={styles.input} mode="outlined" multiline />
      <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading}>
        Save Profile
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
});

export default EditUserProfileScreen;
