export type Task = {
  id: number;
  title: string;
  description: string;
  showAfter?: string; //datetime UTC
  length?: number; //minutes
  dueDate?: string; //datetime UTC
  status: number;
  createdAt: string; //datetime UTC
  updatedAt: string; //datetime UTC
  google_event_id?: string;
};
