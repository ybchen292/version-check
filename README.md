# VersionCheck.js

> 一个轻量级的前端版本检测工具，支持自动轮询检测、手动检测、ETag 模式和版本文件模式，内置原生提示弹窗。支持自定义提示和回调函数。适用于任何基于 HTML 的前端项目。

[English](./README.en.md) | [Gitee](https://gitee.com/ybchen292/version-check) | [GitHub](https://github.com/ybchen292/version-check)

---

## 🌟 功能特性

- **智能双模式检测**：
  - **ETag 模式**(默认)：通过检测入口 HTML 文件的 `ETag` 响应头判断是否有新版本
  - **版本文件模式**：通过检测指定 JSON 文件中的 `version` 字段判断是否有新版本
- **自动化检测**：默认每 10 分钟自动检测一次，可自定义间隔时间
- **灵活的手动检测**：支持主动调用检测方法
- **智能页面管理**：页面隐藏时自动暂停检测，页面显示时恢复检测
- **高度可配置**：支持自定义提示文案、更新回调、错误处理、日志处理等
- **多环境兼容**：支持 UMD 模块规范，可在 CommonJS、AMD 和浏览器全局环境中使用
- **健壮的存储机制**：自动降级 localStorage → 内存存储
- **完善的错误处理**：区分操作日志和错误日志，提供详细的错误信息

---

## 📦 安装方式

### 1. 通过 `<script>` 标签引入（浏览器环境）

```html
<!-- 生产环境 -->
<script src="dist/index.js"></script>

<!-- 或使用 CDN -->
<script src="https://cdn.jsdelivr.net/npm/version-check-js@latest/dist/index.js"></script>
```

### 2. 通过 NPM 安装（Node.js 环境）

```bash
# 安装最新版本
npm install version-check-js

# 或使用 yarn
yarn add version-check-js
```

然后在代码中导入：

```javascript
// CommonJS 方式
const VersionCheck = require('version-check-js');

// ES6 模块方式
import VersionCheck from 'version-check-js';
```

### 3. 通过 unpkg CDN 引入

```html
<script src="https://unpkg.com/version-check-js@latest/dist/index.js"></script>
```

---

## 🚀 快速开始

### 基础用法

```javascript
// 实例化 VersionCheck
const versionCheck = new VersionCheck({
  url: '/version.json', // 指定版本文件路径（或默认使用 '/' 进入 ETag 模式）
  interval: 60 * 1000, // 设置检测间隔为 1 分钟
  message: '发现新版本，是否立即刷新？', // 自定义提示文案
});

// 启动自动检测
versionCheck.start();

// 停止自动检测
// versionCheck.stop();

// 销毁实例
// versionCheck.destroy();

// 手动触发一次检测
versionCheck.check().then(hasUpdate => {
  console.log('是否有更新:', hasUpdate);
});
```

---

## ⚙️ 配置项详解

| 参数名     | 类型       | 默认值                                          | 描述                                                                                             |
| ---------- | ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `url`      | `string`   | `'/'`                                           | 检测地址：<br>- 默认 `'/'`：启用 ETag 模式<br>- 文件路径（如 `/version.json`）：启用版本文件模式 |
| `interval` | `number`   | `10 * 60 * 1000`（10 分钟）                     | 轮询检测间隔时间（毫秒），建议不小于 30 秒                                                       |
| `message`  | `string`   | `'检测到新版本，是否立即刷新？'`                | 更新提示文案，仅在未设置 `onUpdate` 时生效                                                       |
| `onUpdate` | `Function` | `null`                                          | 自定义更新回调函数（优先级高于默认 confirm 弹窗）                                                |
| `onError`  | `Function` | `(err) => console.error('版本检测失败：', err)` | 错误回调函数，接收错误对象作为参数                                                               |
| `onLog`    | `Function` | `null`                                          | 操作日志回调函数，用于记录正常操作信息                                                           |
| `storage`  | `Object`   | `null`                                          | 自定义存储配置（需提供 `get`、`set`、`remove` 方法），默认使用 localStorage                      |

### 配置项最佳实践

```javascript
const versionCheck = new VersionCheck({
  // 基础配置
  url: '/api/version', // 推荐使用具体的 API 接口
  interval: 5 * 60 * 1000, // 5分钟检测一次（生产环境推荐）

  // 用户体验优化
  message: '发现新版本可用，是否立即更新？',

  // 自定义回调
  onUpdate: () => {
    // 自定义更新逻辑
    console.log('执行更新...');
    // 可以在这里添加动画、提示等
    window.location.reload();
  },

  // 错误处理
  onError: error => {
    // 生产环境可以发送错误日志到监控系统
    console.error('版本检测异常:', error);
  },

  // 操作日志
  onLog: message => {
    // 记录操作日志，便于调试
    console.log('VersionCheck:', message);
  },
});
```

---

## 🔧 完整 API 文档

### 实例方法

#### `start()`

启动自动轮询检测。

```javascript
versionCheck.start(); // 返回 undefined
```

#### `stop([isInternal])`

停止自动轮询检测。

```javascript
versionCheck.stop(); // 外部调用，会触发 onLog
versionCheck.stop(true); // 内部调用，不会触发 onLog
```

#### `check()`

手动触发一次检测，返回 Promise。

```javascript
try {
  const hasUpdate = await versionCheck.check();
  if (hasUpdate) {
    console.log('检测到新版本！');
  }
} catch (error) {
  console.error('检测失败:', error);
}
```

#### `reload()`

强制刷新页面，自动处理 URL 参数去重。

```javascript
versionCheck.reload(); // 会添加时间戳参数避免缓存
```

#### `destroy()`

销毁实例，清理所有资源（定时器、事件监听器、存储引用等）。

```javascript
versionCheck.destroy(); // 实例销毁后不可再次使用
```

### 静态属性

#### `checkMode`

获取当前检测模式。

```javascript
console.log(versionCheck.checkMode); // 'etag' 或 'file'
```

#### `isRunning`

获取当前检测状态。

```javascript
console.log(versionCheck.isRunning); // boolean
```

---

## 📝 使用场景和示例

### 配合 Axios 拦截器使用

```javascript
// axios 配置
import axios from 'axios';
import VersionCheck from 'version-check-js';

const versionCheck = new VersionCheck({
  url: '/api/version',
  interval: 300000,
});

// 请求拦截器中进行版本检测
axios.interceptors.request.use(
  async config => {
    if (process.env.NODE_ENV === 'production') {
      try {
        await versionCheck.check().then(flag => {
          console.log(flag);
        });
      } catch (error) {
        console.warn('版本检测失败:', error);
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

versionCheck.start();
```

---

## 🛠️ 高级配置和最佳实践

### 存储策略配置

```javascript
// 自定义存储适配器
const customStorage = {
  get: function (key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // 降级到 cookie
      return this._getFromCookie(key);
    }
  },

  set: function (key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // 降级到 cookie
      return this._setToCookie(key, value);
    }
  },
  // Cookie 操作方法
  _getFromCookie: function (key) {
    /* ... */
  },
  _setToCookie: function (key, value) {
    /* ... */
  },
};

const versionCheck = new VersionCheck({
  storage: customStorage,
});
```

### 错误监控集成

```javascript
const versionCheck = new VersionCheck({
  onError: error => {
    // 发送到自定义监控接口
    fetch('/api/error-report', {
      method: 'POST',
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      }),
    });
  },

  onLog: message => {
    // 记录操作日志
  },
});
```

### 性能优化建议

```javascript
// 生产环境配置
const prodConfig = {
  url: '/api/version',
  interval: 5 * 60 * 1000, // 5分钟（避免过于频繁）
  onError: error => {
    // 生产环境静默处理，避免影响用户体验
    console.debug('Version check error:', error.message);
  },
};

// 开发环境配置
const devConfig = {
  url: '/api/version',
  interval: 30 * 1000, // 30秒（便于调试）
  onLog: message => {
    // 开发环境详细日志
    console.log('🔧 VersionCheck:', message);
  },
};

const versionCheck = new VersionCheck(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
```

---

## 📄 许可证

MIT License
