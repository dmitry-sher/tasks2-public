import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {useModal} from '../../context/ModalContext';
import {RootState, AppDispatch} from '../../../data/store';
import {ButtonState, setActiveButton} from '../../../data/redux/buttonSlice';
import {fetchTasks} from '../../../data/redux/tasksSlice';
import {toggleShowDone} from '../../../data/redux/doneSlice';
import {useNavigation} from '@react-navigation/native';
import { fetchCalendarData } from '../../../data/calendar/api';

interface HeaderProps {
  includeDays: boolean;
}

const Header: React.FC<HeaderProps> = ({includeDays = false}) => {
  const {setMenuVisible} = useModal();
  const dispatch = useDispatch<AppDispatch>();
  const showDone = useSelector((state: RootState) => state.done.showDone);
  const navigation = useNavigation();

  const activeButton = useSelector(
    (state: RootState) => state.button.activeButton,
  );

  const toggleMenu = () => {
    setMenuVisible(true);
  };

  const handleButtonPress = async (button: ButtonState) => {
    dispatch(setActiveButton(button));
    if ([ButtonState.Today, ButtonState.Tomorrow].includes(activeButton)) {
      await fetchCalendarData(button === ButtonState.Tomorrow);
    }
    dispatch(fetchTasks({buttonState: button, showDone}));
  };

  const handleGoProfile = () => {
    // @ts-ignore
    navigation.navigate('Profile');
  };

  const handleToggleDone = () => {
    dispatch(fetchTasks({buttonState: activeButton, showDone: !showDone}));
    dispatch(toggleShowDone());
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoProfile}>
          <Icon name="account-circle" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {includeDays ? (
        <View style={styles.buttonRow}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeButton === ButtonState.Today && styles.activeButton,
              ]}
              onPress={() => handleButtonPress(ButtonState.Today)}>
              <Text
                style={[
                  styles.buttonText,
                  activeButton === ButtonState.Today && styles.activeButtonText,
                ]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeButton === ButtonState.Tomorrow && styles.activeButton,
              ]}
              onPress={() => handleButtonPress(ButtonState.Tomorrow)}>
              <Text
                style={[
                  styles.buttonText,
                  activeButton === ButtonState.Tomorrow &&
                    styles.activeButtonText,
                ]}>
                Tomorrow
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeButton === ButtonState.All && styles.activeButton,
              ]}
              onPress={() => handleButtonPress(ButtonState.All)}>
              <Text
                style={[
                  styles.buttonText,
                  activeButton === ButtonState.All && styles.activeButtonText,
                ]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.doneContainer}>
            <Text style={styles.doneLabel}>Done</Text>
            <Switch value={showDone} onValueChange={handleToggleDone} />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  activeButtonText: {
    color: '#fff',
  },
  divider: {
    height: 24,
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  doneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneLabel: {
    fontSize: 16,
    marginRight: 8,
  },
});
export default Header;
