
<script setup>
import { computed, ref } from 'vue';
import TaskCounter from '../components/TaskCounter.vue';
import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import {
  taskState,
  setTaskStatus,
  setTaskPriority,
} from '../store/tasks';

import '../css/task-components.css';

const totalTasks = computed(() => taskState.tasks.length);

const completedTasks = computed(() =>
  taskState.tasks.filter((task) => task.status === 'done').length
);

const completionPercent = computed(() =>
  totalTasks.value
    ? Math.round((completedTasks.value / totalTasks.value) * 100)
    : 0
);

const progressTasks = computed(() =>
  taskState.tasks.filter((task) => task.status === 'progress').length
);

const plannedTasks = computed(() =>
  taskState.tasks.filter((task) => task.status === 'todo').length
);

const activeTasks = computed(() => {
  const order = { high: 0, medium: 1, low: 2 };

  return taskState.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 3);
});

const selectedTask = ref(null);

const statusLabels = {
  todo: 'Заплановано',
  progress: 'У роботі',
  done: 'Виконано',
};

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

function handleStatusChange(payload) {
  setTaskStatus(payload);
}

function handlePriorityChange(payload) {
  setTaskPriority(payload);
}

function handleTaskSelect(task) {
  selectedTask.value = task;
}

function clearSelectedTask() {
  selectedTask.value = null;
}
</script>

<template>
  <f7-page name="home" class="tf3-page">
    <f7-navbar title="TaskFlow">
      <f7-nav-right>
        <f7-link href="/about/">Про застосунок</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <div class="tf3-container">
      <section class="tf3-hero">
        <div class="tf3-eyebrow">TASKFLOW / DASHBOARD</div>
        <h1>Панель керування</h1>
        <p>Контролюйте виконання завдань та їхні пріоритети.</p>
      </section>

      <section class="tf3-stat-grid">
        <div class="tf3-stat">
          <span class="tf3-stat-label">Усього завдань</span>
          <TaskCounter :count="totalTasks" />
        </div>

        <div class="tf3-stat">
          <span class="tf3-stat-label">У роботі</span>
          <strong>{{ progressTasks }}</strong>
        </div>

        <div class="tf3-stat">
          <span class="tf3-stat-label">Виконано</span>
          <strong>{{ completedTasks }}</strong>
        </div>

        <div class="tf3-stat">
          <span class="tf3-stat-label">Заплановано</span>
          <strong>{{ plannedTasks }}</strong>
        </div>
      </section>

      <section class="tf3-progress-card">
        <div class="tf3-progress-heading">
          <h2>Прогрес виконання</h2>
          <strong>{{ completionPercent }}%</strong>
        </div>

        <div
          class="tf3-progress-track"
          role="progressbar"
          aria-label="Відсоток виконаних завдань"
          :aria-valuenow="completionPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="tf3-progress-fill"
            :style="{ width: completionPercent + '%' }"
          ></div>
        </div>

        <p class="tf3-progress-caption">
          Виконано {{ completedTasks }} із {{ totalTasks }} завдань
        </p>
      </section>

      <section class="tf3-section">
        <div class="tf3-section-heading">
          <div>
            <div class="tf3-eyebrow">PRIORITY TASKS</div>
            <h2>Актуальні завдання</h2>
          </div>

          <f7-button href="/tasks/" outline small>
            Переглянути всі
          </f7-button>
        </div>

        <div v-if="activeTasks.length" class="tf3-task-grid">
          <TaskCard
            v-for="task in activeTasks"
            :key="task.id"
            :task="task"
            @status-change="handleStatusChange"
            @priority-change="handlePriorityChange"
            @task-select="handleTaskSelect"
          />
        </div>

        <div v-else class="tf3-empty">
          Наразі всі завдання виконані.
        </div>

        <div v-if="selectedTask" class="tf3-selected-task">
          <div class="tf3-eyebrow">SELECTED TASK</div>

          <h3>{{ selectedTask.title }}</h3>

          <p>{{ selectedTask.description }}</p>

          <p>
            Статус: {{ statusLabels[selectedTask.status] || selectedTask.status }}
          </p>

          <p>
            Пріоритет:
            {{ priorityLabels[selectedTask.priority] || selectedTask.priority }}
          </p>

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

    <AppTabbar active="home" />
  </f7-page>
</template>
