import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Header from '../components/header/Header';
import TaskList from '../components/task/TaskList';
import FloatingButton from '../components/floating-button/FloatingButton';
import TaskFormModal from '../components/task-form-modal/TaskFormModal';

import {Task} from '../../data/entities/tasks';
import {AppDispatch, RootState} from '../../data/store';
import {
  addTask,
  editTask,
  fetchTasks,
  prepareTaskForTomorrow,
  prepareTaskForYesterday,
  removeTask,
  setStatus,
} from '../../data/redux/tasksSlice';
import {insertTaskHistoryLog, openDatabase} from '../../data/database';
import {applyMigrations} from '../../data/migrationManager';
import {
  deleteEventFromCalendar,
  fetchCalendarData,
  updateEventInCalendar,
} from '../../data/calendar/api';
import {TaskHistoryAction} from '../../data/entities/taskHistoryLog';
import {openTaskHistoryModal} from '../../data/redux/taskHistoryModalSlice';
import {ButtonState} from '../../data/redux/buttonSlice';

const MainPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const activeButton = useSelector(
    (state: RootState) => state.button.activeButton,
  );
  const showDone = useSelector((state: RootState) => state.done.showDone);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initDB = async () => {
      try {
        await openDatabase();
        await applyMigrations();
        if ([ButtonState.Today, ButtonState.Tomorrow].includes(activeButton)) {
          await fetchCalendarData(activeButton === ButtonState.Tomorrow);
        }
        dispatch(fetchTasks({buttonState: activeButton, showDone}));
      } catch (error) {
        console.error('Database initialization error: ', error);
      }
    };

    initDB();
  }, []);

  // UI Handlers
  const handleAddTask = () => {
    setCurrentTask(undefined);
    setIsModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // ACTIONS

  const onTomorrow = async (task: Task) => {
    const {updatedTask} = prepareTaskForTomorrow(task);

    await dispatch(editTask(updatedTask));
    insertTaskHistoryLog(task.id, TaskHistoryAction.MoveTomorrow, updatedTask);
    if (task.google_event_id) {
      await updateEventInCalendar(updatedTask);
    }
    await dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  const onYesterday = async (task: Task) => {
    const {updatedTask} = prepareTaskForYesterday(task);

    await dispatch(editTask(updatedTask));
    insertTaskHistoryLog(task.id, TaskHistoryAction.MoveYesterday, updatedTask);
    if (task.google_event_id) {
      await updateEventInCalendar(updatedTask);
    }
    await dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  const onDelete = async (task: Task) => {
    if (task.google_event_id) {
      await deleteEventFromCalendar(task.google_event_id);
    }
    insertTaskHistoryLog(task.id, TaskHistoryAction.Delete, {});
    await dispatch(removeTask(task.id));
    await dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  const onDoubleTap = (task: Task) => {
    dispatch(openTaskHistoryModal(task.id));
  };

  const onRefresh = async () => {
    await dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  const onStatusChange = async (task: Task) => {
    await dispatch(setStatus({taskId: task.id, status: !task.status}));
    insertTaskHistoryLog(
      task.id,
      task.status ? TaskHistoryAction.MarkUndone : TaskHistoryAction.MarkDone,
      {},
    );
    dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  const onSave = async (task: Task) => {
    console.log(`[handleSave] ${JSON.stringify({task})}`);
    if (task.id > 0) {
      await dispatch(editTask(task));
      insertTaskHistoryLog(task.id, TaskHistoryAction.Edit, task);
      if (task.google_event_id) {
        await updateEventInCalendar(task);
      }
      dispatch(fetchTasks({buttonState: activeButton, showDone}));
      return;
    }
    await dispatch(addTask(task));
    dispatch(fetchTasks({buttonState: activeButton, showDone}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header includeDays />
      <TaskList
        tasks={tasks}
        onEdit={handleEditTask}
        onTomorrow={onTomorrow}
        onYesterday={onYesterday}
        onDelete={onDelete}
        onDoubleTap={onDoubleTap}
        onStatusChange={onStatusChange}
        onRefresh={onRefresh}
      />
      <FloatingButton onPress={handleAddTask} />
      <TaskFormModal
        visible={isModalVisible}
        task={currentTask}
        onClose={handleCloseModal}
        onSave={onSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stubContainer: {
    flex: 1,
    borderColor: 'red',
    borderWidth: 1,
  },
  header: {
    // height: 56,
  },
});

export default MainPage;
