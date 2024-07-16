import {parseISO, differenceInMinutes} from 'date-fns';
import {toZonedTime, format} from 'date-fns-tz';
import {Task} from '../data/entities/tasks';

interface CalendarEvent {
  description: string;
  start: {dateTime: string; timeZone: string};
  end: {dateTime: string; timeZone: string};
  id: string;
}

interface ExtractedTask {
  id: number;
  startLocal: string;
  lengthInMinutes: number;
  googleId: string;
}

const key_prefix = '##tasks2-';
const key_postfix = '##';
export const generateAutoId = (task: Task) =>
  `${key_prefix}${task.id}${key_postfix}`;
export const descriptionRe = new RegExp(`${key_prefix}(\\d+)${key_postfix}`, 'i');

export const extractTasksFromCalendar = (data: any): ExtractedTask[] => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const events = data.items as CalendarEvent[];
  if (!events || !events.length) return [];

  const tasks: ExtractedTask[] = events.reduce(
    (acc: ExtractedTask[], event) => {
      const {description, start, end} = event;
      if (!description) return acc;

      const match = descriptionRe.exec(description);
      const googleId = event.id;
      if (match) {
        const id = parseInt(match[1], 10);
        const startDateTime = parseISO(start.dateTime);
        const endDateTime = parseISO(end.dateTime);
        const startLocal = format(
          toZonedTime(startDateTime, timeZone),
          'yyyy-MM-dd HH:mm:ssXXX',
          {timeZone},
        );
        const lengthInMinutes = differenceInMinutes(endDateTime, startDateTime);

        acc.push({id, startLocal, lengthInMinutes, googleId});
      }
      return acc;
    },
    [],
  );

  return tasks;
};
