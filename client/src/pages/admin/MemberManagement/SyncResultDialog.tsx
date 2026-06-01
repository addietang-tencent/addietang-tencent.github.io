/**
 * 同步结果弹窗
 *
 * 展示同步后检测到的异常：
 *   1. 分组异常（上方）：被删除的组织架构仍有配置绑定
 *   2. 用户异常（下方）：主部门失效等
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertTriangle, Users, FolderX } from "lucide-react";
import type { SyncResult } from "./types";

interface SyncResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SyncResult | null;
  onConfirm: () => void;
}

export default function SyncResultDialog({
  open,
  onOpenChange,
  result,
  onConfirm,
}: SyncResultDialogProps) {
  if (!result) return null;

  const hasGroupAnomalies = result.anomalousGroups.length > 0;
  const hasUserAnomalies = result.anomalousUsers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            同步结果
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto">
          {/* 分组异常区块 */}
          {hasGroupAnomalies && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <FolderX className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-semibold text-[#0A0A0A]">
                  分组异常
                </h4>
                <span className="text-xs text-[#A3A3A3] tabular-nums">
                  ({result.anomalousGroups.length})
                </span>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-red-700 leading-relaxed">
                  以下分组对应的部门已在腾讯统一身份管理平台被删除，分组内用户已被移出。由于分组仍有正在应用的配置，需管理员将配置与分组解绑后，分组才会被彻底删除。
                </p>
              </div>

              {/* 分组异常表格 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-left uppercase tracking-wide">
                        分组名称
                      </TableHead>
                      <TableHead className="text-center uppercase tracking-wide">
                        分组总人数
                      </TableHead>
                      <TableHead className="text-left uppercase tracking-wide">
                        已应用配置
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.anomalousGroups.map((group) => (
                      <TableRow
                        key={group.groupId}
                        className="border-b border-gray-50 last:border-b-0"
                      >
                        <TableCell className="text-[#0A0A0A] font-medium">
                          {group.groupName}
                        </TableCell>
                        <TableCell className="text-center text-[#737373] tabular-nums">
                          {group.memberCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {group.boundConfigs.map((config) => (
                              <span
                                key={config}
                                className="inline-flex items-center px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100"
                              >
                                {config}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* 用户异常区块 */}
          {hasUserAnomalies && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-[#0A0A0A]">
                  用户异常
                </h4>
                <span className="text-xs text-[#A3A3A3] tabular-nums">
                  ({result.anomalousUsers.length})
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  以下用户的主部门在腾讯统一身份管理平台已失效，需管理员关注其配置生效状态。
                </p>
              </div>

              {/* 用户异常表格 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-left uppercase tracking-wide">
                        用户
                      </TableHead>
                      <TableHead className="text-left uppercase tracking-wide">
                        异常原因
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.anomalousUsers.map((user) => (
                      <TableRow
                        key={user.userId}
                        className="border-b border-gray-50 last:border-b-0"
                      >
                        <TableCell className="text-[#0A0A0A] font-medium">
                          {user.displayName}
                        </TableCell>
                        <TableCell className="text-[#737373]">
                          {user.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="dialog-confirm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="text-sm"
          >
            我知道了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
