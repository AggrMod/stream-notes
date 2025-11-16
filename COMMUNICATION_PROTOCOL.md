# Inter-Claude Communication Protocol

## Goal
Enable two Claude sessions to collaborate in near real-time with minimal token usage.

## Design Principles
1. **Compact Format** - Use JSON with short keys
2. **Delta Updates** - Only send changes, not full state
3. **Task-Based** - Clear action items, no verbose explanations
4. **Status Codes** - Use symbols instead of words

## Message Format

```json
{
  "from": "cloud|local",
  "ts": 1234567890,
  "type": "task|status|query|response",
  "id": "msg_001",
  "data": {}
}
```

## Message Types

### 1. TASK (Request work)
```json
{
  "from": "local",
  "ts": 1731730000,
  "type": "task",
  "id": "t_001",
  "data": {
    "action": "add_feature",
    "target": "app.js",
    "desc": "Add tree-sitter integration",
    "priority": "high"
  }
}
```

### 2. STATUS (Report progress)
```json
{
  "from": "cloud",
  "ts": 1731730060,
  "type": "status",
  "id": "s_001",
  "data": {
    "task_id": "t_001",
    "state": "⏳|✓|✗",
    "pct": 50,
    "msg": "Added parser"
  }
}
```

### 3. QUERY (Ask question)
```json
{
  "from": "cloud",
  "ts": 1731730120,
  "type": "query",
  "id": "q_001",
  "data": {
    "question": "Which tree-sitter grammars?",
    "options": ["js", "py", "ts", "all"]
  }
}
```

### 4. RESPONSE (Answer query)
```json
{
  "from": "local",
  "ts": 1731730180,
  "type": "response",
  "id": "r_001",
  "data": {
    "query_id": "q_001",
    "answer": "all"
  }
}
```

## Implementation

### Storage: tasks.json
```json
{
  "inbox": [],
  "outbox": [],
  "completed": [],
  "last_sync": 1731730000
}
```

### Workflow:
1. **Local** writes task to `tasks.json` → commits → pushes
2. **Cloud** pulls every 30s → reads tasks → processes
3. **Cloud** writes status → commits → pushes
4. **Local** pulls → reads status → displays

## Token Optimization

### Instead of:
"I need you to add tree-sitter support to the application for parsing JavaScript and TypeScript code"

### Use:
```json
{"type":"task","action":"add_lib","lib":"tree-sitter","langs":["js","ts"]}
```

**Savings: ~80% tokens**

## Status Symbols
- ⏳ In Progress
- ✓ Complete
- ✗ Failed
- ⏸ Paused
- ❓ Needs Info

## Next Steps
1. Create `comm.js` - Communication handler
2. Add UI for task management
3. Implement automatic polling
4. Add conflict resolution
