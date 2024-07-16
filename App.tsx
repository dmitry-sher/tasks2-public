import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import store from './data/store';
import MainPage from './ui/pages/MainPage';
import ProfilePage from './ui/pages/ProfilePage';
import {ModalProvider} from './ui/context/ModalContext';
import MenuModal from './ui/components/menu-modal/MenuModal';
import {SnackbarProvider} from './ui/components/snackbar-manager/SnackbarManager';
import WithAuth from './ui/components/auth/WithAuth';
import TaskHistoryModal from './ui/components/task-history-modal/TaskHistoryModal';

const Stack = createStackNavigator();

const App: React.FC = () => {
  React.useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ReduxProvider store={store}>
        <ModalProvider>
          <PaperProvider>
            <NavigationContainer>
              <SnackbarProvider>
                <WithAuth>
                  <Stack.Navigator
                    initialRouteName="Main"
                    screenOptions={{headerShown: false}}>
                    <Stack.Screen name="Main" component={MainPage} />
                    <Stack.Screen name="Profile" component={ProfilePage} />
                  </Stack.Navigator>
                  <MenuModal />
                  <TaskHistoryModal />
                </WithAuth>
              </SnackbarProvider>
            </NavigationContainer>
          </PaperProvider>
        </ModalProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

export default App;
