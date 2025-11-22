class SecurityLogger {
  constructor(io) {
    this.io = io;
  }

  log(type, data) {
    const event = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      ...data
    };

    // Emit to all connected clients
    if (this.io) {
      this.io.emit('security-event', event);
    }

    // Also log to console for Azure logs
    const logMessage = `[SECURITY][${type}] ${JSON.stringify(data)}`;
    console.log(logMessage);

    // Emit console log to frontend
    if (this.io) {
      this.io.emit('console-log', {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: logMessage
      });
    }
  }

  logConsole(message, level = 'info') {
    console.log(message);
    if (this.io) {
      this.io.emit('console-log', {
        timestamp: new Date().toISOString(),
        level,
        message
      });
    }
  }

  logEncryption(action, details) {
    this.log('ENCRYPTION', {
      action,
      details,
      status: 'SECURE'
    });
  }

  logAuth(action, user, status = 'SUCCESS') {
    this.log('AUTHENTICATION', {
      action,
      user,
      status
    });
  }

  logAttack(type, details, blocked = true) {
    this.log('ATTACK_ATTEMPT', {
      type,
      details,
      status: blocked ? 'BLOCKED' : 'WARNING'
    });
  }

  logDb(queryType, encrypted) {
    this.log('DATABASE', {
      queryType,
      encrypted,
      status: 'PROTECTED'
    });
  }
}

module.exports = SecurityLogger;
