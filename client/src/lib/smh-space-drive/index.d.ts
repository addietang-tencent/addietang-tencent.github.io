/**
 * smh-web-ui-kit 类型声明文件
 */

import { FC } from 'react'

// ==================== 核心组件 ====================

export interface SpaceDriveProps {
  /** SMH API 基础路径，如 'https://xxx.api.tencentsmh.cn' */
  basePath: string
  /** SMH 媒体库 ID */
  libraryId: string
  /** SMH 空间 ID */
  spaceId: string
  /** accessToken 提供函数（必传），返回 Promise<{ accessToken, expiresAt }> */
  getAccessToken: () => Promise<{ accessToken: string; expiresAt: number }>
  /** 是否启用搜索功能（顶部工具栏搜索框），默认 false */
  enableSearch?: boolean
}

/** 核心组件（完整 UI） */
export const SpaceDrive: FC<SpaceDriveProps>

/** 底层文件管理组件（高级用法） */
export const FilePage: FC<any>

// ==================== 错误处理 ====================

/** SMH 自定义错误类，统一封装所有 SMH 操作的错误信息 */
export class SMHError extends Error {
  /** 固定为 'SMHError' */
  name: 'SMHError'
  /** 操作名称，如 'getFileList'、'uploadFile' */
  operation: string
  /** 错误描述信息 */
  message: string
  /** SMH API 业务错误码，如 'SameFileExists'、'QuotaLimitExceeded' */
  code: string | number
  /** HTTP 状态码，如 401、403、404、500 */
  status: number
  /** 原始错误对象 */
  err: Error

  constructor(
    operation: string,
    message: string,
    code?: string | number,
    status?: number,
    err?: Error
  )
}

// ==================== 配置与 Token 管理 ====================

export interface SmhConfig {
  /** SMH 媒体库 ID */
  libraryId?: string
  /** SMH 空间 ID */
  spaceId?: string
  /** SMH API 基础路径 */
  basePath?: string
  /** accessToken 提供函数（必传），返回 Promise<{ accessToken, expiresAt }> */
  getAccessToken?: () => Promise<{ accessToken: string; expiresAt: number }>
  /** 错误回调函数（可选），接收 { type: 'error', message: string } */
  onError?: (error: { type: string; message: string }) => void
}

/** 设置 SMH 配置 */
export function setSmhConfig(config: SmhConfig): void

/** 获取当前 accessToken */
export function getAccessToken(): string

/** 获取当前 libraryId */
export function getLibraryId(): string

/** 获取当前 spaceId */
export function getSpaceId(): string

/** 获取当前 basePath */
export function getBasePath(): string

/** 获取 token 过期时间信息 */
export function getTokenExpireInfo(): { expiresAt: number }

/** 检查 token 是否即将过期（提前 5 分钟） */
export function isTokenExpiringSoon(): boolean

/** 检查 token 是否已过期 */
export function isTokenExpired(): boolean

/** 确保 token 有效，如果即将过期则重新获取 */
export function ensureValidToken(): Promise<string>

/** 初始化 token（首次调用 getAccessToken 获取） */
export function initToken(): Promise<void>

/** 清除所有配置和 token（包括所有 space 的缓存） */
export function clearConfig(): void

/** 清除指定 space 的 token 缓存，不传则清除当前 space */
export function clearSpaceCache(spaceId?: string): void

// ==================== 文件操作 API ====================

export interface FileListOptions {
  /** 页码，默认 1 */
  page?: number
  /** 每页数量，默认 100 */
  pageSize?: number
}

export interface FileListResult {
  contents: any[]
  [key: string]: any
}

/** 获取文件列表 */
export function getFileList(dirPath?: string, options?: FileListOptions): Promise<FileListResult>

/** 上传文件回调 */
export interface UploadCallbacks {
  /** 上传状态变更回调 */
  onStateChangeCallback?: (state: string) => void
  /** 上传成功回调 */
  onSuccessCallback?: (result: { id: string; name: string }) => void
  /** 上传失败回调 */
  onErrorCallback?: (error: any) => void
  /** 上传进度回调 */
  onProgressCallback?: (percent: number, speed: number) => void
}

/** 上传文件 */
export function uploadFile(file: File, filePath?: string, callbacks?: UploadCallbacks): Promise<any>

/** 删除文件 */
export function delFile(filePath?: string | string[]): Promise<boolean>

/** 删除目录 */
export function delDirectory(dirPath?: string | string[]): Promise<boolean>

/** 创建文件夹 */
export function createDirectory(dirPath?: string | string[]): Promise<any>

/** 移动文件到目标路径 */
export function moveFile(fromPath: string | string[], toPath: string | string[]): Promise<any>

/** 移动目录到目标路径 */
export function moveDirectory(fromPath: string | string[], toPath: string | string[]): Promise<any>

/** 重命名文件 */
export function renameFile(oldPath: string | string[], newPath: string | string[]): Promise<any>

/** 重命名目录 */
export function renameDirectory(oldPath: string | string[], newPath: string | string[]): Promise<any>

/** 获取文件信息 */
export function getFileInfo(filePath?: string | string[]): Promise<any>

/** 获取预览地址 */
export function getPreview(filePath?: string | string[], isDoc?: boolean): Promise<string | any>

/** 获取文档预览 URL（用于 iframe 在线预览） */
export function getDocPreviewUrl(filePath?: string | string[]): Promise<string>

/** 下载文件 */
export function downloadFile(filePath?: string | string[], fileName?: string): Promise<void>

/** 获取文件预览链接或内容 */
export function getFilePreviewUrlOrContent(file: { name?: string; filename?: string; path?: string[] }): Promise<string | any>

/** 搜索选项 */
export interface SearchFilesOptions {
  /** 搜索关键字数组（多个为或关系） */
  keywords?: string[]
  /** 搜索文件后缀（带点号），如 ['.png', '.jpg'] */
  extname?: string[]
  /** 排除的文件后缀（带点号） */
  excludeExtName?: string[]
  /** 文件类型数组：'file' | 'dir' | 'symlink' */
  fileType?: Array<'file' | 'dir' | 'symlink'>
  /** 最小文件大小（Byte） */
  minFileSize?: number
  /** 最大文件大小（Byte） */
  maxFileSize?: number
  /** 修改时间起始（ISO 8601 时间戳字符串） */
  modificationTimeStart?: string
  /** 修改时间截止（ISO 8601 时间戳字符串） */
  modificationTimeEnd?: string
  /** 排序字段 */
  orderBy?: 'name' | 'modificationTime' | 'size' | 'creationTime' | 'localCreationTime' | 'localModificationTime'
  /** 排序方式 */
  orderByType?: 'asc' | 'desc'
  /** 文件标签（或关系） */
  labels?: string[]
  /** 文件分类（或关系） */
  categories?: string[]
  /** 每页数量，取值范围 [1, 100]，默认 50 */
  limit?: number
  /** 分页标识，用于获取后续页 */
  marker?: string
  /** 目录路径过滤，仅返回该目录下的文件（基于 path 前缀匹配），如 'folderA/subFolder' */
  dirPath?: string
}

export interface SearchFilesResult {
  contents: any[]
  nextMarker?: string
}

/** 搜索目录与文件 */
export function searchFiles(options?: SearchFilesOptions): Promise<SearchFilesResult>

/** 获取当前空间的配额和使用量信息 */
export function getSpaceUsage(): Promise<{ used: number; total: number } | null>

/** 重置 SMHClient 实例，传 spaceId 则重置指定 space 的 client，不传则重置所有 */
export function resetClient(spaceId?: string): void

/** 通过 SDK 原生接口续期 accessToken */
export function renewTokenViaSdk(): Promise<{ accessToken: string; expiresAt: number }>
