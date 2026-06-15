/**
 * 通用前端版本检测工具
 * 自动判断检测模式（ETag/版本文件）| 默认自动轮询 | 保留手动检测 | 内置原生confirm提示
 * @module version-check-js
 */

interface StorageApi {
  get: (key: string) => string | null;
  set: (key: string, value: string) => boolean;
}

interface FetchOptions {
  method?: string;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  [key: string]: any;
}

interface VersionCheckOptions {
  /** 检测地址（默认/：ETag 模式；传文件路径如/version.json：版本文件模式） */
  url?: string;
  /** 轮询间隔（毫秒），默认 10 分钟 */
  interval?: number;
  /** 更新提示文案 */
  message?: string;
  /** 自定义更新回调（优先级高于默认 confirm） */
  onUpdate?: (() => void) | null;
  /** 错误回调 */
  onError?: ((err: Error) => void) | null;
  /** 日志回调 */
  onLog?: ((message: string) => void) | null;
  /** 自定义存储配置（get/set 方法） */
  storage?: StorageApi | null;
  /** 重新加载时的时间戳参数名，默认't' */
  t?: string;
  /** 存储版本标识的key */
  versionKey?: string;
  /** 启动时是否立即执行一次检测 */
  initialCheck?: boolean;
  /** 是否绑定页面可见性变化监听 */
  bindVisibility?: boolean;
  /** 自定义请求函数，优先级高于内部fetch实现 */
  fetchRequest?: ((url: string, options: FetchOptions) => Promise<any>) | null;
  /** 自定义fetch选项，优先级高于默认值 */
  fetchOptions?: FetchOptions;
}

interface VersionCheckConfig {
  url: string;
  interval: number;
  message: string;
  onUpdate: (() => void) | null;
  onError: ((err: Error) => void) | null;
  onLog: ((message: string) => void) | null;
  storage: StorageApi | null;
  t: string;
  versionKey: string;
  initialCheck: boolean;
  bindVisibility: boolean;
  fetchRequest: ((url: string, options: FetchOptions) => Promise<any>) | null;
  fetchOptions: FetchOptions;
}

type CheckMode = 'etag' | 'file';

class VersionCheck {
  private config: VersionCheckConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private memoryStorage: string | null = null;
  private storageApi: StorageApi;
  private versionKey: string;
  private checkMode: CheckMode;
  private isRunning: boolean = false;
  private _visibilityHandler: (() => void) | null = null;

  /**
   * 构造函数：初始化配置和存储（极简配置）
   * @param options 配置项
   */
  constructor(options: VersionCheckOptions = {}) {
    // 验证输入参数类型
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('options 必须是对象类型');
    }

    // 定义默认配置
    this.config = {
      url: '/',
      interval: 10 * 60 * 1000,
      message: '检测到新版本，是否立即刷新？',
      onUpdate: null,
      onError: (err: Error) => console.error('VersionCheck 失败：', err),
      onLog: null,
      storage: null,
      t: 't',
      versionKey: 'version_check_key',
      initialCheck: true,
      bindVisibility: true,
      fetchRequest: null,
      fetchOptions: {},
      ...options,
    };

    // 初始化核心状态
    this.memoryStorage = null;
    this.storageApi = this._initStorage();
    this.versionKey = this.config.versionKey;
    this.checkMode = this._getCheckMode();
    this.isRunning = false;

    if (this.config.bindVisibility) {
      this._bindVisibilityListener();
    }
  }

  /**
   * 日志输出
   * @private
   * @param message 日志信息
   */
  private _log(message: string): void {
    if (typeof this.config.onLog === 'function') {
      this.config.onLog(message);
    }
  }

  /**
   * 绑定页面可见性变化监听器
   * @private
   */
  private _bindVisibilityListener(): void {
    this._unbindVisibilityListener();
    this._visibilityHandler = this._handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._visibilityHandler);
  }

  /**
   * 解绑页面可见性变化监听器
   * @private
   */
  private _unbindVisibilityListener(): void {
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      this._visibilityHandler = null;
    }
  }

  /**
   * 处理页面可见性变化
   * @private
   */
  private _handleVisibilityChange(): void {
    if (!this.isRunning) return;

    if (document.hidden) {
      this._pauseDetection();
    } else {
      this._resumeDetection();
    }
  }

  /**
   * 暂停检测（页面隐藏时）
   * @private
   */
  private _pauseDetection(): void {
    this.stop(true);
    this._log('页面隐藏，暂停VersionCheck');
  }

  /**
   * 恢复检测（页面显示时）
   * @private
   */
  private _resumeDetection(): void {
    this.start();
    this._log('页面显示，恢复VersionCheck');
  }

  /**
   * 初始化存储适配器（优先自定义 → localStorage → 内存）
   * @returns 存储接口（get/set）
   */
  private _initStorage(): StorageApi {
    const defaultStorage: StorageApi = {
      get: (key: string): string | null => {
        if (typeof key !== 'string') {
          this.config.onError?.(new Error('存储键必须是字符串'));
          return null;
        }

        try {
          if (window.localStorage) {
            return localStorage.getItem(key);
          }
        } catch (e: any) {
          this.config.onError?.(new Error(`localStorage get 失败: ${e.message}`));
        }

        return this.memoryStorage;
      },

      set: (key: string, value: string): boolean => {
        if (typeof key !== 'string') {
          this.config.onError?.(new Error('存储键必须是字符串'));
          return false;
        }

        try {
          if (window.localStorage) {
            localStorage.setItem(key, String(value));
            return true;
          }
        } catch (e: any) {
          this.config.onError?.(new Error(`localStorage set 失败: ${e.message}`));
        }

        this.memoryStorage = String(value);
        return true;
      },
    };

    return this.config.storage || defaultStorage;
  }

  /**
   * 自动判断检测模式
   * @private
   * @returns 'etag' | 'file'
   */
  private _getCheckMode(): CheckMode {
    const { url } = this.config;
    const isVersionFile = url !== '/' && /\.\w+$/.test(url);
    return isVersionFile ? 'file' : 'etag';
  }

  /**
   * 简化的网络请求（依赖循环调用机制）
   * @private
   * @param url 请求地址
   * @param options 请求选项
   * @returns fetch 响应
   */
  private async _fetchRequest(url: string, options: FetchOptions): Promise<Response> {
    try {
      const response = await fetch(url, options);

      // 4xx 错误记录但不重试（客户端错误）
      if (response.status >= 400 && response.status < 500) {
        this.config.onError?.(new Error(`客户端错误 HTTP ${response.status}: ${response.statusText}`));
        return response;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      this.config.onError?.(new Error(`网络请求失败: ${error.message}`));
      throw error;
    }
  }

  /**
   * ETag模式检测逻辑
   * @private
   * @returns 是否检测到更新
   */
  private async _checkByEtag(): Promise<boolean> {
    const { url, fetchRequest, fetchOptions } = this.config;

    try {
      const options: FetchOptions = {
        method: 'HEAD',
        cache: 'no-cache',
        credentials: 'same-origin',
        ...fetchOptions,
      };
      let newVersion: string | null = null;
      if (typeof fetchRequest === 'function') {
        newVersion = await fetchRequest(url, options);
      } else {
        const response = await this._fetchRequest(url, options);

        if (!response.ok) {
          throw new Error(`ETag 请求失败，状态码：${response.status}`);
        }

        newVersion = response.headers.get('ETag');
        if (!newVersion) throw new Error('服务器未返回 ETag，检测失败');
      }

      return this._compareVersion(newVersion);
    } catch (error: any) {
      this.config.onError?.(error);
      return false;
    }
  }

  /**
   * 版本文件模式检测逻辑
   * @private
   * @returns 是否检测到更新
   */
  private async _checkByVersionFile(): Promise<boolean> {
    const { url, fetchRequest, fetchOptions } = this.config;
    const options: FetchOptions = {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
      ...fetchOptions,
    };
    let newVersion: string | null = null;
    try {
      if (typeof fetchRequest === 'function') {
        newVersion = await fetchRequest(url, options);
      } else {
        const response = await this._fetchRequest(url, options);

        if (!response.ok) {
          throw new Error(`版本文件请求失败，状态码：${response.status}`);
        }

        const result = await response.json();

        if (!result || typeof result !== 'object') {
          throw new Error('版本文件格式错误，必须返回对象');
        }
        newVersion = result.version;
        if (!newVersion) throw new Error('版本文件格式错误，缺少 version 字段');
      }
      return this._compareVersion(newVersion);
    } catch (error: any) {
      this.config.onError?.(error);
      return false;
    }
  }

  /**
   * 对比版本标识
   * @private
   * @param newVersion 最新版本标识
   * @returns 是否检测到更新
   */
  private _compareVersion(newVersion: string | null): boolean {
    if (!newVersion) return false;
    const oldVersion = this.storageApi.get(this.versionKey);

    if (!oldVersion) {
      this.storageApi.set(this.versionKey, newVersion);
      return false;
    }

    if (newVersion == oldVersion) return false;

    this._triggerUpdate(newVersion);
    return true;
  }

  /**
   * 触发更新回调
   * @private
   */
  private _triggerUpdate(newVersion: string | null): void {
    if (!newVersion) return;
    const { onUpdate, message } = this.config;

    if (typeof onUpdate === 'function') {
      this.storageApi.set(this.versionKey, newVersion);
      onUpdate();
      return;
    }

    // 检测到更新时暂停轮询
    this.stop(true);
    setTimeout(() => {
      const isConfirm = window.confirm(message);
      if (isConfirm) {
        this.storageApi.set(this.versionKey, newVersion);
        this.reload();
      } else {
        this.start();
      }
    }, 0);
  }

  /**
   * 重新加载页面（避免缓存）
   */
  reload(): void {
    let currentUrl = window.location.href;
    const param = this.config.t;
    currentUrl = currentUrl.replace(new RegExp(`[?&]${param}=\\d+`, 'g'), '');
    const separator = currentUrl.includes('?') ? '&' : '?';
    const newUrl = `${currentUrl}${separator}${param}=${Date.now()}`;
    window.location.replace(newUrl);
  }

  /**
   * 手动触发单次检测
   * @param isInternal 是否为内部调用
   * @returns 是否检测到更新
   */
  async check(isInternal: boolean = false): Promise<boolean> {
    this._log(`开始执行${isInternal ? '检测' : '手动检测'}，模式: ${this.checkMode}`);

    try {
      const hasUpdate = this.checkMode === 'etag' ? await this._checkByEtag() : await this._checkByVersionFile();
      this._log(`${isInternal ? '检测' : '手动检测'}完成，检测到更新状态: ${hasUpdate}`);
      return hasUpdate;
    } catch (error: any) {
      this._log(`${isInternal ? '检测' : '手动检测'}失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 启动自动轮询检测
   */
  start(): void {
    if (this.isRunning && this.timer) {
      this._log('VersionCheck已在运行中');
      return;
    }

    this.isRunning = true;
    this._clearTimer();

    // 启动轮询
    const poll = async () => {
      try {
        await this.check(true);
      } catch (error: any) {
        this.config.onError?.(new Error(`轮询检测失败: ${error.message}`));
      }
      if (this.isRunning && this.timer) {
        this.timer = setTimeout(poll, this.config.interval);
      }
    };

    if (this.config.initialCheck) {
      this.timer = setTimeout(poll, 0);
    } else {
      this.timer = setTimeout(poll, this.config.interval);
    }

    this._log('VersionCheck已启动');
  }

  /**
   * 停止自动轮询检测
   * @param isInternal 是否为内部调用。用来区分是外部停止还是页面隐藏时停止的
   */
  stop(isInternal: boolean = false): void {
    this._clearTimer();

    if (!isInternal) {
      this.isRunning = false;
    }
    this._log('VersionCheck已停止');
  }

  /**
   * 清理定时器
   * @private
   */
  private _clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.stop();
    this._unbindVisibilityListener();
    this.memoryStorage = null;
    this.timer = null;
    this.storageApi = null as any;
    this.checkMode = null as any;
    this.isRunning = false;
    this._log('VersionCheck实例已销毁');
    this.config = null as any;
  }
}

export default VersionCheck;
