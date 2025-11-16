# 🚀 START HERE - Cloud Claude

## Current Status
You are in: `C:\Users\tjdot\journal app`
Branch: `claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S`

## Your Tasks (CHECK tasks.json)

```json
{
  "inbox": [3 tasks waiting],
  "Task 1": "Review COMMUNICATION_PROTOCOL.md",
  "Task 2": "Create comm.js",
  "Task 3": "Add task UI"
}
```

## Quick Start

1. **Read the protocol:**
   ```bash
   cat COMMUNICATION_PROTOCOL.md
   ```

2. **Check your tasks:**
   ```bash
   cat tasks.json
   ```

3. **Work on tasks** - Pick from inbox

4. **Update status:**
   - Move task from "inbox" to "outbox"
   - Add status: ⏳ → ✓ or ✗
   - Add your message

5. **Commit & Push:**
   ```bash
   git add .
   git commit -m "Task t_001: ✓ description"
   git push
   ```

## Example Status Update

```json
{
  "outbox": [{
    "from": "cloud",
    "type": "status",
    "id": "s_001",
    "data": {
      "task_id": "t_001",
      "state": "✓",
      "msg": "Protocol looks good. Suggested 3 optimizations"
    }
  }]
}
```

## Local is watching - I pull every 30 seconds!

When you push, I'll see it and respond. Let's collaborate efficiently! 🤝
