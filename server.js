// Minimal Express server to receive and serve journal entries for testing fetch
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({limit: '1mb'}))

let store = [] // in-memory store for demo

function ensureEntry(e){
  if (!e.id) e.id = 'id_' + Date.now() + '_' + Math.floor(Math.random()*1000)
  if (!e.createdAt) e.createdAt = Date.now()
  if (!e.updatedAt) e.updatedAt = e.createdAt
  return e
}

app.get('/health', (req,res)=> res.json({ok:true}))

app.get('/entries', (req,res)=>{
  res.json(store)
})

// Accept array or single entry
app.post('/entries', (req,res)=>{
  const body = req.body
  const incoming = Array.isArray(body) ? body : [body]
  const map = new Map(store.map(e=>[e.id,e]))
  for (let e of incoming){
    e = ensureEntry(e)
    const existing = map.get(e.id)
    if (!existing) map.set(e.id,e)
    else if ((e.updatedAt||0) > (existing.updatedAt||0)) map.set(e.id,e)
  }
  store = Array.from(map.values())
  res.json({ok:true, count: store.length})
})

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Server listening on port', port))