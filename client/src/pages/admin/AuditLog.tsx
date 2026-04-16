/**
 * AuditLog - 管控端操作审计页
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Search, ClipboardList, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const MOCK_LOGS = [
  {
    id: "log-001", operator: "admin@acompany.com", action: "updateMember",
    requestTime: "2026-03-09 15:45:37", responseTime: "2026-03-09 15:45:38", success: true,
    detail: {
      eventId: "6af57777-10bd-4032-b881-f2e2f8872cd0",
      request: '{"memberId":"alice@acompany.com","openclawLimit":5,"tokenLimit":100000}',
      endDate: "2026-03-09 15:45:38", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "158", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "updateMember", invokerId: "1",
      startDate: "2026-03-09 15:45:37",
    },
  },
  {
    id: "log-002", operator: "admin@acompany.com", action: "createModel",
    requestTime: "2026-03-09 14:30:12", responseTime: "2026-03-09 14:30:13", success: true,
    detail: {
      eventId: "7bf68888-20cd-5143-c992-g3f3g9983de1",
      request: '{"provider":"腾讯云DeepSeek","version":"DeepSeek V3 0324","dailyLimit":500000}',
      endDate: "2026-03-09 14:30:13", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "203", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "createModel", invokerId: "1",
      startDate: "2026-03-09 14:30:12",
    },
  },
  {
    id: "log-003", operator: "superadmin@acompany.com", action: "updateBasicInfo",
    requestTime: "2026-03-09 11:20:05", responseTime: "2026-03-09 11:20:06", success: true,
    detail: {
      eventId: "8cg79999-31de-6254-d003-h4g4h0094ef2",
      request: '{"siteName":"A公司企业版Agent","siteDesc":"企业专属AI助理平台"}',
      endDate: "2026-03-09 11:20:06", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.SUPERADMIN",
      duration: "89", application: "openclaw-enterprise",
      sourceIp: "30.42.219.88", success: "true",
      action: "updateBasicInfo", invokerId: "0",
      startDate: "2026-03-09 11:20:05",
    },
  },
  {
    id: "log-004", operator: "admin@acompany.com", action: "deleteMember",
    requestTime: "2026-03-08 16:45:22", responseTime: "2026-03-08 16:45:22", success: false,
    detail: {
      eventId: "9dh80000-42ef-7365-e114-i5h5i1105fg3",
      request: '{"memberId":"frank@acompany.com"}',
      endDate: "2026-03-08 16:45:22", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "45", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "false",
      action: "deleteMember", invokerId: "1",
      startDate: "2026-03-08 16:45:22",
    },
  },
  {
    id: "log-005", operator: "admin@acompany.com", action: "updateSecurityGroup",
    requestTime: "2026-03-08 10:12:33", responseTime: "2026-03-08 10:12:34", success: true,
    detail: {
      eventId: "0ei91111-53fg-8476-f225-j6i6j2216gh4",
      request: '{"ruleType":"inbound","source":"0.0.0.0/0","protocol":"TCP","port":"18789","policy":"允许"}',
      endDate: "2026-03-08 10:12:34", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "112", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "updateSecurityGroup", invokerId: "1",
      startDate: "2026-03-08 10:12:33",
    },
  },
  {
    id: "log-006", operator: "admin@acompany.com", action: "createMember",
    requestTime: "2026-03-07 09:30:11", responseTime: "2026-03-07 09:30:12", success: true,
    detail: {
      eventId: "1fj02222-64gh-9587-g336-k7j7k3327hi5",
      request: '{"memberId":"grace@acompany.com","role":"member"}',
      endDate: "2026-03-07 09:30:12", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "134", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "createMember", invokerId: "1",
      startDate: "2026-03-07 09:30:11",
    },
  },
  {
    id: "log-007", operator: "admin@acompany.com", action: "resetPassword",
    requestTime: "2026-03-07 08:15:44", responseTime: "2026-03-07 08:15:44", success: true,
    detail: {
      eventId: "2gk13333-75hi-0698-h447-l8k8l4438ij6",
      request: '{"memberId":"henry@acompany.com"}',
      endDate: "2026-03-07 08:15:44", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "67", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "resetPassword", invokerId: "1",
      startDate: "2026-03-07 08:15:44",
    },
  },
  {
    id: "log-008", operator: "superadmin@acompany.com", action: "importImage",
    requestTime: "2026-03-06 17:22:09", responseTime: "2026-03-06 17:22:11", success: true,
    detail: {
      eventId: "3hl24444-86ij-1709-i558-m9l9m5549jk7",
      request: '{"imageId":"img-abc123","imageName":"Agent镜像v2.1"}',
      endDate: "2026-03-06 17:22:11", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.SUPERADMIN",
      duration: "1842", application: "openclaw-enterprise",
      sourceIp: "30.42.219.88", success: "true",
      action: "importImage", invokerId: "0",
      startDate: "2026-03-06 17:22:09",
    },
  },
  {
    id: "log-009", operator: "admin@acompany.com", action: "deleteModel",
    requestTime: "2026-03-06 14:05:33", responseTime: "2026-03-06 14:05:33", success: false,
    detail: {
      eventId: "4im35555-97jk-2810-j669-n0m0n6650kl8",
      request: '{"modelId":"model-xyz789"}',
      endDate: "2026-03-06 14:05:33", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "23", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "false",
      action: "deleteModel", invokerId: "1",
      startDate: "2026-03-06 14:05:33",
    },
  },
  {
    id: "log-010", operator: "admin@acompany.com", action: "updateChannelConfig",
    requestTime: "2026-03-05 16:48:27", responseTime: "2026-03-05 16:48:28", success: true,
    detail: {
      eventId: "5jn46666-08kl-3921-k770-o1n1o7761lm9",
      request: '{"channel":"feishu","appId":"cli_abc","appSecret":"xxx"}',
      endDate: "2026-03-05 16:48:28", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "245", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "updateChannelConfig", invokerId: "1",
      startDate: "2026-03-05 16:48:27",
    },
  },
  {
    id: "log-011", operator: "superadmin@acompany.com", action: "updateGlobalQuota",
    requestTime: "2026-03-05 10:30:00", responseTime: "2026-03-05 10:30:01", success: true,
    detail: {
      eventId: "6ko57777-19lm-4032-l881-p2o2p8872mn0",
      request: '{"dailyGlobalLimit":2000000}',
      endDate: "2026-03-05 10:30:01", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.SUPERADMIN",
      duration: "98", application: "openclaw-enterprise",
      sourceIp: "30.42.219.88", success: "true",
      action: "updateGlobalQuota", invokerId: "0",
      startDate: "2026-03-05 10:30:00",
    },
  },
  {
    id: "log-012", operator: "admin@acompany.com", action: "disableMember",
    requestTime: "2026-03-04 13:22:15", responseTime: "2026-03-04 13:22:15", success: true,
    detail: {
      eventId: "7lp68888-20mn-5143-m992-q3p3q9983no1",
      request: '{"memberId":"ivan@acompany.com","status":"disabled"}',
      endDate: "2026-03-04 13:22:15", serviceAccount: "true",
      userAgent: "okhttp/4.10.0", invokerName: "ak.ADMIN",
      duration: "56", application: "openclaw-enterprise",
      sourceIp: "30.42.219.99", success: "true",
      action: "disableMember", invokerId: "1",
      startDate: "2026-03-04 13:22:15",
    },
  },
];

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<(typeof MOCK_LOGS)[0] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success("列表已刷新"); }, 1000);
  };

  const hasFilter = search || dateFrom || dateTo;

  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch = !search || log.operator.includes(search) || log.action.includes(search);
    const logDate = log.requestTime.slice(0, 10);
    const matchFrom = !dateFrom || logDate >= dateFrom;
    const matchTo = !dateTo || logDate <= dateTo;
    return matchSearch && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleDateFrom = (v: string) => { setDateFrom(v); setPage(1); };
  const handleDateTo = (v: string) => { setDateTo(v); setPage(1); };

  return (
    <>
      <div className="page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">操作记录</h1>
          <p className="text-sm text-gray-500 mt-1">记录管理员在管控端的所有操作，包括 API 调用详情。</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索操作人或操作事件"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFrom(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              title="开始日期"
              style={{ colorScheme: 'light' }}
            />
            <span className="text-gray-400 text-sm shrink-0">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateTo(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              title="结束日期"
              style={{ colorScheme: 'light' }}
            />
          </div>
          {hasFilter && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setPage(1); }}>
              清除筛选
            </Button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors disabled:opacity-50"
            title="刷新列表"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[26%]">操作人的用户 ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">操作事件</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">请求时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">返回时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-[8%] whitespace-nowrap">执行结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">暂无操作记录</td>
                </tr>
              ) : paged.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{log.operator}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.requestTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.responseTime}</td>
                  <td className="px-6 py-4">
                    {log.success ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs whitespace-nowrap">
                        <CheckCircle className="w-3.5 h-3.5" />
                        成功
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5" />
                        失败
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer: count + pagination */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">共 {filtered.length} 条记录</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      p === safePage
                        ? "bg-blue-500 text-white border border-blue-500"
                        : "border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
    </>
  );
}
