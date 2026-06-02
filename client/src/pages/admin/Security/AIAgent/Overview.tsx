import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

import { ASSETS, ALARMS } from "./constants";

/**
 * AI Agent 安全 - 顶部三张统计卡片
 *
 * 视觉对齐 OpenClawMonitor 的"总数 / 运行中 / 已关机 / 其他"卡片：
 * - <button data-surface="card"> + data-state="selected" 实现 hover/选中态
 * - 18×18 渐变 SVG 图标 + 14px 标签
 * - DIN 字体的 24px 大数字
 */

// 资产（盾牌）
const IconAssets = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 1.6875L3 3.9375V8.4375C3 12.0938 5.55 15.4837 9 16.3125C12.45 15.4837 15 12.0938 15 8.4375V3.9375L9 1.6875ZM7.6875 12.375L4.875 9.5625L5.93625 8.50125L7.6875 10.245L12.0638 5.86875L13.125 6.9375L7.6875 12.375Z"
      fill="url(#icon_aiagent_assets)"
    />
    <defs>
      <linearGradient id="icon_aiagent_assets" x1="15" y1="16.3125" x2="3" y2="1.6875" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0080FF" />
        <stop offset="1" stopColor="#202020" />
      </linearGradient>
    </defs>
  </svg>
);

// 存在风险/告警资产（警告三角）
const IconRisk = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 1.6875C8.6925 1.6875 8.385 1.84875 8.205 2.17125L1.20375 14.0512C0.84375 14.685 1.30875 15.4688 2.04375 15.4688H15.9562C16.6912 15.4688 17.1562 14.685 16.7962 14.0512L9.795 2.17125C9.615 1.84875 9.3075 1.6875 9 1.6875ZM8.4375 6.46875H9.5625V10.9688H8.4375V6.46875ZM9 12.375C9.42 12.375 9.7575 12.7125 9.7575 13.1325C9.7575 13.5525 9.42 13.89 9 13.89C8.58 13.89 8.2425 13.5525 8.2425 13.1325C8.2425 12.7125 8.58 12.375 9 12.375Z"
      fill="url(#icon_aiagent_risk)"
    />
    <defs>
      <radialGradient
        id="icon_aiagent_risk"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(3.6 14.4) scale(13)"
      >
        <stop stopColor="#202020" />
        <stop offset="1" stopColor="#0080FF" />
      </radialGradient>
    </defs>
  </svg>
);

// 威胁告警（雷达扫描）
const IconAlarm = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 2.25C5.27063 2.25 2.25 5.27063 2.25 9C2.25 12.7294 5.27063 15.75 9 15.75C12.7294 15.75 15.75 12.7294 15.75 9C15.75 5.27063 12.7294 2.25 9 2.25ZM9 14.0625C6.20438 14.0625 3.9375 11.7956 3.9375 9C3.9375 6.20438 6.20438 3.9375 9 3.9375C11.7956 3.9375 14.0625 6.20438 14.0625 9C14.0625 11.7956 11.7956 14.0625 9 14.0625ZM9 5.625C7.13438 5.625 5.625 7.13438 5.625 9C5.625 10.8656 7.13438 12.375 9 12.375C10.8656 12.375 12.375 10.8656 12.375 9C12.375 7.13438 10.8656 5.625 9 5.625ZM9 10.6875C8.06813 10.6875 7.3125 9.93188 7.3125 9C7.3125 8.06813 8.06813 7.3125 9 7.3125C9.93188 7.3125 10.6875 8.06813 10.6875 9C10.6875 9.93188 9.93188 10.6875 9 10.6875Z"
      fill="url(#icon_aiagent_alarm)"
    />
    <defs>
      <radialGradient
        id="icon_aiagent_alarm"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(3.6 9) scale(13)"
      >
        <stop stopColor="#202020" />
        <stop offset="1" stopColor="#0080FF" />
      </radialGradient>
    </defs>
  </svg>
);

const STAT_CARD_CLASS = cn(
  "bg-white rounded-xl border border-gray-200 px-6 py-5 flex flex-col gap-4 text-left transition-all duration-200",
  "hover:border-[#C9D5FC] hover:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] hover:-translate-y-0.5",
  "data-[state=selected]:border-[#1447E6] data-[state=selected]:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]",
);

export default function AIAgentOverview({
  tabRef,
  activeTab,
  setActiveTab,
  riskHostCount,
  bashAlarmsCount,
  maliciousAlarmsCount,
  aiAgentHostList,
  hasFilterAlarm,
  setHasFilterAlarm,
}: any) {
  const scrollToTab = () => {
    window.setTimeout(() => {
      tabRef?.current?.scrollIntoView?.({ behavior: "smooth" });
    }, 10);
  };

  const stats = [
    {
      key: "assets",
      label: "AI Agent资产",
      value: aiAgentHostList?.length || 0,
      icon: <IconAssets />,
      selected: activeTab === ASSETS && !hasFilterAlarm,
      onClick: () => {
        setActiveTab?.(ASSETS);
        setHasFilterAlarm?.(false);
        scrollToTab();
      },
    },
    {
      key: "risk",
      label: "存在风险/告警资产",
      value: riskHostCount || 0,
      icon: <IconRisk />,
      tooltip: '存在"恶意Skills"或存在"威胁告警"的AI Agent资产。',
      selected: activeTab === ASSETS && hasFilterAlarm,
      onClick: () => {
        setActiveTab?.(ASSETS);
        setHasFilterAlarm?.(true);
        scrollToTab();
      },
    },
    {
      key: "alarm",
      label: "威胁告警",
      value: (bashAlarmsCount || 0) + (maliciousAlarmsCount || 0),
      icon: <IconAlarm />,
      selected: activeTab === ALARMS,
      onClick: () => {
        setActiveTab?.(ALARMS);
        setHasFilterAlarm?.(false);
        scrollToTab();
      },
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-5">
      {stats.map((stat) => (
        <button
          key={stat.key}
          type="button"
          onClick={stat.onClick}
          data-surface="card"
          data-state={stat.selected ? "selected" : undefined}
          className={STAT_CARD_CLASS}
        >
          <div className="flex items-center gap-1">
            {stat.icon}
            <span className="text-sm font-medium text-[#0A0A0A] leading-[22px] tracking-[0.07px]">
              {stat.label}
            </span>
            {stat.tooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="w-3.5 h-3.5 text-[#A3A3A3] cursor-help shrink-0 ml-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{stat.tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
          <p
            className="text-2xl font-bold text-[#0A0A0A] leading-normal"
            style={{ fontFamily: "'DIN Next LT Pro', 'DIN', sans-serif" }}
          >
            {stat.value}
          </p>
        </button>
      ))}
    </div>
  );
}
