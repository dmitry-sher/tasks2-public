import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  endOfToday,
  endOfTomorrow,
  formatISO,
  startOfToday,
  startOfTomorrow,
} from 'date-fns';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Task} from '../entities/tasks';
import {refreshTokenKey, tokenKey} from '../../util/const';
import {descriptionRe, generateAutoId} from '../../util/calendar';
import {
  getTasksByGoogleEventIds,
  insertTask,
  insertTaskHistoryLog,
  setTaskGoogleId,
} from '../database';
import {TaskHistoryAction} from '../entities/taskHistoryLog';

export const GOOGLE_CALENDAR_API_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';
export const GOOGLE_TOKEN_API_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_WEB_CLIENT_ID =
  '190971343201-qr8j2stgo4uid5brg3kukgfu8200mnl3.apps.googleusercontent.com';
export const REVERSE_GOOGLE_WEB_CLIENT_ID =
  'com.googleusercontent.apps.190971343201-qr8j2stgo4uid5brg3kukgfu8200mnl3';
export const REQUIRED_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

const generateTaskDescription = (task: Task) =>
  [task.description, '', '', '', '', generateAutoId(task)].join('\n');

export const signIn = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();

  // Store tokens in AsyncStorage
  await AsyncStorage.setItem(tokenKey, tokens.accessToken);
  await AsyncStorage.setItem(refreshTokenKey, tokens.idToken);

  return {userInfo};
};

export const signOut = async () => {
  await AsyncStorage.setItem(tokenKey, '');
  await AsyncStorage.setItem(refreshTokenKey, '');
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await AsyncStorage.getItem(refreshTokenKey);
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const body = {
    scope: REQUIRED_SCOPE,
    response_type: 'code',
    access_type: 'offline',
    redirect_uri: `${REVERSE_GOOGLE_WEB_CLIENT_ID}://`,
    client_id: GOOGLE_WEB_CLIENT_ID,
    grant_type: 'refresh_token',
    refreshToken,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  console.log(`[refreshAccessToken] ${JSON.stringify({options, body})}`);
  const response = await fetch(GOOGLE_TOKEN_API_URL, options);

  if (!response.ok) {
    console.error(
      `Failed to refresh access token: ${JSON.stringify({response})}`,
    );
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  const newAccessToken = data.access_token;

  // Store the new access token
  await AsyncStorage.setItem(tokenKey, newAccessToken);

  return newAccessToken;
};

interface FetchOptions {
  method: string;
  headers: any;
  body?: any;
}
export const getCalendarApiMethod = (method: string) => {
  const innerCall = async (
    url: string,
    body?: any,
    retriesCount = 0,
  ): Promise<any> => {
    const accessToken = await AsyncStorage.getItem(tokenKey);
    const options: FetchOptions = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    if (['PATCH', 'POST'].includes(method) && body) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }

    console.log(
      `[calendarApiMethod] ${method} ${url} ${JSON.stringify(options)}`,
    );
    const response = await fetch(url, options);
    if (!response.ok) {
      const responseData = await response.json();
      if (responseData?.error?.code === 401) {
        if (retriesCount > 5) {
          throw new Error(`Failed to update token 5 times`);
        }
        await refreshAccessToken();
        return innerCall(url, body, retriesCount + 1);
      } else {
        throw new Error(
          `Failed to make Google Calendar API call: ${JSON.stringify({
            response,
            responseData,
          })}`,
        );
      }
    }

    const data = await response.json();
    return data;
  };
  return innerCall;
};

export async function postTaskToCalendar(task: Task) {
  if (!task.dueDate || !task.length) return;
  try {
    // Get stored Google access token
    const accessToken = await AsyncStorage.getItem(tokenKey);
    if (accessToken) {
      // Prepare event data
      const startDate = new Date(task.dueDate || '');
      const endDate = new Date(startDate.getTime() + task.length * 60000); // length is in minutes

      const event = {
        summary: task.title,
        description: generateTaskDescription(task),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
      };

      const call = getCalendarApiMethod('POST');
      const data = await call(GOOGLE_CALENDAR_API_URL, event);
      console.log('[posttasktocalender]', JSON.stringify({data}));

      await setTaskGoogleId(task.id, data.id);
    }
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    // @ts-ignore
    console.error(error.toString());
  }
}

export const fetchCalendarData = async (tomorrow = false) => {
  try {
    const accessToken = await AsyncStorage.getItem(tokenKey);
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const startOfDay = tomorrow
      ? startOfTomorrow().toISOString()
      : startOfToday().toISOString();
    const endOfDay = tomorrow
      ? endOfTomorrow().toISOString()
      : endOfToday().toISOString();

    const url = `${GOOGLE_CALENDAR_API_URL}?timeMin=${startOfDay}&timeMax=${endOfDay}`;
    const call = getCalendarApiMethod('GET');
    const data = await call(url);

    const events = data.items;
    // console.log('fetchCalendarData', JSON.stringify({data, events}));

    const eventIds = events.map((event: any) => event.id);
    const existingTasks = await getTasksByGoogleEventIds(eventIds);
    const existingEventIds = new Set(
      existingTasks.map(task => task.google_event_id),
    );

    const newTasks = events
      .filter((event: any) => !existingEventIds.has(event.id))
      .map((event: any) => ({
        title: event.summary || 'No title',
        description: (event.description || '')
          .replace(descriptionRe, '') // Remove the ##tasks2-(\d+)## part at the end
          .replace(/\n+$/, ''), // Remove any trailing newlines
        dueDate: event.start.dateTime,
        length: event.end.dateTime
          ? (new Date(event.end.dateTime).getTime() -
              new Date(event.start.dateTime).getTime()) /
            60000
          : undefined,
        status: 0, // Assuming 0 is the default status for new tasks
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        google_event_id: event.id,
      }));

    console.log('[fetchCalendarData]', JSON.stringify({newTasks}));

    for (const task of newTasks) {
      const newTask = await insertTask(task);
      await insertTaskHistoryLog(
        newTask.id,
        TaskHistoryAction.CreateFromGoogleCalendar,
        newTask,
      );
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error);
  }
};

export const deleteEventFromCalendar = async (eventId: string) => {
  try {
    // Get stored Google access token
    const accessToken = await AsyncStorage.getItem(tokenKey);
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const url = `${GOOGLE_CALENDAR_API_URL}/${eventId}`;
    const call = getCalendarApiMethod('DELETE');
    await call(url);

    console.log(`Event with ID ${eventId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting event from Google Calendar:', error);
  }
};

// New function to update an event in Google Calendar
export const updateEventInCalendar = async (task: Task) => {
  if (!task.dueDate || !task.length || !task.google_event_id) return;
  try {
    // Get stored Google access token
    const accessToken = await AsyncStorage.getItem(tokenKey);
    if (accessToken) {
      // Prepare event data
      const startDate = new Date(task.dueDate || '');
      const endDate = new Date(startDate.getTime() + task.length * 60000); // length is in minutes

      const event = {
        summary: task.title,
        description: generateTaskDescription(task),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
      };
      const url = `${GOOGLE_CALENDAR_API_URL}/${task.google_event_id}`;
      const call = getCalendarApiMethod('PATCH');
      const data = await call(url, event);
      console.log('[updateEventInCalendar]', JSON.stringify({data}));
    }
  } catch (error) {
    console.error('Error updating event in Google Calendar:', error);
    // @ts-ignore
    console.error(error.toString());
  }
};
