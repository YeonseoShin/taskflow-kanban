// TaskFlow Kanban — 카드 생성(제목·태그·담당자·기한·메모), 드래그앤드롭, 필터, 진행률
const TAG_STYLES = {
  'Frontend': { bg:'#dbeafe', text:'#1e40af' },
  'Backend':  { bg:'#dcfce7', text:'#166534' },
  'UI/UX':    { bg:'#fef3c7', text:'#92400e' },
  'Data':     { bg:'#f3e8ff', text:'#6b21a8' },
  'QA':       { bg:'#cffafe', text:'#0e7490' },
  'Bug':      { bg:'#fee2e2', text:'#991b1b' },
  '기타':     { bg:'#f1f5f9', text:'#475569' },
};

// 초기 샘플 카드 데이터
let cards = [
  { id:'c1', title:'다크모드 테마 시안 제작', tag:'UI/UX', assignee:'미할당', due:'', memo:'', status:'todo' },
  { id:'c2', title:'반응형 레이아웃 리팩토링', tag:'Frontend', assignee:'신연서', due: daysFromNow(5), memo:'모바일 375px 기준', status:'todo' },
  { id:'c3', title:'REST API 엔드포인트 설계', tag:'Backend', assignee:'미할당', due: daysFromNow(10), memo:'', status:'todo' },
  { id:'c4', title:'Drag & Drop 로직 구현', tag:'Frontend', assignee:'신연서', due: daysFromNow(2), memo:'HTML5 DnD API 활용', status:'inprogress' },
  { id:'c5', title:'TrustScore 알고리즘 고도화', tag:'Data', assignee:'신연서', due: daysFromNow(7), memo:'', status:'inprogress' },
  { id:'c6', title:'관절 각도 계산 단위 테스트', tag:'QA', assignee:'신연서', due: daysFromNow(3), memo:'', status:'review' },
  { id:'c7', title:'모바일 레이아웃 깨짐 수정', tag:'Bug', assignee:'신연서', due:'', memo:'완료', status:'done' },
  { id:'c8', title:'예금보험 데이터 파이프라인', tag:'Backend', assignee:'신연서', due:'', memo:'', status:'done' },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dueBadge(due, isDone) {
  if (!due) return `<span class="due-badge nodule">기한 없음</span>`;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  if (isDone) return `<span class="due-badge ok">${due}</span>`;
  if (diff < 0)  return `<span class="due-badge overdue">D+${Math.abs(diff)} 초과</span>`;
  if (diff === 0) return `<span class="due-badge overdue">오늘 마감</span>`;
  if (diff <= 3) return `<span class="due-badge soon">D-${diff}</span>`;
  return `<span class="due-badge ok">D-${diff}</span>`;
}

function initials(name) {
  if (!name || name === '미할당') return '?';
  return name.slice(0, 1);
}

function renderCard(card) {
  const ts = TAG_STYLES[card.tag] || TAG_STYLES['기타'];
  const isDone = card.status === 'done';
  const assigneeClass = (!card.assignee || card.assignee === '미할당') ? 'unassigned' : '';

  const el = document.createElement('div');
  el.className = 'card' + (isDone ? ' done-card' : '');
  el.dataset.id = card.id;
  el.draggable = true;
  el.innerHTML = `
    <div class="card-top">
      <span class="ctag" style="background:${ts.bg};color:${ts.text};">${card.tag}</span>
      <button class="card-delete" onclick="deleteCard('${card.id}')" title="삭제">✕</button>
    </div>
    <div class="ctitle${isDone ? ' done-title' : ''}">${card.title}</div>
    ${card.memo ? `<div class="card-memo">${card.memo}</div>` : ''}
    <div class="card-footer">
      <div class="card-meta-row">
        <span class="assignee-badge ${assigneeClass}">${initials(card.assignee)}</span>
        <span class="assignee-name">${card.assignee || '미할당'}</span>
      </div>
      ${dueBadge(card.due, isDone)}
    </div>`;

  initDrag(el);
  return el;
}

function renderAll() {
  const filterTag      = document.getElementById('filter-tag').value;
  const filterAssignee = document.getElementById('filter-assignee').value;
  const statuses = ['todo', 'inprogress', 'review', 'done'];

  statuses.forEach(s => {
    const body = document.getElementById('kb-' + s);
    body.innerHTML = '';
    const filtered = cards.filter(c => {
      if (c.status !== s) return false;
      if (filterTag && c.tag !== filterTag) return false;
      if (filterAssignee && (c.assignee || '미할당') !== filterAssignee) return false;
      return true;
    });
    filtered.forEach(c => body.appendChild(renderCard(c)));
  });

  updateMeta();
}

function updateMeta() {
  const statuses = ['todo', 'inprogress', 'review', 'done'];
  statuses.forEach(s => {
    document.getElementById('cnt-' + s).textContent =
      cards.filter(c => c.status === s).length;
  });

  const total = cards.length;
  const done  = cards.filter(c => c.status === 'done').length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-label').textContent = pct + '% 완료';
  document.getElementById('board-meta').textContent =
    `${total}개 카드 · ${done}개 완료 · ${cards.filter(c=>c.status==='inprogress').length}개 진행 중`;
}

function applyFilter() { renderAll(); }

function deleteCard(id) {
  cards = cards.filter(c => c.id !== id);
  renderAll();
}

// ── Drag & Drop ──
let dragId = null;

function initDrag(el) {
  el.addEventListener('dragstart', () => {
    dragId = el.dataset.id;
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    dragId = null;
    document.querySelectorAll('.col').forEach(c => c.classList.remove('drag-over'));
  });
}

document.querySelectorAll('.col').forEach(col => {
  col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
  col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over'); });
  col.addEventListener('drop', e => {
    e.preventDefault();
    col.classList.remove('drag-over');
    if (!dragId) return;
    const card = cards.find(c => c.id === dragId);
    if (!card) return;
    card.status = col.dataset.status;
    renderAll();
  });
});

// ── Modal ──
let modalTargetStatus = 'todo';

function openModal(status) {
  modalTargetStatus = status || 'todo';
  document.getElementById('m-status').value = modalTargetStatus;
  document.getElementById('m-title').value = '';
  document.getElementById('m-assignee').value = '';
  document.getElementById('m-due').value = '';
  document.getElementById('m-memo').value = '';
  document.getElementById('modal-bg').classList.remove('hidden');
  setTimeout(() => document.getElementById('m-title').focus(), 50);
}

function closeModal() {
  document.getElementById('modal-bg').classList.add('hidden');
}
function closeModalBg(e) {
  if (e.target === document.getElementById('modal-bg')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && !document.getElementById('modal-bg').classList.contains('hidden')) {
    if (document.activeElement.tagName !== 'TEXTAREA') submitCard();
  }
});

function submitCard() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { document.getElementById('m-title').focus(); return; }
  cards.push({
    id: 'c' + Date.now(),
    title,
    tag:      document.getElementById('m-tag').value,
    status:   document.getElementById('m-status').value,
    assignee: document.getElementById('m-assignee').value.trim() || '미할당',
    due:      document.getElementById('m-due').value,
    memo:     document.getElementById('m-memo').value.trim(),
  });
  closeModal();
  renderAll();
}

// 초기 렌더링
renderAll();
