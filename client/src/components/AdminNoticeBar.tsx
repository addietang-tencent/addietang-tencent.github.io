/**
 * AdminNoticeBar - 管控端顶部常驻通知条
 * Design: 「流动蓝图」Fluid Blueprint
 * - 三类通知：基础配置告警（橙色）、腾讯云配额告警（橙色）、产品动态（蓝色）
 * - 支持自动轮播（5s）+ 手动左右切换
 * - 只有 1 条通知时隐藏切换按钮
 * - 关闭按钮常驻，点击后隐藏当前通知
 * - 不吸顶：随页面内容自然滚动（位于内容区顶部，滚动后会被滚走）
 * - 跳转链接紧跟在通知文字末尾
 * - 产品动态图标使用星星符号
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { AdminNoticeAlert, type AdminNoticeAlertType } from "@/components/ui/admin-notice-alert";
import { useAdminMode } from "@/contexts/AdminModeContext";

// ─── 基础配置项完成状态（与 BasicInfo.tsx 保持一致） ──────────────────────
// 说明：
//   - custom 模式：8 项（步骤 1-8）
//   - unified 模式：在原第 3 项「导入企业用户」之后插入「设置用户登录方式」作为第 4 步，
//                   原第 4-8 项顺延为第 5-9 步，共 9 项。
const STEP_STATUS_BASE: Record<number, { label: string; done: boolean }> = {
  1: { label: "设置平台名称与品牌", done: true },
  2: { label: "配置用户默认配额", done: true },
  3: { label: "导入企业用户", done: false },
  4: { label: "配置至少一个模型", done: true },
  5: { label: "配置至少一个通道", done: false },
  6: { label: "配置至少一个镜像", done: true },
  7: { label: "配置私有网络", done: true },
  8: { label: "配置安全组", done: false },
};

// unified 模式下第 4 步：设置用户登录方式
const UNIFIED_LOGIN_STEP: { label: string; done: boolean } = {
  label: "设置用户登录方式",
  done: false,
};

function buildStepStatus(isUnified: boolean): Record<number, { label: string; done: boolean }> {
  if (!isUnified) return STEP_STATUS_BASE;
  // 顺延：1,2,3 保留 → 4 = 新增登录方式 → 5..9 = 原 4..8
  return {
    1: STEP_STATUS_BASE[1],
    2: STEP_STATUS_BASE[2],
    3: STEP_STATUS_BASE[3],
    4: UNIFIED_LOGIN_STEP,
    5: STEP_STATUS_BASE[4],
    6: STEP_STATUS_BASE[5],
    7: STEP_STATUS_BASE[6],
    8: STEP_STATUS_BASE[7],
    9: STEP_STATUS_BASE[8],
  };
}

// ─── 腾讯云配额问题 mock 数据 ─────────────────────────────────────────────────
const QUOTA_ALERTS = [
  {
    id: "vpc",
    message: "私有网络（VPC）配额已耗尽，将影响用户端云设备的正常创建与使用。",
    link: "https://console.cloud.tencent.com/workorder/category",
  },
  {
    id: "ai2",
    message: "云服务器 Ai2 机型购买配额已耗尽，将影响用户端 AI 云设备的正常分配。",
    link: "https://console.cloud.tencent.com/workorder/category",
  },
];

// ─── 产品动态 mock 数据 ───────────────────────────────────────────────────────
const PRODUCT_NEWS = [
  {
    id: "news1",
    message: "OpenClaw v2.4.0 已发布：记忆管理功能上线，支持 Pro / Free 版本切换，Pro 版提供长期记忆存储与跨会话召回能力。",
  },
  {
    id: "news2",
    message: "OpenClaw v2.3.0 已发布：技能配置全面升级，支持公共技能库浏览、收藏与批量分发至指定用户或全体成员。",
  },
];

interface NoticeItem {
  id: string;
  type: AdminNoticeAlertType;
  message: string;
  action?: {
    label: string;
    href: string;
    external?: boolean;
  };
}

// ─── 构建通知列表 ─────────────────────────────────────────────────────────────
function buildNotices(stepStatus: Record<number, { label: string; done: boolean }>): NoticeItem[] {
  const notices: NoticeItem[] = [];

  // 1. 基础配置未完成
  const incompleteSteps = Object.values(stepStatus).filter((s) => !s.done);
  if (incompleteSteps.length > 0) {
    const names = incompleteSteps.map((s) => s.label).join("、");
    notices.push({
      id: "basic-config",
      type: "pending-config",
      message: `有 ${incompleteSteps.length} 项基础配置未完成（${names}），未完成配置将影响用户端的正常使用，`,
      action: {
        label: "前往基础信息配置处理",
        href: "/admin/basic-info",
        external: false,
      },
    });
  }

  // 2. 腾讯云配额问题
  for (const alert of QUOTA_ALERTS) {
    notices.push({
      id: `quota-${alert.id}`,
      type: "resource-alert",
      message: alert.message.replace("。", "，"),
      action: {
        label: "前往腾讯云控制台提交工单",
        href: alert.link,
        external: true,
      },
    });
  }

  // 3. 产品动态
  for (const news of PRODUCT_NEWS) {
    notices.push({
      id: news.id,
      type: "product-news",
      message: news.message,
    });
  }

  return notices;
}

const AUTO_PLAY_INTERVAL = 5000;

function AdminNoticePrevIcon() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.59766 1.06067L1.06216 4.59619L4.59766 8.13169" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function AdminNoticeNextIcon() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1.0625 1.06067L4.598 4.59619L1.0625 8.13169" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function AdminNoticeCloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M11.958 5.17139L9.12891 7.99951L11.958 10.8286L10.8271 11.9595L7.99805 9.13037L5.16992 11.9595L4.03906 10.8286L6.86719 7.99951L4.03906 5.17139L5.16992 4.04053L7.99805 6.86865L10.8271 4.04053L11.958 5.17139Z"
        fill="#020617"
        fillOpacity="0.5"
      />
    </svg>
  );
}

export default function AdminNoticeBar() {
  const { isUnified } = useAdminMode();
  // [004] 每次渲染都重算通知列表，以便存量企业 ack 状态变化时能即时从通知条消失
  const STEP_STATUS = buildStepStatus(isUnified);
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);
  const NOTICES = buildNotices(STEP_STATUS).filter((notice) => !dismissedNoticeIds.includes(notice.id));
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = NOTICES.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total > 0 && current >= total) {
      setCurrent(total - 1);
    }
  }, [current, total]);

  // 自动轮播
  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setInterval(goNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [total, paused, goNext]);

  if (total === 0) return null;

  const notice = NOTICES[current];

  const closeCurrentNotice = () => {
    setDismissedNoticeIds((prev) => (prev.includes(notice.id) ? prev : [...prev, notice.id]));
  };

  const noticeContent = (
    <>
      <span>{notice.message}</span>
      {notice.action && (
        <>
          {notice.action.external ? (
            <a
              href={notice.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[#020617] underline underline-offset-2 whitespace-nowrap hover:opacity-80 transition-opacity"
            >
              {notice.action.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <Link href={notice.action.href}>
              <span className="inline text-[#020617] underline underline-offset-2 whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity">
                {notice.action.label}
              </span>
            </Link>
          )}
        </>
      )}
    </>
  );

  const renderControls = () => (
    <div className="relative h-5 w-[80.07px] text-[#3F3F3F]">
      {total > 1 ? (
        <div className="absolute left-0 top-0 h-5 w-[44.07px]">
          <button
            onClick={goPrev}
            className="absolute left-[-10px] top-0 inline-flex size-5 items-center justify-center rounded-[2px] text-[#3F3F3F] transition-colors hover:bg-black/10 hover:text-[#020617] active:bg-black/15"
            aria-label="上一条"
          >
            <AdminNoticePrevIcon />
          </button>
          <span className="absolute left-[11.54px] top-0 text-xs leading-5 tabular-nums text-[#3F3F3F]">
            {current + 1}/{total}
          </span>
          <button
            onClick={goNext}
            className="absolute left-[36.54px] top-0 inline-flex size-5 items-center justify-center rounded-[2px] text-[#3F3F3F] transition-colors hover:bg-black/10 hover:text-[#020617] active:bg-black/15"
            aria-label="下一条"
          >
            <AdminNoticeNextIcon />
          </button>
        </div>
      ) : null}
      <button
        onClick={closeCurrentNotice}
        className="absolute left-[64.07px] top-[2px] inline-flex size-4 items-center justify-center transition-opacity hover:opacity-80 active:opacity-100"
        aria-label="关闭通知"
      >
        <AdminNoticeCloseIcon />
      </button>
    </div>
  );

  return (
    <div
      className="w-full min-w-[960px] max-w-[1600px] mx-auto px-10 pt-4 pb-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AdminNoticeAlert type={notice.type} controls={renderControls()}>
        {noticeContent}
      </AdminNoticeAlert>
    </div>
  );
}
