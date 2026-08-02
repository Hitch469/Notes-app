const STORAGE_KEY = 'soft-notes-app-data';
let notes = [];
let editingId = null;
let selectedColor = 'pink';

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    notes = raw ? JSON.parse(raw) : seedNotes();
  } catch (e) {
    notes = seedNotes();
  }
}

function seedNotes() {
  return [
    { id: cryptoId(), title: 'welcome 💌', body: "This is your notes app! Tap '+ new note' to add your first one.", color: 'pink', rotation: -2 },
    { id: cryptoId(), title: 'to-do today', body: '- finish homework\n- text bestie back\n- watch that show', color: 'mint', rotation: 1.5 },
    { id: cryptoId(), title: 'random thought', body: 'iced coffee > hot coffee, no debate.', color: 'lavender', rotation: -1 }
  ];
}

function cryptoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function saveNotes() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }
  catch (e) { /* storage unavailable, notes stay in memory for this session */ }
}

function render() {
  const grid = document.getElementById('notesGrid');
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="icon">${query ? '🔎' : '📝'}</div>
        <p>${query ? 'no notes match your search' : 'no notes yet — make your first one!'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(n => `
    <div class="note-card color-${n.color}" style="transform: rotate(${n.rotation}deg);" data-id="${n.id}">
      <div class="note-actions">
        <button class="edit-btn" data-id="${n.id}" title="edit">✏️</button>
        <button class="delete-btn" data-id="${n.id}" title="delete">🗑️</button>
      </div>
      <p class="note-title">${escapeHtml(n.title) || 'untitled'}</p>
      <p class="note-body">${escapeHtml(n.body)}</p>
    </div>
  `).join('');

  grid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openModal(btn.dataset.id); });
  });
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); deleteNote(btn.dataset.id); });
  });
  grid.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openModal(id) {
  editingId = id || null;
  const overlay = document.getElementById('overlay');
  const titleInput = document.getElementById('titleInput');
  const bodyInput = document.getElementById('bodyInput');
  const modalTitle = document.getElementById('modalTitle');

  if (id) {
    const note = notes.find(n => n.id === id);
    modalTitle.textContent = 'edit note';
    titleInput.value = note.title;
    bodyInput.value = note.body;
    selectedColor = note.color;
  } else {
    modalTitle.textContent = 'new note';
    titleInput.value = '';
    bodyInput.value = '';
    selectedColor = 'pink';
  }

  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color === selectedColor);
  });

  overlay.classList.add('open');
  titleInput.focus();
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
}

function saveNote() {
  const title = document.getElementById('titleInput').value.trim();
  const body = document.getElementById('bodyInput').value.trim();
  if (!title && !body) { closeModal(); return; }

  if (editingId) {
    const note = notes.find(n => n.id === editingId);
    note.title = title;
    note.body = body;
    note.color = selectedColor;
  } else {
    notes.unshift({
      id: cryptoId(),
      title,
      body,
      color: selectedColor,
      rotation: (Math.random() * 4 - 2).toFixed(1)
    });
  }
  saveNotes();
  render();
  closeModal();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  render();
}

document.getElementById('addBtn').addEventListener('click', () => openModal(null));
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveNote);
document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target.id === 'overlay') closeModal();
});
document.getElementById('searchInput').addEventListener('input', render);
document.querySelectorAll('.color-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    selectedColor = sw.dataset.color;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
  });
});

loadNotes();
render();
