---
layout: home
hero:
  name: Version Check JS
  text: 通用前端版本检测工具
  tagline: 自动判断检测模式，默认自动轮询，保留手动检测
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/ybchen292/version-check
features:
  - title: 自动判断检测模式
    icon: 🔄
    details: 支持 ETag 模式和版本文件模式，根据配置自动选择
  - title: 默认自动轮询
    icon: ⏰
    details: 可配置轮询间隔，默认 10 分钟
  - title: 保留手动检测
    icon: 🔍
    details: 提供手动触发检测的方法
  - title: 内置原生 confirm 提示
    icon: 💬
    details: 检测到更新时自动弹出提示
  - title: 极简配置
    icon: ⚡
    details: 最少仅需一行代码即可使用
  - title: 不局限于框架
    icon: 🌐
    details: 原生 JavaScript 实现，适用于任何前端项目
---

## 什么是 Version Check JS？

Version Check JS 是一个功能强大、轻量级的前端版本检测工具，使用原生 JavaScript 构建。它提供了丰富的功能，用于检测前端应用的版本变化，包括自动轮询、手动检测、自定义回调等。

## 主要优势

- **框架无关**：可与任何 JavaScript 框架一起使用，或不使用框架
- **自动模式判断**：根据配置自动选择 ETag 模式或版本文件模式
- **智能轮询**：默认自动轮询，可配置间隔时间
- **页面可见性监听**：页面隐藏时暂停检测，显示时恢复检测
- **高度可定制**：丰富的配置选项，支持自定义回调和存储
- **性能优化**：减少不必要的网络请求

## 几分钟内开始使用

```javascript
// 简单使用
const versionCheck = new VersionCheck();
versionCheck.start();

// 高级配置
const versionCheck = new VersionCheck({
  url: '/version.json',
  interval: 5 * 60 * 1000,
  message: '发现新版本，是否立即更新？',
  onUpdate: () => {
    if (confirm('发现新版本，是否立即更新？')) {
      versionCheck.reload();
    }
  }
});
versionCheck.start();
```

## 浏览器支持

Version Check JS 适用于所有现代浏览器，包括：

- Chrome
- Firefox
- Safari
- Edge
- Opera

## 许可证

MIT 许可证