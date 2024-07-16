import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {TapGestureHandler, State} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Task} from '../../../data/entities/tasks'; // Adjust the import path accordingly
import {
  formatDate,
  guessLabelForTaskLength,
  formatDatetimeShort,
} from '../../../util/util';

interface TaskItemProps {
  task: Task;
  onDoubleTap: (task: Task) => void;
  onStatusChange: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onDoubleTap,
  onStatusChange,
}) => {
  const handleDoubleTap = ({nativeEvent}: {nativeEvent: any}) => {
    if (nativeEvent.state === State.ACTIVE) {
      onDoubleTap(task);
    }
  };

  const handleStatusChange = () => {
    onStatusChange(task);
  };

  return (
    <TapGestureHandler onHandlerStateChange={handleDoubleTap} numberOfTaps={2}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleStatusChange}
          style={styles.checkboxContainer}>
          <View
            style={[
              styles.checkbox,
              task.status ? styles.checked : styles.unchecked,
            ]}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description}>{task.description}</Text>
          <View>
            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <Text style={styles.description}>
                  Due on: {formatDatetimeShort(new Date(task.dueDate))},{` `}
                  {guessLabelForTaskLength(task.length || 0)}
                </Text>
                {task.google_event_id && (
                  <Icon
                    name="event-available"
                    size={16}
                    color="#000"
                    style={styles.calendarIcon}
                  />
                )}
              </View>
            )}
            {task.showAfter && (
              <Text style={styles.description}>
                Show on: {formatDate(new Date(task.showAfter))}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  checked: {
    backgroundColor: '#007bff',
  },
  unchecked: {
    backgroundColor: 'white',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginLeft: 5,
  },
});

export default TaskItem;
