import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Task} from '../../../data/entities/tasks';
import {useSnackbar} from '../snackbar-manager/SnackbarManager';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {formatDatetime} from '../../../util/util';
import {lengthOptions} from '../../../util/const';

interface TaskFormModalProps {
  visible: boolean;
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  task,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [length, setLength] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {showMessage} = useSnackbar();

  const init = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setLength(undefined);
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate));
      }
      setLength(task.length ? task.length.toString() : undefined);
    } else {
      init();
    }
  }, [task]);

  const handleSave = () => {
    if (title.trim().length === 0) {
      showMessage('Name is mandatory', 'error');
      return;
    }

    const newTask: Task = {
      ...task,
      title,
      description,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      length: length ? parseInt(length, 10) : undefined,
      status: task?.status || 0,
      id: task?.id || 0,
      createdAt: task?.createdAt || '',
      updatedAt: new Date().toISOString(),
    };

    onSave(newTask);
    onClose();
    init();
  };

  const roundToQuarterHour = (date: Date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    date.setMinutes(roundedMinutes);
    return date;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {task?.id ? 'Edit Task' : 'Add Task'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Select Due Date"
              value={dueDate ? formatDatetime(dueDate) : ''}
              editable={false}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateIcon}>
              <Icon name="calendar-today" size={24} color="#888" />
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(undefined)}
                style={styles.clearIcon}>
                <Icon name="clear" size={24} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <DatePicker
            modal
            open={showDatePicker}
            date={dueDate || new Date()}
            onConfirm={date => {
              setDueDate(roundToQuarterHour(date));
              setShowDatePicker(false);
              if (!length) setLength('30');
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
          />
          {dueDate && (
            <View style={styles.lengthContainer}>
              <Text style={styles.label}>Length of Task:</Text>
              <View style={styles.lengthOptions}>
                {lengthOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.lengthButton,
                      length === option.value && styles.selectedLengthButton,
                    ]}
                    onPress={() => setLength(option.value)}>
                    <Text
                      style={[
                        styles.lengthButtonText,
                        length === option.value &&
                          styles.selectedLengthButtonText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    height: 40,
  },
  dateInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#000',
  },
  dateIcon: {
    padding: 10,
  },
  clearIcon: {
    padding: 10,
  },
  lengthContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  lengthOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lengthButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    margin: 4,
    borderWidth: 0,
    backgroundColor: '#eee',
  },
  selectedLengthButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  lengthButtonText: {
    fontSize: 16,
  },
  selectedLengthButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f56a79',
  },
  saveButton: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TaskFormModal;
