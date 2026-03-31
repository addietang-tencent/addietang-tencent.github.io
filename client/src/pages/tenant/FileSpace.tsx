/**
 * FileSpace - 文件空间（当前龙虾实例的文件管理）
 * Design: 「流动蓝图」Fluid Blueprint
 * - 文件表格 + 面包屑导航
 * - 支持搜索、排序、文件操作
 * - 网格/列表视图切换
 * - 拖拽上传区域
 * - 使用 smh-space-drive 服务层接入真实云盘能力
 */
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search,
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  File,
  FolderOpen,
  Folder,
  Download,
  Trash2,
  MoreVertical,
  HardDrive,
  ArrowUpDown,
  Eye,
  Clock,
  Upload,
  RefreshCw,
  FileArchive,
  FileVideo,
  FileAudio,
  Grid3X3,
  List,
  FolderPlus,
  ChevronRight,
  Home,
  Edit3,
  FolderInput,
  Loader2,
} from "lucide-react";

// ─── SMH 服务层导入 ──────────────────────────────────────────────────────────

// @ts-ignore — smh-space-drive 为预构建 JS 包，无内置类型声明
import {
  setSmhConfig,
  initToken,
  clearConfig,
  isTokenExpiringSoon,
  ensureValidToken,
  // @ts-ignore
} from "@/lib/smh-space-drive/smh-space-drive";

import {
  getFileList,
  uploadFile,
  delFile,
  delDirectory,
  createDirectory,
  moveFile,
  moveDirectory,
  renameFile,
  renameDirectory,
  downloadFile,
  getFileInfo,
  getPreview,
  getDocPreviewUrl,
  getFilePreviewUrlOrContent,
  getSpaceUsage,
  resetClient,
  // @ts-ignore — smh-space-drive 为预构建 JS 包，无内置类型声明
} from "@/lib/smh-space-drive/smh-space-drive";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "image" | "code" | "spreadsheet" | "archive" | "video" | "audio" | "other";
  size: string;
  sizeBytes: number;
  modifiedAt: string;
  parentPath: string;
  /** SMH 原始类型：'file' | 'dir' */
  rawType?: string;
}

type SortField = "name" | "size" | "modifiedAt";
type SortOrder = "asc" | "desc";
type ViewMode = "list" | "grid";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** 根据文件扩展名推断文件类型 */
function inferFileType(name: string, rawType?: string): FileItem["type"] {
  if (rawType === "dir") return "folder";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, FileItem["type"]> = {
    // 文档
    doc: "document", docx: "document", pdf: "document", pptx: "document", ppt: "document",
    // 图片
    png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image", webp: "image", bmp: "image",
    // 代码
    js: "code", ts: "code", jsx: "code", tsx: "code", py: "code", java: "code",
    go: "code", rs: "code", c: "code", cpp: "code", h: "code", css: "code",
    html: "code", json: "code", yaml: "code", yml: "code", xml: "code",
    md: "code", sh: "code", bat: "code", sql: "code", toml: "code",
    // 表格
    xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
    // 压缩包
    zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
    // 视频
    mp4: "video", avi: "video", mov: "video", mkv: "video", wmv: "video", flv: "video",
    // 音频
    mp3: "audio", wav: "audio", flac: "audio", aac: "audio", ogg: "audio",
  };
  return map[ext] ?? "other";
}

/** 将 SMH API 返回的文件条目转换为 FileItem */
function toFileItem(entry: any, parentPath: string): FileItem {
  const rawType = entry.type as string; // 'file' | 'dir'
  const name = entry.name as string;
  const sizeBytes = entry.size ?? 0;
  const modTime = entry.modificationTime ?? entry.creationTime ?? "";
  // 格式化时间：2026-03-28T14:30:00Z → 2026-03-28 14:30
  const modifiedAt = modTime
    ? modTime.replace("T", " ").replace(/:\d{2}(\.\d+)?Z?$/, "").slice(0, 16)
    : "—";

  return {
    id: `${parentPath}/${name}`,
    name,
    type: inferFileType(name, rawType),
    size: rawType === "dir" ? "—" : formatBytes(sizeBytes),
    sizeBytes,
    modifiedAt,
    parentPath,
    rawType,
  };
}

function getFileIcon(type: FileItem["type"], large = false) {
  const cls = large ? "w-8 h-8" : "w-5 h-5";
  switch (type) {
    case "folder": return <Folder className={`${cls} text-amber-500`} />;
    case "document": return <FileText className={`${cls} text-blue-500`} />;
    case "image": return <FileImage className={`${cls} text-pink-500`} />;
    case "code": return <FileCode className={`${cls} text-green-500`} />;
    case "spreadsheet": return <FileSpreadsheet className={`${cls} text-emerald-500`} />;
    case "archive": return <FileArchive className={`${cls} text-orange-500`} />;
    case "video": return <FileVideo className={`${cls} text-purple-500`} />;
    case "audio": return <FileAudio className={`${cls} text-indigo-500`} />;
    default: return <File className={`${cls} text-gray-400`} />;
  }
}

function getFileTypeName(type: FileItem["type"]) {
  const map: Record<string, string> = {
    folder: "文件夹", document: "文档", image: "图片", code: "代码",
    spreadsheet: "表格", archive: "压缩包", video: "视频", audio: "音频", other: "其他",
  };
  return map[type] ?? "其他";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

/** 拼接文件路径 */
function joinPath(parentPath: string, name: string): string {
  if (!parentPath || parentPath === "/") return name;
  return `${parentPath}/${name}`;
}

/** 将 UI 路径转换为 SMH API 路径（去掉开头的 /） */
function toSmhPath(uiPath: string): string {
  if (uiPath === "/") return "";
  return uiPath.startsWith("/") ? uiPath.slice(1) : uiPath;
}

/** 中间省略长路径，保留开头和末尾（含文件后缀），如 /folder/sub/very-long-name.jpg → /folder/s...name.jpg */
function ellipsisMiddle(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  // 找最后一个 / 后面的部分作为文件名
  const lastSlash = text.lastIndexOf("/");
  const suffix = lastSlash >= 0 ? text.slice(lastSlash) : text;
  // 找文件扩展名
  const dotIdx = suffix.lastIndexOf(".");
  const ext = dotIdx > 0 ? suffix.slice(dotIdx) : "";
  // 保留尾部：至少保留后缀 + 3 个字符
  const tailKeep = Math.max(ext.length + 3, Math.floor(maxLen * 0.3));
  const headKeep = maxLen - tailKeep - 3; // 3 for "..."
  if (headKeep < 1) return text.slice(0, maxLen - 3) + "...";
  return text.slice(0, headKeep) + "..." + text.slice(text.length - tailKeep);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface FileSpaceProps {
  clawName: string;
  clawId: string;
  /** SMH API 基础路径 */
  basePath: string;
  /** SMH 媒体库 ID */
  libraryId: string;
  /** SMH 空间 ID */
  spaceId: string;
  /** accessToken 提供函数 */
  getAccessToken: () => Promise<{ accessToken: string; expiresAt: number }>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FileSpace({
  clawName,
  basePath,
  libraryId,
  spaceId,
  getAccessToken: getAccessTokenFn,
}: FileSpaceProps) {
  const [currentPath, setCurrentPath] = useState("/");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("modifiedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [deleteConfirm, setDeleteConfirm] = useState<FileItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // 数据状态
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [spaceUsage, setSpaceUsage] = useState<{ used: number; total: number } | null>(null);

  // 重命名对话框
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // 新建文件夹对话框
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // 移动对话框
  const [moveTarget, setMoveTarget] = useState<FileItem | null>(null);
  const [moveDestPath, setMoveDestPath] = useState("/");
  const [moveBrowsePath, setMoveBrowsePath] = useState("/");
  const [moveFolders, setMoveFolders] = useState<{ name: string; path: string }[]>([]);
  const [moveLoading, setMoveLoading] = useState(false);

  // 上传中状态
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(0);
  const [uploadFailed, setUploadFailed] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tokenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── SMH 初始化 ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 设置 SMH 配置
        setSmhConfig({
          basePath,
          libraryId,
          spaceId,
          getAccessToken: getAccessTokenFn,
          onError: ({ message }: { message: string }) => {
            toast.error(`文件服务错误: ${message}`);
          },
        });

        // 初始化 Token
        await initToken();

        if (!cancelled) {
          setInitialized(true);
        }
      } catch (err) {
        console.error("[FileSpace] SMH 初始化失败:", err);
        if (!cancelled) {
          toast.error("文件服务初始化失败，请检查配置");
        }
      }
    }

    init();

    // Token 定时续期（每 30 秒检查一次）
    tokenTimerRef.current = setInterval(() => {
      if (isTokenExpiringSoon()) {
        ensureValidToken().catch((err: any) =>
          console.error("[FileSpace] Token 续期失败:", err)
        );
      }
    }, 30 * 1000);

    return () => {
      cancelled = true;
      if (tokenTimerRef.current) {
        clearInterval(tokenTimerRef.current);
        tokenTimerRef.current = null;
      }
      clearConfig();
    };
  }, [basePath, libraryId, spaceId, getAccessTokenFn]);

  // ─── 加载文件列表 ────────────────────────────────────────────────────────

  const loadFiles = useCallback(async () => {
    if (!initialized) return;
    setLoading(true);
    try {
      const smhPath = toSmhPath(currentPath);
      const data = await getFileList(smhPath, { page: 1, pageSize: 200 });
      const contents = data?.contents ?? [];
      const items: FileItem[] = contents.map((entry: any) => toFileItem(entry, currentPath));
      setFiles(items);
      setTotalFileCount(data?.totalNum ?? items.length);
    } catch (err) {
      console.error("[FileSpace] 加载文件列表失败:", err);
      toast.error("加载文件列表失败");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [initialized, currentPath]);

  // 初始化完成后 & 路径变化时加载文件
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 加载空间使用量
  useEffect(() => {
    if (!initialized) return;
    getSpaceUsage()
      .then((usage: any) => {
        if (usage) setSpaceUsage(usage);
      })
      .catch(() => {});
  }, [initialized]);

  // ─── 统计 ────────────────────────────────────────────────────────────────

  const fileCount = files.filter((f) => f.type !== "folder").length;
  const folderCount = files.filter((f) => f.type === "folder").length;

  // ─── 搜索 + 排序 ────────────────────────────────────────────────────────

  const filteredFiles = useMemo(() => {
    let result = files.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );
    result.sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name, "zh-CN"); break;
        case "size": cmp = a.sizeBytes - b.sizeBytes; break;
        case "modifiedAt": cmp = a.modifiedAt.localeCompare(b.modifiedAt); break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [files, search, sortField, sortOrder]);

  // ─── 面包屑路径段 ────────────────────────────────────────────────────────

  const breadcrumbs = useMemo(() => {
    if (currentPath === "/") return [{ label: "根目录", path: "/" }];
    const segments = currentPath.split("/").filter(Boolean);
    const crumbs = [{ label: "根目录", path: "/" }];
    let accPath = "";
    for (const seg of segments) {
      accPath += "/" + seg;
      crumbs.push({ label: seg, path: accPath });
    }
    return crumbs;
  }, [currentPath]);

  // ─── 操作处理 ────────────────────────────────────────────────────────────

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  const handleOpenFolder = (folderName: string) => {
    const newPath = currentPath === "/" ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
    setSearch("");
  };

  /** 删除文件/文件夹 */
  const handleDelete = async (file: FileItem) => {
    setDeleteConfirm(null);
    const filePath = toSmhPath(joinPath(file.parentPath, file.name));
    try {
      if (file.type === "folder") {
        await delDirectory(filePath);
      } else {
        await delFile(filePath);
      }
      toast.success(`「${file.name}」已删除`);
      loadFiles();
      // 刷新空间使用量
      getSpaceUsage().then((u: any) => u && setSpaceUsage(u)).catch(() => {});
    } catch (err) {
      console.error("[FileSpace] 删除失败:", err);
      toast.error(`删除「${file.name}」失败`);
    }
  };

  /** 下载文件 */
  const handleDownload = async (file: FileItem) => {
    const filePath = toSmhPath(joinPath(file.parentPath, file.name));
    try {
      await downloadFile(filePath, file.name);
      toast.success(`「${file.name}」开始下载`);
    } catch (err) {
      console.error("[FileSpace] 下载失败:", err);
      toast.error(`下载「${file.name}」失败`);
    }
  };

  /** 预览文件 */
  const handlePreview = async (file: FileItem) => {
    const filePath = toSmhPath(joinPath(file.parentPath, file.name));
    try {
      const result = await getFilePreviewUrlOrContent({ name: file.name, path: filePath.split("/") });
      if (typeof result === "string" && (result.startsWith("http") || result.startsWith("blob"))) {
        window.open(result, "_blank");
      } else {
        toast.info("预览内容已获取，请查看控制台");
        console.log("[FileSpace] 预览内容:", result);
      }
    } catch (err) {
      console.error("[FileSpace] 预览失败:", err);
      toast.error("预览失败");
    }
  };

  /** 上传单个文件（内部使用） */
  const uploadSingleFile = (fileObj: globalThis.File): Promise<boolean> => {
    return new Promise((resolve) => {
      const filePath = toSmhPath(
        currentPath === "/" ? fileObj.name : `${currentPath}/${fileObj.name}`
      ).replace(/^\//, "");
      try {
        uploadFile(fileObj, filePath, {
          onProgressCallback: (_percent: number) => {
            // 单文件进度暂不显示，使用整体完成数作为进度指示
          },
          onSuccessCallback: () => {
            resolve(true);
          },
          onErrorCallback: (err: any) => {
            console.error(`[FileSpace] 上传「${fileObj.name}」失败:`, err);
            resolve(false);
          },
        });
      } catch (err) {
        console.error(`[FileSpace] 上传「${fileObj.name}」失败:`, err);
        resolve(false);
      }
    });
  };

  /** 批量上传文件（最多 10000 个） */
  const handleUploadFiles = async (fileList: globalThis.File[]) => {
    if (fileList.length === 0) return;
    const MAX_FILES = 10000;
    if (fileList.length > MAX_FILES) {
      toast.error(`一次最多上传 ${MAX_FILES} 个文件，当前选择了 ${fileList.length} 个`);
      return;
    }

    const total = fileList.length;
    setUploading(true);
    setUploadTotal(total);
    setUploadCompleted(0);
    setUploadFailed(0);
    setUploadProgress(0);

    let completed = 0;
    let failed = 0;

    // 并发控制：每批最多 5 个文件同时上传
    const CONCURRENCY = 5;
    for (let i = 0; i < total; i += CONCURRENCY) {
      const batch = fileList.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map((f) => uploadSingleFile(f)));
      for (const ok of results) {
        completed++;
        if (!ok) failed++;
        setUploadCompleted(completed);
        setUploadFailed(failed);
        setUploadProgress(Math.round((completed / total) * 100));
      }
    }

    // 上传完成汇总
    if (failed === 0) {
      toast.success(total === 1 ? `「${fileList[0].name}」上传成功` : `${total} 个文件全部上传成功`);
    } else {
      toast.warning(`上传完成：${total - failed} 个成功，${failed} 个失败`);
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadTotal(0);
    setUploadCompleted(0);
    setUploadFailed(0);
    loadFiles();
    getSpaceUsage().then((u: any) => u && setSpaceUsage(u)).catch(() => {});
  };

  /** 新建文件夹 */
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }
    const dirPath = toSmhPath(
      currentPath === "/" ? newFolderName.trim() : `${currentPath}/${newFolderName.trim()}`
    ).replace(/^\//, "");
    try {
      await createDirectory(dirPath);
      toast.success(`文件夹「${newFolderName.trim()}」已创建`);
      setShowNewFolder(false);
      setNewFolderName("");
      loadFiles();
    } catch (err) {
      console.error("[FileSpace] 创建文件夹失败:", err);
      toast.error("创建文件夹失败");
    }
  };

  /** 重命名 */
  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    const oldPath = toSmhPath(joinPath(renameTarget.parentPath, renameTarget.name));
    const newPath = toSmhPath(joinPath(renameTarget.parentPath, renameValue.trim()));
    try {
      if (renameTarget.type === "folder") {
        await renameDirectory(oldPath, newPath);
      } else {
        await renameFile(oldPath, newPath);
      }
      toast.success(`已重命名为「${renameValue.trim()}」`);
      setRenameTarget(null);
      setRenameValue("");
      loadFiles();
    } catch (err) {
      console.error("[FileSpace] 重命名失败:", err);
      toast.error("重命名失败");
    }
  };

  /** 加载移动对话框中的目录列表 */
  const loadMoveFolders = useCallback(async (browsePath: string) => {
    setMoveLoading(true);
    try {
      const smhPath = toSmhPath(browsePath);
      const data = await getFileList(smhPath, { page: 1, pageSize: 200 });
      const contents = data?.contents ?? [];
      // 只保留文件夹
      const folders = contents
        .filter((entry: any) => entry.type === "dir")
        .map((entry: any) => ({
          name: entry.name as string,
          path: browsePath === "/" ? `/${entry.name}` : `${browsePath}/${entry.name}`,
        }));
      setMoveFolders(folders);
    } catch (err) {
      console.error("[FileSpace] 加载目录列表失败:", err);
      setMoveFolders([]);
    } finally {
      setMoveLoading(false);
    }
  }, []);

  /** 打开移动对话框时初始化 */
  const openMoveDialog = useCallback((file: FileItem) => {
    setMoveTarget(file);
    setMoveDestPath("/");
    setMoveBrowsePath("/");
    loadMoveFolders("/");
  }, [loadMoveFolders]);

  /** 在移动对话框中进入子目录 */
  const moveBrowseInto = useCallback((folderPath: string) => {
    setMoveBrowsePath(folderPath);
    setMoveDestPath(folderPath);
    loadMoveFolders(folderPath);
  }, [loadMoveFolders]);

  /** 在移动对话框中返回上级目录 */
  const moveBrowseUp = useCallback(() => {
    if (moveBrowsePath === "/") return;
    const segments = moveBrowsePath.split("/").filter(Boolean);
    segments.pop();
    const parentPath = segments.length === 0 ? "/" : "/" + segments.join("/");
    setMoveBrowsePath(parentPath);
    setMoveDestPath(parentPath);
    loadMoveFolders(parentPath);
  }, [moveBrowsePath, loadMoveFolders]);

  /** 移动文件/文件夹 */
  const handleMove = async () => {
    if (!moveTarget) return;
    const oldPath = toSmhPath(joinPath(moveTarget.parentPath, moveTarget.name));
    // 目标路径：选中的目录 + 原文件名
    const destDir = moveDestPath === "/" ? "" : moveDestPath.replace(/^\//, "").replace(/\/$/, "");
    const newPath = destDir ? `${destDir}/${moveTarget.name}` : moveTarget.name;
    try {
      if (moveTarget.type === "folder") {
        await moveDirectory(oldPath, newPath);
      } else {
        await moveFile(oldPath, newPath);
      }
      toast.success(`「${moveTarget.name}」已移动到 ${moveDestPath === "/" ? "根目录" : moveDestPath}`);
      setMoveTarget(null);
      setMoveDestPath("/");
      loadFiles();
    } catch (err) {
      console.error("[FileSpace] 移动失败:", err);
      toast.error(`移动「${moveTarget.name}」失败`);
    }
  };

  /** 刷新 */
  const handleRefresh = () => {
    loadFiles();
    getSpaceUsage().then((u: any) => u && setSpaceUsage(u)).catch(() => {});
    toast.success("文件列表已刷新");
  };

  // ─── 拖拽上传 ────────────────────────────────────────────────────────────

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleUploadFiles(Array.from(droppedFiles));
    }
  };

  /** 点击上传按钮 */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleUploadFiles(Array.from(selectedFiles));
    }
    // 重置 input 以便重复选择同一文件
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>

        {/* Top Info + Actions */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.12), rgba(88,86,214,0.12))" }}>
                <HardDrive className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{clawName} · 文件空间</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {spaceUsage
                    ? `已用 ${formatBytes(spaceUsage.used)} / 共 ${formatBytes(spaceUsage.total)}`
                    : `共 ${totalFileCount} 个文件`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 上传进度 */}
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 mr-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {uploadTotal > 1
                      ? `上传中 ${uploadCompleted}/${uploadTotal}${uploadFailed > 0 ? `（${uploadFailed} 失败）` : ""}`
                      : `上传中 ${uploadProgress}%`
                    }
                  </span>
                </div>
              )}
              {/* 视图切换 */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 transition-colors ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-400 hover:bg-gray-50"}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 border-l border-gray-200 transition-colors ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-400 hover:bg-gray-50"}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setNewFolderName("新建文件夹"); setShowNewFolder(true); }} className="text-gray-600">
                    <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
                    新建文件夹
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">在当前目录创建新文件夹</TooltipContent>
              </Tooltip>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="text-gray-600">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                刷新
              </Button>
              <Button
                size="sm"
                onClick={handleUploadClick}
                disabled={uploading}
                className="text-white"
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                上传文件
              </Button>
            </div>
          </div>

          {/* Breadcrumb + Search + Sort */}
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs flex-shrink min-w-0 overflow-hidden">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center gap-1 flex-shrink-0 min-w-0" style={{ maxWidth: idx === 0 ? undefined : "120px" }}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                  {idx === 0 ? (
                    <button
                      onClick={() => { setCurrentPath(crumb.path); setSearch(""); }}
                      className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors flex-shrink-0 ${
                        idx === breadcrumbs.length - 1
                          ? "text-gray-700 font-medium"
                          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <Home className="w-3 h-3" />
                    </button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => { setCurrentPath(crumb.path); setSearch(""); }}
                          className={`px-1.5 py-1 rounded-md transition-colors truncate block max-w-[100px] ${
                            idx === breadcrumbs.length - 1
                              ? "text-gray-700 font-medium"
                              : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {crumb.label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">{crumb.label}</TooltipContent>
                    </Tooltip>
                  )}
                </span>
              ))}
            </nav>

            <div className="w-px h-4 bg-gray-200" />

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="搜索文件名..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 text-xs h-8"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto flex-shrink-0">
              <ArrowUpDown className="w-3 h-3" />
              {([
                { field: "modifiedAt" as SortField, label: "时间" },
                { field: "name" as SortField, label: "名称" },
                { field: "size" as SortField, label: "大小" },
              ]).map((opt) => (
                <button
                  key={opt.field}
                  onClick={() => toggleSort(opt.field)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    sortField === opt.field
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {opt.label}
                  {sortField === opt.field && (
                    <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File List / Grid */}
        <div
          className={`relative transition-colors ${isDragOver ? "bg-blue-50/60" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-lg m-2 pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-blue-400" />
                <p className="text-sm text-blue-600 font-medium">释放文件以上传</p>
              </div>
            </div>
          )}

          {/* Loading 状态 */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          )}

          {!loading && viewMode === "list" ? (
            /* ===== List View ===== */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-400 text-xs tracking-wide">
                    <th className="text-left px-5 py-2.5 font-medium">文件名</th>
                    <th className="text-left px-5 py-2.5 font-medium w-20">类型</th>
                    <th className="text-right px-5 py-2.5 font-medium w-24">大小</th>
                    <th className="text-right px-5 py-2.5 font-medium w-40">修改时间</th>
                    <th className="text-center px-5 py-2.5 font-medium w-16">下载</th>
                    <th className="text-center px-5 py-2.5 font-medium w-16">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">
                          {search ? "未找到匹配的文件" : "当前目录为空"}
                        </p>
                        {!search && (
                          <p className="text-xs text-gray-300 mt-1">拖拽文件到此处或点击上传按钮添加文件</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50/60 transition-colors group"
                        onDoubleClick={() => file.type === "folder" && handleOpenFolder(file.name)}
                      >
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <button
                              className={`text-sm font-medium truncate max-w-[320px] text-left ${
                                file.type === "folder"
                                  ? "text-gray-900 hover:text-blue-600 cursor-pointer"
                                  : "text-gray-700 group-hover:text-blue-600 cursor-default"
                              } transition-colors`}
                              onClick={() => file.type === "folder" && handleOpenFolder(file.name)}
                            >
                              {file.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="text-xs text-gray-400">{getFileTypeName(file.type)}</span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span className="text-xs tabular-nums text-gray-500">{file.size}</span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">{file.modifiedAt}</span>
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          {file.type !== "folder" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleDownload(file)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors mx-auto"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">下载</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <FileActions
                            file={file}
                            onDelete={() => setDeleteConfirm(file)}
                            onOpenFolder={() => handleOpenFolder(file.name)}
                            onDownload={() => handleDownload(file)}
                            onPreview={() => handlePreview(file)}
                            onRename={() => { setRenameTarget(file); setRenameValue(file.name); }}
                            onMove={() => openMoveDialog(file)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            /* ===== Grid View ===== */
            <div className="p-5">
              {filteredFiles.length === 0 ? (
                <div className="py-16 text-center">
                  <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {search ? "未找到匹配的文件" : "当前目录为空"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group relative bg-gray-50/50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all cursor-pointer"
                      onDoubleClick={() => file.type === "folder" && handleOpenFolder(file.name)}
                      onClick={() => file.type === "folder" && handleOpenFolder(file.name)}
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileActions
                          file={file}
                          onDelete={() => setDeleteConfirm(file)}
                          onOpenFolder={() => handleOpenFolder(file.name)}
                          onDownload={() => handleDownload(file)}
                          onPreview={() => handlePreview(file)}
                          onRename={() => { setRenameTarget(file); setRenameValue(file.name); }}
                          onMove={() => openMoveDialog(file)}
                        />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3">{getFileIcon(file.type, true)}</div>
                        <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 truncate w-full transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {file.type === "folder" ? "文件夹" : file.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Footer Stats */}
          {!loading && filteredFiles.length > 0 && (
            <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {folderCount > 0 && `${folderCount} 个文件夹，`}{fileCount} 个文件
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  最近更新于 {files[0]?.modifiedAt ?? "—"}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-gray-300 truncate block text-right" style={{ maxWidth: "30%" }}>
                    {currentPath === "/" ? "根目录" : ellipsisMiddle(currentPath, 40)}
                  </span>
                </TooltipTrigger>
                {currentPath !== "/" && currentPath.length > 40 && (
                  <TooltipContent side="top" className="text-xs max-w-[400px] break-all">{currentPath}</TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 leading-relaxed">
            确定要删除「{deleteConfirm?.name}」吗？{deleteConfirm?.type === "folder" ? "文件夹内的所有内容也将被删除，" : ""}此操作不可恢复。
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>取消</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) { setRenameTarget(null); setRenameValue(""); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">重命名</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="请输入新名称"
              className="text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setRenameTarget(null); setRenameValue(""); }}>取消</Button>
            <Button
              onClick={handleRename}
              disabled={!renameValue.trim() || renameValue === renameTarget?.name}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={(open) => { if (!open) { setShowNewFolder(false); setNewFolderName(""); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">新建文件夹</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="请输入文件夹名称"
              className="text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}>取消</Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog - 目录选择器 */}
      <Dialog open={!!moveTarget} onOpenChange={(open) => { if (!open) { setMoveTarget(null); setMoveDestPath("/"); } }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">移动到</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-xs text-gray-500">
              将「{moveTarget?.name}」移动到选定目录
            </p>

            {/* 当前浏览路径面包屑 */}
            <div className="flex items-center gap-1 text-xs bg-gray-50 rounded-lg px-3 py-2 overflow-hidden flex-nowrap min-w-0">
              <button
                onClick={() => moveBrowseInto("/")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors flex-shrink-0 ${
                  moveBrowsePath === "/" ? "text-blue-600 font-medium bg-blue-50" : "text-gray-400 hover:text-blue-600"
                }`}
              >
                <Home className="w-3 h-3" />
                <span>根目录</span>
              </button>
              {moveBrowsePath !== "/" && moveBrowsePath.split("/").filter(Boolean).map((seg, idx, arr) => {
                const segPath = "/" + arr.slice(0, idx + 1).join("/");
                const isLast = idx === arr.length - 1;
                return (
                  <span key={segPath} className="flex items-center gap-1 flex-shrink-0 min-w-0">
                    <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    <button
                      onClick={() => moveBrowseInto(segPath)}
                      className={`px-1.5 py-0.5 rounded transition-colors truncate max-w-[100px] ${
                        isLast ? "text-blue-600 font-medium bg-blue-50" : "text-gray-400 hover:text-blue-600"
                      }`}
                      title={seg}
                    >
                      {seg}
                    </button>
                  </span>
                );
              })}
            </div>

            {/* 目录列表 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
              {/* 返回上级 */}
              {moveBrowsePath !== "/" && (
                <button
                  onClick={moveBrowseUp}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180 text-gray-400" />
                  <span>返回上级目录</span>
                </button>
              )}

              {moveLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-2" />
                  <span className="text-xs text-gray-400">加载中...</span>
                </div>
              ) : moveFolders.length === 0 ? (
                <div className="py-8 text-center">
                  <Folder className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">当前目录下没有子文件夹</p>
                </div>
              ) : (
                moveFolders
                  .filter((f) => !(moveTarget && moveTarget.type === "folder" && f.name === moveTarget.name && moveBrowsePath === moveTarget.parentPath))
                  .map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => moveBrowseInto(folder.path)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-colors group min-w-0 overflow-hidden"
                  >
                    <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-blue-600 truncate text-left flex-1 min-w-0 w-[100px]" title={folder.name}>{folder.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  </button>
                ))
              )}
            </div>

            {/* 选中的目标路径 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">目标位置：</span>
              <span className="text-blue-600 font-medium">
                {moveDestPath === "/" ? "/ 根目录" : moveDestPath}
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setMoveTarget(null); setMoveDestPath("/"); }}>取消</Button>
            <Button
              onClick={handleMove}
              className="text-white"
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              移动到此处
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FileActions Sub-Component ───────────────────────────────────────────────

function FileActions({
  file,
  onDelete,
  onOpenFolder,
  onDownload,
  onPreview,
  onRename,
  onMove,
}: {
  file: FileItem;
  onDelete: () => void;
  onOpenFolder: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onRename: () => void;
  onMove: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mx-auto">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {file.type === "folder" ? (
          <DropdownMenuItem onClick={onOpenFolder}>
            <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
            打开
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              预览
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="w-4 h-4 mr-2 text-gray-500" />
              下载
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRename}>
          <Edit3 className="w-4 h-4 mr-2 text-gray-500" />
          重命名
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMove}>
          <FolderInput className="w-4 h-4 mr-2 text-gray-500" />
          移动到
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
