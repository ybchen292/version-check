---
layout: home
hero:
  name: Version Check JS
  text: Universal Frontend Version Detection Tool
  tagline: Auto-detect detection mode, default auto-polling, manual detection supported
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/
    - theme: alt
      text: GitHub
      link: https://github.com/ybchen292/version-check
features:
  - title: Auto-detect Detection Mode
    icon: 🔄
    details: Supports both ETag mode and version file mode, automatically selected based on configuration
  - title: Default Auto-polling
    icon: ⏰
    details: Configurable polling interval, default 10 minutes
  - title: Manual Detection Supported
    icon: 🔍
    details: Provides methods for manual trigger detection
  - title: Built-in Native Confirm
    icon: 💬
    details: Automatically shows prompt when update is detected
  - title: Minimal Configuration
    icon: ⚡
    details: Can be used with just one line of code
  - title: Framework Agnostic
    icon: 🌐
    details: Native JavaScript implementation, works with any frontend project
---

## What is Version Check JS?

Version Check JS is a powerful, lightweight frontend version detection tool built with native JavaScript. It provides rich functionality for detecting version changes in frontend applications, including auto-polling, manual detection, custom callbacks, and more.

## Key Advantages

- **Framework Agnostic**: Works with any JavaScript framework or without a framework
- **Auto Mode Detection**: Automatically selects ETag mode or version file mode based on configuration
- **Smart Polling**: Default auto-polling with configurable interval
- **Page Visibility Monitoring**: Pauses detection when page is hidden, resumes when visible
- **Highly Customizable**: Rich configuration options, supports custom callbacks and storage
- **Performance Optimized**: Reduces unnecessary network requests

## Get Started in Minutes

```javascript
// Simple usage
const versionCheck = new VersionCheck();
versionCheck.start();

// Advanced configuration
const versionCheck = new VersionCheck({
  url: '/version.json',
  interval: 5 * 60 * 1000,
  message: 'New version detected, update now?',
  onUpdate: () => {
    if (confirm('New version detected, update now?')) {
      versionCheck.reload();
    }
  }
});
versionCheck.start();
```

## Browser Support

Version Check JS works with all modern browsers, including:

- Chrome
- Firefox
- Safari
- Edge
- Opera

## License

MIT License