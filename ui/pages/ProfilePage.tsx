import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  Text,
  Image,
} from 'react-native';
import Header from '../components/header/Header';
import {useSnackbar} from '../components/snackbar-manager/SnackbarManager';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../data/store';
import {fetchTasks} from '../../data/redux/tasksSlice';
import {regenerateDB} from '../../data/migrationManager';
import {clearProfile} from '../../data/redux/profileSlice';
import {
  fetchCalendarData,
  signOut as signOutFromCalendar,
} from '../../data/calendar/api';

const ProfilePage: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile);
  const {showMessage} = useSnackbar();
  const dispatch = useDispatch<AppDispatch>();
  const activeButton = useSelector(
    (state: RootState) => state.button.activeButton,
  );
  const showDone = useSelector((state: RootState) => state.done.showDone);

  const handleRegenerateDB = async () => {
    try {
      await regenerateDB();
      dispatch(fetchTasks({buttonState: activeButton, showDone}));
      showMessage('Database has been regenerated successfully', 'success');
    } catch (error) {
      console.error('Error regenerating database:', error);
      showMessage('Failed to regenerate the database', 'error');
    }
  };

  const signOut = async () => {
    signOutFromCalendar();
    dispatch(clearProfile());
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header includeDays={false} />
      <View style={styles.profileContainer}>
        {profile && profile.name ? (
          <>
            <Image
              source={{uri: profile.photoUrl}}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile.name}</Text>
            <Button title="load events" onPress={fetchCalendarData} />
            <View style={styles.buttonContainer}>
              <Button title="Log out" onPress={signOut} />
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Regenerate DB" onPress={handleRegenerateDB} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
  },
});

export default ProfilePage;
