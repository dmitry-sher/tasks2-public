import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Portal} from 'react-native-paper';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import {useModal} from '../../context/ModalContext';

const screenWidth = Dimensions.get('window').width;

const MenuModal: React.FC = () => {
  const {menuVisible, setMenuVisible} = useModal();
  const slideAnim = React.useRef(new Animated.Value(-screenWidth)).current;

  const navigation = useNavigation();

  React.useEffect(() => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible, slideAnim]);

  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    // @ts-ignore
    navigation.navigate(screen);
  };

  return (
    <Portal>
      {menuVisible && (
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Animated.View
            style={[
              styles.menuContainer,
              {transform: [{translateX: slideAnim}]},
            ]}>
            <View style={styles.menu}>
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo('Main')}>
                <Text style={styles.menuText}>Main</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo('Profile')}>
                <Text style={styles.menuText}>Profile</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      )}
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  menu: {
    padding: 20,
    paddingTop: 50,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
  },
});

export default MenuModal;
