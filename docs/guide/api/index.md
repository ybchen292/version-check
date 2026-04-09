# 构造函数

## 基本用法

```javascript
import VersionCheck from 'version-check-js';

// 极简配置
const versionCheck = new VersionCheck();

// 完整配置
const versionCheck = new VersionCheck({
  url: '/version.json',
  interval: 5 * 60 * 1000,
  message: '发现新版本，是否立即更新？',
  onUpdate: () => {
    // 自定义更新回调
  },
  onError: (err) => {
    // 错误回调
  },
  onLog: (message) => {
    // 日志回调
  },
  storage: {
    // 自定义存储
    get: (key) => { /* 实现 */ },
    set: (key, value) => { /* 实现 */ }
  },
  t: 't'
});
```

## 配置参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| url | string | '/' | 检测地址（默认/：ETag 模式；传文件路径如/version.json：版本文件模式） |
| interval | number | 10 * 60 * 1000 | 轮询间隔（毫秒），默认 10 分钟 |
| message | string | '检测到新版本，是否立即刷新？' | 更新提示文案 |
| onUpdate | Function | null | 自定义更新回调（优先级高于默认 confirm） |
| onError | Function | (err)=>console.error(err) | 错误回调 |
| onLog | Function | null | 日志回调 |
| storage | Object | null | 自定义存储配置（get/set 方法） |
| t | string | 't' | 重新加载时的时间戳参数名，默认't' |

## 检测模式

构造函数会根据 `url` 参数自动判断检测模式：

- **ETag 模式**：当 `url` 为 '/' 时使用此模式
- **版本文件模式**：当 `url` 为具体文件路径时使用此模式

### ETag 模式

通过比较服务器返回的 ETag 头信息来检测版本变化。

### 版本文件模式

通过比较版本文件中的 `version` 字段来检测版本变化。版本文件应返回如下格式：

```json
{
  "version": "1.0.0"
}
```