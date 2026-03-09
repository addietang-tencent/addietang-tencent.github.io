/**
 * OpenClawDetail - OpenClaw 详细配置页
 * Design: 「流动蓝图」Fluid Blueprint
 * - 三栏布局：模型 | 通道 | 技能
 * - 参考图片风格：白色卡片，标题带彩色图标
 */
import { useState } from "react";
import { useRoute, Link } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft, ChevronRight, ChevronDown, Trash2, Eye, EyeOff,
  Search, Plus, ExternalLink, Brain, MessageSquare, Puzzle,
  Edit2, Check, X
} from "lucide-react";
import { MOCK_OPENCLAW_LIST, AVAILABLE_MODELS, AVAILABLE_SKILLS } from "@/lib/mockData";

const CHANNEL_OPTIONS = [
  { value: "feishu", label: "飞书", fields: [{ key: "appId", label: "飞书机器人的 App ID" }, { key: "appSecret", label: "飞书机器人的 App Secret" }] },
  { value: "qq", label: "QQ", fields: [{ key: "appId", label: "QQ机器人的 App ID" }, { key: "appSecret", label: "QQ机器人的 App Secret" }] },
  { value: "wework-bot", label: "企业微信机器人", fields: [{ key: "webhookUrl", label: "企业微信机器人 Webhook URL" }] },
  { value: "wework-app", label: "企业微信应用", fields: [{ key: "corpId", label: "企业 Corp ID" }, { key: "agentId", label: "应用 Agent ID" }, { key: "secret", label: "应用 Secret" }] },
  { value: "dingtalk", label: "钉钉", fields: [{ key: "appKey", label: "钉钉应用 App Key" }, { key: "appSecret", label: "钉钉应用 App Secret" }] },
];

export default function OpenClawDetail() {
  const [, params] = useRoute("/openclaw/:id");
  const clawId = params?.id;
  const claw = MOCK_OPENCLAW_LIST.find((c) => c.id === clawId) || MOCK_OPENCLAW_LIST[0];

  const [clawName, setClawName] = useState(claw.name);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(claw.name);

  // Model state
  const [selectedProvider, setSelectedProvider] = useState("tencent-deepseek");
  const [selectedVersion, setSelectedVersion] = useState("DeepSeek V3 0324");
  const [apiKey, setApiKey] = useState("sk-**********************a1b2");
  const [showApiKey, setShowApiKey] = useState(false);
  const [appliedModels, setAppliedModels] = useState([
    { provider: "腾讯云混元", version: "混元 Turbo", apiKey: "sk-****c3d4", active: true },
    { provider: "腾讯云 DeepSeek", version: "DeepSeek R1", apiKey: "sk-****e5f6", active: false },
  ]);

  // Channel state
  const [selectedChannel, setSelectedChannel] = useState("qq");
  const [channelFields, setChannelFields] = useState<Record<string, string>>({});
  const [appliedChannels, setAppliedChannels] = useState([
    { type: "飞书", status: "running" },
    { type: "QQ", status: "running" },
  ]);

  // Skills state
  const [skillSearch, setSkillSearch] = useState("");
  const [installedSkills, setInstalledSkills] = useState(claw.skills || [
    "tavily-search 1.0.0", "summarize 1.0.0", "agent-browser 0.2.0",
    "find-skills 0.1.0", "github 1.0.0", "obsidian 1.0.0",
    "notion 1.0.0", "weather 1.0.0", "tencentcloud-lighthouse-skill 1.0.0",
    "tencent-docs 1.0.3", "xhs-skill 1.0.15", "ai-ppt-generator 1.1.2",
  ]);

  const selectedProviderData = AVAILABLE_MODELS.find((m) => m.value === selectedProvider);

  const handleAddModel = () => {
    if (!apiKey.trim()) { toast.error("请输入 API Key"); return; }
    const providerLabel = selectedProviderData?.label || selectedProvider;
    setAppliedModels([...appliedModels, { provider: providerLabel, version: selectedVersion, apiKey: apiKey.slice(0, 8) + "****", active: false }]);
    toast.success("模型已添加并应用");
  };

  const handleAddChannel = () => {
    const ch = CHANNEL_OPTIONS.find((c) => c.value === selectedChannel);
    if (!ch) return;
    setAppliedChannels([...appliedChannels, { type: ch.label, status: "running" }]);
    setChannelFields({});
    toast.success(`${ch.label} 通道已添加`);
  };

  const handleInstallSkill = (skill: string) => {
    if (installedSkills.includes(skill)) { toast.info("该技能已安装"); return; }
    setInstalledSkills([...installedSkills, skill]);
    toast.success(`${skill} 安装成功`);
  };

  const filteredSkills = AVAILABLE_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <TenantLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Back & Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/my-openclaw">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.1), rgba(88,86,214,0.1))" }}>
            🦞
          </div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-xl font-bold h-9 w-48"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={() => { setClawName(tempName); setEditingName(false); toast.success("名称已更新"); }}>
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setTempName(clawName); setEditingName(false); }}>
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{clawName}</h1>
              <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={() => { setTempName(clawName); setEditingName(true); }}>
                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
              </Button>
              <span className="badge-running ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                运行中
              </span>
            </div>
          )}
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-3 gap-5" style={{ minHeight: 0 }}>
          {/* ===== Model Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">模型 (Models)</h2>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Provider Select */}
              <Select value={selectedProvider} onValueChange={(v) => { setSelectedProvider(v); setSelectedVersion(""); }}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Version Select */}
              {selectedProviderData && selectedProviderData.versions.length > 0 && (
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="选择具体模型版本" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProviderData.versions.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* API Key */}
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="请输入 API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-50 border-gray-200 pr-10"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                className="w-full text-sm"
                variant="outline"
                onClick={handleAddModel}
              >
                添加并应用
              </Button>

              {selectedProviderData && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  {selectedProviderData.label}，集成多家主流模型。
                  <a href="#" className="text-blue-500 hover:underline ml-1">点击获取 API KEY ↗</a>
                </p>
              )}

              {/* Applied Models */}
              {appliedModels.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2">切换模型</p>
                  <div className="space-y-2">
                    {appliedModels.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-800">{m.provider}</span>
                          </div>
                          <p className="text-xs text-gray-400 ml-4.5 mt-0.5">API Key: {m.apiKey}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.active ? (
                            <span className="badge-running text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                              应用中
                            </span>
                          ) : (
                            <span className="badge-stopped text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                              未应用
                            </span>
                          )}
                          <button
                            onClick={() => setAppliedModels(appliedModels.filter((_, i) => i !== idx))}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== Channel Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">通道 (Channels)</h2>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Channel Select */}
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="选择通道类型" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dynamic Fields */}
              {CHANNEL_OPTIONS.find((c) => c.value === selectedChannel)?.fields.map((field) => (
                <div key={field.key} className="relative">
                  <Input
                    type="password"
                    placeholder={field.label}
                    value={channelFields[field.key] || ""}
                    onChange={(e) => setChannelFields({ ...channelFields, [field.key]: e.target.value })}
                    className="bg-gray-50 border-gray-200 pr-10"
                  />
                  <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              ))}

              <Button className="w-full text-sm" variant="outline" onClick={handleAddChannel}>
                添加并应用
              </Button>

              <p className="text-xs text-gray-400 leading-relaxed">
                一键解锁智能玩法，开启你的个性化机器人之旅。
                <a href="#" className="text-blue-500 hover:underline ml-1">查看详情 ↗</a>
              </p>

              {/* Applied Channels */}
              {appliedChannels.length > 0 && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2">已接入通道</p>
                  <div className="space-y-2">
                    {appliedChannels.map((ch, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{ch.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge-running text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            运行中
                          </span>
                          <button
                            onClick={() => setAppliedChannels(appliedChannels.filter((_, i) => i !== idx))}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== Skills Column ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Puzzle className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">技能 (Skills)</h2>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="请输入 ClawHub 中上架的 Skill 名称，或输入后回车搜索"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 text-xs"
                />
              </div>

              <Button className="w-full text-sm" variant="outline" onClick={() => toast.info("功能开发中")}>
                安装技能
              </Button>

              <a href="#" className="text-xs text-blue-500 hover:underline block">获取更多 Skills?</a>

              {/* Installed Skills */}
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2">已安装技能</p>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {(skillSearch ? filteredSkills : installedSkills).map((skill) => (
                    <div key={skill}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                      <span className="text-sm text-gray-700">{skill}</span>
                      <button
                        onClick={() => setInstalledSkills(installedSkills.filter((s) => s !== skill))}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {skillSearch && filteredSkills.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">未找到相关技能</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
