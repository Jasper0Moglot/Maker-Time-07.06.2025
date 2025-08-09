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

const noteColorInput = document.getElementById('noteColor');
const noteColorHexInput = document.getElementById('noteColorHex');

let isEditing = false;
let currentNoteId = null;

// ===== Завантаження нотаток при запуску =====
let notes = JSON.parse(localStorage.getItem('notes')) || [];
renderAllNotes();

// Закриття всіх меню опцій кліком поза ними (єдиний глобальний обробник)
document.addEventListener('click', (e) => {
  if (!(e.target.closest('.note-options') || e.target.closest('.note-menu'))) {
    document.querySelectorAll('.note-options').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

// ===== Відкрити модальне вікно =====
addNoteBtn.onclick = () => {
  isEditing = false;
  currentNoteId = null;
  noteTitleInput.value = '';
  noteDescriptionInput.value = '';
  noteColorInput.value = '#ffffff';
  noteColorHexInput.value = '#ffffff';
  saveNote.textContent = 'Додати нотатку';
  noteModal.style.display = 'block';
};

// ===== Закрити модальне вікно =====
closeModal.onclick = () => {
  noteModal.style.display = 'none';
};

// ===== Синхронізація input color та текстового поля =====
noteColorInput.oninput = () => {
  noteColorHexInput.value = noteColorInput.value;
};

noteColorHexInput.oninput = () => {
  const val = noteColorHexInput.value.trim();
  if (isValidHex(val)) {
    noteColorInput.value = val;
  }
};

// Перевірка валідності HEX коду (#123abc або #fff)
function isValidHex(color) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color);
}

// Санітизація кольору: дозволяємо лише HEX або безпечні градієнти
function sanitizeColor(input) {
  const value = String(input).trim();
  if (isValidHex(value)) return value;
  if (isGradient(value)) return value;
  return null;
}

// ===== Зберегти нотатку =====
saveNote.onclick = () => {
  const title = noteTitleInput.value.trim();
  const description = noteDescriptionInput.value.trim();
  const colorValue = noteColorHexInput.value.trim();

  if (title === '' || description === '') {
    alert('Будь ласка, заповніть всі поля!');
    return;
  }
  if (colorValue === '') {
    alert('Будь ласка, оберіть колір нотатки!');
    return;
  }

  const sanitizedColor = sanitizeColor(colorValue);
  if (!sanitizedColor) {
    alert('Некоректний колір. Використовуйте HEX або CSS градієнт (linear-gradient або radial-gradient).');
    return;
  }

  if (isEditing && currentNoteId !== null) {
    const note = notes.find(n => n.id === currentNoteId);
    note.title = title;
    note.description = description;
    note.color = sanitizedColor;
    saveNotesToStorage();
    renderAllNotes();
  } else {
    const newNote = {
      id: Date.now(),
      title,
      description,
      color: sanitizedColor,
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
  noteDiv.style.display = 'flex';

  noteDiv.querySelector('.note-title').textContent = note.title;
  noteDiv.querySelector('.note-description').textContent = note.description;

  // Додати/оновити дату у вже існуючому елементі .note-date
  const dateEl = noteDiv.querySelector('.note-date');
  if (dateEl) {
    dateEl.textContent = note.date;
  }

  // Застосувати колір фону
  noteDiv.style.background = note.color;

  // Визначити контрастний колір тексту
  let textColor;
  if (!isGradient(note.color)) {
    textColor = getContrastYIQ(note.color);
    noteDiv.style.color = textColor;
  } else {
    textColor = document.body.classList.contains('dark-theme') ? '#eee' : '#222';
    noteDiv.style.color = textColor;
  }

  // Встановити цей самий колір для дати
  if (dateEl) {
    dateEl.style.color = textColor;
  }

  const menuBtn = noteDiv.querySelector('.note-menu');
  const optionsMenu = noteDiv.querySelector('.note-options');

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll('.note-options').forEach(menu => {
      if (menu !== optionsMenu) menu.style.display = 'none';
    });
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
  };

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

    if (isValidHex(note.color)) {
      noteColorInput.value = note.color;
      noteColorHexInput.value = note.color;
    } else {
      noteColorHexInput.value = note.color;
      noteColorInput.value = '#ffffff';
    }

    saveNote.textContent = 'Зберегти зміни';
    noteModal.style.display = 'block';
  };

  notesContainer.appendChild(noteDiv);
}

// Перевірка, чи рядок - градієнт
function isGradient(str) {
  const s = String(str).trim();
  // Дозволяємо тільки linear-gradient(...) або radial-gradient(...), без url() та крапки з комою
  return /^(linear-gradient|radial-gradient)\((?!.*url\()[^;]*\)$/i.test(s);
}

// Функція для вибору контрастного кольору тексту
function getContrastYIQ(hexcolor) {
  if (!isValidHex(hexcolor)) return '#000';
  let r, g, b;
  if (hexcolor.length === 4) {
    r = parseInt(hexcolor[1] + hexcolor[1], 16);
    g = parseInt(hexcolor[2] + hexcolor[2], 16);
    b = parseInt(hexcolor[3] + hexcolor[3], 16);
  } else {
    r = parseInt(hexcolor.substr(1, 2), 16);
    g = parseInt(hexcolor.substr(3, 2), 16);
    b = parseInt(hexcolor.substr(5, 2), 16);
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 128) ? '#000' : '#fff';
}
