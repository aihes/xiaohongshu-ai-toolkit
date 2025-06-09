
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "your_sentry_dsn_here",
    environment: import.meta.env.MODE,
    integrations: [
      // send console.log, console.error, and console.warn calls as logs to Sentry
      // Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
      // Sentry.captureConsoleIntegration(),
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 生产环境降低采样率
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% 的会话会被录制
    replaysOnErrorSampleRate: 1.0, // 100% 的错误会话会被录制

    // 设置发布版本
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // 添加用户上下文
    beforeSend(event, hint) {
      // 在开发环境下也打印到控制台
      if (import.meta.env.DEV) {
        console.error('Sentry Error:', hint.originalException || hint.syntheticException);
      }
      return event;
    },
    _experiments: { enableLogs: true },
  });
};

// 错误边界组件
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// 手动捕获错误的工具函数
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};

// 捕获消息
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// 设置用户上下文
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// 添加面包屑
export const addBreadcrumb = (message: string, category?: string, level?: Sentry.SeverityLevel) => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
};

// 设置标签
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// 设置上下文
export const setContext = (key: string, context: Record<string, any>) => {
  Sentry.setContext(key, context);
};

// 性能监控 - 创建事务
export const startTransaction = (name: string, op?: string) => {
  return Sentry.startSpan({ name, op: op || 'navigation' }, (span) => {
    return span;
  });
};

// 包装异步函数以进行错误捕获
export const withSentry = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error);
          throw error;
        });
      }
      return result;
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }) as T;
};
