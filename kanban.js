// HTML5 Drag & Drop API 기반 칸반 보드 로직
let dragCard = null;

function updateCounts() {
  ['todo', 'inprogress', 'review', 'done'].forEach(id => {
    const cnt = document.getElementById('kb-' + id).querySelectorAll('.card').length;
    document.getElementById('cnt-' + id).textContent = cnt;
  });
}

function initCard(card) {
  card.addEventListener('dragstart', () => {
    dragCard = card;
    setTimeout(() => card.classList.add('dragging'), 0);
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    dragCard = null;
    document.querySelectorAll('.col').forEach(c => c.classList.remove('drag-over'));
    updateCounts();
  });
}

document.querySelectorAll('.card').forEach(initCard);

document.querySelectorAll('.col').forEach(col => {
  col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
  col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over'); });
  col.addEventListener('drop', e => {
    e.preventDefault();
    col.classList.remove('drag-over');
    if (!dragCard) return;
    col.querySelector('.col-body').appendChild(dragCard);
    const isDone = col.dataset.status === 'done';
    dragCard.classList.toggle('done', isDone);
    dragCard.querySelector('.ctitle').classList.toggle('done-title', isDone);
    updateCounts();
  });
});

function addCard(btn) {
  const text = prompt('새 카드 제목:');
  if (!text) return;
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.innerHTML = `<span class="ctag" style="background:#e0f2fe;color:#0369a1;">New</span><div class="ctitle">${text}</div><div class="cmeta">방금 추가됨</div>`;
  initCard(card);
  btn.previousElementSibling.appendChild(card);
  updateCounts();
}
