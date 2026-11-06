
<script setup>
import { computed, nextTick, ref } from 'vue';

import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskListControls from '../components/TaskListControls.vue';

import {
  taskState,
  addTask,
  updateTask,
  deleteTask,
  setTaskStatus,
  setTaskPriority,
} from '../store/tasks';

import '../css/task-components.css';
import '../css/task-form.css';
import '../css/task-list.css';

const searchText = ref('');
const selectedStatus = ref('all');
const selectedPriority = ref('all');
const sortOrder = ref('newest');
const onlyUncompleted = ref(false);

const showForm = ref(false);
const editingId = ref(null);
const selectedTask = ref(null);
const feedback = ref('');

const editingTask = computed(
  () => taskState.tasks.find((task) => task.id === editingId.value) ?? null
);

// Відсоток виконаних завдань серед усього списку.
const completedPercent = computed(() => {
  if (taskState.tasks.length === 0) return 0;

  const completed = taskState.tasks.filter(
    (task) => task.status === 'done'
  ).length;

  return Math.round((completed / taskState.tasks.length) * 100);
});

// Пошук, комбінована фільтрація та сортування.
const visibleTasks = computed(() => {
  const term = searchText.value.trim().toLocaleLowerCase('uk-UA');

  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const statusWeight = {
    progress: 1,
    todo: 2,
    done: 3,
  };

  // filter() створює новий масив, не змінюючи спільне сховище.
  const result = taskState.tasks.filter((task) => {
    const searchableText =
      `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('uk-UA');

    const matchesText = !term || searchableText.includes(term);

    const matchesStatus =
      selectedStatus.value === 'all' ||
      task.status === selectedStatus.value;

    const matchesPriority =
      selectedPriority.value === 'all' ||
      task.priority === selectedPriority.value;

    const matchesUncompleted =
      !onlyUncompleted.value || task.status !== 'done';

    return (
      matchesText &&
      matchesStatus &&
      matchesPriority &&
      matchesUncompleted
    );
  });

  // Сортуємо тільки результат filter(), а не taskState.tasks.
  return result.sort((a, b) => {
    if (sortOrder.value === 'title') {
      return a.title.localeCompare(b.title, 'uk-UA') || a.id - b.id;
    }

    if (sortOrder.value === 'priority') {
      return (
        priorityWeight[b.priority] - priorityWeight[a.priority] ||
        b.id - a.id
      );
    }

    if (sortOrder.value === 'status') {
      return (
        statusWeight[a.status] - statusWeight[b.status] ||
        b.id - a.id
      );
    }

    if (
      sortOrder.value === 'dueDate' ||
      sortOrder.value === 'dueDateDesc'
    ) {
      // Завдання без дати завжди залишаються в кінці.
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && !b.dueDate) return -1;

      if (!a.dueDate && !b.dueDate) {
        return b.id - a.id;
      }

      if (sortOrder.value === 'dueDateDesc') {
        return b.dueDate.localeCompare(a.dueDate) || b.id - a.id;
      }

      return a.dueDate.localeCompare(b.dueDate) || b.id - a.id;
    }

    // Спочатку нові завдання.
    return b.id - a.id;
  });
});

function resetFilters() {
  searchText.value = '';
  selectedStatus.value = 'all';
  selectedPriority.value = 'all';
  sortOrder.value = 'newest';
  onlyUncompleted.value = false;
}

function clearSearch() {
  searchText.value = '';
}

async function startCreate() {
  editingId.value = null;
  showForm.value = true;
  feedback.value = '';

  await nextTick();

  document.querySelector('.tf4-form-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

async function startEdit(id) {
  editingId.value = id;
  showForm.value = true;
  feedback.value = '';

  await nextTick();

  document.querySelector('.tf4-form-section')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function cancelForm() {
  editingId.value = null;
  showForm.value = false;
}

function saveTask(data) {
  const isEditing = editingId.value !== null;

  const saved = isEditing
    ? updateTask({ id: editingId.value, ...data })
    : addTask(data);

  if (!saved) {
    feedback.value =
      'Не вдалося зберегти завдання. Перевірте дані або унікальність назви.';
    return;
  }

  feedback.value = isEditing
    ? `Завдання «${saved.title}» оновлено.`
    : `Завдання «${saved.title}» створено.`;

  cancelForm();
  resetFilters();
  selectedTask.value = null;
}

function handleDelete(id) {
  const task = taskState.tasks.find((item) => item.id === id);

  if (!task) return;

  const confirmed = window.confirm(
    `Видалити завдання «${task.title}»?`
  );

  if (!confirmed) return;

  const deleted = deleteTask(id);

  if (!deleted) {
    feedback.value = 'Не вдалося видалити завдання.';
    return;
  }

  if (editingId.value === id) {
    cancelForm();
  }

  if (selectedTask.value?.id === id) {
    selectedTask.value = null;
  }

  feedback.value = `Завдання «${task.title}» видалено.`;
}

function handleTaskSelect(task) {
  selectedTask.value = task;
}

function clearSelectedTask() {
  selectedTask.value = null;
}

function handleStatusChange(payload) {
  setTaskStatus(payload);
}

function handlePriorityChange(payload) {
  setTaskPriority(payload);
}
</script>

<template>
  <f7-page name="tasks" class="tf3-page">
    <f7-navbar title="Мої завдання" />

    <div class="tf3-container">
      <section class="tf3-hero">
        <div class="tf3-eyebrow">TASKFLOW / TASK MANAGER</div>
        <h1>Керування завданнями</h1>
        <p>
          Створюйте, редагуйте, знаходьте, сортуйте та видаляйте завдання.
        </p>

        <button
          type="button"
          class="tf5-btn tf5-btn--primary tf5-new"
          @click="startCreate"
        >
          + Додати завдання
        </button>
      </section>

      <p v-if="feedback" class="tf4-feedback" role="status">
        {{ feedback }}
      </p>

      <section
        v-if="showForm"
        class="tf4-form-section"
      >
        <TaskForm
          :key="editingId ?? 'new'"
          :task="editingTask"
          @save="saveTask"
          @cancel="cancelForm"
        />
      </section>

      <TaskListControls
        v-model:search="searchText"
        v-model:status="selectedStatus"
        v-model:priority="selectedPriority"
        v-model:sort="sortOrder"
        v-model:only-uncompleted="onlyUncompleted"
        @clear-search="clearSearch"
        @reset="resetFilters"
      />

      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">TASK LIST</div>
            <h2>Список завдань</h2>
          </div>

          <div class="tf3-counter">
            <div>
              Показано: {{ visibleTasks.length }}
              із {{ taskState.tasks.length }}
            </div>
            <div>
              Виконано загалом: {{ completedPercent }}%
            </div>
          </div>
        </div>

        <div
          v-if="visibleTasks.length"
          class="tf3-task-grid"
        >
          <TaskCard
            v-for="task in visibleTasks"
            :key="task.id"
            :task="task"
            :editable="true"
            @status-change="handleStatusChange"
            @priority-change="handlePriorityChange"
            @edit="startEdit"
            @delete="handleDelete"
            @task-select="handleTaskSelect"
          />
        </div>

        <div
          v-else-if="taskState.tasks.length === 0"
          class="tf5-empty"
        >
          <p>Список завдань порожній. Додайте перше завдання.</p>

          <button
            type="button"
            class="tf5-btn tf5-btn--primary"
            @click="startCreate"
          >
            Створити завдання
          </button>
        </div>

        <div
          v-else
          class="tf5-empty"
        >
          <p>За поточними умовами завдань не знайдено.</p>

          <button
            type="button"
            class="tf5-btn"
            @click="resetFilters"
          >
            Показати всі завдання
          </button>
        </div>

        <div
          v-if="selectedTask"
          class="tf3-selected-task"
        >
          <div class="tf3-eyebrow">SELECTED TASK</div>
          <h3>{{ selectedTask.title }}</h3>
          <p>{{ selectedTask.description }}</p>

          <button
            type="button"
            class="tf3-action"
            @click="clearSelectedTask"
          >
            Закрити
          </button>
        </div>
      </section>
    </div>

    <AppTabbar active="tasks" />
  </f7-page>
</template>
