export type TaskStatus = "pending" | "ongoing" | "delivered";

export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  avatarColor: string;
  initials: string;
  isOnline: boolean;
  isAdmin: boolean;
}

export interface DailyLog {
  id: string;
  memberId: string;
  departmentId: string;
  taskId?: string;
  taskTitle?: string;
  date: string;
  summary: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  createdById: string;
  assigneeIds: string[];
  status: TaskStatus;
  dueDate: string;
  updatedAt: string;
}

export interface NewTaskInput {
  title: string;
  description: string;
  departmentId: string;
  assigneeIds: string[];
  status: TaskStatus;
  dueDate: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  memberId: string;
  body: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  memberId: string;
  departmentId: string;
  type: "log" | "task_update" | "task_created" | "task_comment";
  message: string;
  timestamp: string;
  meta?: {
    taskStatus?: TaskStatus;
    imageUrl?: string;
    taskId?: string;
    taskTitle?: string;
  };
}
