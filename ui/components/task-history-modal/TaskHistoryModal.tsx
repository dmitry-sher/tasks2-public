import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {Modal, Portal, Text, Button, Card, Paragraph} from 'react-native-paper';
import Dropdown from 'react-native-paper-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../data/store';
import {
  TaskHistoryLog,
  TaskHistoryAction,
} from '../../../data/entities/taskHistoryLog';
import {closeTaskHistoryModal} from '../../../data/redux/taskHistoryModalSlice';
import {getTaskHistoryLogs} from '../../../data/database';

const TaskHistoryModal: React.FC = () => {
  const dispatch = useDispatch();
  const {isVisible, taskId} = useSelector(
    (state: RootState) => state.taskHistoryModal,
  );

  const [logs, setLogs] = useState<TaskHistoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<
    TaskHistoryAction | undefined
  >(undefined);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isVisible && taskId !== null) {
      fetchLogs(taskId);
    }
  }, [isVisible, taskId, actionFilter]);

  const fetchLogs = async (taskId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTaskHistoryLogs(taskId, actionFilter);
      setLogs(response);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const renderAction = (action: TaskHistoryAction) => {
    switch (action) {
      case TaskHistoryAction.CreationByUser:
        return 'Created by user';
      case TaskHistoryAction.Edit:
        return 'Edited';
      case TaskHistoryAction.Delete:
        return 'Deleted';
      case TaskHistoryAction.MoveTomorrow:
        return 'Moved to tomorrow';
      case TaskHistoryAction.MoveYesterday:
        return 'Moved to today';
      case TaskHistoryAction.MarkDone:
        return 'Marked as done';
      case TaskHistoryAction.MarkUndone:
        return 'Marked as undone';
      case TaskHistoryAction.CreateFromGoogleCalendar:
        return 'Created from Google Calendar';
      default:
        return 'Unknown action';
    }
  };

  const handleClose = () => {
    dispatch(closeTaskHistoryModal());
  };

  const actionOptions = [
    {label: 'All Actions', value: 0},
    {label: 'Created by user', value: TaskHistoryAction.CreationByUser},
    {label: 'Edited', value: TaskHistoryAction.Edit},
    {label: 'Deleted', value: TaskHistoryAction.Delete},
    {label: 'Moved to tomorrow', value: TaskHistoryAction.MoveTomorrow},
    {label: 'Moved to today', value: TaskHistoryAction.MoveYesterday},
    {label: 'Marked as done', value: TaskHistoryAction.MarkDone},
    {label: 'Marked as undone', value: TaskHistoryAction.MarkUndone},
    {
      label: 'Created from Google Calendar',
      value: TaskHistoryAction.CreateFromGoogleCalendar,
    },
  ];

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContainer}>
        <Text style={styles.header}>Task History Logs</Text>

        <Dropdown
          label="Filter by Action"
          visible={showDropdown}
          showDropDown={() => setShowDropdown(true)}
          onDismiss={() => setShowDropdown(false)}
          value={actionFilter}
          setValue={setActionFilter}
          list={actionOptions}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <ScrollView style={styles.logsContainer}>
            {logs.map(log => (
              <Card key={log.id} style={styles.logCard}>
                <Card.Content>
                  <View style={styles.row}>
                    <Paragraph style={styles.logAction}>
                      {renderAction(log.action)}
                    </Paragraph>
                    <Paragraph style={styles.logTimestamp}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Paragraph>
                  </View>
                  {log.payload && log.payload !== '{}' ? (
                    <Paragraph style={styles.logPayload}>
                      {log.payload}
                    </Paragraph>
                  ) : null}
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        )}
        <Button
          mode="contained"
          onPress={handleClose}
          style={styles.closeButton}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 10,
  },
  logsContainer: {
    maxHeight: 400,
  },
  logCard: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logAction: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logPayload: {
    fontSize: 14,
    color: '#333',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default TaskHistoryModal;
