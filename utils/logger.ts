import fs from 'fs';
import path from 'path';
import { env } from './env';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

/**
 * Professional logging utility for API testing
 * Provides structured logging with multiple output formats
 */
class Logger {
  private logLevel: LogLevel;
  private logFile: string;

  constructor() {
    this.logLevel = this.parseLogLevel(env.LOG_LEVEL);
    this.logFile = env.LOG_FILE;
    this.ensureLogDirectory();
  }

  /**
   * Log an error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log API request details
   */
  logRequest(method: string, url: string, headers?: Record<string, string>, body?: any): void {
    this.info(`API Request: ${method} ${url}`, {
      headers: this.sanitizeHeaders(headers),
      body: this.sanitizeBody(body),
    });
  }

  /**
   * Log API response details
   */
  logResponse(status: number, url: string, headers?: Record<string, string>, body?: any): void {
    this.info(`API Response: ${status} ${url}`, {
      headers: this.sanitizeHeaders(headers),
      body: this.sanitizeBody(body),
    });
  }

  /**
   * Log test execution details
   */
  logTest(testName: string, status: 'started' | 'passed' | 'failed', duration?: number): void {
    const message = `Test ${status}: ${testName}`;
    const data = duration ? { duration: `${duration}ms` } : undefined;
    
    if (status === 'failed') {
      this.error(message, data);
    } else {
      this.info(message, data);
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Console output
    this.logToConsole(logEntry);

    // File output
    this.logToFile(logEntry);
  }

  /**
   * Check if message should be logged based on log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    
    let message = `${prefix} ${entry.message}`;
    
    if (entry.data) {
      message += `\n${JSON.stringify(entry.data, null, 2)}`;
    }

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.DEBUG:
        console.debug(message);
        break;
    }
  }

  /**
   * Log to file
   */
  private logToFile(entry: LogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Parse log level from string
   */
  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined;

    const sanitized = { ...headers };
    const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize body for logging (remove sensitive data)
   */
  private sanitizeBody(body?: any): any {
    if (!body) return undefined;

    const sanitized = JSON.parse(JSON.stringify(body));
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(value);
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }
}

// Export singleton instance
export const logger = new Logger();
