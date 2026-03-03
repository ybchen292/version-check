# VersionCheck.js

> A lightweight front-end version detection tool that supports automatic polling detection, manual detection, ETag mode and version file mode, with built-in native prompt dialogs. Supports custom prompts and callback functions. Suitable for any HTML-based front-end projects.

[中文版本](./README.md) | [Gitee](https://gitee.com/ybchen292/version-check) | [GitHub](https://github.com/ybchen292/version-check)

---

## 🌟 Key Features

- **Intelligent Dual-mode Detection**:
  - **ETag Mode** (Default): Detect new versions by checking the `ETag` response header of the entry HTML file
  - **Version File Mode**: Detect new versions by checking the `version` field in a specified JSON file
- **Automated Detection**: Automatically detects every 5 minutes by default, customizable interval
- **Flexible Manual Detection**: Support for actively calling detection methods
- **Smart Page Management**: Automatically pauses detection when page is hidden, resumes when page is visible
- **Highly Configurable**: Support for custom prompt messages, update callbacks, error handling, log processing, etc.
- **Multi-environment Compatibility**: Supports UMD module specification, can be used in CommonJS, AMD and browser global environments
- **Robust Storage Mechanism**: Automatic downgrade from localStorage → memory storage
- **Complete Error Handling**: Distinguishes between operation logs and error logs, provides detailed error information

## 📦 Installation Methods

### 1. Via `<script>` Tag (Browser Environment)

```html
<!-- Production environment -->
<script src="dist/index.js"></script>

<!-- Or using CDN -->
<script src="https://cdn.jsdelivr.net/npm/version-check-js@latest/dist/index.js"></script>
```

### 2. Via NPM (Node.js Environment)

```bash
# Install latest version
npm install version-check-js

# Or using yarn
yarn add version-check-js
```

Then import in your code:

```javascript
// CommonJS way
const VersionCheck = require('version-check-js');

// ES6 module way
import VersionCheck from 'version-check-js';
```

### 3. Via unpkg CDN

```html
<script src="https://unpkg.com/version-check-js@latest/dist/index.js"></script>
```

---

## 🚀 Quick Start

### Basic Usage

```javascript
// Instantiate VersionCheck
const versionCheck = new VersionCheck({
  url: '/version.json', // Specify version file path (or default to '/' for ETag mode)
  interval: 60 * 1000, // Set detection interval to 1 minute
  message: 'New version found, refresh now?', // Custom prompt message
});

// Start automatic detection
versionCheck.start();

// Stop automatic detection
// versionCheck.stop();

// Destroy instance
// versionCheck.destroy();

// Manually trigger one detection
versionCheck.check().then(hasUpdate => {
  console.log('Has update:', hasUpdate);
});
```

---

## ⚙️ Configuration Options Detailed

| Parameter  | Type       | Default Value                                          | Description                                                                                                              |
| ---------- | ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `url`      | `string`   | `'/'`                                                  | Detection address:<br>- Default `'/'`: Enable ETag mode<br>- File path (e.g., `/version.json`): Enable version file mode |
| `interval` | `number`   | `10 * 60 * 1000` (10 minutes)                          | Polling detection interval (milliseconds), recommended not less than 30 seconds                                          |
| `message`  | `string`   | `'New version detected, refresh now?'`                 | Update prompt message, only effective when `onUpdate` is not set                                                         |
| `onUpdate` | `Function` | `null`                                                 | Custom update callback function (higher priority than default confirm dialog)                                            |
| `onError`  | `Function` | `(err) => console.error('Version check failed:', err)` | Error callback function, receives error object as parameter                                                              |
| `onLog`    | `Function` | `null`                                                 | Operation log callback function, used to record normal operation information                                             |
| `storage`  | `Object`   | `null`                                                 | Custom storage configuration (requires `get`, `set`, `remove` methods), defaults to localStorage                         |
| `t`        | `string`   | `t`                                                    | The timestamp parameter name when reloading                                                                              |

### Configuration Best Practices

```javascript
const versionCheck = new VersionCheck({
  // Basic configuration
  url: '/api/version', // Recommended to use specific API interface
  interval: 5 * 60 * 1000, // 5-minute detection (recommended for production)

  // User experience optimization
  message: 'New version available, update now?',

  // Custom callbacks
  onUpdate: () => {
    // Custom update logic
    console.log('Executing update...');
    // Can add animations, notifications, etc.
    window.location.reload();
  },

  // Error handling
  onError: error => {
    // Production environment can send error logs to monitoring system
    console.error('Version check exception:', error);
    // Sentry.captureException(error);
  },

  // Operation logs
  onLog: message => {
    // Record operation logs for debugging
    console.log('VersionCheck:', message);
  },
});
```

## 🔧 Complete API Documentation

### Instance Methods

#### `start()`

Start automatic polling detection.

```javascript
versionCheck.start(); // Returns undefined
```

#### `stop([isInternal])`

Stop automatic polling detection.

```javascript
versionCheck.stop(); // External call, triggers onLog
versionCheck.stop(true); // Internal call, doesn't trigger onLog
```

#### `check()`

Manually trigger one detection, returns Promise.

```javascript
try {
  const hasUpdate = await versionCheck.check();
  if (hasUpdate) {
    console.log('New version detected!');
  }
} catch (error) {
  console.error('Detection failed:', error);
}
```

#### `reload()`

Force refresh page, automatically handles URL parameter deduplication.

```javascript
versionCheck.reload(); // Will add timestamp parameter to avoid cache
```

#### `destroy()`

Destroy instance, clean up all resources (timers, event listeners, storage references, etc.).

```javascript
versionCheck.destroy(); // Instance cannot be used again after destruction
```

### Static Properties

#### `checkMode`

Get current detection mode.

```javascript
console.log(versionCheck.checkMode); // 'etag' or 'file'
```

#### `isRunning`

Get current detection status.

```javascript
console.log(versionCheck.isRunning); // boolean
```

## 📝 Usage Scenarios and Examples

### Integration with Axios Interceptors

```javascript
// axios configuration
import axios from 'axios';
import VersionCheck from 'version-check-js';

const versionCheck = new VersionCheck({
  url: '/api/version',
  interval: 300000,
});

// Perform version check in request interceptor
axios.interceptors.request.use(
  async config => {
    if (process.env.NODE_ENV === 'production') {
      try {
        await versionCheck.check();
      } catch (error) {
        console.warn('Version check failed:', error);
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

versionCheck.start();
```

## 📝 Usage Scenarios and Examples

### Integration with Axios Interceptors

```javascript
// axios configuration
import axios from 'axios';
import VersionCheck from 'version-check-js';

const versionCheck = new VersionCheck({
  url: '/api/version',
  interval: 300000,
});

// Perform version check in request interceptor
axios.interceptors.request.use(
  async config => {
    if (process.env.NODE_ENV === 'production') {
      try {
        await versionCheck.check().then(flag => {
          console.log(flag);
        });
      } catch (error) {
        console.warn('Version check failed:', error);
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

versionCheck.start();
```

---

### Storage Strategy Configuration

```javascript
// Custom storage adapter
const customStorage = {
  get: function (key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Fallback to cookie
      return this._getFromCookie(key);
    }
  },

  set: function (key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // Fallback to cookie
      return this._setToCookie(key, value);
    }
  },
  // Cookie operation methods
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

### Error Monitoring Integration

```javascript
const versionCheck = new VersionCheck({
  onError: error => {
    // Send to custom monitoring API
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
    // Record operation logs
  },
});
```

### Performance Optimization Recommendations

```javascript
// Production environment configuration
const prodConfig = {
  url: '/api/version',
  interval: 5 * 60 * 1000, // 5 minutes (avoid too frequent)
  onError: error => {
    // Production environment silent handling, avoid affecting user experience
    console.debug('Version check error:', error.message);
  },
};

// Development environment configuration
const devConfig = {
  url: '/api/version',
  interval: 30 * 1000, // 30 seconds (for debugging)
  onLog: message => {
    // Development environment detailed logs
    console.log('🔧 VersionCheck:', message);
  },
};

const versionCheck = new VersionCheck(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);
```

## 📄 License

MIT License
