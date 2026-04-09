# 方法

## start()

启动自动轮询检测。

### 用法

```javascript
versionCheck.start();
```

### 描述

- 启动后会按照配置的 `interval` 间隔自动执行检测
- 如果实例已经在运行，会忽略此调用
- 启动时会绑定页面可见性变化监听器

## stop()

停止自动轮询检测。

### 用法

```javascript
versionCheck.stop();
```

### 描述

- 停止后会清理定时器
- 不会解绑页面可见性变化监听器

## check()

手动触发单次检测。

### 用法

```javascript
// 手动检测
const hasUpdate = await versionCheck.check();
console.log('是否检测到更新:', hasUpdate);
```

### 返回值

- `Promise<boolean>`: 是否检测到更新

## reload()

重新加载页面（避免缓存）。

### 用法

```javascript
versionCheck.reload();
```

### 描述

- 会在 URL 后添加时间戳参数，避免缓存
- 使用 `window.location.replace()` 进行跳转

## destroy()

销毁实例。

### 用法

```javascript
versionCheck.destroy();
```

### 描述

- 停止轮询
- 解绑页面可见性变化监听器
- 清理所有状态和定时器
- 将配置设为 null

## 页面可见性监听

VersionCheck 会自动监听页面的可见性变化：

- 当页面隐藏时，会暂停检测
- 当页面显示时，会恢复检测

这样可以减少不必要的网络请求，提高性能。