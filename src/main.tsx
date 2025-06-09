
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'
import { testSentryConnection } from './utils/sentryTest'

// 初始化 Sentry
initSentry();

// 在开发环境测试 Sentry 连接
if (import.meta.env.DEV) {
  setTimeout(() => {
    testSentryConnection();
  }, 1000);
}

createRoot(document.getElementById("root")!).render(<App />);
