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
  // Якщо введений валідний HEX колір, оновлюємо color picker
  if (isValidHex(val)) {
    noteColorInput.value = val;
  }
};

// Перевірка валідності HEX коду (#123abc або #fff)
function isValidHex(color) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color);
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

  if (isEditing && currentNoteId !== null) {
    const note = notes.find(n => n.id === currentNoteId);
    note.title = title;
    note.description = description;
    note.color = colorValue;
    saveNotesToStorage();
    renderAllNotes();
  } else {
    const newNote = {
      id: Date.now(),
      title,
      description,
      color: colorValue,
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
  noteDiv.style.display = 'flex'; // flex, щоб зберегти flex-direction

  noteDiv.querySelector('.note-title').textContent = note.title;
  noteDiv.querySelector('.note-description').textContent = note.description;

  // Додати дату
  const dateEl = document.createElement('div');
  dateEl.className = 'note-date';
  dateEl.textContent = note.date;
  noteDiv.appendChild(dateEl);

  // Застосувати колір (фон)
  // Якщо це градієнт — ставимо в background, якщо HEX — теж
  noteDiv.style.background = note.color;
  
  // Визначити контрастний колір тексту (для кращої видимості)
  if (!isGradient(note.color)) {
    const textColor = getContrastYIQ(note.color);
    noteDiv.style.color = textColor;
  } else {
    // Для градієнту залишаємо колір за замовчуванням (білий для теми, чорний для світлої)
    if (document.body.classList.contains('dark-theme')) {
      noteDiv.style.color = '#eee';
    } else {
      noteDiv.style.color = '#222';
    }
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

    // Встановити колір у інпут
    if (isValidHex(note.color)) {
      noteColorInput.value = note.color;
      noteColorHexInput.value = note.color;
    } else {
      // Градієнт чи інше
      noteColorHexInput.value = note.color;
      // Поставимо колір за замовчуванням (білий), щоб не було помилки в color picker
      noteColorInput.value = '#ffffff';
    }

    saveNote.textContent = 'Зберегти зміни';
    noteModal.style.display = 'block';
  };

  notesContainer.appendChild(noteDiv);
}

// Перевірка, чи рядок - градієнт (починається з "linear-gradient" або "radial-gradient")
function isGradient(str) {
  return /^linear-gradient|^radial-gradient/.test(str);
}

// Функція для вибору контрастного кольору тексту (чорний чи білий) для читабельності на фоні
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
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return (yiq >= 128) ? '#000' : '#fff';
}
