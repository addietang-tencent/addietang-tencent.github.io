/**
 * SecurityGroupManagement - 管控端网络管理页
 * 采用 Tab 结构：私有网络和子网、安全组、公网、更多功能
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Info, Zap, Globe, Link, RefreshCw, Network, ExternalLink, Wifi, Lock, Loader2, Check, ChevronDown, ChevronRight, ChevronLeft, Shield, ArrowRight, Search, X, AlertTriangle, ShieldCheck, ListChecks } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

// ─── Mock 数据 ────────────────────────────────────────────────────────────────

// 迁移影响范围 Mock 数据
const MIGRATION_INSTANCES = [
  { user: "alice@acompany.com", instance: "openclaw-alice-01", currentNet: "vpc-aa1 / subnet-aa1", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", note: "可迁移" },
  { user: "alice@acompany.com", instance: "openclaw-alice-02", currentNet: "vpc-aa1 / subnet-aa1", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", note: "暂不支持迁移：已绑定负载均衡" },
  { user: "bob@acompany.com", instance: "openclaw-bob-01", currentNet: "vpc-bb2 / subnet-bb2", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", note: "可迁移" },
  { user: "carol@acompany.com", instance: "openclaw-carol-01", currentNet: "vpc-cc3 / subnet-cc3", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", note: "暂不支持迁移：存在辅助网卡" },
  { user: "carol@acompany.com", instance: "openclaw-carol-02", currentNet: "vpc-cc3 / subnet-cc3", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", note: "可迁移" },
  { user: "dave@acompany.com", instance: "openclaw-dave-01", currentNet: "vpc-dd4 / subnet-dd4", targetNet: "vpc-jp7fjg13 / subnet-gz7-001", note: "暂不支持迁移：存在辅助 IP 未释放" },
  { user: "eve@acompany.com", instance: "openclaw-eve-01", currentNet: "vpc-ee5 / subnet-ee5", targetNet: "vpc-jp7fjg13 / subnet-gz5-001", note: "暂不支持迁移：实例状态不允许迁移" },
  { user: "frank@acompany.com", instance: "openclaw-frank-01", currentNet: "vpc-ff6 / subnet-ff6", targetNet: "vpc-jp7fjg13 / subnet-gz6-001", note: "可迁移" },
];

const MIGRATION_FAILURE_SCENARIOS: Record<string, { step: string; reason: string }> = {
  "openclaw-bob-01": {
    step: "切换实例网络",
    reason: "请稍后重试；如问题持续存在，请联系管理员处理",
  },
  "openclaw-frank-01": {
    step: "重启实例",
    reason: "请检查实例是否处于可操作状态后重试",
  },
};

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
  { id: "12", source: "0.0.0.0/0", protocol: "TCP", port: "18789", policy: "允许", remark: "Agent 服务端口" },
  { id: "13", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

const DEFAULT_OUTBOUND = [
  { id: "1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
  { id: "2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
];

// 系统分配的可用区
const AVAILABLE_ZONES = ["广州五区", "广州六区", "广州七区"];

// 系统自动分配的 VPC（模拟后端返回的实际生效资源）
const AUTO_ASSIGNED_VPC = { id: "vpc-jp7fjg13", name: "clawpro/default-vpc", cidr: "10.0.0.0/16" };

// 系统自动分配的子网（按可用区，模拟后端返回的实际生效资源）
const AUTO_ASSIGNED_SUBNETS: Record<string, { id: string; name: string; cidr: string }> = {
  "广州五区": { id: "subnet-gz5-001", name: "clawpro/ap-guangzhou-5", cidr: "10.0.1.0/24" },
  "广州六区": { id: "subnet-gz6-001", name: "clawpro/ap-guangzhou-6", cidr: "10.0.2.0/24" },
  "广州七区": { id: "subnet-gz7-001", name: "clawpro/ap-guangzhou-7", cidr: "10.0.3.0/24" },
};

// Mock VPC 列表
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

// ─── Mock 安全组数据 ──────────────────────────────────────────────────────────

type SecurityGroup = {
  id: string;
  name: string;
  remark: string;
  inboundCount: number;
  outboundCount: number;
  inboundRules: Rule[];
  outboundRules: Rule[];
};

const MOCK_SECURITY_GROUPS: SecurityGroup[] = [
  {
    id: "sg-current001",
    name: "clawpro-default",
    remark: "Agent 默认安全组",
    inboundCount: 13,
    outboundCount: 2,
    inboundRules: DEFAULT_INBOUND,
    outboundRules: DEFAULT_OUTBOUND,
  },
  {
    id: "sg-web00002",
    name: "Web-Server-SG",
    remark: "Web 服务器安全组，开放 80/443",
    inboundCount: 5,
    outboundCount: 2,
    inboundRules: [
      { id: "w1", source: "0.0.0.0/0", protocol: "TCP", port: "80", policy: "允许", remark: "HTTP" },
      { id: "w2", source: "0.0.0.0/0", protocol: "TCP", port: "443", policy: "允许", remark: "HTTPS" },
      { id: "w3", source: "10.0.0.0/8", protocol: "ALL", port: "ALL", policy: "允许", remark: "内网放通" },
      { id: "w4", source: "0.0.0.0/0", protocol: "TCP", port: "22", policy: "允许", remark: "SSH" },
      { id: "w5", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
    ],
    outboundRules: [
      { id: "wo1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
      { id: "wo2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
    ],
  },
  {
    id: "sg-strict003",
    name: "Strict-Isolation-SG",
    remark: "严格隔离，仅允许必要端口",
    inboundCount: 3,
    outboundCount: 1,
    inboundRules: [
      { id: "s1", source: "10.0.0.0/8", protocol: "TCP", port: "22", policy: "允许", remark: "内网 SSH" },
      { id: "s2", source: "10.0.0.0/8", protocol: "TCP", port: "18789", policy: "允许", remark: "Agent 内网端口" },
      { id: "s3", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
    ],
    outboundRules: [
      { id: "so1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
    ],
  },
  {
    id: "sg-devtest04",
    name: "Dev-Test-SG",
    remark: "开发测试环境，开放所有端口",
    inboundCount: 2,
    outboundCount: 1,
    inboundRules: [
      { id: "d1", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "允许", remark: "全放通（仅测试用）" },
      { id: "d2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "" },
    ],
    outboundRules: [
      { id: "do1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
    ],
  },
];

const MOCK_SECURITY_GROUP_DIALOG_EXTRA_CANDIDATES: SecurityGroup[] = [
  {
    id: "sg-office005",
    name: "Office-Standard-SG",
    remark: "办公网标准安全组，适合常规员工办公实例",
    inboundCount: 4,
    outboundCount: 2,
    inboundRules: [
      { id: "o1", source: "10.10.0.0/16", protocol: "TCP", port: "22", policy: "允许", remark: "办公网 SSH" },
      { id: "o2", source: "10.10.0.0/16", protocol: "TCP", port: "3389", policy: "允许", remark: "办公网远程桌面" },
      { id: "o3", source: "10.10.0.0/16", protocol: "TCP", port: "443", policy: "允许", remark: "办公系统 HTTPS" },
      { id: "o4", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: DEFAULT_OUTBOUND,
  },
  {
    id: "sg-data006",
    name: "Data-Processing-SG",
    remark: "数据处理节点专用，保留必要服务访问",
    inboundCount: 3,
    outboundCount: 2,
    inboundRules: [
      { id: "dp1", source: "172.20.0.0/16", protocol: "TCP", port: "22", policy: "允许", remark: "运维 SSH" },
      { id: "dp2", source: "172.20.0.0/16", protocol: "TCP", port: "9090", policy: "允许", remark: "监控采集" },
      { id: "dp3", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: DEFAULT_OUTBOUND,
  },
  {
    id: "sg-bastion007",
    name: "Bastion-Only-SG",
    remark: "仅允许堡垒机来源访问的安全组",
    inboundCount: 2,
    outboundCount: 1,
    inboundRules: [
      { id: "b1", source: "10.200.0.12/32", protocol: "TCP", port: "22", policy: "允许", remark: "堡垒机 SSH" },
      { id: "b2", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: [
      { id: "bo1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
    ],
  },
  {
    id: "sg-app008",
    name: "Application-Cluster-SG",
    remark: "应用集群通用安全组，放通服务编排端口",
    inboundCount: 4,
    outboundCount: 2,
    inboundRules: [
      { id: "a1", source: "10.30.0.0/16", protocol: "TCP", port: "8080", policy: "允许", remark: "应用服务入口" },
      { id: "a2", source: "10.30.0.0/16", protocol: "TCP", port: "8443", policy: "允许", remark: "应用服务 HTTPS" },
      { id: "a3", source: "10.30.0.0/16", protocol: "TCP", port: "22", policy: "允许", remark: "集群运维 SSH" },
      { id: "a4", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: DEFAULT_OUTBOUND,
  },
  {
    id: "sg-audit009",
    name: "Audit-Readonly-SG",
    remark: "审计查看实例，限制仅查询与日志上报",
    inboundCount: 3,
    outboundCount: 2,
    inboundRules: [
      { id: "ar1", source: "10.40.8.0/24", protocol: "TCP", port: "22", policy: "允许", remark: "审计网 SSH" },
      { id: "ar2", source: "10.40.8.0/24", protocol: "TCP", port: "5601", policy: "允许", remark: "日志检索" },
      { id: "ar3", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: DEFAULT_OUTBOUND,
  },
  {
    id: "sg-trial010",
    name: "Trial-Sandbox-SG",
    remark: "试用沙箱环境，方便演示分页与搜索效果",
    inboundCount: 3,
    outboundCount: 1,
    inboundRules: [
      { id: "t1", source: "192.168.50.0/24", protocol: "TCP", port: "22", policy: "允许", remark: "试用环境 SSH" },
      { id: "t2", source: "192.168.50.0/24", protocol: "TCP", port: "443", policy: "允许", remark: "试用环境 HTTPS" },
      { id: "t3", source: "0.0.0.0/0", protocol: "ALL", port: "ALL", policy: "拒绝", remark: "默认拒绝其余访问" },
    ],
    outboundRules: [
      { id: "to1", source: "-", protocol: "ALL", port: "ALL", policy: "允许", remark: "放通所有出站流量" },
    ],
  },
];

const MOCK_SECURITY_GROUP_DIALOG_CANDIDATES = [
  ...MOCK_SECURITY_GROUPS,
  ...MOCK_SECURITY_GROUP_DIALOG_EXTRA_CANDIDATES,
];

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

type Rule = {
  id: string;
  source: string;
  protocol: string;
  port: string;
  policy: string;
  remark: string;
};

type RuleTableBodyProps = {
  rules: Rule[];
  type: "inbound" | "outbound";
  readonly?: boolean;
  onEdit?: (rule: Rule, type: "inbound" | "outbound") => void;
  onDelete?: (rule: Rule, type: "inbound" | "outbound") => void;
  paginate?: boolean;
};

type CommonRuleOptionKey = "block-inter-vpc" | "allow-public" | "allow-ssh";

type CommonRuleOption = {
  key: CommonRuleOptionKey;
  label: string;
  description: string;
  defaultChecked: boolean;
  rules: {
    inbound: Array<Omit<Rule, "id">>;
    outbound: Array<Omit<Rule, "id">>;
  };
};

const COMMON_RULE_OPTIONS: CommonRuleOption[] = [
  {
    key: "block-inter-vpc",
    label: "限制 Agent 互访",
    description: "",
    defaultChecked: true,
    rules: {
      inbound: [
        {
          source: "当前 VPC 的 CIDR",
          protocol: "ALL",
          port: "ALL",
          policy: "拒绝",
          remark: "限制 VPC 下 Agent 云服务器互访",
        },
      ],
      outbound: [],
    },
  },
  {
    key: "allow-public",
    label: "允许公网访问",
    description: "",
    defaultChecked: true,
    rules: {
      inbound: [],
      outbound: [
        {
          source: "0.0.0.0/0",
          protocol: "ALL",
          port: "ALL",
          policy: "允许",
          remark: "可访问公网",
        },
        {
          source: "::/0",
          protocol: "ALL",
          port: "ALL",
          policy: "允许",
          remark: "可访问公网",
        },
      ],
    },
  },
  {
    key: "allow-ssh",
    label: "允许 Linux SSH 登录",
    description: "",
    defaultChecked: false,
    rules: {
      inbound: [
        {
          source: "0.0.0.0/0",
          protocol: "TCP",
          port: "22",
          policy: "允许",
          remark: "放通Linux SSH登录",
        },
        {
          source: "::/0",
          protocol: "TCP",
          port: "22",
          policy: "允许",
          remark: "放通Linux SSH登录",
        },
      ],
      outbound: [],
    },
  },
];

const INITIAL_DEFAULT_SECURITY_GROUP_ID = "sg-current001";
const NETWORK_TEMPLATE_WARNING_KEY: CommonRuleOptionKey = "block-inter-vpc";
const ENABLE_SECURITY_GROUP_EMPTY_STATE_DEMO = true;

// 默认安全组的本地快照 key：供平台策略页等其他管理员页面只读消费（单向同步）。
const DEFAULT_SECURITY_GROUP_SNAPSHOT_KEY = "admin_default_security_group_snapshot";

function findSecurityGroupById(securityGroupId: string) {
  return MOCK_SECURITY_GROUPS.find((sg) => sg.id === securityGroupId) ?? null;
}

function getInitialDefaultSecurityGroup(): SecurityGroup | null {
  // 优先读取本地快照：让「网络管理」与「平台策略」等页面共享同一份默认安全组状态，
  // 避免组件 re-mount 后（例如在侧边栏切换管理页）把之前的切换/补规则动作丢失。
  const snapshotRaw = typeof window !== "undefined"
    ? window.localStorage.getItem(DEFAULT_SECURITY_GROUP_SNAPSHOT_KEY)
    : null;
  if (snapshotRaw) {
    try {
      const snapshot = JSON.parse(snapshotRaw) as {
        id?: string;
        name?: string;
        inboundRules?: Rule[];
      };
      if (snapshot && snapshot.id && Array.isArray(snapshot.inboundRules)) {
        // 快照只持久化 id/name/inboundRules，其它字段从 MOCK 中补齐（outboundRules 等）。
        const template = findSecurityGroupById(snapshot.id);
        if (template) {
          return {
            ...template,
            name: snapshot.name ?? template.name,
            inboundRules: snapshot.inboundRules,
            inboundCount: snapshot.inboundRules.length,
          };
        }
        // 新建/已被删除的安全组也能用：仅用快照内字段构造，outbound 留空。
        return {
          id: snapshot.id,
          name: snapshot.name ?? snapshot.id,
          remark: "",
          inboundCount: snapshot.inboundRules.length,
          outboundCount: 0,
          inboundRules: snapshot.inboundRules,
          outboundRules: [],
        };
      }
    } catch {
      // JSON 解析失败则 fallback 到 demo / 默认逻辑
    }
  }

  // 仅将“未配置默认安全组”的演示开关收口在初始化阶段，避免主流程持续混入 demo 判断。
  if (ENABLE_SECURITY_GROUP_EMPTY_STATE_DEMO) {
    return null;
  }

  return findSecurityGroupById(INITIAL_DEFAULT_SECURITY_GROUP_ID);
}

// 写入默认安全组快照：currentSg 为 null 时清除 key。
function writeDefaultSecurityGroupSnapshot(
  currentSg: SecurityGroup | null,
  inboundRules: Rule[],
) {
  if (!currentSg) {
    localStorage.removeItem(DEFAULT_SECURITY_GROUP_SNAPSHOT_KEY);
    return;
  }
  const snapshot = {
    id: currentSg.id,
    name: currentSg.name,
    inboundRules,
  };
  localStorage.setItem(DEFAULT_SECURITY_GROUP_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function isSameRuleContent(rule: Omit<Rule, "id">, expectedRule: Omit<Rule, "id">) {
  return (
    rule.source === expectedRule.source &&
    rule.protocol === expectedRule.protocol &&
    rule.port === expectedRule.port &&
    rule.policy === expectedRule.policy &&
    rule.remark === expectedRule.remark
  );
}

function hasCommonRulePreviewRule(rules: Rule[], optionKey: CommonRuleOptionKey, direction: "inbound" | "outbound") {
  const option = COMMON_RULE_OPTIONS.find((item) => item.key === optionKey);
  if (!option) {
    return false;
  }

  return option.rules[direction].some((expectedRule) =>
    rules.some((rule) => isSameRuleContent(rule, expectedRule))
  );
}

function buildRulesFromOptions(checkedKeys: CommonRuleOptionKey[]) {
  const inbound: Array<Omit<Rule, "id">> = [];
  const outbound: Array<Omit<Rule, "id">> = [];

  COMMON_RULE_OPTIONS.filter((o) => checkedKeys.includes(o.key)).forEach((option) => {
    option.rules.inbound.forEach((r) => {
      if (!inbound.some((existing) => isSameRuleContent(existing, r))) {
        inbound.push(r);
      }
    });
    option.rules.outbound.forEach((r) => {
      if (!outbound.some((existing) => isSameRuleContent(existing, r))) {
        outbound.push(r);
      }
    });
  });

  const timestamp = Date.now();
  const toRules = (rules: Array<Omit<Rule, "id">>, direction: "inbound" | "outbound"): Rule[] =>
    rules.map((rule, index) => ({
      id: `rule-${direction}-${timestamp}-${index}`,
      ...rule,
    }));

  return {
    inbound: toRules(inbound, "inbound"),
    outbound: toRules(outbound, "outbound"),
  };
}

const DEFAULT_PANEL_ACCESS_PORT = "443";

function buildPanelAccessRequiredRules(panelAccessPort: string): Array<Omit<Rule, "id">> {
  return [
    {
      source: "0.0.0.0/0",
      protocol: "TCP",
      port: panelAccessPort,
      policy: "允许",
      remark: "允许访问 Agent 面板",
    },
  ];
}

function doesRulePortCoverRequiredPort(rulePort: string, requiredPort: string) {
  if (rulePort === "ALL") {
    return true;
  }

  if (rulePort === requiredPort) {
    return true;
  }

  const requiredPortNumber = Number(requiredPort);
  if (Number.isNaN(requiredPortNumber)) {
    return false;
  }

  return rulePort.split(",").some((segment) => {
    const normalizedSegment = segment.trim();
    if (normalizedSegment === requiredPort) {
      return true;
    }

    const rangeMatch = normalizedSegment.match(/^(\d+)-(\d+)$/);
    if (!rangeMatch) {
      return false;
    }

    const rangeStart = Number(rangeMatch[1]);
    const rangeEnd = Number(rangeMatch[2]);
    return requiredPortNumber >= rangeStart && requiredPortNumber <= rangeEnd;
  });
}

function doesRuleCoverPanelAccessRequirement(rule: Rule, expectedRule: Omit<Rule, "id">) {
  return rule.policy === "允许"
    && rule.source === expectedRule.source
    && (rule.protocol === expectedRule.protocol || rule.protocol === "ALL")
    && doesRulePortCoverRequiredPort(rule.port, expectedRule.port);
}

function buildSecurityGroupWithPanelAccessRules(securityGroup: SecurityGroup, panelAccessPort: string): SecurityGroup {
  const requiredRules = buildPanelAccessRequiredRules(panelAccessPort);
  const missingRules = requiredRules.filter((expectedRule) =>
    !securityGroup.inboundRules.some((rule) => doesRuleCoverPanelAccessRequirement(rule, expectedRule))
  );

  if (missingRules.length === 0) {
    return securityGroup;
  }

  const timestamp = Date.now();
  const injectedRules: Rule[] = missingRules.map((rule, index) => ({
    id: `panel-access-${timestamp}-${index}`,
    ...rule,
  }));
  const inboundRules = [...injectedRules, ...securityGroup.inboundRules];

  return {
    ...securityGroup,
    inboundRules,
    inboundCount: inboundRules.length,
  };
}

type NetworkConfig = {
  vpcId: string;
  zoneSubnets: Record<string, string>;
};

// ─── Tab 定义 ──────────────────────────────────────────────

const TABS = [
  {
    id: "vpc",
    label: "私有网络和子网",
    description: "配置 Agent 云服务器的私有网络和子网部署策略。",
  },
  {
    id: "security",
    label: "安全组",
    description: "配置 Agent 所在云服务器的入站与出站规则，管控网络流量策略。",
  },
  {
    id: "public",
    label: "公网",
    description: "配置 Agent 云服务器的公网 IP 和带宽策略。",
  },
  {
    id: "coming",
    label: "更多功能",
    description: "更多功能即将上线。",
  },
];

// ─── 组件 ─────────────────────────────────────────────────────────────────────

type CreateSecurityGroupDialogProps = {
  open: boolean;
  checkedOptions: CommonRuleOptionKey[];
  draft: {
    name: string;
    remark: string;
  };
  previewTab: "inbound" | "outbound";
  onOpenChange: (open: boolean) => void;
  onOptionToggle: (optionKey: CommonRuleOptionKey, checked: boolean) => void;
  onNameChange: (name: string) => void;
  onRemarkChange: (remark: string) => void;
  onPreviewTabChange: (tab: "inbound" | "outbound") => void;
  onCancel: () => void;
  onConfirm: () => void;
};

type SelectExistingSecurityGroupDialogProps = {
  open: boolean;
  searchKeyword: string;
  selectedSecurityGroup: SecurityGroup | null;
  previewTab: "outbound" | "inbound";
  candidateSecurityGroups: SecurityGroup[];
  candidatePage: number;
  candidateTotalPages: number;
  shouldShowPanelAccessAssist: boolean;
  isPanelAccessStaged: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onSelectSecurityGroup: (sg: SecurityGroup) => void;
  onCandidatePageChange: (page: number) => void;
  onTogglePanelAccessStaged: () => void;
  onPreviewTabChange: (tab: "outbound" | "inbound") => void;
  onCancel: () => void;
  onConfirm: () => void;
};

const SECURITY_GROUP_DIALOG_PAGE_SIZE = 5;

function CreateSecurityGroupDialog({
  open,
  checkedOptions,
  draft,
  previewTab,
  onOpenChange,
  onOptionToggle,
  onNameChange,
  onRemarkChange,
  onPreviewTabChange,
  onCancel,
  onConfirm,
}: CreateSecurityGroupDialogProps) {
  const { inbound: previewInbound, outbound: previewOutbound } = buildRulesFromOptions(checkedOptions);
  const previewRules = previewTab === "inbound" ? previewInbound : previewOutbound;
  const hasRiskyRule = [previewInbound, previewOutbound].some((rules) =>
    rules.some((rule) =>
      (rule.source === "0.0.0.0/0" || rule.source === "::/0") && rule.policy === "允许"
    )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900">
            新建安全组
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">安全组名称<span className="text-red-500 ml-1">*</span></Label>
            <Input
              placeholder="请输入安全组名称"
              value={draft.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">备注</Label>
            <Input
              placeholder="简要描述此安全组用途"
              value={draft.remark}
              onChange={(e) => onRemarkChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">快速添加常用规则</Label>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_RULE_OPTIONS.map((option) => {
                const isChecked = checkedOptions.includes(option.key);
                return (
                  <label
                    key={option.key}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                      isChecked ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                        isChecked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onOptionToggle(option.key, checked);
                          if (checked) {
                            if (option.key === "allow-public") {
                              onPreviewTabChange("outbound");
                            } else if (option.key === "allow-ssh" || option.key === "block-inter-vpc") {
                              onPreviewTabChange("inbound");
                            }
                          }
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isChecked ? "text-blue-900" : "text-gray-700"}`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">规则预览</Label>
            </div>

            {hasRiskyRule && (
              <div className="bg-amber-50 px-3 py-2.5 rounded-md flex items-start gap-2 border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  当前规则中包含来源/目标为 0.0.0.0/0 或 ::/0 的允许规则，可能带来安全风险。建议创建 Agent 云服务器后及时收紧访问范围，仅保留必要的来源或目标。
                </p>
              </div>
            )}

            {checkedOptions.length === 0 && (
              <div className="bg-amber-50 px-3 py-2.5 rounded-md flex items-start gap-2 border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  无任何规则时 Agent 将无法正常使用，请在创建后手动配置规则。至少放通一条出站规则，否则所有出站流量将被拒绝。
                </p>
              </div>
            )}

            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex items-center px-3 border-b border-gray-200 bg-white" style={{ minHeight: "36px" }}>
                {(["outbound", "inbound"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onPreviewTabChange(tab)}
                    className={`relative px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      previewTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "outbound" ? "出站规则" : "入站规则"} ({tab === "outbound" ? previewOutbound.length : previewInbound.length})
                  </button>
                ))}
              </div>

              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-3 py-2 text-left font-medium text-gray-500">{previewTab === "outbound" ? "目标" : "来源"}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">协议</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">端口</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">策略</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-400">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRules.length > 0 ? (
                      previewRules.map((rule, index) => {
                        // 如果这条规则只属于某一个 checkedOption，并且我们能检测到它，给予轻微高亮
                        // 简单起见，利用 remark 里的关键字或者来源作为匹配判断
                        // 这里我们仅为规则行添加一个非常轻的过渡背景类（如果不需要具体判断谁引起的，直接用默认即可，React会自动应用动画，这里为了明显反馈，我们让所有展示出来的规则都自带淡入高亮效果）。
                        // 此处通过在渲染时添加动画类名实现每次重渲染的高亮闪烁，或者简单使用 hover
                        return (
                          <tr key={`preview-${previewTab}-${rule.source}-${rule.port}-${index}`} className="animate-in fade-in bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                            <td className="px-3 py-2 text-gray-700">{rule.source}</td>
                            <td className="px-3 py-2 text-gray-700">{rule.protocol}</td>
                            <td className="px-3 py-2 text-gray-700">{rule.port}</td>
                            <td className="px-3 py-2">
                              {rule.policy === "允许" ? (
                                <span className="badge-running !text-xs !font-normal !px-1.5 !py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                  {rule.policy}
                                </span>
                              ) : (
                                <span className="badge-stopped !text-xs !font-normal !px-1.5 !py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                  {rule.policy}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-400">{rule.remark || "—"}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="bg-white">
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                          暂无规则
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onConfirm}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SecurityGroupManagement() {
  const [activeTab, setActiveTab] = useState("security");
  const initialDefaultSecurityGroup = getInitialDefaultSecurityGroup();

  // 安全组状态
  const [inboundRules, setInboundRules] = useState<Rule[]>(initialDefaultSecurityGroup?.inboundRules ?? []);
  const [outboundRules, setOutboundRules] = useState<Rule[]>(initialDefaultSecurityGroup?.outboundRules ?? []);
  const [securityTab, setSecurityTab] = useState<"outbound" | "inbound">("outbound");

  // 用户端访问 Agent 面板开关 - 持久化到 localStorage
  const [allowPanelAccess, setAllowPanelAccess] = useState(() => {
    return localStorage.getItem("admin_allow_panel_access") === "true";
  });
  const [panelPort, setPanelPort] = useState<string | null>(() => {
    return localStorage.getItem("admin_panel_port");
  });
  const [panelAccessLoading, setPanelAccessLoading] = useState(false);

  // VPC 和子网配置状态
  const INITIAL_NETWORK_CONFIG: NetworkConfig = { vpcId: "", zoneSubnets: {} };
  const [config, setConfig] = useState<NetworkConfig>(INITIAL_NETWORK_CONFIG);
  const [savedConfig, setSavedConfig] = useState<NetworkConfig>(INITIAL_NETWORK_CONFIG); // 上次保存的快照
  const [isDirty, setIsDirty] = useState(false);
  const [showVpcSaveDialog, setShowVpcSaveDialog] = useState(false);
  const [refreshingVpc, setRefreshingVpc] = useState(false);
  const [refreshingZone, setRefreshingZone] = useState<string | null>(null);
  // Combobox 搜索状态
  const [vpcOpen, setVpcOpen] = useState(false);
  const [vpcSearch, setVpcSearch] = useState("");
  const [subnetOpen, setSubnetOpen] = useState<Record<string, boolean>>({});
  const [subnetSearch, setSubnetSearch] = useState<Record<string, string>>({});

  // 迁移状态
  type MigrationBusinessState = "idle" | "running" | "success" | "failed";
  type MigrationViewState = "hidden" | "confirm" | "execution" | "result";
  type ConfirmMigrationTab = "migratable" | "blocked";
  type MigrationResultTab = "success" | "failed";
  type InstanceTaskStatus = "待迁移" | "迁移中" | "迁移成功" | "迁移失败";
  type MigrationInstance = typeof MIGRATION_INSTANCES[number];
  type InstanceTask = {
    user: string;
    instance: string;
    currentNet: string;
    targetNet: string;
    status: InstanceTaskStatus;
    failReason?: string;
  };

  const migrationDialogTitle = "Agent 云服务器网络迁移";
  const migrationFlowSteps = ["确认迁移范围", "执行迁移", "查看迁移结果"] as const;
  const confirmTableColumns = ["用户名", "Agent 云服务器", "当前网络", "目标网络", "说明"] as const;
  const executionTableColumns = ["用户名", "Agent 云服务器", "迁移任务状态"] as const;
  const resultTableColumns = ["用户名", "Agent 云服务器", "当前网络", "迁移任务状态", "说明"] as const;
  const confirmTableGridClass = "grid grid-cols-[1.3fr_1.4fr_1.7fr_1.7fr_1.8fr]";
  const executionTableGridClass = "grid grid-cols-[1.5fr_1.5fr_1fr]";
  const resultTableGridClass = "grid grid-cols-[1.3fr_1.4fr_1.7fr_1fr_2fr]";
  const migratableInstances = MIGRATION_INSTANCES.filter((item) => item.note === "可迁移");
  const blockedInstances = MIGRATION_INSTANCES.filter((item) => item.note !== "可迁移");
  const buildMigrationTasks = (items: MigrationInstance[] = migratableInstances): InstanceTask[] => (
    items.map((item) => ({
      user: item.user,
      instance: item.instance,
      currentNet: item.currentNet,
      targetNet: item.targetNet,
      status: "待迁移"
    }))
  );

  const [migrationBusinessState, setMigrationBusinessState] = useState<MigrationBusinessState>("idle");
  const [migrationViewState, setMigrationViewState] = useState<MigrationViewState>("hidden");
  const [confirmMigrationTab, setConfirmMigrationTab] = useState<ConfirmMigrationTab>("migratable");
  const [confirmTableExpanded, setConfirmTableExpanded] = useState(false);
  const [migrationResultTab, setMigrationResultTab] = useState<MigrationResultTab>("success");
  const [currentMigrationRunMode, setCurrentMigrationRunMode] = useState<"all" | "retryFailed" | null>(null);
  const [resolvedFailureInstances, setResolvedFailureInstances] = useState<string[]>([]);
  const [instanceTasks, setInstanceTasks] = useState<InstanceTask[]>(() => buildMigrationTasks());
  const [activeMigrationInstanceNames, setActiveMigrationInstanceNames] = useState<string[]>(() => migratableInstances.map((item) => item.instance));

  const activeConfirmInstances = confirmMigrationTab === "migratable" ? migratableInstances : blockedInstances;
  const migrationImpactSummary = {
    instanceCount: MIGRATION_INSTANCES.length,
    userCount: new Set(MIGRATION_INSTANCES.map((item) => item.user)).size
  };
  const activeMigrationInstanceNameSet = new Set(activeMigrationInstanceNames);
  const activeMigrationTasks = instanceTasks.filter((task) => activeMigrationInstanceNameSet.has(task.instance));
  const failedMigrationTasks = instanceTasks.filter((task) => task.status === "迁移失败");
  const currentRunSuccessfulMigrationTasks = activeMigrationTasks.filter((task) => task.status === "迁移成功");
  const currentRunFailedMigrationTasks = activeMigrationTasks.filter((task) => task.status === "迁移失败");
  const currentRunHasRunningTasks = activeMigrationTasks.some((task) => task.status === "待迁移" || task.status === "迁移中");
  const isCurrentRunCompleted = activeMigrationTasks.length > 0 && !currentRunHasRunningTasks;
  const isRetryFailedRun = currentMigrationRunMode === "retryFailed";
  const isRetryRunCompletedWithAllSuccess = isCurrentRunCompleted && isRetryFailedRun && currentRunFailedMigrationTasks.length === 0;
  const hasRunningTasks = instanceTasks.some((task) => task.status === "待迁移" || task.status === "迁移中");
  const hasFailedTasks = failedMigrationTasks.length > 0;
  const shouldShowMigrationBanner = migrationBusinessState !== "success";
  const migrationBannerState: "idle" | "running" | "failed" = migrationBusinessState === "running"
    ? "running"
    : migrationBusinessState === "failed"
      ? "failed"
      : "idle";
  const isMigrationConfirmOpen = migrationViewState === "confirm";
  const isMigrationProgressOpen = migrationViewState === "execution" || migrationViewState === "result";
  const isViewingMigrationResult = migrationViewState === "result";
  const resultTabs = migrationBusinessState === "failed" ? (["success", "failed"] as const) : (["success"] as const);
  const activeResultTasks = migrationResultTab === "failed" ? currentRunFailedMigrationTasks : currentRunSuccessfulMigrationTasks;

  const closeMigrationDialog = () => {
    setMigrationViewState("hidden");
  };

  const openMigrationConfirmDialog = () => {
    setConfirmMigrationTab("migratable");
    setConfirmTableExpanded(false);
    setMigrationViewState("confirm");
  };

  const openMigrationProgressDialog = () => {
    setMigrationViewState("execution");
  };

  const openMigrationResultDialog = (tab: MigrationResultTab = migrationBusinessState === "failed" ? "failed" : "success") => {
    setMigrationResultTab(tab);
    setMigrationViewState("result");
  };

  const startMigrationRun = (mode: "all" | "retryFailed") => {
    const targetInstances = mode === "retryFailed"
      ? migratableInstances.filter((item) => failedMigrationTasks.some((task) => task.instance === item.instance))
      : migratableInstances;

    if (targetInstances.length === 0) {
      toast.error(mode === "retryFailed" ? "暂无可重试的失败实例" : "暂无可迁移实例");
      return;
    }

    const activeInstanceNames = targetInstances.map((item) => item.instance);
    const retryingInstanceNames = mode === "retryFailed" ? activeInstanceNames : [];
    const resolvedInstancesSnapshot = new Set(mode === "retryFailed" ? [...resolvedFailureInstances, ...retryingInstanceNames] : []);

    setActiveMigrationInstanceNames(activeInstanceNames);
    setCurrentMigrationRunMode(mode);
    setMigrationBusinessState("running");
    setMigrationViewState("execution");
    setMigrationResultTab("success");

    if (mode === "retryFailed") {
      setResolvedFailureInstances((prev) => Array.from(new Set([...prev, ...retryingInstanceNames])));
    } else {
      setResolvedFailureInstances([]);
    }

    setInstanceTasks((prev) => {
      if (mode === "retryFailed") {
        return prev.map((task) => (
          retryingInstanceNames.includes(task.instance)
            ? { ...task, status: "待迁移", failReason: undefined }
            : task
        ));
      }

      return buildMigrationTasks(targetInstances);
    });

    const updateTasks = (updater: (tasks: InstanceTask[]) => InstanceTask[]) => {
      setInstanceTasks((prev) => updater(prev));
    };

    const STEP_LABELS = ["确认网络配置", "切换实例网络", "重启实例"] as const;
    const runInstance = (currentInstance: MigrationInstance, stepIndex: number, delayOffset: number) => {
      const stepLabel = STEP_LABELS[stepIndex];
      const failureScenario = MIGRATION_FAILURE_SCENARIOS[currentInstance.instance];

      updateTasks((tasks) =>
        tasks.map((task) =>
          task.instance === currentInstance.instance
            ? { ...task, status: "迁移中", failReason: undefined }
            : task
        )
      );

      setTimeout(() => {
        if (failureScenario?.step === stepLabel && !resolvedInstancesSnapshot.has(currentInstance.instance)) {
          updateTasks((tasks) =>
            tasks.map((task) =>
              task.instance === currentInstance.instance
                ? { ...task, status: "迁移失败", failReason: failureScenario.reason }
                : task
            )
          );
          return;
        }

        if (stepIndex === STEP_LABELS.length - 1) {
          updateTasks((tasks) =>
            tasks.map((task) =>
              task.instance === currentInstance.instance
                ? { ...task, currentNet: currentInstance.targetNet, status: "迁移成功", failReason: undefined }
                : task
            )
          );
          return;
        }

        runInstance(currentInstance, stepIndex + 1, delayOffset);
      }, 700 + delayOffset);
    };

    targetInstances.forEach((currentInstance, index) => {
      const delayOffset = (index % 3) * 120;
      setTimeout(() => runInstance(currentInstance, 0, delayOffset), 300 + index * 220);
    });
  };

  const renderMigrationStepBar = (activeStep: number) => (
    <div className="px-1 py-1">
      <div className="flex items-center">
        {migrationFlowSteps.map((label, index) => {
          const isCompleted = activeStep > index;
          const isActive = activeStep === index;

          return (
            <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isCompleted || isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span
                  className={`truncate text-sm font-medium transition-colors ${
                    isActive
                      ? "text-gray-900"
                      : isCompleted
                        ? "text-blue-600"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < migrationFlowSteps.length - 1 && (
                <div
                  className={`mx-4 h-px flex-1 transition-colors ${
                    activeStep > index ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    if (migrationBusinessState !== "running" || hasRunningTasks) return;

    const nextBusinessState: MigrationBusinessState = hasFailedTasks ? "failed" : "success";
    setMigrationBusinessState(nextBusinessState);
    setMigrationResultTab(nextBusinessState === "failed" ? "failed" : "success");
    setMigrationViewState((prev) => (prev === "hidden" ? "hidden" : "execution"));
  }, [migrationBusinessState, hasRunningTasks, hasFailedTasks]);

  const MigrationBanner = shouldShowMigrationBanner ? (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-amber-800">
          {migrationBannerState === "running" ? (
            <>Agent 云服务器迁移任务正在执行中。单击「<button onClick={openMigrationProgressDialog} className="font-medium text-amber-700 underline underline-offset-2 transition-colors hover:text-amber-900">查看进度</button>」可查看实例迁移情况。</>
          ) : migrationBannerState === "failed" ? (
            <>仍有 Agent 云服务器未完成迁移，请根据失败原因处理后重试。单击「<button onClick={() => openMigrationResultDialog("failed")} className="font-medium text-amber-700 underline underline-offset-2 transition-colors hover:text-amber-900">查看详情</button>」可查看失败实例并继续迁移。</>
          ) : (
            <>检测到当前企业下仍有 Agent 云服务器运行在用户个人 VPC 中，为避免后续网络管理和实例治理持续分散，建议尽快发起迁移。单击「<button onClick={openMigrationConfirmDialog} className="font-medium text-amber-700 underline underline-offset-2 transition-colors hover:text-amber-900">查看详情</button>」可查看迁移范围并确认迁移。</>
          )}
        </p>
      </div>
    </div>
  ) : null;

  const MigrationConfirmDialog = (
    <Dialog open={isMigrationConfirmOpen} onOpenChange={(open) => !open && closeMigrationDialog()}>
      <DialogContent style={{ maxWidth: "min(90vw, 860px)", width: "min(90vw, 860px)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900">{migrationDialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {renderMigrationStepBar(0)}


          <div className="flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-amber-700">
              <li>迁移过程中，Agent 云服务器会重启；迁移完成后，内网 IP 默认会发生变化，请提前告知相关用户。</li>
              <li>仅迁移“可迁移”列表的 Agent 云服务器，您可查看暂不支持迁移的 Agent 云服务器，按提示处理后在发起迁移。</li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4" style={{ minHeight: "44px" }}>
              <div className="flex items-center">
                {(["migratable", "blocked"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setConfirmMigrationTab(tab);
                      setConfirmTableExpanded(false);
                    }}
                    className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                      confirmMigrationTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "migratable" ? "可迁移" : "暂不支持迁移"}
                    <span className="ml-1.5 text-xs text-gray-400">
                      ({tab === "migratable" ? migratableInstances.length : blockedInstances.length})
                    </span>
                  </button>
                ))}
              </div>
              <div className="shrink-0 text-xs text-gray-400">
                <span>
                  涉及 Agent 云服务器数：<span className="tabular-nums font-medium text-gray-700">{migrationImpactSummary.instanceCount}</span>
                </span>
                <span className="mx-2 text-gray-300">｜</span>
                <span>
                  涉及用户数：<span className="tabular-nums font-medium text-gray-700">{migrationImpactSummary.userCount}</span>
                </span>
              </div>
            </div>
            <div className={`${confirmTableGridClass} border-b border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-500`}>
              {confirmTableColumns.map((label) => (
                <span key={label} className="whitespace-nowrap">{label}</span>
              ))}
            </div>
            <div className="divide-y divide-gray-50 bg-white">
              {(confirmTableExpanded ? activeConfirmInstances : activeConfirmInstances.slice(0, 4)).map((item, index) => (
                <div key={`${item.instance}-${index}`} className={`${confirmTableGridClass} items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50/60`}>
                  <span className="truncate text-gray-500">{item.user}</span>
                  <span className="truncate font-medium text-gray-900">{item.instance}</span>
                  <span className="truncate text-gray-500">{item.currentNet}</span>
                  <span className="truncate text-blue-600">{item.targetNet}</span>
                  <span className={item.note === "可迁移" ? "text-green-600" : "text-amber-700"}>{item.note}</span>
                </div>
              ))}
            </div>
            {activeConfirmInstances.length > 4 && (
              <button
                className="w-full border-t border-gray-100 bg-gray-50/50 py-2 text-xs text-blue-500 transition-colors hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setConfirmTableExpanded((value) => !value)}
              >
                {confirmTableExpanded ? "收起" : `展开查看剩余 ${activeConfirmInstances.length - 4} 条实例`}
              </button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeMigrationDialog}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => startMigrationRun("all")}>
            开始迁移
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const MigrationProgressDialog = (
    <Dialog
      open={isMigrationProgressOpen}
      onOpenChange={(open) => {
        if (!open && isViewingMigrationResult) {
          closeMigrationDialog();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-3xl"
        showCloseButton={isViewingMigrationResult}
        style={{ maxWidth: "min(90vw, 900px)", width: "min(90vw, 900px)" }}
        onInteractOutside={(event) => {
          if (!isViewingMigrationResult) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!isViewingMigrationResult) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900">{migrationDialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {renderMigrationStepBar(isViewingMigrationResult ? 2 : 1)}

          {isViewingMigrationResult ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4" style={{ minHeight: "44px" }}>
                <div className="flex items-center">
                  {resultTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMigrationResultTab(tab)}
                      className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                        migrationResultTab === tab
                          ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab === "success" ? "迁移成功" : "迁移失败"}
                      <span className="ml-1.5 text-xs text-gray-400">
                        ({tab === "success" ? currentRunSuccessfulMigrationTasks.length : currentRunFailedMigrationTasks.length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${resultTableGridClass} border-b border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-500`}>
                {resultTableColumns.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto bg-white">
                {activeResultTasks.length > 0 ? activeResultTasks.map((task, index) => (
                  <div key={`${migrationResultTab}-${task.instance}-${index}`} className={`${resultTableGridClass} items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50/60`}>
                    <span className="truncate text-gray-500">{task.user}</span>
                    <span className="truncate font-medium text-gray-900">{task.instance}</span>
                    <span className="truncate text-gray-500">{task.currentNet}</span>
                    <span className={`inline-flex items-center gap-1 font-medium ${migrationResultTab === "success" ? "text-green-600" : "text-red-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${migrationResultTab === "success" ? "bg-green-500" : "bg-red-500"}`} />
                      {migrationResultTab === "success" ? "迁移成功" : "迁移失败"}
                    </span>
                    <span className={migrationResultTab === "success" ? "text-gray-500 leading-relaxed" : "text-red-500 leading-relaxed"}>
                      {migrationResultTab === "success" ? "-" : task.failReason ?? "请稍后重试；如问题持续存在，请联系管理员处理"}
                    </span>
                  </div>
                )) : (
                  <div className="px-3 py-10 text-center text-sm text-gray-400">
                    暂无{migrationResultTab === "success" ? "迁移成功" : "迁移失败"}实例
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className={`${executionTableGridClass} border-b border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-500`}>
                  {executionTableColumns.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto bg-white">
                  {activeMigrationTasks.map((task, index) => (
                    <div key={`${task.instance}-${index}`} className={`${executionTableGridClass} items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50/60`}>
                      <span className="truncate text-gray-500">{task.user}</span>
                      <span className="truncate font-medium text-gray-900">{task.instance}</span>
                      <span className={`inline-flex items-center gap-1 font-medium ${
                        task.status === "迁移成功"
                          ? "text-green-600"
                          : task.status === "迁移中"
                            ? "text-blue-600"
                            : task.status === "迁移失败"
                              ? "text-red-500"
                              : "text-gray-400"
                      }`}>
                        {task.status === "迁移中" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            task.status === "迁移成功"
                              ? "bg-green-500"
                              : task.status === "迁移失败"
                                ? "bg-red-500"
                                : "bg-gray-300"
                          }`} />
                        )}
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          {isViewingMigrationResult ? (
            migrationBusinessState === "failed" ? (
              <>
                <Button variant="outline" onClick={closeMigrationDialog}>稍后处理</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => startMigrationRun("retryFailed")}>
                  重试失败实例
                </Button>
              </>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={closeMigrationDialog}>
                完成
              </Button>
            )
          ) : isCurrentRunCompleted ? (
            isRetryRunCompletedWithAllSuccess ? (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={closeMigrationDialog}>
                完成
              </Button>
            ) : currentRunFailedMigrationTasks.length > 0 ? (
              <>
                <Button variant="outline" onClick={closeMigrationDialog}>
                  最小化
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openMigrationResultDialog()}>
                  下一步：查看结果
                </Button>
              </>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openMigrationResultDialog()}>
                下一步：查看结果
              </Button>
            )
          ) : (
            <Button variant="outline" onClick={closeMigrationDialog}>
              最小化
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // 安全组切换状态
  const [currentSg, setCurrentSg] = useState<SecurityGroup | null>(initialDefaultSecurityGroup);
  const [isSgDialogOpen, setIsSgDialogOpen] = useState(false);
  const [isConfirmSwitchDialogOpen, setIsConfirmSwitchDialogOpen] = useState(false);
  const [sgSearchKeyword, setSgSearchKeyword] = useState("");
  const [sgDialogCandidatePage, setSgDialogCandidatePage] = useState(1);
  const [sgDialogSelected, setSgDialogSelected] = useState<SecurityGroup | null>(null); // 弹窗内选中的候选
  const [sgDialogTab, setSgDialogTab] = useState<"outbound" | "inbound">("outbound");
  const [isSgDialogPanelAccessStaged, setIsSgDialogPanelAccessStaged] = useState(false);

  // 将「当前默认安全组 + 入方向规则」同步到本地快照，供平台策略页等管理员页面只读消费。
  useEffect(() => {
    writeDefaultSecurityGroupSnapshot(currentSg, inboundRules);
  }, [currentSg, inboundRules]);

  // 新建安全组状态
  const [showCreateSgDialog, setShowCreateSgDialog] = useState(false);
  const [createSgDraft, setCreateSgDraft] = useState({ name: "", remark: "" });
  const [createSgCheckedOptions, setCreateSgCheckedOptions] = useState<CommonRuleOptionKey[]>(
    COMMON_RULE_OPTIONS.filter((o) => o.defaultChecked).map((o) => o.key)
  );
  const [createSgPreviewTab, setCreateSgPreviewTab] = useState<"inbound" | "outbound">("outbound");

  // 公网配置状态
  const INITIAL_PUBLIC_CONFIG = { assignPublicIp: true, billingMode: "monthly" as "monthly" | "traffic", bandwidth: 5 };
  const [publicConfig, setPublicConfig] = useState(INITIAL_PUBLIC_CONFIG);
  const [savedPublicConfig, setSavedPublicConfig] = useState(INITIAL_PUBLIC_CONFIG);
  const [isPublicDirty, setIsPublicDirty] = useState(false);

  // 编辑规则状态
  const [editingRule, setEditingRule] = useState<{ id: string; type: "inbound" | "outbound" } | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Rule>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ id: string; type: "inbound" | "outbound" } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<"inbound" | "outbound" | null>(null);
  const [addDraft, setAddDraft] = useState<Partial<Rule>>({});

  // ── VPC 和子网处理函数 ──
  const handleVpcChange = (val: string) => {
    // val: "auto" 表示自动分配，其他为具体 vpc id
    setConfig((prev) => {
      const updatedZoneSubnets: Record<string, string> = {};
      if (val === "auto") {
        // 切换回自动分配：所有可用区子网全部重置为「自动分配」，并禁用交互
        AVAILABLE_ZONES.forEach((zone) => {
          updatedZoneSubnets[zone] = "auto";
        });
      } else {
        // 切换到具体 VPC：所有可用区子网全部重置为「不分配」
        AVAILABLE_ZONES.forEach((zone) => {
          updatedZoneSubnets[zone] = "none";
        });
      }
      return { ...prev, vpcId: val, zoneSubnets: updatedZoneSubnets };
    });
    setIsDirty(true);
  };

  const handleSubnetChange = (zone: string, val: string) => {
    // val: "auto" / "none" / 具体 subnet id
    setConfig((prev) => ({
      ...prev,
      zoneSubnets: { ...prev.zoneSubnets, [zone]: val },
    }));
    setIsDirty(true);
  };

  const handleRefreshVpc = () => {
    setRefreshingVpc(true);
    setTimeout(() => setRefreshingVpc(false), 1000);
  };

  const handleRefreshZone = (zone: string) => {
    setRefreshingZone(zone);
    setTimeout(() => setRefreshingZone(null), 1000);
  };

  const handleDiscard = () => {
    setConfig(savedConfig); // 还原到上次保存的快照
    setIsDirty(false);
  };

  const handleSaveVpc = () => {
    setSavedConfig(config); // 保存当前配置为快照
    toast.success("VPC 和子网配置已保存");
    setShowVpcSaveDialog(false);
    setIsDirty(false);
  };

  const hasAtLeastOneSubnet = Object.values(config.zoneSubnets).some(
    (v) => v !== undefined && v !== "none"
  );

  // ── 公网配置处理函数 ──
  const handleBillingModeChange = (mode: "monthly" | "traffic") => {
    setPublicConfig((prev) => ({
      ...prev,
      billingMode: mode,
      bandwidth: Math.min(prev.bandwidth, mode === "monthly" ? 2000 : 200),
    }));
    setIsPublicDirty(true);
  };

  const handlePublicSave = () => {
    setSavedPublicConfig(publicConfig);
    setIsPublicDirty(false);
    toast.success("公网配置已保存");
  };

  const handlePublicDiscard = () => {
    setPublicConfig(savedPublicConfig);
    setIsPublicDirty(false);
  };

  const applyCurrentSecurityGroup = (sg: SecurityGroup) => {
    setCurrentSg(sg);
    setInboundRules(sg.inboundRules);
    setOutboundRules(sg.outboundRules);
  };

  const resetCreateSecurityGroupState = () => {
    setCreateSgDraft({ name: "", remark: "" });
    setCreateSgCheckedOptions(COMMON_RULE_OPTIONS.filter((o) => o.defaultChecked).map((o) => o.key));
    setCreateSgPreviewTab("outbound");
  };

  const openCreateSecurityGroupDialog = () => {
    resetCreateSecurityGroupState();
    setShowCreateSgDialog(true);
  };

  const closeCreateSecurityGroupDialog = () => {
    setShowCreateSgDialog(false);
    resetCreateSecurityGroupState();
  };

  const handleCreateSecurityGroupDialogOpenChange = (open: boolean) => {
    if (open) {
      setShowCreateSgDialog(true);
      return;
    }
    closeCreateSecurityGroupDialog();
  };

  const handleCreateSgOptionToggle = (optionKey: CommonRuleOptionKey, checked: boolean) => {
    setCreateSgCheckedOptions((prev) => {
      if (checked) return [...prev, optionKey];
      return prev.filter((k) => k !== optionKey);
    });
  };

  const openSelectSecurityGroupDialog = () => {
    setSgSearchKeyword("");
    setSgDialogCandidatePage(1);
    setSgDialogSelected(null);
    setSgDialogTab("outbound");
    setIsSgDialogPanelAccessStaged(false);
    setIsSgDialogOpen(true);
  };

  const closeSelectSecurityGroupDialog = () => {
    setSgSearchKeyword("");
    setSgDialogCandidatePage(1);
    setIsSgDialogPanelAccessStaged(false);
    setIsSgDialogOpen(false);
  };

  // ── 规则表格内容组件（不包含卡片外层）──
  function RuleTableBody({ rules, type, readonly = false, onEdit, onDelete, paginate = false }: RuleTableBodyProps) {
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
      setPage(1);
    }, [type, rules.length]);

    const totalPages = Math.max(1, Math.ceil(rules.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const displayRules = paginate ? rules.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) : rules;

    return (
      <div className="flex flex-col w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{type === "inbound" ? "来源" : "目标"}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">协议</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">端口</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">策略</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">备注</th>
              {!readonly && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayRules.length > 0 ? (
              displayRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{rule.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{rule.protocol}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{rule.port}</td>
                  <td className="px-6 py-4">
                    {rule.policy === "允许" ? (
                      <span className="badge-running">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        {rule.policy}
                      </span>
                    ) : (
                      <span className="badge-stopped">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        {rule.policy}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{rule.remark || "—"}</td>
                  {!readonly && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit?.(rule, type)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete?.(rule, type)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={readonly ? 5 : 6} className="px-6 py-8">
                  {type === "outbound" ? (
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-lg mx-auto">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 leading-relaxed">出站规则为空时，所有出站流量将被拒绝，Agent 将无法正常使用</p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-400">暂无入站规则</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {paginate && (
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between bg-white">
            <span className="text-xs text-gray-400">共 {rules.length} 条规则</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 text-xs ${p === currentPage
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const renderSelectExistingSecurityGroupDialog = ({
    open,
    searchKeyword,
    selectedSecurityGroup,
    previewTab,
    candidateSecurityGroups,
    candidatePage,
    candidateTotalPages,
    shouldShowPanelAccessAssist,
    isPanelAccessStaged,
    onOpenChange,
    onSearchChange,
    onClearSearch,
    onSelectSecurityGroup,
    onCandidatePageChange,
    onTogglePanelAccessStaged,
    onPreviewTabChange,
    onCancel,
    onConfirm,
  }: SelectExistingSecurityGroupDialogProps) => (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="flex flex-col p-0 gap-0 overflow-hidden"
        style={{ width: "min(90vw, 704px)", maxWidth: "704px", maxHeight: "min(90vh, 820px)" }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* 弹窗标题栏 */}
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-base font-semibold text-gray-900">
            选择已有安全组
          </DialogTitle>
        </DialogHeader>

        {/* 内容区（可滚动） */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
          <div className="px-6 pt-5 pb-4 space-y-4">
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <p className="text-xs leading-relaxed text-blue-600">
                以下安全组均为已在腾讯云控制台创建的安全组，您可按需选择，作为当前企业下 Agent 的安全组。
              </p>
            </div>
            <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="relative border-b border-gray-100 p-4">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索安全组名称或 ID"
                      value={searchKeyword}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full pl-9 pr-9 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchKeyword && (
                      <button
                        onClick={onClearSearch}
                        className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    {candidateSecurityGroups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Shield className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm">未找到匹配的安全组</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          {candidateSecurityGroups.map((sg) => {
                            const isSelected = selectedSecurityGroup?.id === sg.id;
                            return (
                              <button
                                key={sg.id}
                                onClick={() => onSelectSecurityGroup(sg)}
                                className={`w-full text-left px-4 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  isSelected
                                    ? "bg-blue-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 shrink-0">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-300 bg-white"
                                    }`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{sg.name}</span>
                                      <span className="text-xs text-gray-400 font-mono shrink-0 truncate max-w-[140px]">(id: {sg.id})</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sg.remark || "—"}</p>
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1.5 shrink-0 text-xs text-gray-400 whitespace-nowrap">
                                    <span>入站 {sg.inboundCount} 条</span>
                                    <span className="text-gray-200">|</span>
                                    <span>出站 {sg.outboundCount} 条</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {candidateTotalPages > 1 && (
                          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2.5">
                            <span className="text-xs text-gray-400">第 {candidatePage} / {candidateTotalPages} 页</span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                                disabled={candidatePage === 1}
                                onClick={() => onCandidatePageChange(candidatePage - 1)}
                              >
                                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                                上一页
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                                disabled={candidatePage === candidateTotalPages}
                                onClick={() => onCandidatePageChange(candidatePage + 1)}
                              >
                                下一页
                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
            </div>

            {selectedSecurityGroup && (
              <div>
                <div className="mb-3">
                  <Label className="text-sm font-medium text-gray-700">规则预览</Label>
                </div>
                {shouldShowPanelAccessAssist && (
                  <div className={`mb-3 rounded-lg border px-3 py-2.5 ${
                    isPanelAccessStaged
                      ? "border-blue-100 bg-blue-50"
                      : "border-amber-100 bg-amber-50"
                  }`}>
                    <div className="flex items-start gap-2">
                      {isPanelAccessStaged ? (
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      )}
                      <p className={`text-xs leading-relaxed ${isPanelAccessStaged ? "text-blue-600" : "text-amber-700"}`}>
                        {isPanelAccessStaged
                          ? "已根据当前已启用的 ClawPro 配置，为该安全组补齐所需规则，确认后将随安全组切换一并生效。"
                          : "检测到当前安全组缺少当前已启用的 ClawPro 配置所需规则，可能影响相关功能使用。"}
                        {" "}
                        <button
                          type="button"
                          onClick={onTogglePanelAccessStaged}
                          className={`inline-flex items-center whitespace-nowrap align-middle rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${isPanelAccessStaged ? "border-blue-200 bg-white text-blue-600 hover:bg-blue-50" : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"}`}
                        >
                          {isPanelAccessStaged ? "取消添加" : "一键添加"}
                        </button>
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center px-4 border-b border-gray-100" style={{ minHeight: "44px" }}>
                    {(["outbound", "inbound"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => onPreviewTabChange(tab)}
                        className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                          previewTab === tab
                            ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab === "outbound" ? "出站规则" : "入站规则"}
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({tab === "outbound" ? selectedSecurityGroup.outboundCount : selectedSecurityGroup.inboundCount})
                        </span>
                      </button>
                    ))}
                    <span className="ml-auto text-xs text-gray-400 pr-2">仅预览，不可编辑</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
                    <RuleTableBody
                      rules={previewTab === "outbound" ? selectedSecurityGroup.outboundRules : selectedSecurityGroup.inboundRules}
                      type={previewTab}
                      readonly={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部：操作按钮（固定） */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-4 bg-white">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              取消
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedSecurityGroup}
              onClick={onConfirm}
            >
              确定
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const availableSubnets = config.vpcId ? (MOCK_SUBNETS[config.vpcId] ?? []) : [];
  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const selectableSecurityGroups = MOCK_SECURITY_GROUP_DIALOG_CANDIDATES.filter(
    (sg) =>
      sg.id !== currentSg?.id &&
      (sgSearchKeyword === "" ||
        sg.name.toLowerCase().includes(sgSearchKeyword.toLowerCase()) ||
        sg.id.toLowerCase().includes(sgSearchKeyword.toLowerCase()) ||
        (sg.remark ?? "").toLowerCase().includes(sgSearchKeyword.toLowerCase()))
  );
  const selectableSecurityGroupTotalPages = Math.max(1, Math.ceil(selectableSecurityGroups.length / SECURITY_GROUP_DIALOG_PAGE_SIZE));
  const selectableSecurityGroupCurrentPage = Math.min(sgDialogCandidatePage, selectableSecurityGroupTotalPages);
  const pagedSelectableSecurityGroups = selectableSecurityGroups.slice(
    (selectableSecurityGroupCurrentPage - 1) * SECURITY_GROUP_DIALOG_PAGE_SIZE,
    selectableSecurityGroupCurrentPage * SECURITY_GROUP_DIALOG_PAGE_SIZE
  );

  useEffect(() => {
    if (sgDialogCandidatePage > selectableSecurityGroupTotalPages) {
      setSgDialogCandidatePage(1);
    }
  }, [sgDialogCandidatePage, selectableSecurityGroupTotalPages]);

  const hasNetworkTemplateWarning = hasCommonRulePreviewRule(inboundRules, NETWORK_TEMPLATE_WARNING_KEY, "inbound");
  const activePanelAccessPort = panelPort || DEFAULT_PANEL_ACCESS_PORT;
  const panelAccessRequiredRules = allowPanelAccess ? buildPanelAccessRequiredRules(activePanelAccessPort) : [];
  const sgDialogMissingPanelAccessRules = Boolean(
    allowPanelAccess
    && sgDialogSelected
    && panelAccessRequiredRules.some((expectedRule) =>
      !sgDialogSelected.inboundRules.some((rule) => doesRuleCoverPanelAccessRequirement(rule, expectedRule))
    )
  );
  const sgDialogPreviewSecurityGroup = sgDialogSelected && isSgDialogPanelAccessStaged
    ? buildSecurityGroupWithPanelAccessRules(sgDialogSelected, activePanelAccessPort)
    : sgDialogSelected;
  const shouldShowSgDialogPanelAccessAssist = Boolean(
    sgDialogSelected && allowPanelAccess && (sgDialogMissingPanelAccessRules || isSgDialogPanelAccessStaged)
  );

  // VPC 切换且 CIDR 不一致的补充说明逻辑
  const isVpcSwitched = config.vpcId !== savedConfig.vpcId;
  const oldVpcCidr = MOCK_VPCS.find((v) => v.id === savedConfig.vpcId)?.cidr || (!savedConfig.vpcId || savedConfig.vpcId === "auto" ? AUTO_ASSIGNED_VPC.cidr : "");
  const targetVpcCidr = MOCK_VPCS.find((v) => v.id === config.vpcId)?.cidr || (!config.vpcId || config.vpcId === "auto" ? AUTO_ASSIGNED_VPC.cidr : "");
  const hasVpcCidrWarning = isVpcSwitched && targetVpcCidr !== oldVpcCidr && [...inboundRules, ...outboundRules].some(
    (r) => r.source === oldVpcCidr && r.protocol === "ALL" && r.port === "ALL" && r.policy === "拒绝"
  );

  return (
    <>
      <div className="page-enter max-w-5xl">

        {/* 页头 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">网络管理</h1>
        </div>

        {/* Tab 切换器 */}
        <div className="flex items-center gap-1 mb-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 描述 */}
        <p className="text-sm text-gray-500 mt-3 mb-6 leading-relaxed">{currentTab.description}</p>

        {/* Tab 内容 */}
        {activeTab === "security" && (
        <div className="flex flex-col gap-6">
          {/* 风险提示 */}
          {currentSg && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed space-y-1">
                <p>• 当前企业下<span className="font-semibold">所有 Agent 云服务器</span>共用同一个安全组。切换安全组或修改安全组规则后，将立即统一生效，请谨慎操作。</p>
                <p>• 如该安全组已关联其他腾讯云资源，后续对安全组规则的修改也会<span className="font-semibold">同步影响</span>这些资源，请谨慎操作。</p>
              </div>
            </div>
          )}


          {/* 安全组与规则配置卡片 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-6 border-b border-gray-100" style={{ minHeight: "56px" }}>
              <span className="text-sm font-semibold text-gray-800">安全组</span>
            </div>

            {/* 1. 安全组配置项（标准配置行） */}
            <div className="px-6 py-5 border-b border-gray-100">
              {currentSg ? (
                <div className="w-full flex items-center gap-6">
                  <div className="w-full max-w-md flex items-center justify-between gap-4 px-4 py-2.5 bg-white border border-gray-200 rounded-lg group text-left min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {currentSg.name}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-xs text-gray-500 truncate cursor-default">
                              {currentSg.id} <span className="mx-1.5 text-gray-200">|</span> {currentSg.remark || "—"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md text-xs leading-relaxed">
                            {currentSg.id} | {currentSg.remark || "—"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <button
                      onClick={openSelectSecurityGroupDialog}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      切换
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex-col text-center">
                    <div className="text-sm text-gray-500 mb-4">暂未配置安全组</div>

                    <div className="flex gap-3 mb-4">
                      <Button
                        onClick={openCreateSecurityGroupDialog}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6 text-sm btn-primary-glow"
                        style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                      >
                        新建安全组
                      </Button>
                      <Button
                        variant="outline"
                        onClick={openSelectSecurityGroupDialog}
                        className="h-9 px-6 text-sm bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                      >
                        选择已有安全组
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400">设置完成后，当前企业下所有 Agent 所在云服务器将默认关联该安全组</p>
                  </div>
                </div>
              )}
            </div>

            {/* 规则表区域：直接在外层卡片中展示，左右顶边，通过分割线区分层级 */}
            <div className="flex flex-col mt-4">
              {/* 规则Tab + 添加按钮 */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6" style={{ minHeight: "40px" }}>
                <div className="flex items-center gap-6">
                  {(["outbound", "inbound"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSecurityTab(t)}
                      className={`relative pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                        securityTab === t
                          ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t === "outbound" ? "出站规则" : "入站规则"}
                    </button>
                  ))}
                </div>
                <div className="pb-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!currentSg) return;
                      setShowAddDialog(securityTab);
                    }}
                    className={`h-8 gap-1 text-white ${currentSg ? 'btn-primary-glow' : 'opacity-50 cursor-not-allowed'}`}
                    style={{ background: currentSg ? "linear-gradient(135deg, #007AFF, #5856D6)" : "#d1d5db" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加规则
                  </Button>
                </div>
              </div>

              {/* 规则表 */}
              <div className="bg-white">
                {currentSg ? (
                  <RuleTableBody
                    rules={securityTab === "outbound" ? outboundRules : inboundRules}
                    type={securityTab}
                    readonly={false}
                    paginate={true}
                    onEdit={(rule, type) => {
                      setEditingRule({ id: rule.id, type });
                      setEditDraft(rule);
                    }}
                    onDelete={(rule, type) => {
                      setShowDeleteDialog({ id: rule.id, type });
                    }}
                  />
                ) : (
                  <div className="px-6 py-10 flex flex-col items-center justify-center border-t border-gray-50">
                    {securityTab === "outbound" ? (
                      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-lg w-full">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800 leading-relaxed">出站规则为空时，所有出站流量将被拒绝，Agent 将无法正常使用</p>
                      </div>
                    ) : (
                      <>
                        <Shield className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">暂无入站规则</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        )}

        {activeTab === "vpc" && (
        <div>
          {/* 私有网络与子网顶部提示条 */}
          {MigrationBanner}

          {/* 说明文字区域 */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <ul className="text-xs text-blue-700 leading-relaxed space-y-1.5">
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span><span className="font-medium">私有网络（VPC）：</span>选择「自动分配」时，系统会为企业统一分配 VPC，所有用户创建的 Agent 云服务器将默认共享该 VPC；您也可以选择其他已有 VPC，作为企业统一使用的 VPC。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span><span className="font-medium">子网：</span>选择「自动分配」 VPC 时，系统会将 Agent 云服务器随机部署到系统分配可用区的子网下；您也可选择其他的 VPC 下的子网，或选择「不分配」跳过该可用区部署。</span>
              </li>
              <li className="flex gap-1.5">
                <span className="shrink-0">•</span>
                <span>如需限制实例间的内网互访，请将安全策略设置为内网不互通，以实现 Agent 云服务器间的隔离。</span>
              </li>
            </ul>
          </div>

          {/* VPC / 子网配置卡片 */}
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 border-b border-gray-100" style={{ minHeight: "56px" }}>
              <span className="text-sm font-semibold text-gray-800">私有网络与子网配置</span>
              {isDirty && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    className="h-7 px-3 text-xs text-gray-500"
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // 校验是否至少有一个可用区选择了子网
                      // 自动分配(""/undefined)和具体子网 ID 都算有效，只有 "none" 才算未选
                      const allNone = AVAILABLE_ZONES.every((z) => {
                        const v = config.zoneSubnets[z];
                        return v === "none";
                      });
                      if (allNone) {
                        toast.error("请至少选择一个子网");
                        return;
                      }
                      setShowVpcSaveDialog(true);
                    }}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    保存
                  </Button>
                </div>
              )}
            </div>

            {/* ── 私有网络区域 ── */}
            <div className="px-6 py-4 border-b border-gray-100">
              {/* 字段标题行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 mb-2">
                <span className="text-xs font-medium text-gray-400">私有网络（VPC）</span>
                <span />
              </div>
              {/* VPC 数据行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 items-center">
                {/* 左：地域 */}
                <span className="text-sm text-[oklch(0.707_0.022_261.325)]">全局</span>

                {/* 中： Combobox（自动分配 + 所有可选 VPC，支持关键字搜索） */}
                {(() => {
                  const currentVpc = MOCK_VPCS.find(v => v.id === config.vpcId);
                  const isAuto = !config.vpcId || config.vpcId === "auto";
                  const displayLabel = isAuto
                    ? "自动分配"
                    : currentVpc ? `${currentVpc.id} | ${currentVpc.name} | ${currentVpc.cidr}` : config.vpcId;
                  const filteredVpcs = vpcSearch
                    ? MOCK_VPCS.filter(v =>
                        `${v.id} ${v.name} ${v.cidr}`.toLowerCase().includes(vpcSearch.toLowerCase())
                      )
                    : MOCK_VPCS;
                  return (
                    <Popover open={vpcOpen} onOpenChange={(o) => { setVpcOpen(o); if (!o) setVpcSearch(""); }}>
                      <PopoverTrigger asChild>
                        <button
                          className={`h-9 w-full flex items-center justify-between px-3 rounded-md border border-gray-200 bg-white text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                            isAuto ? "text-[oklch(0.707_0.022_261.325)]" : "text-[oklch(0.446_0.03_256.802)]"
                          }`}
                        >
                          <span className="truncate">{displayLabel}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 ml-2" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                        style={{ width: "var(--radix-popover-trigger-width)" }}
                        align="start"
                        sideOffset={4}
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="搜索 VPC…"
                            value={vpcSearch}
                            onValueChange={setVpcSearch}
                            className="text-sm"
                          />
                          <CommandList className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                            <CommandEmpty className="py-3 text-xs text-gray-400 text-center">未找到匹配的 VPC</CommandEmpty>
                            <CommandGroup>
                              {/* 自动分配选项：仅在无搜索关键字时显示 */}
                              {!vpcSearch && (
                                <CommandItem
                                  value="auto"
                                  onSelect={() => { handleVpcChange("auto"); setVpcOpen(false); setVpcSearch(""); }}
                                  className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                >
                                  <span className="flex-1">自动分配</span>
                                  {isAuto && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                </CommandItem>
                              )}
                              {filteredVpcs.map((vpc) => (
                                <CommandItem
                                  key={vpc.id}
                                  value={vpc.id}
                                  onSelect={() => { handleVpcChange(vpc.id); setVpcOpen(false); setVpcSearch(""); }}
                                  className="text-[oklch(0.446_0.03_256.802)] cursor-pointer"
                                >
                                  <span className="flex-1">{vpc.id} | {vpc.name} | {vpc.cidr}</span>
                                  {config.vpcId === vpc.id && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                })()}

                {/* 刷新按钮 */}
                <button
                  onClick={handleRefreshVpc}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
                  title="刷新私有网络列表"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingVpc ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* ── 子网区域 ── */}
            <div>
              {/* 字段标题行 */}
              <div className="grid grid-cols-[100px_1fr_40px] gap-4 px-6 py-2.5 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-400">系统分配可用区</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-300 hover:text-gray-400 cursor-default shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[240px] text-xs leading-relaxed">
                        系统自动选择的 Agent 云服务器主力可用区，不可修改。可通过指定子网来规定云服务器部署在哪个可用区。
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs font-medium text-gray-400">子网</span>
                <span />
              </div>

              {/* 每个可用区一行 */}
              {AVAILABLE_ZONES.map((zone, idx) => {
                const isRefreshing = refreshingZone === zone;
                const subnetVal = config.zoneSubnets[zone] ?? "auto";
                // 当前生效的 VPC ID：自动分配时用系统分配的 VPC
                const effectiveVpcId = (config.vpcId && config.vpcId !== "auto") ? config.vpcId : AUTO_ASSIGNED_VPC.id;
                const zoneSubnets = MOCK_SUBNETS[effectiveVpcId] ?? [];
                // VPC 是否为自动分配（子网禁用状态依赖此变量）
                const isAutoVpc = !config.vpcId || config.vpcId === "auto";

                return (
                  <div
                    key={zone}
                    className={`grid grid-cols-[100px_1fr_40px] gap-4 items-center px-6 py-3.5 ${
                      idx < AVAILABLE_ZONES.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    {/* 左：可用区 */}
                    <span className="text-sm text-gray-700">{zone}</span>

                    {/* 中： Combobox（支持关键字搜索） */}
                    {(() => {
                      const currentSubnet = zoneSubnets.find(s => s.id === subnetVal);
                      const subnetDisplayLabel =
                        subnetVal === "auto" ? "自动分配"
                        : subnetVal === "none" ? "不分配"
                        : currentSubnet ? `${currentSubnet.id} | ${currentSubnet.name} | ${currentSubnet.cidr}`
                        : subnetVal;
                      const isSpecialVal = subnetVal === "auto" || subnetVal === "none";
                      const sq = subnetSearch[zone] ?? "";
                      const filteredSubnets = sq
                        ? zoneSubnets.filter(s =>
                            `${s.id} ${s.name} ${s.cidr}`.toLowerCase().includes(sq.toLowerCase())
                          )
                        : zoneSubnets;
                      return (
                        <Popover
                          open={isAutoVpc ? false : !!subnetOpen[zone]}
                          onOpenChange={(o) => {
                            if (isAutoVpc) return;
                            setSubnetOpen(prev => ({ ...prev, [zone]: o }));
                            if (!o) setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              disabled={isAutoVpc}
                              className={`h-9 w-full flex items-center justify-between px-3 rounded-md border bg-white text-sm transition-colors ${
                                isAutoVpc
                                  ? "border-gray-100 bg-gray-50 text-[oklch(0.707_0.022_261.325)] opacity-60 cursor-not-allowed"
                                  : `border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                      isSpecialVal ? "text-[oklch(0.707_0.022_261.325)]" : "text-[oklch(0.446_0.03_256.802)]"
                                    }`
                              }`}
                            >
                              <span className="truncate">{subnetDisplayLabel}</span>
                              <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 ml-2" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0 shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                            style={{ width: "var(--radix-popover-trigger-width)" }}
                            align="start"
                            sideOffset={4}
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="搜索子网…"
                                value={sq}
                                onValueChange={(v) => setSubnetSearch(prev => ({ ...prev, [zone]: v }))}
                                className="text-sm"
                              />
                              <CommandList className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                                <CommandEmpty className="py-3 text-xs text-gray-400 text-center">未找到匹配的子网</CommandEmpty>
                                <CommandGroup>
                                  {/* 不分配：始终显示在最顶部（无搜索关键字时） */}
                                  {!sq && (
                                    <CommandItem
                                      value="none"
                                      onSelect={() => {
                                        handleSubnetChange(zone, "none");
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                    >
                                      <span className="flex-1">不分配</span>
                                      {subnetVal === "none" && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  )}
                                  {/* 自动分配：仅 VPC 为自动分配且无搜索关键字时显示 */}
                                  {isAutoVpc && !sq && (
                                    <CommandItem
                                      value="auto"
                                      onSelect={() => {
                                        handleSubnetChange(zone, "auto");
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.707_0.022_261.325)] cursor-pointer"
                                    >
                                      <span className="flex-1">自动分配</span>
                                      {subnetVal === "auto" && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  )}
                                  {filteredSubnets.map((subnet) => (
                                    <CommandItem
                                      key={subnet.id}
                                      value={subnet.id}
                                      onSelect={() => {
                                        handleSubnetChange(zone, subnet.id);
                                        setSubnetOpen(prev => ({ ...prev, [zone]: false }));
                                        setSubnetSearch(prev => ({ ...prev, [zone]: "" }));
                                      }}
                                      className="text-[oklch(0.446_0.03_256.802)] cursor-pointer"
                                    >
                                      <span className="flex-1">{subnet.id} | {subnet.name} | {subnet.cidr}</span>
                                      {subnetVal === subnet.id && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}

                    {/* 刷新按鈕 */}
                    <button
                      onClick={() => handleRefreshZone(zone)}
                      disabled={isAutoVpc}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                        isAutoVpc
                          ? "border-gray-100 text-gray-300 opacity-60 cursor-not-allowed"
                          : "border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300"
                      }`}
                      title="刷新子网列表"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 底部提示文案 */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500 leading-relaxed">
                如现有私有网络/子网不符合要求，可以去腾讯云控制台{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/vpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  新建私有网络
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                {" "}或{" "}
                <a
                  href="https://console.cloud.tencent.com/vpc/subnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-0.5"
                >
                  新建子网
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                。
              </p>
            </div>
          </div>
        </div>
        )}

        {activeTab === "public" && (
        <div>
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">公网配置</span>
              {isPublicDirty && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePublicDiscard}>取消</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePublicSave}>保存</Button>
                </div>
              )}
            </div>

            {/* ── 是否分配公网 IP ── */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">是否分配公网 IP</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="!max-w-none w-96 text-xs leading-relaxed text-justify">
                      云服务器需要外网访问能力的时候，需要为云服务器分配公网IP，如果云服务器不分配公网IP，则不支持外出流量，并且无法使用外网IP对外进行互相通信。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignPublicIp"
                    checked={publicConfig.assignPublicIp === true}
                    onChange={() => { setPublicConfig((prev) => ({ ...prev, assignPublicIp: true })); setIsPublicDirty(true); }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">分配</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignPublicIp"
                    checked={publicConfig.assignPublicIp === false}
                    onChange={() => { setPublicConfig((prev) => ({ ...prev, assignPublicIp: false })); setIsPublicDirty(true); }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">不分配</span>
                </label>
              </div>
            </div>

            {/* 带宽计费模式 + 带宽上限（分配公网 IP 时才显示） */}
            {publicConfig.assignPublicIp && (
              <>
                {/* 带宽计费模式 */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">带宽计费模式</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm text-xs leading-relaxed space-y-2">
                          <p><span className="font-semibold">包月带宽：</span>包月的固定带宽是指定公网出方向的带宽的大小，选择单台服务器最大带宽値。固定带宽，流量单价相对于按使用流量的计费方式所使用的费用低，适合网络带宽使用稳定的用户。</p>
                          <p><span className="font-semibold">按流量计费：</span>使用流量是指服务器使用过程中产生的流量大小，网络费用仅取决于云服务器的出流量。为了防止突然爆发的流量产生较高的费用，可选择设置一个带宽上限，带宽上限对于网络单价完全无影响。</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingMode"
                        checked={publicConfig.billingMode === "monthly"}
                        onChange={() => handleBillingModeChange("monthly")}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">包月带宽</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingMode"
                        checked={publicConfig.billingMode === "traffic"}
                        onChange={() => handleBillingModeChange("traffic")}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">按流量计费</span>
                    </label>
                  </div>
                </div>

                {/* 带宽上限 */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">带宽上限</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="!max-w-none w-96 text-xs leading-relaxed text-justify">
                          单台云服务器可以运行到的最高带宽，超过这个带宽上限将默认丢包。不同的网络计费模式，支持的公网带宽上限有所不同。
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* 滑块 */}
                    <div className="flex-1">
                      <Slider
                        min={1}
                        max={publicConfig.billingMode === "monthly" ? 2000 : 200}
                        step={1}
                        value={[publicConfig.bandwidth]}
                        onValueChange={([val]) => { setPublicConfig((prev) => ({ ...prev, bandwidth: val })); setIsPublicDirty(true); }}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">1 Mbps</span>
                        <span className="text-xs text-gray-400">{publicConfig.billingMode === "monthly" ? "2000" : "200"} Mbps</span>
                      </div>
                    </div>
                    {/* 输入框 */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={publicConfig.billingMode === "monthly" ? 2000 : 200}
                        value={publicConfig.bandwidth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const maxBw = publicConfig.billingMode === "monthly" ? 2000 : 200;
                          if (!isNaN(val)) {
                            setPublicConfig((prev) => ({
                              ...prev,
                              bandwidth: Math.max(1, Math.min(val, maxBw)),
                            }));
                            setIsPublicDirty(true);
                          }
                        }}
                        className="w-20 h-9 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">Mbps</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
        )}

        {activeTab === "coming" && (
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
                  为 Agent 调用海外模型或国内模型提供专属优化链路，实现跨境/跨网访问的低延迟、高稳定传输，显著提升大模型交互体验
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
                  提供全球范围内广覆盖、大带宽、低延时的公网出口和高性能接入网关，保障 Agent 各场景下极速、灵活、稳定的网络接入体验
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
                  为 Agent 平台与企业 IDC 之间提供大带宽、高速、安全的互通能力，保障云上云下协同
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* ─── 新建安全组弹窗 ──────────────────────────────────────────────────────────────── */}
      <CreateSecurityGroupDialog
        open={showCreateSgDialog}
        checkedOptions={createSgCheckedOptions}
        draft={createSgDraft}
        previewTab={createSgPreviewTab}
        onOpenChange={handleCreateSecurityGroupDialogOpenChange}
        onOptionToggle={handleCreateSgOptionToggle}
        onNameChange={(name) => setCreateSgDraft((prev) => ({ ...prev, name }))}
        onRemarkChange={(remark) => setCreateSgDraft((prev) => ({ ...prev, remark }))}
        onPreviewTabChange={setCreateSgPreviewTab}
        onCancel={closeCreateSecurityGroupDialog}
        onConfirm={() => {
          if (!createSgDraft.name.trim()) {
            toast.error("请输入安全组名称");
            return;
          }

          const { inbound: initialInbound, outbound: initialOutbound } = buildRulesFromOptions(createSgCheckedOptions);

          const newSg: SecurityGroup = {
            id: "sg-new" + Date.now(),
            name: createSgDraft.name,
            remark: createSgDraft.remark,
            inboundCount: initialInbound.length,
            outboundCount: initialOutbound.length,
            inboundRules: initialInbound,
            outboundRules: initialOutbound,
          };
          MOCK_SECURITY_GROUPS.unshift(newSg);
          applyCurrentSecurityGroup(newSg);
          closeCreateSecurityGroupDialog();
          toast.success("创建成功，当前企业下所有 Agent 将使用该安全组");
        }}
      />

      {/* ─── 切换安全组大弹窗（上下布局） ──────────────────────────────────────────────────────────────── */}
      {renderSelectExistingSecurityGroupDialog({
        open: isSgDialogOpen,
        searchKeyword: sgSearchKeyword,
        selectedSecurityGroup: sgDialogPreviewSecurityGroup,
        previewTab: sgDialogTab,
        candidateSecurityGroups: pagedSelectableSecurityGroups,
        candidatePage: selectableSecurityGroupCurrentPage,
        candidateTotalPages: selectableSecurityGroupTotalPages,
        shouldShowPanelAccessAssist: shouldShowSgDialogPanelAccessAssist,
        isPanelAccessStaged: isSgDialogPanelAccessStaged,
        onOpenChange: (open) => {
          if (!open) {
            closeSelectSecurityGroupDialog();
          }
        },
        onSearchChange: (value) => {
          setSgSearchKeyword(value);
          setSgDialogCandidatePage(1);
        },
        onClearSearch: () => {
          setSgSearchKeyword("");
          setSgDialogCandidatePage(1);
        },
        onSelectSecurityGroup: (sg) => {
          setSgDialogSelected(sg);
          setSgDialogTab("outbound");
          setSgSearchKeyword("");
          setSgDialogCandidatePage(1);
          setIsSgDialogPanelAccessStaged(false);
        },
        onCandidatePageChange: setSgDialogCandidatePage,
        onTogglePanelAccessStaged: () => {
          if (!isSgDialogPanelAccessStaged) {
            setSgDialogTab("inbound");
          }
          setIsSgDialogPanelAccessStaged((prev) => !prev);
        },
        onPreviewTabChange: setSgDialogTab,
        onCancel: closeSelectSecurityGroupDialog,
        onConfirm: () => {
          if (!sgDialogSelected) return;
          setIsConfirmSwitchDialogOpen(true);
        },
      })}

      {/* ─── 确认切换安全组二次确认弹窗 ──────────────────────────────────────────────────────────────── */}
      <Dialog open={isConfirmSwitchDialogOpen} onOpenChange={setIsConfirmSwitchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              确认选择安全组
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm text-red-600 leading-relaxed">
                <ul className="list-disc pl-4 space-y-1">
                  <li>当前企业下<span className="font-semibold">所有 Agent 所在云服务器</span>将统一使用该安全组，包括已有和后续新增的 <span className="font-semibold">Agent 云服务器</span>。</li>
                  <li>如安全组已经关联了您的其他腾讯云资源，则后续安全组规则修改将<span className="font-semibold">同步影响这些资源</span>，请谨慎操作</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsConfirmSwitchDialogOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (sgDialogPreviewSecurityGroup) {
                  applyCurrentSecurityGroup(sgDialogPreviewSecurityGroup);
                  toast.success("安全组已切换，当前企业下所有 Agent 将使用该安全组");
                  setIsConfirmSwitchDialogOpen(false);
                  closeSelectSecurityGroupDialog();
                }
              }}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ─── 添加规则弹窗 ───────────────────────────────────────────────────────────────── */}
      <Dialog
        open={showAddDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(null);
            setAddDraft({});
          }
        }}
      >
        <DialogContent
          className="w-auto"
          style={{ minWidth: "360px", maxWidth: "min(90vw, 480px)" }}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {showAddDialog === "inbound" ? "添加入站规则" : "添加出站规则"}
            </DialogTitle>
          </DialogHeader>

          {/* ── 自定义添加 tab ── */}
            <div className="space-y-4">
              {/* 来源 / 目标 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {showAddDialog === "inbound" ? "来源" : "目标"}
                </Label>
                <Input
                  placeholder={showAddDialog === "inbound" ? "例如：0.0.0.0/0 或 10.0.0.0/8" : "例如：0.0.0.0/0"}
                  value={addDraft.source ?? ""}
                  onChange={(e) => setAddDraft((prev) => ({ ...prev, source: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              {/* 协议 + 端口：两列并排，协议下拉固定宽 */}
              <div className="flex gap-3 items-end">
                <div className="space-y-1.5 flex-none w-[120px]">
                  <Label className="text-sm font-medium text-gray-700">协议</Label>
                  <Select
                    value={addDraft.protocol ?? ""}
                    onValueChange={(v) => setAddDraft((prev) => ({ ...prev, protocol: v }))}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[120px]">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">ALL</SelectItem>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="ICMP">ICMP</SelectItem>
                      <SelectItem value="ICMPv6">ICMPv6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label className="text-sm font-medium text-gray-700">端口</Label>
                  <Input
                    placeholder="例如 80 或 ALL"
                    value={addDraft.port ?? ""}
                    onChange={(e) => setAddDraft((prev) => ({ ...prev, port: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* 策略：下拉固定宽，与协议宽度对齐 */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">策略</Label>
                <Select
                  value={addDraft.policy ?? ""}
                  onValueChange={(v) => setAddDraft((prev) => ({ ...prev, policy: v }))}
                >
                  <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[160px]">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="允许">允许</SelectItem>
                    <SelectItem value="拒绝">拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 备注（可选） */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  备注
                  <span className="text-gray-400 font-normal ml-1">（可选）</span>
                </Label>
                <Input
                  placeholder="简要描述此规则用途"
                  value={addDraft.remark ?? ""}
                  onChange={(e) => setAddDraft((prev) => ({ ...prev, remark: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(null);
                    setAddDraft({});
                  }}
                >
                  取消
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (!addDraft.source?.trim()) {
                      toast.error(showAddDialog === "inbound" ? "请填写来源" : "请填写目标");
                      return;
                    }
                    if (!addDraft.protocol) {
                      toast.error("请选择协议");
                      return;
                    }
                    if (!addDraft.port?.trim()) {
                      toast.error("请填写端口");
                      return;
                    }
                    if (!addDraft.policy) {
                      toast.error("请选择策略");
                      return;
                    }
                    const newRule: Rule = {
                      id: String(Date.now()),
                      source: addDraft.source!,
                      protocol: addDraft.protocol!,
                      port: addDraft.port!,
                      policy: addDraft.policy!,
                      remark: addDraft.remark ?? "",
                    };

                    // 添加规则入口只会在已存在默认安全组时开启，这里直接追加到当前规则即可。
                    if (showAddDialog === "inbound") {
                      setInboundRules((prev) => [...prev, newRule]);
                    } else {
                      setOutboundRules((prev) => [...prev, newRule]);
                    }

                    setShowAddDialog(null);
                    setAddDraft({});
                    toast.success("规则添加成功");
                  }}
                >
                  添加规则
                </Button>
              </DialogFooter>
            </div>
        </DialogContent>
      </Dialog>

      {/* ─── 编辑规则弹窗 ───────────────────────────────────────────────────────────────── */}
      <Dialog
        open={editingRule !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRule(null);
            setEditDraft({});
          }
        }}
      >
        <DialogContent
          className="w-auto"
          style={{ minWidth: "360px", maxWidth: "min(90vw, 480px)" }}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {editingRule?.type === "inbound" ? "编辑入站规则" : "编辑出站规则"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 来源 / 目标 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                {editingRule?.type === "inbound" ? "来源" : "目标"}
              </Label>
              <Input
                placeholder={editingRule?.type === "inbound" ? "例如：0.0.0.0/0 或 10.0.0.0/8" : "例如：0.0.0.0/0"}
                value={editDraft.source ?? ""}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, source: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* 协议 + 端口：两列并排，协议下拉固定宽 */}
            <div className="flex gap-3 items-end">
              <div className="space-y-1.5 flex-none w-[120px]">
                <Label className="text-sm font-medium text-gray-700">协议</Label>
                <Select
                  value={editDraft.protocol ?? ""}
                  onValueChange={(v) => setEditDraft((prev) => ({ ...prev, protocol: v }))}
                >
                  <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[120px]">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ALL</SelectItem>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="ICMP">ICMP</SelectItem>
                    <SelectItem value="ICMPv6">ICMPv6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex-1">
                <Label className="text-sm font-medium text-gray-700">端口</Label>
                <Input
                  placeholder="例如 80 或 ALL"
                  value={editDraft.port ?? ""}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, port: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* 策略：下拉固定宽，与协议宽度对齐 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">策略</Label>
              <Select
                value={editDraft.policy ?? ""}
                onValueChange={(v) => setEditDraft((prev) => ({ ...prev, policy: v }))}
              >
                <SelectTrigger className="h-9 text-sm bg-white border-gray-200 w-[160px]">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="允许">允许</SelectItem>
                  <SelectItem value="拒绝">拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 备注（可选） */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                备注
                <span className="text-gray-400 font-normal ml-1">（可选）</span>
              </Label>
              <Input
                placeholder="简要描述此规则用途"
                value={editDraft.remark ?? ""}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, remark: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRule(null);
                  setEditDraft({});
                }}
              >
                取消
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!editDraft.source?.trim()) {
                    toast.error(editingRule?.type === "inbound" ? "请填写来源" : "请填写目标");
                    return;
                  }
                  if (!editDraft.protocol) {
                    toast.error("请选择协议");
                    return;
                  }
                  if (!editDraft.port?.trim()) {
                    toast.error("请填写端口");
                    return;
                  }
                  if (!editDraft.policy) {
                    toast.error("请选择策略");
                    return;
                  }
                  const updatedRule = {
                    ...editDraft,
                    source: editDraft.source!,
                    protocol: editDraft.protocol!,
                    port: editDraft.port!,
                    policy: editDraft.policy!,
                    remark: editDraft.remark ?? "",
                  } as Rule;
                  if (editingRule?.type === "inbound") {
                    setInboundRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
                  } else {
                    setOutboundRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
                  }
                  setEditingRule(null);
                  setEditDraft({});
                  toast.success("规则修改成功");
                }}
              >
                保存修改
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* VPC 保存确认对话框 */}
      <Dialog open={showVpcSaveDialog} onOpenChange={setShowVpcSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认保存网络配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              确认保存当前私有网络和子网配置？<br />
              修改后将对后续新创建的 Agent 云服务器生效。
            </p>
            {hasNetworkTemplateWarning && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <p className="text-xs text-amber-800 leading-relaxed">
                  检测到当前安全组中存在与旧 VPC 网络配置相关的规则。切换私有网络后，这些规则可能与新的网络配置不一致。保存后，请前往「安全组」检查并调整相关规则。
                </p>
              </div>
            )}
            {hasVpcCidrWarning && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  检测到目标 VPC 的 CIDR 与当前安全组中的 VPC CIDR 规则不一致。切换后，请检查并调整相关安全组规则。
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVpcSaveDialog(false)}>取消</Button>
            <Button onClick={handleSaveVpc} className="bg-blue-600 hover:bg-blue-700 text-white">继续保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {MigrationConfirmDialog}
      {MigrationProgressDialog}
      {/* ─── 删除规则二次确认弹窗 ──────────────────────────────────────────────────────── */}
      <Dialog open={showDeleteDialog !== null} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              确定删除该规则？
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              删除后，相关网络流量策略将立即失效，可能影响现有业务的网络访问。请确认是否继续。
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              取消
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={() => {
                if (showDeleteDialog) {
                  if (showDeleteDialog.type === "inbound") {
                    setInboundRules((prev) => prev.filter((r) => r.id !== showDeleteDialog.id));
                  } else {
                    setOutboundRules((prev) => prev.filter((r) => r.id !== showDeleteDialog.id));
                  }
                  toast.success("规则已删除");
                }
                setShowDeleteDialog(null);
              }}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
