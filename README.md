# VersionCheck.js

> 一个轻量级的前端版本检测工具，支持自动轮询检测、手动检测、ETag 模式和版本文件模式，内置原生提示弹窗. 支持自定义提示. 适用于任何基于 HTML 的前端项目。

---

## 🌟 功能特性

- **双模式检测**：
  - **ETag 模式**：通过检测入口 HTML 文件的 `ETag` 响应头判断是否有新版本。
  - **版本文件模式**：通过检测指定 JSON 文件中的 `version` 字段判断是否有新版本。
- **自动轮询**：默认每 5 分钟自动检测一次，可自定义间隔时间。
- **手动检测**：支持主动调用检测方法。
- **页面可见性监听**：页面隐藏时暂停检测，页面显示时恢复检测。
- **灵活配置**：支持自定义提示文案、更新回调、错误处理等。
- **兼容性强**：支持 UMD 模块规范，可在 CommonJS、AMD 和浏览器全局环境中使用。

---

## 📦 安装

### 通过 `<script>` 标签引入（浏览器环境）

```html
<script src="path/to/version-check.min.js"></script>
```

### 通过 NPM 安装（Node.js 环境）

```bash
npm install version-check-js
```

然后在代码中导入：

```javascript
const VersionCheck = require('version-check-js');
// 或者使用 ES6 模块语法
import VersionCheck from 'version-check-js';
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

## ⚙️ 配置项说明

| 参数名     | 类型       | 默认值                                          | 描述                                                                                                    |
| ---------- | ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `url`      | `string`   | `'/'`                                           | 检测地址：<br>- 默认 [/]：启用 ETag 模式<br>- 文件路径或get地址（如 `/version.json`）：启用版本文件模式 |
| `interval` | `number`   | `5 * 60 * 1000`（5 分钟）                       | 轮询检测间隔时间（毫秒）                                                                                |
| `message`  | `string`   | `'检测到新版本，是否立即刷新？'`                | 更新提示文案                                                                                            |
| `onUpdate` | `Function` | `null`                                          | 自定义更新回调（优先级高于默认 confirm）                                                                |
| `onError`  | `Function` | `(err) => console.error('版本检测失败：', err)` | 错误回调函数                                                                                            |
| `storage`  | `Object`   | `null`                                          | 自定义存储配置（需提供 `get` 和 `set` 方法）                                                            |

---

## 🔧 API 方法

### `start()`

启动自动轮询检测。

```javascript
versionCheck.start();
```

### `stop()`

停止自动轮询检测。

```javascript
versionCheck.stop(); // 停止检测
```

### `check()`

手动触发一次检测，返回 Promise。

```javascript
versionCheck.check().then(hasUpdate => {
  if (hasUpdate) {
    console.log('检测到新版本！');
  }
});
```

### `reload()`

强制刷新页面。

```javascript
versionCheck.reload();
```

### `destroy()`

销毁实例，清理定时器和事件监听器。

```javascript
versionCheck.destroy();
```

---

## 📝 使用示例

### 示例 1：ETag 模式（默认）

```javascript
const versionCheck = new VersionCheck({
  url: '/', // 默认进入 ETag 模式
  interval: 30 * 1000, // 每 30 秒检测一次
});

versionCheck.start();
```

### 示例 2：版本文件模式

假设服务器提供一个版本文件 `version.json`，内容如下：

```json
{
  "version": "1.2.3"
}
```

```javascript
const versionCheck = new VersionCheck({
  url: '/version.json', // 指定版本文件路径或get地址返回对应结构也行
  interval: 60 * 1000, // 每分钟检测一次
  onUpdate: () => {
    console.log('执行自定义更新逻辑...');
    versionCheck.reload(); // 强制刷新页面
    // window.location.reload();
  },
});

versionCheck.start();
```

### 示例 3：自定义存储

```javascript
const customStorage = {
  get: key => sessionStorage.getItem(key),
  set: (key, value) => sessionStorage.setItem(key, value),
};

const versionCheck = new VersionCheck({
  storage: customStorage,
});

versionCheck.start();
```

---

## 🛠️ 注意事项

1. **URL 参数累积问题**：
   - 默认刷新逻辑会在 URL 中添加时间戳参数 `t=xxx`，避免缓存问题。
   - 工具已自动处理参数去重，无需担心 URL 变长。

2. **页面可见性监听**：
   - 页面隐藏时会自动暂停检测，页面显示时恢复检测。
   - 可通过 `stop()` 和 `start()` 手动控制检测状态。

3. **跨域限制**：
   - 若使用 ETag 模式，请确保目标资源允许跨域请求。
   - 若使用版本文件模式，请确保 JSON 文件格式正确且包含 `version` 字段。

4. **兼容性**：
   - 支持现代浏览器（Chrome、Firefox、Safari、Edge 等）。
   - IE 浏览器需支持 `fetch` 和 `Promise`（可通过 polyfill 兼容）。

---

## 📄 License

MIT
