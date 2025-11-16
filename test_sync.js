// test_sync.js — test client-side fetch calls to the server
// Run: node test_sync.js (after starting server.js)

const BASE_URL = 'http://localhost:4000'

async function testHealthCheck(){
  console.log('Testing /health...')
  try{
    const resp = await fetch(BASE_URL + '/health')
    const data = await resp.json()
    console.log('✓ /health:', data)
  }catch(err){
    console.error('✗ /health failed:', err.message)
  }
}

async function testGetEntries(){
  console.log('\nTesting GET /entries...')
  try{
    const resp = await fetch(BASE_URL + '/entries')
    const data = await resp.json()
    console.log('✓ GET /entries:', data.length, 'entries')
  }catch(err){
    console.error('✗ GET /entries failed:', err.message)
  }
}

async function testPostEntries(){
  console.log('\nTesting POST /entries...')
  const entries = [
    { id: 'test_1', title: 'Test Entry 1', content: '# Hello\nThis is a test.', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'test_2', title: 'Test Entry 2', content: '## Markdown Works', createdAt: Date.now(), updatedAt: Date.now() }
  ]
  try{
    const resp = await fetch(BASE_URL + '/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries)
    })
    if (!resp.ok) throw new Error('HTTP ' + resp.status)
    const data = await resp.json()
    console.log('✓ POST /entries:', data)
  }catch(err){
    console.error('✗ POST /entries failed:', err.message)
  }
}

async function testGetAfterPost(){
  console.log('\nTesting GET /entries (after POST)...')
  try{
    const resp = await fetch(BASE_URL + '/entries')
    const data = await resp.json()
    console.log('✓ GET /entries after POST:', data.length, 'entries')
    data.forEach(e => console.log('  -', e.title || 'Untitled', `(id: ${e.id})` ))
  }catch(err){
    console.error('✗ GET /entries failed:', err.message)
  }
}

async function runTests(){
  console.log('=== Journal MVP Fetch Sync Tests ===\n')
  await testHealthCheck()
  await testGetEntries()
  await testPostEntries()
  await testGetAfterPost()
  console.log('\n=== Tests Complete ===')
}

runTests().catch(console.error)
