# Constructor

## Basic Usage

```javascript
import VersionCheck from 'version-check-js';

// Minimal configuration
const versionCheck = new VersionCheck();

// Full configuration
const versionCheck = new VersionCheck({
  url: '/version.json',
  interval: 5 * 60 * 1000,
  message: 'New version detected, update now?',
  onUpdate: () => {
    // Custom update callback
  },
  onError: err => {
    // Error callback
  },
  onLog: message => {
    // Log callback
  },
  storage: {
    // Custom storage
    get: key => {
      /* implementation */
    },
    set: (key, value) => {
      /* implementation */
    },
  },
  t: 't',
  versionKey: 'version_check_key',
  initialCheck: true,
  bindVisibility: true,
});
```

## Configuration Options

| Parameter      | Type     | Default                      | Description                                                                                                     |
| -------------- | -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| url            | string   | /                            | Detection URL (default '/': ETag mode; pass file path like '/version.json': version file mode)                  |
| interval       | number   | `10 * 60 * 1000`             | Polling interval (milliseconds), default 10 minutes                                                             |
| message        | string   | 检测到新版本，是否立即刷新？ | Update prompt message                                                                                           |
| onUpdate       | Function | null                         | Custom update callback (priority over default confirm)                                                          |
| onError        | Function | (err)=>console.error(err)    | Error callback                                                                                                  |
| onLog          | Function | null                         | Log callback                                                                                                    |
| storage        | Object   | null                         | Custom storage configuration (get/set methods)                                                                  |
| t              | string   | t                            | Timestamp parameter name when reloading, default 't'                                                            |
| versionKey     | string   | version_check_key            | Key used to store the version identifier, customizable for different projects/environments                      |
| initialCheck   | boolean  | true                         | Whether to run a version check immediately when `start()` is called (instead of waiting for the first interval) |
| bindVisibility | boolean  | true                         | Whether to bind the page visibility listener (pauses polling when hidden, automatically resumes when visible)   |

## Detection Modes

The constructor automatically determines the detection mode based on the `url` parameter:

- **ETag Mode**: When `url` is '/', this mode is used
- **Version File Mode**: When `url` is a specific file path, this mode is used

### ETag Mode

Detects version changes by comparing the ETag header returned by the server.

### Version File Mode

Detects version changes by comparing the `version` field in the version file. The version file should return the following format:

```json
{
  "version": "1.0.0"
}
```
