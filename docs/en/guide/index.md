# Guide

This guide will help you quickly get started with Version Check JS and understand its core features and usage.

## Installation

Install using npm:

```bash
npm install version-check-js
```

## Quick Start

### Basic Usage

```javascript
import VersionCheck from 'version-check-js';

// Create instance
const versionCheck = new VersionCheck();

// Start auto-polling detection
versionCheck.start();
```

### Custom Configuration

```javascript
const versionCheck = new VersionCheck({
  // Detection URL (version file mode)
  url: '/version.json',
  // Polling interval (5 minutes)
  interval: 5 * 60 * 1000,
  // Update prompt message
  message: 'New version detected, update now?',
  // Custom update callback
  onUpdate: () => {
    if (confirm('New version detected, update now?')) {
      versionCheck.reload();
    }
  },
  // Error callback
  onError: (err) => {
    console.error('Version check failed:', err);
  },
  // Log callback
  onLog: (message) => {
    console.log('Version check log:', message);
  }
});

versionCheck.start();
```

## Detection Modes

Version Check JS supports two detection modes:

### ETag Mode (Default)

When `url` is '/', ETag mode is used. This mode detects version changes by comparing the ETag header returned by the server.

```javascript
// ETag mode (default)
const versionCheck = new VersionCheck({
  url: '/' // default value
});
```

### Version File Mode

When `url` is a specific file path, version file mode is used. This mode detects version changes by comparing the `version` field in the version file.

```javascript
// Version file mode
const versionCheck = new VersionCheck({
  url: '/version.json'
});
```

The version file should return the following format:

```json
{
  "version": "1.0.0"
}
```

## Manual Detection

In addition to auto-polling detection, you can also manually trigger detection:

```javascript
// Manually trigger detection
const hasUpdate = await versionCheck.check();
console.log('Update detected:', hasUpdate);
```

## Stop and Resume Detection

### Stop Detection

```javascript
// Stop auto-polling detection
versionCheck.stop();
```

### Resume Detection

```javascript
// Resume auto-polling detection
versionCheck.start();
```

## Destroy Instance

When you no longer need version detection, you can destroy the instance:

```javascript
// Destroy instance
versionCheck.destroy();
```

## Page Visibility Monitoring

Version Check JS automatically monitors page visibility changes:

- When the page is hidden, detection is paused
- When the page is shown, detection is resumed

This reduces unnecessary network requests and improves performance.

## Custom Storage

You can customize the storage implementation for storing version identifiers:

```javascript
const versionCheck = new VersionCheck({
  storage: {
    get: (key) => {
      // Get value from custom storage
      return localStorage.getItem(key);
    },
    set: (key, value) => {
      // Store value to custom storage
      localStorage.setItem(key, value);
      return true;
    }
  }
});
```

## FAQ

### Why is no update detected?

1. **Server Configuration Issue**: Ensure the server correctly sets ETag or provides the version file.
2. **Cache Issue**: Ensure requests are not cached by the browser. Version Check JS has already set `cache: 'no-cache'`.
3. **Network Issue**: Check if the network connection is normal.

### How to use in different frameworks?

Version Check JS is implemented in native JavaScript and works with any frontend framework:

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