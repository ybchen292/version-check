# Type Definitions

This document contains the TypeScript type definitions for Version Check JS.

## Storage Adapter Interface

```typescript
export interface VersionCheckStorageAdapter {
  /**
   * Get stored value
   * @param key Storage key
   */
  get(key: string): string | null;

  /**
   * Set stored value
   * @param key Storage key
   * @param value Storage value
   */
  set(key: string, value: string): boolean;
}
```

## Version Check Options

```typescript
export interface VersionCheckOptions {
  /** Detection URL (default '/': ETag mode; file path like '/version.json': version file mode) */
  url?: string;

  /** Polling interval (milliseconds), default 10 minutes */
  interval?: number;

  /** Update prompt message */
  message?: string;

  /** Custom update callback (priority over default confirm) */
  onUpdate?: () => void;

  /** Error callback */
  onError?: (error: Error) => void;

  /** Log callback */
  onLog?: (message: string) => void;

  /** Custom storage configuration */
  storage?: VersionCheckStorageAdapter;

  /** Timestamp parameter name when reloading, default 't' */
  t?: string;
}
```

## Version Check Class

```typescript
export declare class VersionCheck {
  /**
   * Constructor
   * @param options Configuration options
   */
  constructor(options?: VersionCheckOptions);

  /** Current detection mode ('etag' | 'file') */
  readonly checkMode: string;

  /** Current detection status */
  readonly isRunning: boolean;

  /**
   * Start auto-polling detection
   */
  start(): void;

  /**
   * Stop auto-polling detection
   * @param isInternal Whether it's an internal call
   */
  stop(isInternal?: boolean): void;

  /**
   * Manually trigger a single detection
   */
  check(): Promise<boolean>;

  /**
   * Force reload the page (avoid cache)
   */
  reload(): void;

  /**
   * Destroy instance
   */
  destroy(): void;
}

// Default export
export default VersionCheck;

// Global variable declaration (for UMD module)
declare global {
  interface Window {
    VersionCheck?: typeof VersionCheck;
  }
}
```