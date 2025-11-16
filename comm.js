// Communication handler for inter-Claude collaboration
const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join(__dirname, 'tasks.json');

class CommHandler {
  constructor() {
    this.tasks = null;
  }

  async loadTasks() {
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf8');
      this.tasks = JSON.parse(data);
      return this.tasks;
    } catch (err) {
      console.error('Failed to load tasks:', err.message);
      return null;
    }
  }

  async saveTasks() {
    try {
      await fs.writeFile(TASKS_FILE, JSON.stringify(this.tasks, null, 2));
      return true;
    } catch (err) {
      console.error('Failed to save tasks:', err.message);
      return false;
    }
  }

  async processTasks() {
    await this.loadTasks();
    if (!this.tasks) return;

    console.log(`\n📋 Inbox: ${this.tasks.inbox.length} tasks`);
    console.log(`📤 Outbox: ${this.tasks.outbox.length} messages`);
    console.log(`✅ Completed: ${this.tasks.completed.length} tasks\n`);

    // Display inbox tasks
    if (this.tasks.inbox.length > 0) {
      console.log('📥 PENDING TASKS:');
      this.tasks.inbox.forEach((task, i) => {
        console.log(`  ${i + 1}. [${task.data.priority}] ${task.data.desc}`);
        console.log(`     ID: ${task.id} | Action: ${task.data.action}`);
      });
    }

    // Display outbox messages
    if (this.tasks.outbox.length > 0) {
      console.log('\n📬 RECENT MESSAGES:');
      this.tasks.outbox.slice(-5).forEach(msg => {
        const time = new Date(msg.ts).toLocaleTimeString();
        console.log(`  [${time}] ${msg.from}: ${msg.data.msg || JSON.stringify(msg.data)}`);
      });
    }
  }

  async updateStatus(taskId, status, message) {
    await this.loadTasks();

    const statusUpdate = {
      from: 'local',
      ts: Date.now(),
      type: 'status',
      id: `s_${Date.now()}`,
      data: {
        task_id: taskId,
        state: status,
        msg: message
      }
    };

    this.tasks.outbox.push(statusUpdate);
    this.tasks.last_sync = Date.now();

    await this.saveTasks();
    console.log(`✅ Status updated for ${taskId}: ${status} - ${message}`);
  }

  async completeTask(taskId, result) {
    await this.loadTasks();

    const taskIndex = this.tasks.inbox.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.log(`❌ Task ${taskId} not found in inbox`);
      return;
    }

    const task = this.tasks.inbox.splice(taskIndex, 1)[0];
    task.completed_at = Date.now();
    task.result = result;

    this.tasks.completed.push(task);
    await this.updateStatus(taskId, '✓', result);

    console.log(`✅ Task completed: ${task.data.desc}`);
  }

  async addTask(action, desc, priority = 'medium') {
    await this.loadTasks();

    const newTask = {
      from: 'local',
      ts: Date.now(),
      type: 'task',
      id: `t_${Date.now()}`,
      data: { action, desc, priority }
    };

    this.tasks.inbox.push(newTask);
    await this.saveTasks();

    console.log(`📝 New task added: ${desc}`);
    return newTask.id;
  }
}

// CLI interface
if (require.main === module) {
  const comm = new CommHandler();
  const command = process.argv[2];

  (async () => {
    switch (command) {
      case 'list':
        await comm.processTasks();
        break;

      case 'complete':
        const taskId = process.argv[3];
        const result = process.argv[4] || 'Completed';
        await comm.completeTask(taskId, result);
        break;

      case 'add':
        const action = process.argv[3];
        const desc = process.argv[4];
        const priority = process.argv[5] || 'medium';
        await comm.addTask(action, desc, priority);
        break;

      case 'status':
        const tId = process.argv[3];
        const state = process.argv[4];
        const msg = process.argv[5];
        await comm.updateStatus(tId, state, msg);
        break;

      default:
        console.log(`
Communication Handler CLI

Usage:
  node comm.js list                              # Show all tasks
  node comm.js add <action> <desc> [priority]    # Add new task
  node comm.js status <taskId> <state> <msg>     # Update status
  node comm.js complete <taskId> <result>        # Mark complete

Examples:
  node comm.js list
  node comm.js add implement_feature "Add dark mode" high
  node comm.js status t_001 "⏳" "Working on it"
  node comm.js complete t_001 "Dark mode implemented"
        `);
    }
  })();
}

module.exports = CommHandler;
