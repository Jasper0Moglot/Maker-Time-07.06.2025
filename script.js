// ===== Перемикач теми =====
const themeSelect = document.getElementById('themeSelect');
themeSelect.onchange = () => {
  if (themeSelect.value === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }
};

// ===== Змінні =====
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const closeModal = document.getElementById('closeModal');
const saveNote = document.getElementById('saveNote');
const notesContainer = document.querySelector('.notes-container');
const templateNote = document.querySelector('.template-note');
const noteTitleInput = document.getElementById('noteTitle');
const noteDescriptionInput = document.getElementById('noteDescription');

let isEditing = false;
let currentNoteElement = null;
let currentNoteId = null;

// ===== Завантаження нотаток при запуску =====
let notes = JSON.parse(localStorage.getItem('notes')) || [];
renderAllNotes();

// ===== Відкрити модальне вікно =====
addNoteBtn.onclick = () => {
  isEditing = false;
  currentNoteId = null;
  noteTitleInput.value = '';
  noteDescriptionInput.value = '';
  saveNote.textContent = 'Додати нотатку';
  noteModal.style.display = 'block';
};

// ===== Закрити модальне вікно =====
closeModal.onclick = () => {
  noteModal.style.display = 'none';
};

// ===== Зберегти нотатку =====
saveNote.onclick = () => {
  const title = noteTitleInput.value.trim();
  const description = noteDescriptionInput.value.trim();

  if (title === '' || description === '') {
    alert('Будь ласка, заповніть всі поля!');
    return;
  }

  if (isEditing && currentNoteId !== null) {
    const note = notes.find(n => n.id === currentNoteId);
    note.title = title;
    note.description = description;
    saveNotesToStorage();
    renderAllNotes();
  } else {
    const newNote = {
      id: Date.now(),
      title,
      description,
      date: new Date().toLocaleString()
    };
    notes.push(newNote);
    saveNotesToStorage();
    renderNote(newNote);
  }

  noteModal.style.display = 'none';
};

// ===== Збереження в localStorage =====
function saveNotesToStorage() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// ===== Рендер всіх нотаток =====
function renderAllNotes() {
  document.querySelectorAll('.note:not(.template-note)').forEach(n => n.remove());
  notes.forEach(renderNote);
}

// ===== Рендер однієї нотатки =====
function renderNote(note) {
  const noteDiv = templateNote.cloneNode(true);
  noteDiv.classList.remove('template-note');
  noteDiv.style.display = 'block';

  noteDiv.querySelector('.note-title').textContent = note.title;
  noteDiv.querySelector('.note-description').textContent = note.description;

  // Додати дату
  const dateEl = document.createElement('div');
  dateEl.className = 'note-date';
  dateEl.textContent = note.date;
  noteDiv.appendChild(dateEl);

  const menuBtn = noteDiv.querySelector('.note-menu');
  const optionsMenu = noteDiv.querySelector('.note-options');

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll('.note-options').forEach(menu => {
      if (menu !== optionsMenu) menu.style.display = 'none';
    });
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
  };

  document.addEventListener('click', () => {
    optionsMenu.style.display = 'none';
  });

  // Видалення
  noteDiv.querySelector('.delete-note').onclick = () => {
    if (confirm('Видалити нотатку?')) {
      notes = notes.filter(n => n.id !== note.id);
      saveNotesToStorage();
      renderAllNotes();
    }
  };

  // Редагування
  noteDiv.querySelector('.edit-note').onclick = () => {
    isEditing = true;
    currentNoteId = note.id;
    noteTitleInput.value = note.title;
    noteDescriptionInput.value = note.description;
    saveNote.textContent = 'Зберегти зміни';
    noteModal.style.display = 'block';
  };

  notesContainer.appendChild(noteDiv);
}
