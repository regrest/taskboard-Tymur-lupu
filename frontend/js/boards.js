let usersMap = new Map();
let boardsList = [];
let pendingDeleteBoardId = null;
let boardModalInstance = null;
let deleteModalInstance = null;

function getOwnerName(ownerId) {
  const u = usersMap.get(Number(ownerId));
  return u ? `${u.firstName} ${u.lastName}` : `ID ${ownerId}`;
}

function renderBoards() {
  const grid = document.getElementById('boardsGrid');
  if (!boardsList.length) {
    grid.innerHTML = '<div class="col-12 text-muted">Brak tablic. Kliknij „Nowa tablica”, aby utworzyć pierwszą.</div>';
    return;
  }

  grid.innerHTML = boardsList
    .map((b) => `
      <div class="col-md-6 col-lg-4">
        <div class="board-card p-3 h-100 d-flex flex-column justify-content-between">
          <div>
            <h5 class="fw-bold mb-1">${escapeHtml(b.name)}</h5>
            <p class="text-muted small mb-3">${escapeHtml(b.description || '')}</p>
            <div class="small mb-3">
              <div>Utworzył(a): ${escapeHtml(getOwnerName(b.ownerId))}</div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <a class="btn btn-accent btn-sm" href="/board.html?id=${b.id}">Otwórz</a>
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="openEditBoard(${b.id})">Edytuj</button>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="askDeleteBoard(${b.id})">Usuń</button>
          </div>
        </div>
      </div>
    `)
    .join('');
}

async function loadBoardsPage() {
  const [users, boards] = await Promise.all([
    apiRequest('/api/users'),
    apiRequest('/api/boards')
  ]);

  usersMap = new Map((users || []).map((u) => [Number(u.id), u]));
  boardsList = boards || [];
  renderBoards();
}

function openEditBoard(id) {
  const b = boardsList.find((x) => Number(x.id) === Number(id));
  if (!b) return;
  document.getElementById('boardEditId').value = b.id;
  document.getElementById('boardModalTitle').textContent = 'Edytuj tablicę';
  document.getElementById('boardNameInput').value = b.name || '';
  document.getElementById('boardDescInput').value = b.description || '';
  boardModalInstance.show();
}

function askDeleteBoard(id) {
  const b = boardsList.find((x) => Number(x.id) === Number(id));
  if (!b) return;
  pendingDeleteBoardId = b.id;
  document.getElementById('deleteBoardNameText').textContent = b.name;
  deleteModalInstance.show();
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireSessionOrRedirect();
  if (!user) return;

  boardModalInstance = new bootstrap.Modal(document.getElementById('boardModal'));
  deleteModalInstance = new bootstrap.Modal(document.getElementById('confirmDeleteBoardModal'));

  document.getElementById('openNewBoardBtn').addEventListener('click', () => {
    document.getElementById('boardEditId').value = '';
    document.getElementById('boardModalTitle').textContent = 'Nowa tablica';
    document.getElementById('boardNameInput').value = '';
    document.getElementById('boardDescInput').value = '';
    boardModalInstance.show();
  });

  document.getElementById('boardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const editId = document.getElementById('boardEditId').value;
    const name = document.getElementById('boardNameInput').value.trim();
    const description = document.getElementById('boardDescInput').value.trim();

    try {
      if (editId) {
        await apiRequest(`/api/boards/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description })
        });
        showInfo('Zapisano zmiany w tablicy.');
      } else {
        await apiRequest('/api/boards', {
          method: 'POST',
          body: JSON.stringify({ name, description })
        });
        showInfo('Dodano tablicę.');
      }
      boardModalInstance.hide();
      await loadBoardsPage();
    } catch (err) {
      showError(err.message);
    }
  });

  document.getElementById('confirmDeleteBoardBtn').addEventListener('click', async () => {
    if (!pendingDeleteBoardId) return;
    hideError();
    try {
      await apiRequest(`/api/boards/${pendingDeleteBoardId}`, { method: 'DELETE' });
      deleteModalInstance.hide();
      pendingDeleteBoardId = null;
      showInfo('Usunięto tablicę.');
      await loadBoardsPage();
    } catch (err) {
      showError(err.message);
    }
  });

  try {
    await loadBoardsPage();
  } catch (err) {
    showError(err.message);
  }
});