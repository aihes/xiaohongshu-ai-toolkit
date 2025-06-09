import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { captureError, captureMessage, addBreadcrumb, setTag, setContext } from '@/lib/sentry';
import { toast } from 'sonner';

const SentryTest = () => {
  const testError = () => {
    try {
      throw new Error('这是一个测试错误 - Test Error');
    } catch (error) {
      captureError(error as Error, {
        testType: 'manual_error_test',
        timestamp: new Date().toISOString()
      });
      toast.error('错误已发送到 Sentry');
    }
  };

  const testMessage = () => {
    captureMessage('这是一个测试消息 - Test Message', 'info');
    toast.success('消息已发送到 Sentry');
  };

  const testBreadcrumb = () => {
    addBreadcrumb('用户点击了测试面包屑按钮', 'user_action', 'info');
    toast.success('面包屑已添加到 Sentry');
  };

  const testTag = () => {
    setTag('test_feature', 'sentry_integration');
    toast.success('标签已设置到 Sentry');
  };

  const testContext = () => {
    setContext('test_context', {
      feature: 'sentry_test',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    toast.success('上下文已设置到 Sentry');
  };

  const testUnhandledError = () => {
    // 这会触发一个未处理的错误
    setTimeout(() => {
      throw new Error('这是一个未处理的错误 - Unhandled Error');
    }, 100);
    toast.info('未处理错误将在 100ms 后触发');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xiaohongshu-red">
          🔧 Sentry 集成测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testError}
            variant="destructive"
            className="w-full"
          >
            测试错误捕获
          </Button>

          <Button
            onClick={testMessage}
            variant="default"
            className="w-full"
          >
            测试消息记录
          </Button>

          <Button
            onClick={testBreadcrumb}
            variant="secondary"
            className="w-full"
          >
            测试面包屑
          </Button>

          <Button
            onClick={testTag}
            variant="outline"
            className="w-full"
          >
            测试标签设置
          </Button>

          <Button
            onClick={testContext}
            variant="ghost"
            className="w-full"
          >
            测试上下文设置
          </Button>

          <Button
            onClick={testUnhandledError}
            variant="destructive"
            className="w-full border-2 border-red-500"
          >
            测试未处理错误
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">测试说明：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 点击按钮后，相应的事件会发送到 Sentry</li>
            <li>• 请在 Sentry 控制台中查看是否收到相应的事件</li>
            <li>• 红色边框的按钮会触发未处理的错误</li>
            <li>• 所有测试都会显示 toast 提示</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentryTest;
