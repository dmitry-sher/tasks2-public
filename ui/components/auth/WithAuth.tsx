import React, {useEffect} from 'react';
import {View, Button, Text, StyleSheet, Image} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../data/store';
import {setProfile} from '../../../data/redux/profileSlice';
import {tokenKey} from '../../../util/const';
import {
  GOOGLE_WEB_CLIENT_ID,
  REQUIRED_SCOPE,
  signIn as signInGoogle,
} from '../../../data/calendar/api';

const WithAuth: React.FC<{children: React.ReactNode}> = ({children}) => {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    GoogleSignin.configure({
      scopes: [REQUIRED_SCOPE], // Required scopes
      webClientId: GOOGLE_WEB_CLIENT_ID, // Client ID from Google API Console
      offlineAccess: true, // Enables server-side access
    });

    const loadProfile = async () => {
      try {
        const accessToken = await AsyncStorage.getItem(tokenKey);
        if (accessToken) {
          const userInfo = await GoogleSignin.signInSilently();
          dispatch(
            setProfile({
              name: userInfo.user.name || '',
              photoUrl: userInfo.user.photo || '',
              email: userInfo.user.email,
            }),
          );
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadProfile();
  }, [dispatch]);

  const signIn = async () => {
    try {
      const {userInfo} = await signInGoogle();

      dispatch(
        setProfile({
          name: userInfo.user.name || '',
          photoUrl: userInfo.user.photo || '',
          email: userInfo.user.email,
        }),
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.error('User cancelled the login flow', error);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.error('Operation (e.g. sign in) is in progress already', error);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('Play services not available or outdated', error);
      } else {
        // Some other error happened
        console.error(error);
      }
    }
  };

  if (!profile.email) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../../assets/logo-470.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Tasks2</Text>
        <Text style={styles.description}>Please Sign In</Text>
        <Button title="Sign in with Google" onPress={signIn} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default WithAuth;
