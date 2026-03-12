/**
 * SecurityGroupManagement - 管控端安全组管理页
 * 成员创建 OpenClaw 时启动的云服务器安全组管理
 * 企业可自行管控入站/出站端口规则
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Shield, Info } from "lucide-react";

const DEFAULT_INBOUND = [
  { id: "1", source: "0.0.0.0/0", protocol: "ICMP", port: "ALL", policy: "允许", remark: "放通 Ping 服务" },
  { id: "2", source: "::/0", protocol: "ICMPv6", port: "ALL", policy: "允许", remark: "放通 Ping 服务（IPv6）" },
  { id: "3", source: "0.0.0.0/0", protocol: "TCP", port: "22", policy: "允许", remark: "放通 Linux SSH 登录" },
  { id: "4", source: "::/0", protocol: "TCP", port: "22", policy: "允许", remark: "放通 Linux SSH 登录（IPv6）" },
  { id: "5", source: "0.0.0.0/0", protocol: "TCP", port: "3389", policy: "允许", remark: "放通 Windows 远程登录" },
  { id: "6", source: "::/0", protocol: "TCP", port: "3389", policy: "允许", remark: "放通 Windows 远程登录（IPv6）" },
  { id: "7", source: "10.0.0.0/8", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "8", source: "172.16.0.0/12", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "9", source: "192.168.0.0/16", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通内网（云私有网络）" },
  { id: "10", source: "0.0.0.0/0", protocol: "TCP", port: "80", policy: "允许", remark: "Web 服务 HTTP（Apache、Nginx 等）" },
  { id: "11", source: "0.0.0.0/0", protocol: "TCP", port: "443", policy: "允许", remark: "Web 服务 HTTPS（Apache、Nginx 等）" },
  { id: "12", source: "0.0.0.0/0", protocol: "TCP", port: "18789", policy: "允许", remark: "OpenClaw 服务端口" },
  { id: "13", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

const DEFAULT_OUTBOUND = [
  { id: "1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
  { id: "2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

type Rule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark: string;
};

export default function SecurityGroupManagement() {
  const [inboundRules, setInboundRules] = useState<Rule[]>(DEFAULT_INBOUND);
  const [outboundRules, setOutboundRules] = useState<Rule[]>(DEFAULT_OUTBOUND);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [ruleType, setRuleType] = useState<"inbound" | "outbound">("inbound");
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [form, setForm] = useState({ source: "", protocol: "TCP", port: "", policy: "允许", remark: "" });

  const handleSaveRule = () => {
    if (!form.source.trim()) { toast.error(`请填写${ruleType === "inbound" ? "来源" : "目标"}`); return; }
    const rule: Rule = { ...form, id: editRule ? editRule.id : String(Date.now()) };
    if (editRule) {
      if (ruleType === "inbound") setInboundRules((prev) => prev.map((r) => r.id === editRule.id ? rule : r));
      else setOutboundRules((prev) => prev.map((r) => r.id === editRule.id ? rule : r));
      toast.success("规则已更新");
    } else {
      if (ruleType === "inbound") setInboundRules((prev) => [...prev, rule]);
      else setOutboundRules((prev) => [...prev, rule]);
      toast.success("规则已添加");
    }
    setShowRuleDialog(false);
    setEditRule(null);
    setForm({ source: "", protocol: "TCP", port: "", policy: "允许", remark: "" });
  };

  const openAdd = (type: "inbound" | "outbound") => {
    setRuleType(type);
    setEditRule(null);
    setForm({ source: "", protocol: "TCP", port: "", policy: "允许", remark: "" });
    setShowRuleDialog(true);
  };

  const openEdit = (rule: Rule, type: "inbound" | "outbound") => {
    setRuleType(type);
    setEditRule(rule);
    setForm({ source: rule.source, protocol: rule.protocol, port: rule.port, policy: rule.policy, remark: rule.remark });
    setShowRuleDialog(true);
  };

  const RuleTable = ({ rules, type }: { rules: Rule[]; type: "inbound" | "outbound" }) => (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <span className="text-sm font-medium text-gray-700">
          {type === "inbound" ? "入站规则" : "出站规则"}
        </span>
        <Button size="sm" variant="outline" onClick={() => openAdd(type)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          添加规则
        </Button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-50 bg-gray-50/50">
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
              {type === "inbound" ? "来源" : "目标"}
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">协议</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">端口</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">策略</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">备注</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-3 text-sm text-gray-700 font-mono">{rule.source}</td>
              <td className="px-6 py-3 text-sm text-gray-600">{rule.protocol}</td>
              <td className="px-6 py-3 text-sm text-gray-600">{rule.port}</td>
              <td className="px-6 py-3">
                <span className={`text-sm font-medium ${rule.policy === "允许" ? "text-green-600" : "text-red-500"}`}>
                  {rule.policy}
                </span>
              </td>
              <td className="px-6 py-3 text-sm text-gray-400">{rule.remark || "—"}</td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => openEdit(rule, type)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (type === "inbound") setInboundRules((prev) => prev.filter((r) => r.id !== rule.id));
                      else setOutboundRules((prev) => prev.filter((r) => r.id !== rule.id));
                      toast.success("规则已删除");
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="page-enter max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">安全组管理</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理成员创建 OpenClaw 时所使用的云服务器安全组规则。企业可在此自行管控云服务器的入站与出站端口策略，精细化控制网络访问权限，保障企业数据安全。
          </p>
        </div>

        {/* 提示说明 */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-600 leading-relaxed">
            规则按从上到下的顺序匹配，命中第一条匹配规则后即停止。修改安全组规则后，对已运行中的 OpenClaw 云服务器立即生效，请谨慎操作。
          </p>
        </div>

        <Tabs defaultValue="inbound">
          <TabsList className="mb-5">
            <TabsTrigger value="inbound">入站规则</TabsTrigger>
            <TabsTrigger value="outbound">出站规则</TabsTrigger>
          </TabsList>
          <TabsContent value="inbound">
            <RuleTable rules={inboundRules} type="inbound" />
          </TabsContent>
          <TabsContent value="outbound">
            <RuleTable rules={outboundRules} type="outbound" />
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加/编辑规则弹窗 */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editRule ? "编辑规则" : `添加${ruleType === "inbound" ? "入站" : "出站"}规则`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{ruleType === "inbound" ? "来源" : "目标"}</Label>
              <Input
                placeholder="例如 0.0.0.0/0 或 ::/0"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>协议</Label>
                <Select value={form.protocol} onValueChange={(v) => setForm({ ...form, protocol: v })}>
                  <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["TCP", "UDP", "ICMP", "ICMPv6", "ALL"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>端口</Label>
                <Input
                  placeholder="例如 80 或 ALL"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: e.target.value })}
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>策略</Label>
              <Select value={form.policy} onValueChange={(v) => setForm({ ...form, policy: v })}>
                <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="允许">允许</SelectItem>
                  <SelectItem value="拒绝">拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>备注 <span className="text-gray-400 font-normal">（可选）</span></Label>
              <Input
                placeholder="简要描述此规则用途"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                className="bg-gray-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>取消</Button>
            <Button
              onClick={handleSaveRule}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              {editRule ? "保存修改" : "添加规则"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
