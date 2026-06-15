# 构建插件

`VersionCheckPlugin` 是一个用于自动生成版本文件的构建插件，支持 Vite、Webpack 和 Vue CLI。<Badge  text="v2.0.0+" />

## 安装

```bash
npm install version-check-js
```

## 基本用法

### Vite

```javascript
// vite.config.js
import { VersionCheckPlugin, VersionCheckRules } from 'version-check-js/plugin';

export default {
  plugins: [
    new VersionCheckPlugin({
      output: 'dist/version.json',
      version: VersionCheckRules.dateTime(),
      format: 'json',
    }).vitePlugin(),
  ],
};
```

### Webpack

```javascript
// webpack.config.js
const { VersionCheckPlugin, VersionCheckRules } = require('version-check-js/plugin');

module.exports = {
  plugins: [
    new VersionCheckPlugin({
      output: 'dist/version.json',
      version: VersionCheckRules.dateTime(),
      format: 'json',
    }).webpackPlugin(),
  ],
};
```

### Vue CLI

```javascript
// vue.config.js
const { VersionCheckPlugin, VersionCheckRules } = require('version-check-js/plugin');

module.exports = {
  configureWebpack: (config) => {
    config.plugins.push(
      new VersionCheckPlugin({
        output: 'dist/version.json',
        version: VersionCheckRules.dateTime(),
        format: 'json',
      }).vueCLIPlugin()
    );
  },
};
```

## 配置参数

| 参数    | 类型              | 默认值                | 描述                                                         |
| ------- | ----------------- | --------------------- | ------------------------------------------------------------ |
| output  | string            | `dist/version.json`   | 输出文件的路径                                               |
| version | Function \| string | `VersionCheckRules.timestamp()` | 版本号生成规则，可以是预定义规则或自定义函数/字符串          |
| format  | string            | `json`                | 输出格式，可选值：`json`、`txt`、`js`                        |
| mode    | string \| string[] | `production`          | 仅在匹配的构建模式下执行（Webpack mode），默认production模式 |

## 预定义版本号规则

插件提供了多种预定义的版本号生成规则：

| 规则             | 描述                    | 示例输出                    |
| ---------------- | ----------------------- | --------------------------- |
| `timestamp`      | 时间戳（推荐）          | `1717286400000`             |
| `gitCommit`      | Git commit hash         | `a1b2c3d`                   |
| `gitTag`         | Git tag                 | `v1.0.0`                    |
| `date`           | 日期格式 YYYYMMDD       | `20240601`                  |
| `dateTime`       | 日期时间 YYYYMMDDHHmmss | `20240601123045`            |
| `dateHash`       | 日期 + Git 短 hash      | `20240601-a1b2c3d`          |
| `packageVersion` | package.json 中的版本   | `1.0.0`                     |

### 使用示例

```javascript
import { VersionCheckPlugin, VersionCheckRules } from 'version-check-js/plugin';

// 使用时间戳
new VersionCheckPlugin({ version: VersionCheckRules.timestamp() }).vitePlugin();

// 使用 Git commit hash
new VersionCheckPlugin({ version: VersionCheckRules.gitCommit() }).vitePlugin();

// 使用自定义函数
new VersionCheckPlugin({
  version: () => `v${Date.now()}`,
}).vitePlugin();

// 使用固定字符串
new VersionCheckPlugin({
  version: '1.0.0',
}).vitePlugin();
```

## 输出格式

### JSON 格式（默认）

```json
{
  "version": "20240601123045"
}
```

### TXT 格式

```
20240601123045
```

### JS 格式

```javascript
export const VERSION = '20240601123045';
```

## 构建模式控制

通过 `mode` 参数可以控制插件在哪些构建模式下执行：

```javascript
// 仅在 production 模式下执行（默认）
new VersionCheckPlugin({
  mode: 'production',
}).webpackPlugin();

// 在多个模式下执行
new VersionCheckPlugin({
  mode: ['production', 'staging'],
}).webpackPlugin();

```

## 完整示例

```javascript
import { VersionCheckPlugin, VersionCheckRules } from 'version-check-js/plugin';

export default {
  plugins: [
    new VersionCheckPlugin({
      output: 'dist/version.json',
      version: VersionCheckRules.dateHash(),
      format: 'json',
      mode: ['production', 'staging'],
    }).vitePlugin(),
  ],
};
```
