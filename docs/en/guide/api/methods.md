# Methods

## start()

Starts auto-polling detection.

### Usage

```javascript
versionCheck.start();
```

### Description

- Starts auto-polling according to the configured `interval`
- If the instance is already running, this call will be ignored
- Binds page visibility change listener when starting

## stop()

Stops auto-polling detection.

### Usage

```javascript
versionCheck.stop();
```

### Description

- Stops and clears the timer
- Does not unbind the page visibility change listener

## check()

Manually triggers a single detection.

### Usage

```javascript
// Manual detection
const hasUpdate = await versionCheck.check();
console.log('Update detected:', hasUpdate);
```

### Return Value

- `Promise<boolean>`: Whether an update is detected

## reload()

Reloads the page (avoiding cache).

### Usage

```javascript
versionCheck.reload();
```

### Description

- Adds a timestamp parameter to the URL to avoid caching
- Uses `window.location.replace()` for navigation

## destroy()

Destroys the instance.

### Usage

```javascript
versionCheck.destroy();
```

### Description

- Stops polling
- Unbinds page visibility change listener
- Clears all state and timers
- Sets configuration to null

## Page Visibility Monitoring

Version Check JS automatically monitors page visibility changes:

- When the page is hidden, detection is paused
- When the page is shown, detection is resumed

This reduces unnecessary network requests and improves performance.