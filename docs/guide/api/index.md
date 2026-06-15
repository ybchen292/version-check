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
  onError: err => {
    // 错误回调
  },
  onLog: message => {
    // 日志回调
  },
  storage: {
    // 自定义存储
    get: key => {
      /* 实现 */
    },
    set: (key, value) => {
      /* 实现 */
    },
  },
  t: 't',
  versionKey: 'version_check_key',
  initialCheck: true,
  bindVisibility: true,
  // fetchOptions: {
  //   headers: {
  //     'Authorization': 'Bearer ' + localStorage.getItem('token'),
  //   },
  // },
  // fetchRequest: async (url, options) => {
  //   const response = await axios(url, options);
  //   return response.version;
  // },
});
```

## 配置参数

| 参数           | 类型     | 默认值                       | 描述                                                                                                             |
| -------------- | -------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| url            | string   | /                            | 检测地址（默认/：ETag 模式；传文件路径如/version.json：版本文件模式。如vue中放在public目录下，需要传/version.json。也可以传入接口地址，通过get请求或者自定义请求(fetchRequest)获取版本号）                                           |
| interval       | number   | `10 * 60 * 1000`               | 轮询间隔（毫秒），默认 10 分钟                                                                                   |
| message        | string   | 检测到新版本，是否立即刷新？ | 更新提示文案                                                                                                     |
| onUpdate       | Function | null                         | 自定义更新回调（优先级高于默认 confirm。传入后message无效。当需要自定义弹框提示或无需弹框提示时需要用的此方法）                                                                                             |
| onError        | Function | (err)=>console.error(err)    | 错误回调                                                                                                         |
| onLog          | Function | null                         | 日志回调                                                                                                         |
| storage        | Object   | null                         | 自定义存储配置（get/set 方法）                                                                                   |
| t              | string   | t                            | 重新加载时的时间戳参数名，默认't'                                                                                |
| versionKey     | string   | version_check_key            | 用于在 `localStorage` 中缓存版本标识的键名                                                                       |
| initialCheck   | boolean  | true                         | 是否在执行start方法时立即执行一次版本比对，而非等待首个轮询间隔(为true时,页面可见性变化显示时会执行一次版本检测) |
| bindVisibility | boolean  | true                         | 是否自动监听页面可见性变化：页面隐藏时暂停轮询，显示时自动恢复，节省性能与网络开销                               |
| fetchRequest          | Function | null                         | 自定义请求函数，优先级高于内部fetch实现(需要返回Promise对象。返回值为版本号)                                                                                             |
| fetchOptions        | Object   | {}                           | 自定义fetch选项，优先级高于默认值（当通过接口请求url时需要传入token时可在此处传入。或者使用其他自定义header时可在此处传入。也可以使用fetchRequest）                                                                                             |

## 检测模式

构造函数会根据 `url` 参数自动判断检测模式：

- **ETag 模式**：当 `url` 为 '/' 时使用此模式
- **版本文件模式**：当 `url` 为具体文件路径时使用此模式或具体api接口

### ETag 模式

通过比较服务器返回的 ETag 头信息来检测版本变化。

### 版本文件模式

通过比较版本文件中的 `version` 字段来检测版本变化。版本文件应返回如下格式：

```json
{
  "version": "1.0.0"
}
```
