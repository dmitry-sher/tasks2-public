export enum TaskHistoryAction {
  CreationByUser = 1,
  Edit,
  Delete,
  MoveTomorrow,
  MarkDone,
  MarkUndone,
  CreateFromGoogleCalendar,
  MoveYesterday,
}

export type TaskHistoryLog = {
  id: number;
  task_id: number;
  action: TaskHistoryAction;
  payload: string; // json
  createdAt: string; // datetime UTC
  updatedAt: string; // datetime UTC
};
