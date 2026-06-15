# Build Plugin

`VersionCheckPlugin` is a build plugin for automatically generating version files, supporting Vite, Webpack, and Vue CLI.<Badge  text="v2.0.0+" />

## Installation

```bash
npm install version-check-js
```

## Basic Usage

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

## Configuration Options

| Parameter | Type              | Default               | Description                                                  |
| --------- | ----------------- | --------------------- | ------------------------------------------------------------ |
| output    | string            | `dist/version.json`   | Output file path                                             |
| version   | Function \| string | `VersionCheckRules.timestamp` | Version generation rule, can be a predefined rule or custom function/string |
| format    | string            | `json`                | Output format, options: `json`, `txt`, `js`                  |
| mode      | string \| string[] | `production`             | Execute only in matching build modes (Webpack mode), default is `production` |

## Predefined Version Rules

The plugin provides multiple predefined version generation rules:

| Rule             | Description                | Example Output              |
| ---------------- | -------------------------- | --------------------------- |
| `timestamp`      | Timestamp (recommended)    | `1717286400000`             |
| `gitCommit`      | Git commit hash            | `a1b2c3d`                   |
| `gitTag`         | Git tag                    | `v1.0.0`                    |
| `date`           | Date format YYYYMMDD       | `20240601`                  |
| `dateTime`       | DateTime YYYYMMDDHHmmss    | `20240601123045`            |
| `dateHash`       | Date + Git short hash      | `20240601-a1b2c3d`          |
| `packageVersion` | Version from package.json  | `1.0.0`                     |

### Usage Examples

```javascript
import { VersionCheckPlugin, VersionCheckRules } from 'version-check-js/plugin';

// Using timestamp
new VersionCheckPlugin({ version: VersionCheckRules.timestamp() }).vitePlugin();

// Using Git commit hash
new VersionCheckPlugin({ version: VersionCheckRules.gitCommit() }).vitePlugin();

// Using custom function
new VersionCheckPlugin({
  version: () => `v${Date.now()}`,
}).vitePlugin();

// Using fixed string
new VersionCheckPlugin({
  version: '1.0.0',
}).vitePlugin();
```

## Output Formats

### JSON Format (default)

```json
{
  "version": "20240601123045"
}
```

### TXT Format

```
20240601123045
```

### JS Format

```javascript
export const VERSION = '20240601123045';
```

## Build Mode Control

The `mode` parameter controls which build modes the plugin executes in:

```javascript
// Execute only in production mode
new VersionCheckPlugin({
  mode: 'production',
}).webpackPlugin();

// Execute in multiple modes
new VersionCheckPlugin({
  mode: ['production', 'staging'],
}).webpackPlugin();

```

## Complete Example

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
