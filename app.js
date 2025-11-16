// Minimal journal MVP using localStorage
const STORAGE_KEY = 'journal_entries_v1'
const DARK_MODE_KEY = 'journal_dark_mode'
let entries = []
let currentId = null
let autoSaveTimeout = null
let hasUnsavedChanges = false

// DOM
const entriesList = document.getElementById('entriesList')
const editor = document.getElementById('editor')
const preview = document.getElementById('preview')
const titleEl = document.getElementById('title')
const meta = document.getElementById('meta')
const btnSave = document.getElementById('btnSave')
const btnNew = document.getElementById('btnNew')
const btnDelete = document.getElementById('btnDelete')
const btnExport = document.getElementById('btnExport')
const btnImport = document.getElementById('btnImport')
const btnSync = document.getElementById('btnSync')
const btnPull = document.getElementById('btnPull')
const fileInput = document.getElementById('fileInput')
const search = document.getElementById('search')
const btnDarkMode = document.getElementById('btnDarkMode')
const unsavedIndicator = document.getElementById('unsavedIndicator')
const autoSaveIndicator = document.getElementById('autoSaveIndicator')
const wordCount = document.getElementById('wordCount')
// Markdown toolbar buttons
const btnBold = document.getElementById('btnBold')
const btnItalic = document.getElementById('btnItalic')
const btnHeading = document.getElementById('btnHeading')
const btnLink = document.getElementById('btnLink')
const btnCode = document.getElementById('btnCode')
const btnList = document.getElementById('btnList')

function load() {
  try {
    entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch (e) {
    console.error('Failed to load entries', e)
    entries = []
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function renderList(filter = '') {
  entriesList.innerHTML = ''
  const filtered = entries.filter(e => (e.title + '\n' + e.content).toLowerCase().includes(filter.toLowerCase()))
  if (!filtered.length) {
    entriesList.innerHTML = '<div class="text-sm text-gray-500">No entries</div>'
    return
  }
  filtered.sort((a,b)=> b.updatedAt - a.updatedAt)
  for (const e of filtered) {
    const el = document.createElement('div')
    el.className = 'p-2 hover:bg-gray-50 rounded cursor-pointer flex items-start justify-between'
    el.innerHTML = `<div>
      <div class="font-medium">${escapeHtml(e.title || 'Untitled')}</div>
      <div class="text-xs text-gray-500">${new Date(e.updatedAt).toLocaleString()}</div>
    </div>`
    el.addEventListener('click', ()=> loadEntry(e.id))
    entriesList.appendChild(el)
  }
}

function escapeHtml(s){
  return s?.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
}

function renderPreview() {
  const md = editor.value || ''
  preview.innerHTML = marked.parse(md)
}

function updateWordCount() {
  const text = editor.value || ''
  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  wordCount.textContent = `${words} words · ${chars} chars`
}

function markUnsaved() {
  hasUnsavedChanges = true
  unsavedIndicator.classList.remove('hidden')
  autoSaveIndicator.classList.add('hidden')

  // Clear any existing auto-save timeout
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout)

  // Set new auto-save timeout (2 seconds after last change)
  autoSaveTimeout = setTimeout(() => {
    if (hasUnsavedChanges && currentId) {
      autoSaveEntry()
    }
  }, 2000)
}

function markSaved() {
  hasUnsavedChanges = false
  unsavedIndicator.classList.add('hidden')
  autoSaveIndicator.classList.remove('hidden')
  setTimeout(() => {
    autoSaveIndicator.classList.add('hidden')
  }, 2000)
}

function autoSaveEntry() {
  if (!currentId) return
  const e = entries.find(x=>x.id===currentId)
  if (!e) return
  e.title = titleEl.value
  e.content = editor.value
  e.updatedAt = Date.now()
  saveAll()
  renderList(search.value)
  meta.textContent = `Last updated: ${new Date(e.updatedAt).toLocaleString()}`
  markSaved()
}

function newEntry() {
  const id = 'id_' + Date.now()
  const now = Date.now()
  const e = { id, title: 'Untitled', content: '', createdAt: now, updatedAt: now }
  entries.push(e)
  currentId = id
  saveAll()
  renderList(search.value)
  loadEntry(id)
}

function loadEntry(id){
  const e = entries.find(x=>x.id===id)
  if (!e) return
  currentId = e.id
  titleEl.value = e.title
  editor.value = e.content
  meta.textContent = `Last updated: ${new Date(e.updatedAt).toLocaleString()}`
  renderPreview()
}

function saveEntry(){
  if (!currentId) {
    newEntry();
    return
  }
  const e = entries.find(x=>x.id===currentId)
  if (!e) return
  e.title = titleEl.value
  e.content = editor.value
  e.updatedAt = Date.now()
  saveAll()
  renderList(search.value)
  meta.textContent = `Last updated: ${new Date(e.updatedAt).toLocaleString()}`
  markSaved()
}

function deleteEntry(){
  if (!currentId) return
  const idx = entries.findIndex(x=>x.id===currentId)
  if (idx===-1) return
  if (!confirm('Delete this entry?')) return
  entries.splice(idx,1)
  currentId = null
  saveAll()
  renderList(search.value)
  clearEditor()
}

function clearEditor(){
  titleEl.value = ''
  editor.value = ''
  preview.innerHTML = ''
  meta.textContent = ''
}

function exportEntries(){
  const data = JSON.stringify(entries, null, 2)
  const blob = new Blob([data],{type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'journal-export.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function importEntries(file){
  const reader = new FileReader()
  reader.onload = ()=>{
    try {
      const imported = JSON.parse(reader.result)
      if (!Array.isArray(imported)) throw new Error('Invalid format')
      // merge by id (overwrite existing) - simple strategy
      const map = new Map(entries.map(e=>[e.id,e]))
      for (const e of imported) map.set(e.id, e)
      entries = Array.from(map.values())
      saveAll()
      renderList()
      alert('Import complete')
    } catch (err){
      alert('Failed to import: ' + err.message)
    }
  }
  reader.readAsText(file)
}

// Dark mode toggle
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark')
  const isDark = document.documentElement.classList.contains('dark')
  localStorage.setItem(DARK_MODE_KEY, isDark ? 'true' : 'false')
  btnDarkMode.textContent = isDark ? '☀️' : '🌙'
}

function loadDarkMode() {
  const savedPreference = localStorage.getItem(DARK_MODE_KEY)
  // Default to dark mode if no preference is saved
  const isDark = savedPreference === null ? true : savedPreference === 'true'
  if (isDark) {
    document.documentElement.classList.add('dark')
    btnDarkMode.textContent = '☀️'
  } else {
    btnDarkMode.textContent = '🌙'
  }
}

// Markdown toolbar helpers
function wrapSelection(before, after = before) {
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const text = editor.value
  const selectedText = text.substring(start, end)
  const replacement = before + selectedText + after
  editor.value = text.substring(0, start) + replacement + text.substring(end)
  editor.selectionStart = start + before.length
  editor.selectionEnd = end + before.length
  editor.focus()
  markUnsaved()
  renderPreview()
  updateWordCount()
}

function insertAtCursor(text) {
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const current = editor.value
  editor.value = current.substring(0, start) + text + current.substring(end)
  editor.selectionStart = editor.selectionEnd = start + text.length
  editor.focus()
  markUnsaved()
  renderPreview()
  updateWordCount()
}

// events
editor.addEventListener('input', ()=>{
  renderPreview()
  updateWordCount()
  markUnsaved()
})

titleEl.addEventListener('input', ()=>{
  markUnsaved()
})

btnSave.addEventListener('click', ()=> saveEntry())
btnNew.addEventListener('click', ()=> newEntry())
btnDelete.addEventListener('click', ()=> deleteEntry())
btnExport.addEventListener('click', ()=> exportEntries())
btnImport.addEventListener('click', ()=> fileInput.click())
fileInput.addEventListener('change', (e)=>{
  if (e.target.files && e.target.files[0]) importEntries(e.target.files[0])
})
search.addEventListener('input', ()=> renderList(search.value))

// Sync to server using fetch
async function syncToServer(){
  const url = 'http://localhost:4000/entries'
  try{
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries)
    })
    if (!resp.ok) throw new Error('Server returned ' + resp.status)
    const data = await resp.json()
    alert('Sync successful — server entries: ' + (data.count ?? 'unknown'))
  }catch(err){
    console.error('Sync failed', err)
    alert('Sync failed: ' + err.message)
  }
}

// Pull entries from server and merge
async function pullFromServer(){
  const url = 'http://localhost:4000/entries'
  try{
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('Server returned ' + resp.status)
    const serverEntries = await resp.json()
    if (!Array.isArray(serverEntries)) throw new Error('Invalid response format')
    // merge: keep newest updatedAt
    const map = new Map(entries.map(e=>[e.id,e]))
    for (const s of serverEntries){
      const existing = map.get(s.id)
      if (!existing) map.set(s.id,s)
      else if ((s.updatedAt||0) > (existing.updatedAt||0)) map.set(s.id,s)
    }
    entries = Array.from(map.values())
    saveAll()
    renderList(search.value)
    alert('Pull complete — entries: ' + entries.length)
  }catch(err){
    console.error('Pull failed', err)
    alert('Pull failed: ' + err.message)
  }
}

btnSync.addEventListener('click', ()=> syncToServer())
btnPull.addEventListener('click', ()=> pullFromServer())

// Dark mode
btnDarkMode.addEventListener('click', ()=> toggleDarkMode())

// Markdown toolbar
btnBold.addEventListener('click', ()=> wrapSelection('**'))
btnItalic.addEventListener('click', ()=> wrapSelection('*'))
btnHeading.addEventListener('click', ()=> {
  const start = editor.selectionStart
  const text = editor.value
  // Find start of line
  let lineStart = start
  while (lineStart > 0 && text[lineStart - 1] !== '\n') lineStart--

  editor.selectionStart = lineStart
  editor.selectionEnd = lineStart
  insertAtCursor('# ')
})
btnLink.addEventListener('click', ()=> wrapSelection('[', '](url)'))
btnCode.addEventListener('click', ()=> wrapSelection('`'))
btnList.addEventListener('click', ()=> {
  const start = editor.selectionStart
  const text = editor.value
  let lineStart = start
  while (lineStart > 0 && text[lineStart - 1] !== '\n') lineStart--

  editor.selectionStart = lineStart
  editor.selectionEnd = lineStart
  insertAtCursor('- ')
})

// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  // Ctrl+S or Cmd+S - Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveEntry()
  }
  // Ctrl+N or Cmd+N - New entry
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    newEntry()
  }
  // Ctrl+F or Cmd+F - Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault()
    search.focus()
    search.select()
  }
  // Ctrl+B or Cmd+B - Bold (only in editor)
  if ((e.ctrlKey || e.metaKey) && e.key === 'b' && document.activeElement === editor) {
    e.preventDefault()
    wrapSelection('**')
  }
  // Ctrl+I or Cmd+I - Italic (only in editor)
  if ((e.ctrlKey || e.metaKey) && e.key === 'i' && document.activeElement === editor) {
    e.preventDefault()
    wrapSelection('*')
  }
})

// init
load()
loadDarkMode()
renderList()
// auto-load most recent entry if present
if (entries.length) {
  entries.sort((a,b)=> b.updatedAt - a.updatedAt)
  loadEntry(entries[0].id)
  updateWordCount()
} else {
  // start with a fresh entry
  newEntry()
  updateWordCount()
}