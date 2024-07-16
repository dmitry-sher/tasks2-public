import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {useSelector} from 'react-redux';
import TaskItem from './TaskItem';
import {Task} from '../../../data/entities/tasks';
import {RootState} from '../../../data/store';
import Stub from '../stub/Stub';
import {ButtonState} from '../../../data/redux/buttonSlice';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onTomorrow: (task: Task) => void;
  onYesterday: (task: Task) => void;
  onDoubleTap: (task: Task) => void;
  onStatusChange: (task: Task) => void;
  onRefresh: () => void; // Add this prop to handle refresh
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onDoubleTap,
  onTomorrow,
  onStatusChange,
  onRefresh,
  onYesterday,
}) => {
  const rowRefs = useRef(new Map<number, any>());
  const activeButton = useSelector(
    (state: RootState) => state.button.activeButton,
  );
  const [refreshing, setRefreshing] = useState(false);

  const closeRow = (task: Task) => {
    const rowRef = rowRefs.current.get(task.id);
    if (rowRef) {
      rowRef.closeRow();
    }
  };

  const handleEdit = (task: Task) => {
    closeRow(task);
    onEdit(task);
  };

  const handleTomorrow = async (task: Task) => {
    closeRow(task);
    await onTomorrow(task);
  };

  const handleYesterday = async (task: Task) => {
    closeRow(task);
    await onYesterday(task);
  };

  const handleDelete = async (task: Task) => {
    closeRow(task);
    await onDelete(task);
  };

  const confirmDelete = (task: Task) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => handleDelete(task),
        style: 'destructive',
      },
    ]);
  };

  const handleDoubleTap = (task: Task) => {
    onDoubleTap(task);
  };

  const handleStatusChange = (task: Task) => {
    onStatusChange(task);
  };

  const renderItem = ({item}: {item: Task}) => (
    <TaskItem
      task={item}
      onDoubleTap={handleDoubleTap}
      onStatusChange={handleStatusChange}
    />
  );

  const onRowOpen = (rowKey: string, rowMap: any, toValue: number) => {
    const taskId = parseInt(rowKey, 10);
    rowRefs.current.set(taskId, rowMap[rowKey]);

    if (toValue > 0) {
      // Swipe right
      handleEdit(tasks.find(task => task.id === taskId)!);
    }
  };

  const renderHiddenItem = ({item}: {item: Task}) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => handleEdit(item)}>
        <Text style={styles.backTextWhite}>Edit</Text>
      </TouchableOpacity>
      {activeButton === ButtonState.Today ? (
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnCenter]}
          onPress={() => handleTomorrow(item)}>
          <Text style={styles.backTextWhite}>Tomorrow</Text>
        </TouchableOpacity>
      ) : null}
      {activeButton === ButtonState.Tomorrow ? (
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnCenter]}
          onPress={() => handleYesterday(item)}>
          <Text style={styles.backTextWhite}>Today</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => confirmDelete(item)}>
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const onRefreshHandler = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (!tasks || !tasks.length)
    return (
      <Stub
        text={`No tasks yet.
Click + icon to create your first task! `}
      />
    );

  return (
    <View style={styles.container}>
      <SwipeListView
        data={tasks}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        keyExtractor={item => item.id.toString()}
        rightOpenValue={-225}
        leftOpenValue={225}
        onRowOpen={onRowOpen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshHandler}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75, // Adjust width to fit the buttons equally
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 150,
  },
  backRightBtnCenter: {
    backgroundColor: 'orange',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
});

export default TaskList;
