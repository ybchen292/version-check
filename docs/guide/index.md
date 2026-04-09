# 指南

本指南将帮助您快速上手 Version Check JS，了解其核心功能和使用方法。

## 安装

使用 npm 安装：

```bash
npm install version-check-js
```

## 快速开始

### 基本使用

```javascript
import VersionCheck from 'version-check-js';

// 创建实例
const versionCheck = new VersionCheck();

// 启动自动轮询检测
versionCheck.start();
```

### 自定义配置

```javascript
const versionCheck = new VersionCheck({
  // 检测地址（版本文件模式）
  url: '/version.json',
  // 轮询间隔（5分钟）
  interval: 5 * 60 * 1000,
  // 更新提示文案
  message: '发现新版本，是否立即更新？',
  // 自定义更新回调
  onUpdate: () => {
    if (confirm('发现新版本，是否立即更新？')) {
      versionCheck.reload();
    }
  },
  // 错误回调
  onError: (err) => {
    console.error('版本检测失败:', err);
  },
  // 日志回调
  onLog: (message) => {
    console.log('版本检测日志:', message);
  }
});

versionCheck.start();
```

## 检测模式

Version Check JS 支持两种检测模式：

### ETag 模式（默认）

当 `url` 为 '/' 时，使用 ETag 模式。此模式通过比较服务器返回的 ETag 头信息来检测版本变化。

```javascript
// ETag 模式（默认）
const versionCheck = new VersionCheck({
  url: '/' // 默认值
});
```

### 版本文件模式

当 `url` 为具体文件路径时，使用版本文件模式。此模式通过比较版本文件中的 `version` 字段来检测版本变化。

```javascript
// 版本文件模式
const versionCheck = new VersionCheck({
  url: '/version.json'
});
```

版本文件应返回如下格式：

```json
{
  "version": "1.0.0"
}
```

## 手动检测

除了自动轮询检测外，您还可以手动触发检测：

```javascript
// 手动触发检测
const hasUpdate = await versionCheck.check();
console.log('是否检测到更新:', hasUpdate);
```

## 停止和恢复检测

### 停止检测

```javascript
// 停止自动轮询检测
versionCheck.stop();
```

### 恢复检测

```javascript
// 恢复自动轮询检测
versionCheck.start();
```

## 销毁实例

当您不再需要版本检测时，可以销毁实例：

```javascript
// 销毁实例
versionCheck.destroy();
```

## 页面可见性监听

Version Check JS 会自动监听页面的可见性变化：

- 当页面隐藏时，会暂停检测
- 当页面显示时，会恢复检测

这样可以减少不必要的网络请求，提高性能。

## 自定义存储

您可以自定义存储实现，用于存储版本标识：

```javascript
const versionCheck = new VersionCheck({
  storage: {
    get: (key) => {
      // 从自定义存储中获取值
      return localStorage.getItem(key);
    },
    set: (key, value) => {
      // 存储值到自定义存储
      localStorage.setItem(key, value);
      return true;
    }
  }
});
```

## 常见问题

### 为什么检测不到更新？

1. **服务器配置问题**：确保服务器正确设置了 ETag 或者版本文件。
2. **缓存问题**：确保请求没有被浏览器缓存，Version Check JS 已经设置了 `cache: 'no-cache'`。
3. **网络问题**：检查网络连接是否正常。

### 如何在不同框架中使用？

Version Check JS 是原生 JavaScript 实现，适用于任何前端框架：

#### React

```javascript
import { useEffect } from 'react';
import VersionCheck from 'version-check-js';

function App() {
  useEffect(() => {
    const versionCheck = new VersionCheck();
    versionCheck.start();

    return () => {
      versionCheck.destroy();
    };
  }, []);

  return <div>App</div>;
}
```

#### Vue

```javascript
import { onMounted, onUnmounted } from 'vue';
import VersionCheck from 'version-check-js';

export default {
  setup() {
    let versionCheck;

    onMounted(() => {
      versionCheck = new VersionCheck();
      versionCheck.start();
    });

    onUnmounted(() => {
      if (versionCheck) {
        versionCheck.destroy();
      }
    });

    return {};
  }
};
```

#### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import VersionCheck from 'version-check-js';

@Component({
  selector: 'app-root',
  template: '<h1>App</h1>'
})
export class AppComponent implements OnInit, OnDestroy {
  private versionCheck: any;

  ngOnInit() {
    this.versionCheck = new VersionCheck();
    this.versionCheck.start();
  }

  ngOnDestroy() {
    if (this.versionCheck) {
      this.versionCheck.destroy();
    }
  }
}
```