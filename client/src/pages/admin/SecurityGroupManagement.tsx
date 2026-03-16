/**
 * SecurityGroupManagement - 管控端网络管理页
 * 三大块：安全组（入站/出站规则）、VPC 和子网配置、敬请期待
 */
import { useState } from "react";
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
import { Plus, Trash2, Pencil, Info, Zap, Globe, Link, RefreshCw, Network, ExternalLink, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

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

// 系统分配的可用区
const AVAILABLE_ZONES = ["广州五区", "广州六区", "广州七区"];

// Mock VPC 列表（每个可用区相同，实际应按区过滤）
const MOCK_VPCS = [
  { id: "vpc-jp7fjg13", name: "auto_test_vpc_2", cidr: "10.1.0.0/16" },
  { id: "vpc-9lyx5t8h", name: "CHC-带外", cidr: "192.168.0.0/16" },
  { id: "vpc-ri7mmw6n", name: "CHC-部署", cidr: "192.168.0.0/16" },
  { id: "vpc-ab3cd4ef", name: "企业内网", cidr: "172.16.0.0/12" },
];

// Mock 子网列表（按 VPC ID 过滤）
const MOCK_SUBNETS: Record<string, { id: string; name: string; cidr: string }[]> = {
  "vpc-jp7fjg13": [
    { id: "subnet-f7t69gji", name: "lb_auto_test_subnet", cidr: "10.1.0.0/24" },
    { id: "subnet-h8u80hkj", name: "lb_auto_test_subnet_2", cidr: "10.1.1.0/24" },
  ],
  "vpc-9lyx5t8h": [
    { id: "subnet-gaclgbzu", name: "带外管理", cidr: "192.168.20.0/24" },
  ],
  "vpc-ri7mmw6n": [
    { id: "subnet-mn3op5qr", name: "部署子网A", cidr: "192.168.1.0/24" },
    { id: "subnet-st6uv7wx", name: "部署子网B", cidr: "192.168.2.0/24" },
  ],
  "vpc-ab3cd4ef": [
    { id: "subnet-yz9ab1cd", name: "企业内网子网", cidr: "172.16.1.0/24" },
  ],
};

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

type Rule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark: string;
};

type ZoneConfig = {
  zone: string;
  vpcId: string;
  subnetId: string;
};

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export default function SecurityGroupManagement() {
  // 安全组状态
  const [inboundRules, setInboundRules] = useState<Rule[]>(DEFAULT_INBOUND);
  const [outboundRules, setOutboundRules] = useState<Rule[]>(DEFAULT_OUTBOUND);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [ruleType, setRuleType] = useState<"inbound" | "outbound">("inbound");
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [form, setForm] = useState({ source: "", protocol: "TCP", port: "", policy: "允许", remark: "" });

  // VPC 和子网状态
  const [savedZoneConfigs, setSavedZoneConfigs] = useState<ZoneConfig[]>(
    AVAILABLE_ZONES.map((zone) => ({ zone, vpcId: "", subnetId: "" }))
  );
  const [zoneConfigs, setZoneConfigs] = useState<ZoneConfig[]>(
    AVAILABLE_ZONES.map((zone) => ({ zone, vpcId: "", subnetId: "" }))
  );
  const [refreshingZone, setRefreshingZone] = useState<string | null>(null);
  const [showVpcSaveDialog, setShowVpcSaveDialog] = useState(false);

  // 是否有未保存的 VPC/子网改动
  const isVpcDirty = JSON.stringify(zoneConfigs) !== JSON.stringify(savedZoneConfigs);

  // ── 安全组操作 ──────────────────────────────────────────────────────────────

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

  // ── VPC 和子网操作 ──────────────────────────────────────────────────────────

  const handleVpcChange = (zone: string, vpcId: string) => {
    setZoneConfigs((prev) =>
      prev.map((c) => c.zone === zone ? { ...c, vpcId, subnetId: "" } : c)
    );
  };

  const handleSubnetChange = (zone: string, subnetId: string) => {
    setZoneConfigs((prev) =>
      prev.map((c) => c.zone === zone ? { ...c, subnetId } : c)
    );
  };

  const handleRefreshZone = (zone: string) => {
    setRefreshingZone(zone);
    setTimeout(() => {
      setRefreshingZone(null);
      toast.success(`${zone} 网络信息已刷新`);
    }, 800);
  };

  const handleVpcSaveConfirm = () => {
    setSavedZoneConfigs(zoneConfigs);
    setShowVpcSaveDialog(false);
    toast.success("VPC 和子网配置已保存");
  };

  const handleVpcDiscard = () => {
    setZoneConfigs(savedZoneConfigs);
  };

  // ── 子组件：规则表格 ────────────────────────────────────────────────────────

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

  // ── 渲染 ────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="page-enter max-w-5xl">

        {/* 页头 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">网络管理</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            管理 OpenClaw 实例的安全组规则与私有网络配置，确保云服务器在安全可控的网络环境中运行。
          </p>
        </div>

        {/* ══ 第一块：安全组 ══════════════════════════════════════════════════ */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">安全组</h2>
          </div>

          {/* 提示说明 */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-600 leading-relaxed">
              配置安全组规则以管控云服务器的入站与出站端口策略。修改规则后，对已运行中的 OpenClaw 云服务器立即生效，请谨慎操作。
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

        {/* ══ 第二块：VPC 和子网 ══════════════════════════════════════════════ */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">VPC 和子网</h2>
          </div>

          {/* 说明文字区域 - 蓝色提示条 */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs text-blue-700 leading-relaxed">
              <p><strong>推荐：</strong>不填写任何 VPC 和子网，系统将自动创建 VPC，并把 OpenClaw 实例随机部署到系统分配的可用区中。</p>
              <p>填写了具体 VPC 则部署到对应 VPC 下；填写了几个可用区的子网，系统就在这几个可用区随机部署；若某可用区未填子网，则在该区内自动分配。</p>
            </div>
          </div>

          {/* VPC / 子网列表选框 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            {/* 表格标题栏 */}
            <div className="flex items-center justify-between px-6 border-b border-gray-100" style={{ minHeight: "56px" }}>
              <span className="text-sm font-semibold text-gray-800">VPC 与子网配置</span>
              {isVpcDirty && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVpcDiscard}
                    className="h-7 px-3 text-xs text-gray-500"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowVpcSaveDialog(true)}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    保存
                  </Button>
                </div>
              )}
            </div>
            {/* 列标题 */}
            <div className="grid grid-cols-[110px_1fr_1fr_40px] gap-4 px-6 py-2.5 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-500">系统分配可用区</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      系统自动选择的 OpenClaw 实例主力可用区，不可修改。可通过指定 VPC 和子网来规定实例部署在哪个可用区。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-xs font-medium text-gray-500">私有网络（VPC）</span>
              <span className="text-xs font-medium text-gray-500">子网</span>
              <span />
            </div>

            {/* 每行一个可用区 */}
            {zoneConfigs.map((config, idx) => {
              const availableSubnets = config.vpcId ? (MOCK_SUBNETS[config.vpcId] ?? []) : [];
              const isRefreshing = refreshingZone === config.zone;
              return (
                <div
                  key={config.zone}
                  className={`grid grid-cols-[110px_1fr_1fr_40px] gap-4 items-center px-6 py-4 ${idx < zoneConfigs.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  {/* 可用区名称 */}
                  <span className="text-sm font-medium text-gray-700">{config.zone}</span>

                  {/* VPC 下拉 */}
                  <Select
                    value={config.vpcId || "auto"}
                    onValueChange={(val) => handleVpcChange(config.zone, val === "auto" ? "" : val)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-full min-w-0 max-w-none">
                      <SelectValue placeholder="请选择私有网络" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="text-gray-400 text-xs">自动分配</span>
                      </SelectItem>
                      {MOCK_VPCS.map((vpc) => (
                        <SelectItem key={vpc.id} value={vpc.id}>
                          <span className="font-mono text-xs text-gray-500 mr-1">{vpc.id}</span>
                          <span className="text-sm text-gray-800 mr-1">| {vpc.name}</span>
                          <span className="text-xs text-gray-400">| {vpc.cidr}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 子网下拉 */}
                  <Select
                    value={config.subnetId || "auto"}
                    onValueChange={(val) => handleSubnetChange(config.zone, val === "auto" ? "" : val)}
                    disabled={!config.vpcId}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border-gray-200 disabled:opacity-50 w-full min-w-0 max-w-none">
                      <SelectValue placeholder="请选择子网" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="text-gray-400 text-xs">自动分配</span>
                      </SelectItem>
                      {availableSubnets.map((subnet) => (
                        <SelectItem key={subnet.id} value={subnet.id}>
                          <span className="font-mono text-xs text-gray-500 mr-1">{subnet.id}</span>
                          <span className="text-sm text-gray-800 mr-1">| {subnet.name}</span>
                          <span className="text-xs text-gray-400">| {subnet.cidr}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 刷新按鈕 */}
                  <div className="flex justify-end">
                  <button
                    onClick={() => handleRefreshZone(config.zone)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
                    title={`刷新 ${config.zone} 网络信息`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                  </div>
                </div>
              );
            })}

            {/* 底部提示 */}
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/30">
              <p className="text-xs text-gray-400 leading-relaxed">
                如现有私有网络/子网不符合要求，可以去控制台{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/vpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 transition-colors"
                >
                  新建私有网络<ExternalLink className="w-3 h-3" />
                </a>
                {" "}或{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/subnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 transition-colors"
                >
                  新建子网<ExternalLink className="w-3 h-3" />
                </a>
                。云主机购买后可以通过控制台切换私有网络完成私有网络/子网的切换。
              </p>
            </div>
          </div>

          {/* 保存/取消按钮已移至表格右上角，此处不再重复显示 */}
        </div>

        {/* ══ 第三块：敬请期待 ════════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">敬请期待</h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 模型加速服务 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#007AFF" }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">模型加速服务</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    为 OpenClaw 调用海外模型或国内模型提供专属优化链路，实现跨境/跨网访问的低延迟、高稳定传输，显著提升大模型交互体验
                  </p>
                </div>
              </div>
            </div>

            {/* 公网高效接入 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#34C759" }}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">公网极速接入</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    提供全球范围内广覆盖、大带宽、低延时的公网出口和高性能接入网关，保障 OpenClaw 各场景下极速、灵活、稳定的网络接入体验
                  </p>
                </div>
              </div>
            </div>

            {/* 企业网络环境互通 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FF9500" }}>
                  <Link className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">企业网络环境互通</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    为 OpenClaw 平台与企业 IDC 之间提供大带宽、高速、安全的互通能力，保障云上云下协同
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 添加/编辑规则弹窗 ─────────────────────────────────────────────── */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editRule ? "编辑规则" : `添加${ruleType === "inbound" ? "入站" : "出站"}规则`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">{ruleType === "inbound" ? "来源" : "目标"}</Label>
              <Input
                placeholder="例如：0.0.0.0/0"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">协议</Label>
                <Select value={form.protocol} onValueChange={(v) => setForm((f) => ({ ...f, protocol: v }))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["TCP", "UDP", "ICMP", "ICMPv6", "ALL"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">端口</Label>
                <Input
                  placeholder="例如：80 或 ALL"
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">策略</Label>
              <Select value={form.policy} onValueChange={(v) => setForm((f) => ({ ...f, policy: v }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="允许">允许</SelectItem>
                  <SelectItem value="拒绝">拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">备注（选填）</Label>
              <Input
                placeholder="规则用途说明"
                value={form.remark}
                onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                className="text-sm"
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

      {/* VPC 保存确认弹窗 */}
      <Dialog open={showVpcSaveDialog} onOpenChange={setShowVpcSaveDialog}>
        <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>确认保存 VPC 和子网配置</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-700 mb-3">
              此配置修改仅对<span className="font-semibold">后续新增的 OpenClaw 实例</span>生效。
            </p>
            <p className="text-sm text-gray-500">
              已有实例保持原有网络配置不变，不会受影响。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVpcSaveDialog(false)}>取消</Button>
            <Button
              onClick={handleVpcSaveConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              确认保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
