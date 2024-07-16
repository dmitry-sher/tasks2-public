import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StubProps {
  text?: string;
}

const Stub: React.FC<StubProps> = ({ text = "later, amigo" }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    height: '100%',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default Stub;
