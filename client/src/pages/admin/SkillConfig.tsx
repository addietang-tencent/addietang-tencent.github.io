/**
 * SkillConfig - 管控端技能配置页
 */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Puzzle, Pencil, X, Check } from "lucide-react";

export default function SkillConfig() {
  const [skillhubUrl, setSkillhubUrl] = useState("https://clawhub.openclaw.com");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(skillhubUrl);

  const handleEdit = () => {
    setDraft(skillhubUrl);
    setEditing(true);
  };

  const handleSave = () => {
    if (!draft.trim()) {
      toast.error("SkillHub 地址不能为空");
      return;
    }
    setSkillhubUrl(draft.trim());
    setEditing(false);
    toast.success("SkillHub 地址已保存");
  };

  const handleCancel = () => {
    setDraft(skillhubUrl);
    setEditing(false);
  };

  return (
      <div className="page-enter max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">技能配置</h1>
          <p className="text-sm text-gray-500 mt-1">
            配置企业专属 SkillHub 地址。用户为自己的 OpenClaw 配置技能时，将从指定的 SkillHub 范围内选择和安装技能。若未配置，默认从 ClawHub 上加载可用技能。
          </p>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          {/* 卡片标题 */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-50">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Puzzle className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">SkillHub 地址</h2>
          </div>

          {/* 内容区 */}
          <div className="px-6 py-6">
            <p className="text-xs text-gray-400 mb-3">
              填写企业自建或采购的 SkillHub 服务地址，用户的技能市场将从此地址加载可用技能列表。若留空，用户将默认使用 ClawHub 官方技能库。
            </p>

            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="https://clawhub.yourcompany.com"
                  className="flex-1 font-mono text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-1"
                  style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}
                >
                  <Check className="w-3.5 h-3.5" />
                  保存
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="gap-1 text-gray-500">
                  <X className="w-3.5 h-3.5" />
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 font-mono text-sm text-gray-700">
                  {skillhubUrl || <span className="text-gray-400 font-sans">未配置</span>}
                </div>
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="编辑"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
