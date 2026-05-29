# 类型定义

本文档包含 Version Check JS 的 TypeScript 类型定义。

## 存储适配器接口

```typescript
export interface VersionCheckStorageAdapter {
  /**
   * 获取存储值
   * @param key 存储键
   */
  get(key: string): string | null;

  /**
   * 设置存储值
   * @param key 存储键
   * @param value 存储值
   */
  set(key: string, value: string): boolean;
}
```

## 版本检测配置项

```typescript
export interface VersionCheckOptions {
  /** 检测地址（默认/：ETag模式；传文件路径如/version.json：版本文件模式） */
  url?: string;

  /** 轮询间隔（毫秒），默认10分钟 */
  interval?: number;

  /** 更新提示文案 */
  message?: string;

  /** 自定义更新回调（优先级高于默认confirm） */
  onUpdate?: () => void;

  /** 错误回调 */
  onError?: (error: Error) => void;

  /** 日志回调 */
  onLog?: (message: string) => void;

  /** 自定义存储配置 */
  storage?: VersionCheckStorageAdapter;

  /** 重新加载时的时间戳参数名，默认't' */
  t?: string;

  /** 版本键名，默认'version_check_key' */
  versionKey?: string;

  /** 是否在执行start方法时立即执行一次版本比对，默认true */
  initialCheck?: boolean;

  /** 是否绑定visibilitychange事件，默认true */
  bindVisibility?: boolean;

  /** 自定义请求函数（优先级高于内部fetch实现，返回Promise对象，值为版本标识） */
  fetchRequest?: (url: string, options?: any | null) => Promise<string | null>;

  /** 自定义fetch选项（优先级高于默认值） */
  fetchOptions?: any | null;
}
```

## 版本检测类

```typescript
export declare class VersionCheck {
  /**
   * 构造函数
   * @param options 配置项
   */
  constructor(options?: VersionCheckOptions);

  /** 当前检测模式 ('etag' | 'file') */
  readonly checkMode: string;

  /** 当前检测状态 */
  readonly isRunning: boolean;

  /**
   * 启动自动轮询检测
   */
  start(): void;

  /**
   * 停止自动轮询检测
   * @param isInternal 是否为内部调用
   */
  stop(isInternal?: boolean): void;

  /**
   * 手动触发单次检测
   */
  check(): Promise<boolean>;

  /**
   * 强制刷新页面（避免缓存）
   */
  reload(): void;

  /**
   * 销毁实例
   */
  destroy(): void;
}

// 默认导出
export default VersionCheck;

// 全局变量声明（用于UMD模块）
declare global {
  interface Window {
    VersionCheck?: typeof VersionCheck;
  }
}
```