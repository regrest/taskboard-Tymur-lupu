let allUsers = [];
let allBoards = [];
let currentBoard = null;
let currentTasks = [];
let boardModalInstance = null;
let taskModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await apiFetch('/api/auth/me');
    document.getElementById('navUserName').textContent = `${user.firstName} ${user.lastName}`;
  } catch {
    window.location.href = 'index.html';
    return;
  }

  boardModalInstance = new bootstrap.Modal(document.getElementById('boardModal'));
  taskModalInstance = new bootstrap.Modal(document.getElementById('taskModal'));

  bindEvents();
  await loadUsers();
  await openBoardsView();
});

async function loadUsers() {
  try {
    allUsers = await apiFetch('/api/users');
    const filterSelect = document.getElementById('filterAssignee');
    const taskSelect = document.getElementById('taskAssigneeInput');

    filterSelect.innerHTML = '<option value="">Wszyscy</option><option value="unassigned">Nieprzypisane</option>';
    taskSelect.innerHTML = '<option value="">Nieprzypisane</option>';

    allUsers.forEach((u) => {
      const fullName = `${u.firstName} ${u.lastName}`;
      filterSelect.insertAdjacentHTML('beforeend', `<option value="${u.id}">${escapeHtml(fullName)}</option>`);
      taskSelect.insertAdjacentHTML('beforeend', `<option value="${u.id}">${escapeHtml(fullName)}</option>`);
    });
  } catch (e) {
    console.error(e);
  }
}

async function openBoardsView() {
  currentBoard = null;
  document.title = 'TaskBoard – Tablice';
  document.getElementById('boardDetailView').classList.add('d-none');
  document.getElementById('boardsView').classList.remove('d-none');
  await loadBoards();
}

async function loadBoards() {
  try {
    allBoards = await apiFetch('/api/boards');
    renderBoards();
  } catch (err) {
    if (err.status === 401) window.location.href = 'index.html';
    else showAlert('globalAlert', 'globalAlertText', err.message, 'danger');
  }
}

function renderBoards() {
  const grid = document.getElementById('boardsGrid');
  if (!allBoards.length) {
    grid.innerHTML = '<div class="col-12 text-muted">Brak tablic. Kliknij „Nowa tablica”, aby dodać pierwszą.</div>';
    return;
  }

  grid.innerHTML = allBoards.map((b) => {
    const ownerObj = allUsers.find((u) => Number(u.id) === Number(b.ownerId ?? b.userId ?? b.createdBy));
    const author = b.ownerName || (b.firstName ? `${b.firstName} ${b.lastName}` : (ownerObj ? `${ownerObj.firstName} ${ownerObj.lastName}` : 'Użytkownik'));
    const activeCount = b.activeTasksCount ?? b.tasksCount ?? 0;

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card board-card shadow-sm h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold mb-1">${escapeHtml(b.name)}</h5>
            <p class="text-muted small mb-3">${escapeHtml(b.description || '')}</p>
            <div class="small text-muted mb-3 mt-auto">
              <div>Utworzył(a): ${escapeHtml(author)}</div>
              <div>Aktywne zadania: ${activeCount}</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-teal btn-sm" onclick="openBoard(${b.id})">Otwórz</button>
              <button class="btn btn-outline-secondary btn-sm" onclick="openEditBoardModal(${b.id})">Edytuj</button>
              <button class="btn btn-outline-danger btn-sm" onclick="deleteBoard(${b.id})">Usuń</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function openBoard(boardId) {
  const board = allBoards.find((b) => b.id === boardId);
  if (!board) return;
  currentBoard = board;

  document.title = `TaskBoard – ${board.name}`;
  document.getElementById('boardsView').classList.add('d-none');
  document.getElementById('boardDetailView').classList.remove('d-none');
  document.getElementById('boardAlert').classList.add('d-none');
  document.getElementById('breadcrumbBoardTitle').textContent = board.name;
  document.getElementById('boardTitleHeader').textContent = board.name;
  document.getElementById('boardDescHeader').textContent = board.description || '';

  resetFiltersUI();
  await loadTasks();
}

function resetFiltersUI() {
  document.getElementById('filterPriority').value = '';
  document.getElementById('filterAssignee').value = '';
  document.getElementById('filterSearch').value = '';
  document.getElementById('clearSearchBtn').classList.add('d-none');
}

async function loadTasks() {
  if (!currentBoard) return;
  try {
    const params = new URLSearchParams({ boardId: currentBoard.id });
    const prio = document.getElementById('filterPriority').value;
    const assignee = document.getElementById('filterAssignee').value;
    const search = document.getElementById('filterSearch').value.trim();

    if (prio) params.append('priority', prio);
    if (assignee && assignee !== 'unassigned') params.append('assigneeId', assignee);
    if (search) params.append('search', search);

    let tasks = await apiFetch(`/api/tasks?${params.toString()}`);

    tasks = tasks.filter((t) => {
      if (t.boardId && Number(t.boardId) !== Number(currentBoard.id)) return false;
      if (prio && t.priority !== prio) return false;
      if (assignee === 'unassigned' && t.assigneeId) return false;
      if (assignee && assignee !== 'unassigned' && Number(t.assigneeId) !== Number(assignee)) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    currentTasks = tasks;
    renderKanban();
  } catch (err) {
    if (err.status === 401) window.location.href = 'index.html';
    else showAlert('boardAlert', 'boardAlertText', err.message, 'danger');
  }
}

function renderKanban() {
  const todo = currentTasks.filter((t) => t.status === 'do_zrobienia');
  const inProgress = currentTasks.filter((t) => t.status === 'w_trakcie');
  const done = currentTasks.filter((t) => t.status === 'gotowe');

  document.getElementById('countTodo').textContent = todo.length;
  document.getElementById('countInProgress').textContent = inProgress.length;
  document.getElementById('countDone').textContent = done.length;

  renderColumn('colTodoList', todo);
  renderColumn('colInProgressList', inProgress);
  renderColumn('colDoneList', done);
}

function renderColumn(containerId, tasks) {
  const el = document.getElementById(containerId);
  if (!tasks.length) {
    el.innerHTML = '<div class="text-muted small">Brak zadań w tej kolumnie.</div>';
    return;
  }

  el.innerHTML = tasks.map((t) => {
    const prioLabel = { wysoki: 'Wysoki', sredni: 'Średni', niski: 'Niski' }[t.priority] || t.priority;
    const assigneeObj = allUsers.find((u) => Number(u.id) === Number(t.assigneeId));
    const assigneeName = t.assigneeName || (assigneeObj ? `${assigneeObj.firstName} ${assigneeObj.lastName}` : 'nieprzypisane');

    let dueHtml = '';
    if (t.dueDate) {
      const dateStr = formatDatePL(t.dueDate);
      const dueDateOnly = new Date(t.dueDate);
      const todayOnly = new Date(new Date().toDateString());
      const isOverdue = t.status !== 'gotowe' && dueDateOnly < todayOnly;

      dueHtml = isOverdue
        ? `<span class="text-danger fw-semibold ms-2">Termin: ${dateStr} (po terminie)</span>`
        : `<span class="text-muted ms-2">Termin: ${dateStr}</span>`;
    }

    let moveBtn = '';
    if (t.status === 'do_zrobienia') {
      moveBtn = `<button class="btn btn-outline-secondary btn-sm" onclick="changeTaskStatus(${t.id}, 'w_trakcie')">Przenieś do: W trakcie</button>`;
    } else if (t.status === 'w_trakcie') {
      moveBtn = `<button class="btn btn-outline-secondary btn-sm" onclick="changeTaskStatus(${t.id}, 'gotowe')">Przenieś do: Gotowe</button>`;
    } else {
      moveBtn = `<button class="btn btn-outline-secondary btn-sm" onclick="changeTaskStatus(${t.id}, 'do_zrobienia')">Otwórz ponownie</button>`;
    }

    return `
      <div class="task-card status-${t.status}">
        <div class="fw-bold mb-2">${escapeHtml(t.title)}</div>
        <div class="small mb-1">
          <span class="badge-prio badge-prio-${t.priority}">Priorytet: ${prioLabel}</span>
          ${dueHtml}
        </div>
        <div class="small text-muted mb-3">Osoba: ${escapeHtml(assigneeName)}</div>
        <div class="d-flex flex-wrap gap-2">
          ${moveBtn}
          <button class="btn btn-outline-secondary btn-sm" onclick="openEditTaskModal(${t.id})">Szczegóły</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteTask(${t.id})">Usuń</button>
        </div>
      </div>
    `;
  }).join('');
}

async function changeTaskStatus(taskId, newStatus) {
  const task = currentTasks.find((t) => t.id === taskId);
  if (!task) return;
  try {
    await apiFetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({
        boardId: currentBoard.id,
        title: task.title,
        description: task.description || '',
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : null,
        assigneeId: task.assigneeId || null
      })
    });
    await loadTasks();
  } catch (err) {
    showAlert('boardAlert', 'boardAlertText', err.message, 'danger');
  }
}

async function deleteTask(taskId) {
  if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;
  try {
    await apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    showAlert('boardAlert', 'boardAlertText', 'Usunięto zadanie.', 'success');
    await loadTasks();
  } catch (err) {
    showAlert('boardAlert', 'boardAlertText', err.message, 'danger');
  }
}

function openEditTaskModal(taskId) {
  const task = currentTasks.find((t) => t.id === taskId);
  if (!task) return;

  document.getElementById('taskTitleInput').classList.remove('is-invalid');
  document.getElementById('taskModalTitle').textContent = `Zadanie: ${task.title}`;
  document.getElementById('taskEditId').value = task.id;
    document.getElementById('taskTitleInput').value = task.title;
  document.getElementById('taskDescInput').value = task.description || '';
  document.getElementById('taskStatusInput').value = task.status;
  document.getElementById('taskPriorityInput').value = task.priority;
  document.getElementById('taskDueDateInput').value = task.dueDate ? String(task.dueDate).slice(0, 10) : '';
  document.getElementById('taskAssigneeInput').value = task.assigneeId || '';

  const infoEl = document.getElementById('taskCreatedAtInfo');
  if (task.createdAt) {
    infoEl.textContent = `Utworzono: ${formatDatePL(task.createdAt)}`;
    infoEl.classList.remove('d-none');
  } else {
    infoEl.classList.add('d-none');
  }

  taskModalInstance.show();
}

function openEditBoardModal(boardId) {
  const board = allBoards.find((b) => b.id === boardId);
  if (!board) return;
  document.getElementById('boardNameInput').classList.remove('is-invalid');
  document.getElementById('boardModalTitle').textContent = 'Edytuj tablicę';
  document.getElementById('boardEditId').value = board.id;
  document.getElementById('boardNameInput').value = board.name;
  document.getElementById('boardDescInput').value = board.description || '';
  boardModalInstance.show();
}

async function deleteBoard(boardId) {
  if (!confirm('Czy na pewno chcesz usunąć tę tablicę?')) return;
  try {
    await apiFetch(`/api/boards/${boardId}`, { method: 'DELETE' });
    showAlert('globalAlert', 'globalAlertText', 'Usunięto tablicę.', 'success');
    await loadBoards();
  } catch (err) {
    showAlert('globalAlert', 'globalAlertText', err.message, 'danger');
  }
}

function bindEvents() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = 'index.html';
  });

  document.getElementById('navBrandLink').addEventListener('click', (e) => {
    e.preventDefault();
    openBoardsView();
  });
  document.getElementById('backToBoardsLink').addEventListener('click', (e) => {
    e.preventDefault();
    openBoardsView();
  });

  document.getElementById('openNewBoardModalBtn').addEventListener('click', () => {
    document.getElementById('boardNameInput').classList.remove('is-invalid');
    document.getElementById('boardModalTitle').textContent = 'Nowa tablica';
    document.getElementById('boardEditId').value = '';
    document.getElementById('boardNameInput').value = '';
    document.getElementById('boardDescInput').value = '';
    boardModalInstance.show();
  });

  document.getElementById('boardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('boardNameInput');
    const name = nameEl.value.trim();
    if (name.length < 3 || name.length > 100) {
      nameEl.classList.add('is-invalid');
      return;
    }
    nameEl.classList.remove('is-invalid');

    const editId = document.getElementById('boardEditId').value;
    const description = document.getElementById('boardDescInput').value.trim();

    try {
      if (editId) {
        await apiFetch(`/api/boards/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description })
        });
        showAlert('globalAlert', 'globalAlertText', 'Zapisano zmiany w tablicy.', 'success');
      } else {
        await apiFetch('/api/boards', {
          method: 'POST',
          body: JSON.stringify({ name, description })
        });
        showAlert('globalAlert', 'globalAlertText', 'Utworzono tablicę.', 'success');
      }
      boardModalInstance.hide();
      await loadBoards();
    } catch (err) {
      showAlert('globalAlert', 'globalAlertText', err.message, 'danger');
    }
  });

  document.getElementById('openNewTaskModalBtn').addEventListener('click', () => {
    document.getElementById('taskTitleInput').classList.remove('is-invalid');
    document.getElementById('taskModalTitle').textContent = 'Nowe zadanie';
    document.getElementById('taskEditId').value = '';
    document.getElementById('taskTitleInput').value = '';
    document.getElementById('taskDescInput').value = '';
    document.getElementById('taskStatusInput').value = 'do_zrobienia';
    document.getElementById('taskPriorityInput').value = 'sredni';
    document.getElementById('taskDueDateInput').value = '';
    document.getElementById('taskAssigneeInput').value = '';
    document.getElementById('taskCreatedAtInfo').classList.add('d-none');
    taskModalInstance.show();
  });

  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleEl = document.getElementById('taskTitleInput');
    const title = titleEl.value.trim();
    if (title.length < 3 || title.length > 100) {
      titleEl.classList.add('is-invalid');
      return;
    }
    titleEl.classList.remove('is-invalid');

    const editId = document.getElementById('taskEditId').value;
    const assigneeVal = document.getElementById('taskAssigneeInput').value;
    const payload = {
      boardId: currentBoard.id,
      title,
      description: document.getElementById('taskDescInput').value.trim(),
      status: document.getElementById('taskStatusInput').value,
      priority: document.getElementById('taskPriorityInput').value,
      dueDate: document.getElementById('taskDueDateInput').value || null,
      assigneeId: assigneeVal ? Number(assigneeVal) : null
    };

    try {
      if (editId) {
        await apiFetch(`/api/tasks/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showAlert('boardAlert', 'boardAlertText', 'Zapisano zmiany w zadaniu.', 'success');
      } else {
        await apiFetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showAlert('boardAlert', 'boardAlertText', 'Dodano zadanie.', 'success');
      }
      taskModalInstance.hide();
      await loadTasks();
    } catch (err) {
      showAlert('boardAlert', 'boardAlertText', err.message, 'danger');
    }
  });

  document.getElementById('filterPriority').addEventListener('change', loadTasks);
  document.getElementById('filterAssignee').addEventListener('change', loadTasks);
  document.getElementById('filterSearch').addEventListener('input', (e) => {
    document.getElementById('clearSearchBtn').classList.toggle('d-none', !e.target.value);
    loadTasks();
  });
  document.getElementById('clearSearchBtn').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    document.getElementById('clearSearchBtn').classList.add('d-none');
    loadTasks();
  });
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    resetFiltersUI();
    loadTasks();
  });

  document.getElementById('closeGlobalAlert').addEventListener('click', () => document.getElementById('globalAlert').classList.add('d-none'));
  document.getElementById('closeBoardAlert').addEventListener('click', () => document.getElementById('boardAlert').classList.add('d-none'));
}

