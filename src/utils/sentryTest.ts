import { captureMessage, captureError } from '@/lib/sentry';

// 简单的 Sentry 连接测试
export const testSentryConnection = () => {
  try {
    // 发送测试消息
    captureMessage('Sentry 集成测试 - 连接正常', 'info');
    console.log('✅ Sentry 测试消息已发送');
    return true;
  } catch (error) {
    console.error('❌ Sentry 连接测试失败:', error);
    return false;
  }
};

// 测试错误捕获
export const testSentryError = () => {
  try {
    throw new Error('Sentry 错误捕获测试');
  } catch (error) {
    captureError(error as Error, {
      testType: 'connection_test',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Sentry 错误捕获测试完成');
  }
};
