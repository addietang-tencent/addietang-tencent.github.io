/**
 * ModelConfig - 管控端模型配置页
 * Design: 「流动蓝图」Fluid Blueprint - Admin Side
 */
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Plus, Trash2, Info, Brain, Users, Zap, Eye, EyeOff } from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/mockData";

const MOCK_MODELS = [
  { id: "1", name: "腾讯云 DeepSeek", version: "DeepSeek V3 0324", apiKey: "sk-****a1b2c3d4", status: "connected", visible: true, dailyLimit: 500000 },
  { id: "2", name: "腾讯云混元", version: "混元 Turbo", apiKey: "sk-****e5f6g7h8", status: "connected", visible: true, dailyLimit: 200000 },
  { id: "3", name: "腾讯云 DeepSeek", version: "DeepSeek R1", apiKey: "sk-****i9j0k1l2", status: "disconnected", visible: false, dailyLimit: 100000 },
];

const DEFAULT_JSON = `{
  "provider": "provider_name",
  "base_url": "baseurl",
  "api": "API协议",
  "api_key": "your-api-key-here",
  "model": {
    "id": "model_id",
    "name": "model_name"
  }
}`;

export default function ModelConfig() {
  const [models, setModels] = useState(MOCK_MODELS);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<"preset" | "custom">("preset");
  const [customInputMode, setCustomInputMode] = useState<"json" | "form">("form");
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Add form state
  const [newModel, setNewModel] = useState({
    provider: "", version: "", apiKey: "", dailyLimit: 100000,
  });
  const [customForm, setCustomForm] = useState({
    provider: "", base_url: "", api: "", api_key: "", model_id: "", model_name: "", dailyLimit: 100000,
  });
  const [customJson, setCustomJson] = useState(DEFAULT_JSON);

  // Global quota
  const [globalLimit, setGlobalLimit] = useState(1000000);
  const [allowCustomModel, setAllowCustomModel] = useState(false);

  const totalMembers = 5;
  const connectedModels = models.filter((m) => m.status === "connected").length;

  const selectedProviderData = AVAILABLE_MODELS.find((m) => m.value === newModel.provider);

  const handleAddPreset = () => {
    if (!newModel.provider || !newModel.apiKey) { toast.error("请填写完整信息"); return; }
    const providerLabel = selectedProviderData?.label || newModel.provider;
    setModels([...models, {
      id: String(Date.now()), name: providerLabel, version: newModel.version || "自动",
      apiKey: newModel.apiKey.slice(0, 8) + "****", status: "connected", visible: true,
      dailyLimit: newModel.dailyLimit,
    }]);
    setShowAddDialog(false);
    setNewModel({ provider: "", version: "", apiKey: "", dailyLimit: 100000 });
    toast.success("模型已添加");
  };

  const handleAddCustom = () => {
    const name = customInputMode === "form" ? (customForm.provider || "自定义模型") : "自定义模型";
    setModels([...models, {
      id: String(Date.now()), name, version: customInputMode === "form" ? customForm.model_name : "自定义",
      apiKey: "****", status: "connected", visible: true, dailyLimit: customForm.dailyLimit,
    }]);
    setShowAddDialog(false);
    toast.success("自定义模型已添加");
  };

  return (
    <AdminLayout>
      <div className="page-enter space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型配置</h1>
          <p className="text-sm text-gray-500 mt-1">
            配置企业成员可使用的大模型。配置好的模型会展示在企业成员的模型选择里；如果只有一个模型，企业成员将直接使用，无需选择。
          </p>
        </div>

        {/* Part 1: Model List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">模型列表</h2>
            </div>
            <Button size="sm" onClick={() => setShowAddDialog(true)}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              添加模型
            </Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">模型名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">API Key</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">连接状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">每日 Tokens 上限</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-400">{model.version}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-600 font-mono">
                        {showApiKey[model.id] ? model.apiKey : model.apiKey.replace(/./g, "•").slice(0, 12)}
                      </span>
                      <button onClick={() => setShowApiKey({ ...showApiKey, [model.id]: !showApiKey[model.id] })}
                        className="text-gray-300 hover:text-gray-500">
                        {showApiKey[model.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {model.status === "connected" ? (
                      <span className="badge-running text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        已连接
                      </span>
                    ) : (
                      <span className="badge-stopped text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                        未连接
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{model.dailyLimit.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">成员可见</span>
                        <Switch
                          checked={model.visible}
                          onCheckedChange={(v) => {
                            setModels(models.map((m) => m.id === model.id ? { ...m, visible: v } : m));
                            toast.success(v ? "已对成员可见" : "已对成员隐藏");
                          }}
                        />
                      </div>
                      <button
                        onClick={() => { setModels(models.filter((m) => m.id !== model.id)); toast.success("模型已删除"); }}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Part 2: Global Quota */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">全局配额设置</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">企业成员总数</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">已连接模型</p>
              <p className="text-2xl font-bold text-gray-900">{connectedModels}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-400 mb-1">全局每日 Tokens 上限</p>
              <p className="text-2xl font-bold text-blue-600">{globalLimit.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              每日全局 Tokens 数量上限
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  全局 Tokens 指所有企业成员使用所有模型所消耗的总 Tokens 数量，达到上限后当日将暂停服务
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex gap-3">
              <Input
                type="number"
                value={globalLimit}
                onChange={(e) => setGlobalLimit(Number(e.target.value))}
                className="bg-gray-50 border-gray-200 max-w-xs"
              />
              <Button onClick={() => toast.success("全局配额已保存")}
                style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
                保存
              </Button>
            </div>
          </div>
        </div>

        {/* Part 3: Member Model Permission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">企业成员模型权限配置</h2>
          </div>
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex-1 pr-6">
              <p className="text-sm font-medium text-gray-900">允许企业成员自行添加自定义模型</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                开启后，企业成员可以在自己的 OpenClaw 中自行添加自定义模型。
                系统会提醒成员：自定义模型需自行负责配置和管理费用，不在企业的 Tokens 和费用覆盖范围内。
              </p>
            </div>
            <Switch
              checked={allowCustomModel}
              onCheckedChange={(v) => { setAllowCustomModel(v); toast.success(v ? "已允许成员添加自定义模型" : "已禁止成员添加自定义模型"); }}
            />
          </div>
        </div>
      </div>

      {/* Add Model Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Button
                variant={addType === "preset" ? "default" : "outline"}
                size="sm"
                onClick={() => setAddType("preset")}
                className={addType === "preset" ? "" : ""}
                style={addType === "preset" ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
              >
                厂商模型
              </Button>
              <Button
                variant={addType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setAddType("custom")}
                style={addType === "custom" ? { background: "linear-gradient(135deg, #007AFF, #5856D6)" } : {}}
              >
                自定义模型
              </Button>
            </div>

            {addType === "preset" ? (
              <>
                <div className="space-y-2">
                  <Label>模型厂商</Label>
                  <Select value={newModel.provider} onValueChange={(v) => { setNewModel({ ...newModel, provider: v, version: "" }); }}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="选择模型厂商" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProviderData && selectedProviderData.versions.length > 0 && (
                  <div className="space-y-2">
                    <Label>具体模型版本</Label>
                    <Select value={newModel.version} onValueChange={(v) => setNewModel({ ...newModel, version: v })}>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="选择模型版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProviderData.versions.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="请输入 API Key"
                    value={newModel.apiKey}
                    onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={newModel.dailyLimit}
                    onChange={(e) => setNewModel({ ...newModel, dailyLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
              </>
            ) : (
              <>
                <Tabs value={customInputMode} onValueChange={(v) => setCustomInputMode(v as "json" | "form")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="json" className="flex-1">JSON 输入</TabsTrigger>
                    <TabsTrigger value="form" className="flex-1">表单输入</TabsTrigger>
                  </TabsList>
                  <TabsContent value="json" className="mt-3">
                    <Textarea
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      className="font-mono text-xs bg-gray-50 border-gray-200 min-h-48"
                    />
                  </TabsContent>
                  <TabsContent value="form" className="mt-3 space-y-3">
                    {[
                      { key: "provider", label: "请输入自定义模型 provider" },
                      { key: "base_url", label: "请输入自定义模型 base_url" },
                      { key: "api", label: "请输入自定义模型 api" },
                      { key: "api_key", label: "请输入自定义模型 api_key" },
                      { key: "model_id", label: "请输入自定义模型 model.id" },
                      { key: "model_name", label: "请输入自定义模型 model.name" },
                    ].map((field) => (
                      <Input
                        key={field.key}
                        placeholder={field.label}
                        value={(customForm as any)[field.key]}
                        onChange={(e) => setCustomForm({ ...customForm, [field.key]: e.target.value })}
                        className="bg-gray-50"
                      />
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="space-y-2">
                  <Label>每日 Tokens 数量上限</Label>
                  <Input
                    type="number"
                    value={customForm.dailyLimit}
                    onChange={(e) => setCustomForm({ ...customForm, dailyLimit: Number(e.target.value) })}
                    className="bg-gray-50"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button
              onClick={addType === "preset" ? handleAddPreset : handleAddCustom}
              style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
            >
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
