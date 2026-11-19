let boardId = null;
let usersList = [];
let tasksList = [];
let pendingDeleteTaskId = null;
let taskModalInstance = null;
let deleteTaskModalInstance = null;

function getAssigneeName(assigneeId) {
  if (!assigneeId) return 'nieprzypisane';
  const u = usersList.find((x) => Number(x.id) === Number(assigneeId));
  return u ? `${u.firstName} ${u.lastName}` : `ID ${assigneeId}`;
}

function populateUsersSelects() {
  const filterSel = document.getElementById('filterAssignee');
  const taskSel = document.getElementById('taskAssigneeInput');

  filterSel.innerHTML =
    '<option value="all">Wszyscy</option><option value="unassigned">Nieprzypisane</option>' +
    usersList
      .map((u) => `<option value="${u.id}">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</option>`)
      .join('');

  taskSel.innerHTML =
    '<option value="">Nieprzypisane</option>' +
    usersList
      .map((u) => `<option value="${u.id}">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</option>`)
      .join('');
}

function getFilteredTasks() {
  const prio = document.getElementById('filterPriority').value;
  const assignee = document.getElementById('filterAssignee').value;
  const query = document.getElementById('filterSearch').value.trim().toLowerCase();

  return tasksList.filter((t) => {
    if (prio !== 'all' && t.priority !== prio) return false;
    if (assignee === 'unassigned' && t.assigneeId) return false;
    if (assignee !== 'all' && assignee !== 'unassigned' && Number(t.assigneeId) !== Number(assignee)) {
      return false;
    }
    if (query && !String(t.title || '').toLowerCase().includes(query)) return false;
    return true;
  });
}

function renderColumn(containerId, items, status) {
  const el = document.getElementById(containerId);
  if (!items.length) {
    el.innerHTML = '<div class="text-muted small">Brak zadań w tej kolumnie.</div>';
    return;
  }

  el.innerHTML = items
    .map((t) => {
      const prio = t.priority || 'medium';
      const overdue = isOverdue(t.deadline, t.status);
      const deadlineHtml = t.deadline
        ? `<span class="small ms-2 ${overdue ? 'overdue-text' : 'text-muted'}">Termin: ${formatDatePl(t.deadline)}${overdue ? ' (po terminie)' : ''}</span>`
        : '';

      let actionBtn = '';
      if (status === 'todo') {
        actionBtn = `<button type="button" class="btn btn-outline-success btn-sm" onclick="moveTask(${t.id}, 'in_progress')">Przenieś do: W trakcie</button>`;
      } else if (status === 'in_progress') {
        actionBtn = `<button type="button" class="btn btn-outline-success btn-sm" onclick="moveTask(${t.id}, 'done')">Przenieś do: Gotowe</button>`;
      } else {
        actionBtn = `<button type="button" class="btn btn-outline-success btn-sm" onclick="moveTask(${t.id}, 'todo')">Otwórz ponownie</button>`;
      }

      return `
        <div class="task-card prio-${prio}">
          <div class="fw-bold mb-2">${escapeHtml(t.title)}</div>
          <div class="mb-2">
            <span class="badge badge-prio-${prio}">Priorytet: ${PRIO_LABEL[prio] || prio}</span>
            ${deadlineHtml}
          </div>
          <div class="small text-muted mb-3">Osoba: ${escapeHtml(getAssigneeName(t.assigneeId))}</div>
          <div class="d-flex flex-wrap gap-2">
            ${actionBtn}
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="openTaskModalById(${t.id})">Szczegóły</button>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="askDeleteTask(${t.id})">Usuń</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderKanban() {
  const filtered = getFilteredTasks();
  const todo = filtered.filter((t) => t.status === 'todo');
  const inProgress = filtered.filter((t) => t.status === 'in_progress');
  const done = filtered.filter((t) => t.status === 'done');

  document.getElementById('countTodo').textContent = todo.length;
  document.getElementById('countProgress').textContent = inProgress.length;
  document.getElementById('countDone').textContent = done.length;

  renderColumn('colTodoTasks', todo, 'todo');
  renderColumn('colProgressTasks', inProgress, 'in_progress');
  renderColumn('colDoneTasks', done, 'done');
}

async function moveTask(id, nextStatus) {
  hideError();
  try {
    const task = await apiRequest(`/api/tasks/${id}`);
    await apiRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        status: nextStatus,
        priority: task.priority,
        deadline: task.deadline ? String(task.deadline).slice(0, 10) : null,
        assigneeId: task.assigneeId || null
      })
    });
    await refreshTasks();
  } catch (err) {
    showError(err.message);
  }
}

async function openTaskModalById(id) {
  hideError();
  try {
    const t = await apiRequest(`/api/tasks/${id}`);
    document.getElementById('taskEditId').value = t.id;
    document.getElementById('taskModalTitle').textContent = `Zadanie: ${t.title}`;
    document.getElementById('taskTitleInput').value = t.title || '';
    document.getElementById('taskDescInput').value = t.description || '';
    document.getElementById('taskStatusInput').value = t.status || 'todo';
    document.getElementById('taskPriorityInput').value = t.priority || 'medium';
    document.getElementById('taskDeadlineInput').value = t.deadline ? String(t.deadline).slice(0, 10) : '';
    document.getElementById('taskAssigneeInput').value = t.assigneeId || '';
    document.getElementById('taskTitleInput').classList.remove('is-invalid');

    const createdInfo = document.getElementById('taskCreatedAtInfo');
    if (t.createdAt) {
      createdInfo.textContent = `Utworzono: ${formatDatePl(t.createdAt)}`;
      createdInfo.classList.remove('d-none');
    } else {
      createdInfo.classList.add('d-none');
    }

    taskModalInstance.show();
  } catch (err) {
    showError(err.message);
  }
}

function askDeleteTask(id) {
  const t = tasksList.find((x) => Number(x.id) === Number(id));
  if (!t) return;
  pendingDeleteTaskId = t.id;
  document.getElementById('deleteTaskTitleText').textContent = t.title;
  deleteTaskModalInstance.show();
}

async function refreshTasks() {
  tasksList = await apiRequest(`/api/boards/${boardId}/tasks`);
  renderKanban();
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireSessionOrRedirect();
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  boardId = params.get('id');
  if (!boardId) {
    window.location.href = '/boards.html';
    return;
  }

  taskModalInstance = new bootstrap.Modal(document.getElementById('taskModal'));
  deleteTaskModalInstance = new bootstrap.Modal(document.getElementById('confirmDeleteTaskModal'));

  try {
    const [users, boards] = await Promise.all([
      apiRequest('/api/users'),
      apiRequest('/api/boards')
    ]);
    usersList = users || [];
    populateUsersSelects();

    const board = (boards || []).find((b) => String(b.id) === String(boardId));
    if (!board) {
      window.location.href = '/boards.html';
      return;
    }

    document.title = `${board.name} — TaskBoard`;
    document.getElementById('breadcrumbBoardName').textContent = board.name;
    document.getElementById('boardTitleHeading').textContent = board.name;
    document.getElementById('boardDescHeading').textContent = board.description || '';

    await refreshTasks();
  } catch (err) {
    showError(err.message);
  }

  document.getElementById('openNewTaskBtn').addEventListener('click', () => {
    document.getElementById('taskEditId').value = '';
    document.getElementById('taskModalTitle').textContent = 'Nowe zadanie';
    document.getElementById('taskTitleInput').value = '';
    document.getElementById('taskDescInput').value = '';
    document.getElementById('taskStatusInput').value = 'todo';
    document.getElementById('taskPriorityInput').value = 'medium';
    document.getElementById('taskDeadlineInput').value = '';
    document.getElementById('taskAssigneeInput').value = '';
    document.getElementById('taskCreatedAtInfo').classList.add('d-none');
    document.getElementById('taskTitleInput').classList.remove('is-invalid');
    taskModalInstance.show();
  });

  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const titleInput = document.getElementById('taskTitleInput');
    const title = titleInput.value.trim();
    if (title.length < 3 || title.length > 100) {
      titleInput.classList.add('is-invalid');
      return;
    }
    titleInput.classList.remove('is-invalid');

    const editId = document.getElementById('taskEditId').value;
    const deadlineVal = document.getElementById('taskDeadlineInput').value;
    const assigneeVal = document.getElementById('taskAssigneeInput').value;

    const payload = {
      title,
      description: document.getElementById('taskDescInput').value.trim(),
      status: document.getElementById('taskStatusInput').value,
      priority: document.getElementById('taskPriorityInput').value,
      deadline: deadlineVal || null,
      assigneeId: assigneeVal ? Number(assigneeVal) : null
    };

    try {
      if (editId) {
        await apiRequest(`/api/tasks/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showInfo('Zapisano zadanie.');
      } else {
        await apiRequest('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ ...payload, boardId: Number(boardId) })
        });
        showInfo('Dodano zadanie.');
      }
      taskModalInstance.hide();
      await refreshTasks();
    } catch (err) {
      showError(err.message);
    }
  });

  document.getElementById('confirmDeleteTaskBtn').addEventListener('click', async () => {
    if (!pendingDeleteTaskId) return;
    hideError();
    try {
      await apiRequest(`/api/tasks/${pendingDeleteTaskId}`, { method: 'DELETE' });
      deleteTaskModalInstance.hide();
      pendingDeleteTaskId = null;
      showInfo('Usunięto zadanie.');
      await refreshTasks();
    } catch (err) {
      showError(err.message);
    }
  });

  ['filterPriority', 'filterAssignee', 'filterSearch'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderKanban);
    document.getElementById(id).addEventListener('change', renderKanban);
  });

  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.getElementById('filterPriority').value = 'all';
    document.getElementById('filterAssignee').value = 'all';
    document.getElementById('filterSearch').value = '';
    renderKanban();
  });
});