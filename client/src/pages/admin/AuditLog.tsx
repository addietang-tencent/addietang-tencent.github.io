/**
 * AuditLog - 管控端操作审计页
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Search, ClipboardList, CheckCircle, XCircle } from "lucide-react";

const MOCK_LOGS = [
  {
    id: "log-001", operator: "admin@acompany.com", action: "更新成员信息",
    api: "/api/admin/members/update", requestTime: "2026-03-09 15:45:37",
    responseTime: "2026-03-09 15:45:38", success: true,
    detail: {
      eventId: "6af57777-10bd-4032-b881-f2e2f8872cd0",
      request: '{"memberId":"alice@acompany.com","openclawLimit":5,"tokenLimit":100000}',
      endDate: "2026-03-09 15:45:38", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "158", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "/api/admin/members/update", invokerId: "1",
      startDate: "2026-03-09 15:45:37",
    },
  },
  {
    id: "log-002", operator: "admin@acompany.com", action: "添加模型",
    api: "/api/admin/models/create", requestTime: "2026-03-09 14:30:12",
    responseTime: "2026-03-09 14:30:13", success: true,
    detail: {
      eventId: "7bf68888-20cd-5143-c992-g3f3g9983de1",
      request: '{"provider":"腾讯云DeepSeek","version":"DeepSeek V3 0324","dailyLimit":500000}',
      endDate: "2026-03-09 14:30:13", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "203", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "/api/admin/models/create", invokerId: "1",
      startDate: "2026-03-09 14:30:12",
    },
  },
  {
    id: "log-003", operator: "superadmin@acompany.com", action: "修改基础信息",
    api: "/api/admin/basic-info/update", requestTime: "2026-03-09 11:20:05",
    responseTime: "2026-03-09 11:20:06", success: true,
    detail: {
      eventId: "8cg79999-31de-6254-d003-h4g4h0094ef2",
      request: '{"siteName":"A公司企业版OpenClaw","siteDesc":"企业专属AI助理平台"}',
      endDate: "2026-03-09 11:20:06", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.SUPERADMIN",
      duration: "89", application: "openclaw-enterprise",
      sourceIp: "30.42.219.88", success: "true",
      action: "/api/admin/basic-info/update", invokerId: "0",
      startDate: "2026-03-09 11:20:05",
    },
  },
  {
    id: "log-004", operator: "admin@acompany.com", action: "删除成员",
    api: "/api/admin/members/delete", requestTime: "2026-03-08 16:45:22",
    responseTime: "2026-03-08 16:45:22", success: false,
    detail: {
      eventId: "9dh80000-42ef-7365-e114-i5h5i1105fg3",
      request: '{"memberId":"frank@acompany.com"}',
      endDate: "2026-03-08 16:45:22", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "45", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "false",
      action: "/api/admin/members/delete", invokerId: "1",
      startDate: "2026-03-08 16:45:22",
    },
  },
  {
    id: "log-005", operator: "admin@acompany.com", action: "更新安全组规则",
    api: "/api/admin/security-group/update", requestTime: "2026-03-08 10:12:33",
    responseTime: "2026-03-08 10:12:34", success: true,
    detail: {
      eventId: "0ei91111-53fg-8476-f225-j6i6j2216gh4",
      request: '{"ruleType":"inbound","source":"0.0.0.0/0","protocol":"TCP","port":"18789","policy":"允许"}',
      endDate: "2026-03-08 10:12:34", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "112", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "/api/admin/security-group/update", invokerId: "1",
      startDate: "2026-03-08 10:12:33",
    },
  },
];

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<(typeof MOCK_LOGS)[0] | null>(null);

  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch = !search || log.operator.includes(search) || log.action.includes(search) || log.api.includes(search);
    const matchDate = !dateFilter || log.requestTime.startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  return (
    <AdminLayout>
      <div className="page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">操作记录</h1>
          <p className="text-sm text-gray-500 mt-1">记录管理员在管控端的所有操作，包括 API 调用详情。</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索操作人、事件或接口"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white w-44"
          />
          {(search || dateFilter) && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setDateFilter(""); }}>
              清除筛选
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作人</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作事件</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">API 接口</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">请求时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">返回时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">执行结果</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{log.operator}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{log.api}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.requestTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.responseTime}</td>
                  <td className="px-6 py-4">
                    {log.success ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        成功
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        失败
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            共 {filtered.length} 条记录
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-500" />
              消息详情
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="bg-gray-950 rounded-xl p-5 font-mono text-sm overflow-auto max-h-96">
              <div className="text-gray-400 mb-3">{"{"} <span className="text-gray-500 text-xs">{Object.keys(selectedLog.detail).length} items</span></div>
              {Object.entries(selectedLog.detail).map(([key, value]) => (
                <div key={key} className="ml-4 mb-1.5">
                  <span className="text-gray-300">"{key}"</span>
                  <span className="text-gray-500"> : </span>
                  <span className="text-orange-400">"{value}"</span>
                </div>
              ))}
              <div className="text-gray-400">{"}"}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>退出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
