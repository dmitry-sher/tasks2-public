import {formatDate as dateFnsFormat} from 'date-fns';
import {Task} from '../data/entities/tasks';
import {lengthOptions} from './const';

const datetimeFormat = 'dd.MM.yyyy HH:mm';
const datetimeFormatShort = 'dd.MM HH:mm';
const dateFormat = 'dd.MM.yyyy';
const placeholder = 'N/A';

export const findMaxId = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  return tasks.reduce(
    (maxId, task) => (task.id > maxId ? task.id : maxId),
    tasks[0].id,
  );
};

export const formatDatetimeShort = (date: Date | undefined): string =>
  date ? dateFnsFormat(date, datetimeFormatShort) : placeholder;

export const formatDatetime = (date: Date | undefined): string =>
  date ? dateFnsFormat(date, datetimeFormat) : placeholder;

export const formatDate = (date: Date | undefined): string =>
  date ? dateFnsFormat(date, dateFormat) : placeholder;

export const guessLabelForTaskLength = (length: number): string => {
  if (!length) return placeholder;

  const option = lengthOptions.find(
    option => option.value === length.toString(),
  );
  if (option) {
    return option.label;
  }

  // If an exact match is not found, return a fallback label
  return `${length}m`;
};
