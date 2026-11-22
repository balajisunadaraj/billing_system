import { spawn } from 'node:child_process';

const processes = [
  spawn(process.execPath, ['backend/server.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' })
];

function stopProcesses() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      process.exitCode = code;
    }
    stopProcesses();
  });
}

process.on('SIGINT', () => {
  stopProcesses();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopProcesses();
  process.exit(0);
});
