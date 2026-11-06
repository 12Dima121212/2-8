
import { reactive } from 'vue';
import initialTasks from '../data/tasks';

const allowedStatuses = ['todo', 'progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];
const allowedCategories = ['study', 'work', 'personal'];

export const taskState = reactive({
  tasks: initialTasks.map((task) => ({
    ...task,
    category: task.category ?? 'study',
  })),
});

function findTask(id) {
  return taskState.tasks.find((task) => task.id === Number(id));
}

function validDate(value) {
  if (!value) return true;

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value
  );
}

function normalizeTaskData(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description =
    typeof data.description === 'string' ? data.description.trim() : '';
  const category = data.category ?? 'study';

  if (title.length < 3 || title.length > 80) return null;
  if (description.length > 300) return null;
  if (!allowedStatuses.includes(data.status)) return null;
  if (!allowedPriorities.includes(data.priority)) return null;
  if (!allowedCategories.includes(category)) return null;
  if (!validDate(data.dueDate)) return null;

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    category,
    dueDate: data.dueDate || '',
  };
}

export function addTask(data) {
  const normalized = normalizeTaskData(data);

  if (!normalized) return null;

  const titleExists = taskState.tasks.some(
    (task) =>
      task.title.trim().toLowerCase() === normalized.title.toLowerCase()
  );

  if (titleExists) return null;

  const nextId =
    Math.max(0, ...taskState.tasks.map((task) => Number(task.id) || 0)) + 1;

  const newTask = {
    id: nextId,
    ...normalized,
  };

  taskState.tasks.unshift(newTask);

  return newTask;
}

export function updateTask({ id, ...data }) {
  const normalized = normalizeTaskData(data);

  if (!normalized) return null;

  const task = findTask(id);

  if (!task) return null;

  Object.assign(task, normalized);

  return task;
}

export function deleteTask(id) {
  const index = taskState.tasks.findIndex(
    (task) => task.id === Number(id)
  );

  if (index === -1) return false;

  taskState.tasks.splice(index, 1);

  return true;
}

export function setTaskStatus({ id, status }) {
  if (!allowedStatuses.includes(status)) return null;

  const task = findTask(id);

  if (!task) return null;

  task.status = status;

  return task;
}

export function setTaskPriority({ id, priority }) {
  if (!allowedPriorities.includes(priority)) return null;

  const task = findTask(id);

  if (!task) return null;

  task.priority = priority;

  return task;
}
