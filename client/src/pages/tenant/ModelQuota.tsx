/**
 * ModelQuota - 模型额度页面
 * Design: 「流动蓝图」Fluid Blueprint
 * Changes v2:
 *  - 拉宽主体内容区域（max-w-7xl）
 *  - 删除今日配额消耗卡片「今日」徽章
 *  - Tooltip 文案两端对齐
 *  - 今日配额消耗总Tokens对齐左侧卡片当天数据
 *  - 今日配额消耗卡片底部进度条（>80%橙色）
 *  - 卡片 icon/配色对齐管控端风格（圆形icon）
 *  - 字体排版统一
 */
import { useState, useCallback, useMemo } from "react";
import TenantLayout from "@/components/TenantLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
} from "lucide-react";

// ─── 自定义图标（设计稿：模型额度） ─────────────────────────────────────────

const Filter = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14.643 2.99437C14.545 2.7729 14.3849 2.58465 14.1819 2.45251C13.979 2.32036 13.742 2.25001 13.4999 2.25H2.49988C2.25775 2.25002 2.02084 2.32037 1.81794 2.45249C1.61503 2.5846 1.45486 2.77281 1.35689 2.99423C1.25892 3.21565 1.22737 3.46076 1.26607 3.69978C1.30477 3.93879 1.41205 4.16143 1.57488 4.34062L1.58238 4.34937L5.74988 8.79688V13.5C5.74985 13.7263 5.81125 13.9484 5.92754 14.1425C6.04382 14.3367 6.21064 14.4956 6.41017 14.6023C6.60971 14.7091 6.83449 14.7597 7.06053 14.7487C7.28656 14.7377 7.50538 14.6656 7.69363 14.54L9.69363 13.2069C9.86486 13.0926 10.0052 12.9379 10.1023 12.7563C10.1993 12.5748 10.25 12.3721 10.2499 12.1663V8.79688L14.4168 4.34937L14.4243 4.34062C14.5872 4.16152 14.6946 3.93895 14.7334 3.69996C14.7723 3.46097 14.7408 3.21585 14.643 2.99437ZM8.9555 7.9875C8.82428 8.12597 8.75075 8.30923 8.74988 8.5V12.0325L7.24988 13.0325V8.5C7.24969 8.30957 7.17707 8.12635 7.04675 7.9875L3.07675 3.75H12.923L8.9555 7.9875Z" fill="currentColor"/>
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14.25 3.00011V6.00011C14.25 6.19902 14.171 6.38978 14.0303 6.53044C13.8897 6.67109 13.6989 6.75011 13.5 6.75011H10.5C10.3011 6.75011 10.1103 6.67109 9.96967 6.53044C9.82902 6.38978 9.75 6.19902 9.75 6.00011C9.75 5.80119 9.82902 5.61043 9.96967 5.46978C10.1103 5.32912 10.3011 5.25011 10.5 5.25011H11.6875L11.2 4.76261C10.3174 3.87562 9.11879 3.37523 7.8675 3.37136H7.84062C6.6005 3.36864 5.40917 3.85429 4.52437 4.72323C4.38215 4.8623 4.19051 4.93918 3.9916 4.93696C3.7927 4.93473 3.60282 4.85358 3.46375 4.71136C3.32468 4.56913 3.2478 4.37749 3.25002 4.17858C3.25225 3.97968 3.3334 3.7898 3.47563 3.65073C4.64076 2.50664 6.20957 1.8674 7.8425 1.87136H7.875C9.52234 1.87585 11.1005 2.53431 12.2625 3.70198L12.75 4.18761V3.00011C12.75 2.80119 12.829 2.61043 12.9697 2.46978C13.1103 2.32912 13.3011 2.25011 13.5 2.25011C13.6989 2.25011 13.8897 2.32912 14.0303 2.46978C14.171 2.61043 14.25 2.80119 14.25 3.00011ZM11.4756 11.277C10.5904 12.1464 9.39827 12.6321 8.1575 12.6289H8.13062C6.87933 12.625 5.68074 12.1246 4.79812 11.2376L4.3125 10.7501H5.5C5.69891 10.7501 5.88968 10.6711 6.03033 10.5304C6.17098 10.3898 6.25 10.199 6.25 10.0001C6.25 9.80119 6.17098 9.61043 6.03033 9.46978C5.88968 9.32912 5.69891 9.25011 5.5 9.25011H2.5C2.30109 9.25011 2.11032 9.32912 1.96967 9.46978C1.82902 9.61043 1.75 9.80119 1.75 10.0001V13.0001C1.75 13.199 1.82902 13.3898 1.96967 13.5304C2.11032 13.6711 2.30109 13.7501 2.5 13.7501C2.69891 13.7501 2.88968 13.6711 3.03033 13.5304C3.17098 13.3898 3.25 13.199 3.25 13.0001V11.8126L3.7375 12.3001C4.89983 13.4671 6.47793 14.1249 8.125 14.1289H8.16C9.79293 14.1328 11.3617 13.4936 12.5269 12.3495C12.5973 12.2806 12.6535 12.1986 12.6922 12.108C12.7309 12.0174 12.7514 11.9201 12.7525 11.8216C12.7536 11.7231 12.7353 11.6254 12.6986 11.534C12.6619 11.4426 12.6076 11.3593 12.5387 11.2889C12.4699 11.2184 12.3878 11.1623 12.2973 11.1236C12.2067 11.0848 12.1094 11.0644 12.0109 11.0633C11.9124 11.0622 11.8147 11.0805 11.7233 11.1171C11.6318 11.1538 11.5485 11.2081 11.4781 11.277H11.4756Z" fill="currentColor"/>
  </svg>
);
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { TenantCard } from "@/components/ui/Surface";
import { TenantSegmentGroup, TenantSegmentOption } from "@/components/ui/segment";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatNumber } from "@/components/ui/Typography";

// ─── 多分组相关 ──────────────────────────────────────────────────────────────
type UserGroupMode = "normal" | "multi-group";

interface SimpleGroup {
  id: string;
  name: string;
  isPrimary: boolean;
  allowViewQuota: boolean;
}

const MOCK_GROUPS: SimpleGroup[] = [
  { id: "grp-fe", name: "A公司 / 技术部 / 前端组", isPrimary: true, allowViewQuota: true },
  { id: "grp-ai", name: "A公司 / 技术部 / AI 组", isPrimary: false, allowViewQuota: true },
  { id: "grp-custom", name: "前端研发同学", isPrimary: false, allowViewQuota: false },
];

// 普通用户的默认分组（只有一个）
const MOCK_DEFAULT_GROUP: SimpleGroup[] = [
  { id: "default", name: "默认", isPrimary: true, allowViewQuota: true },
];

const getDefaultGroup = (groups: SimpleGroup[]): SimpleGroup => {
  return groups.find(g => g.isPrimary) || groups[0];
};

// ─── Types ───────────────────────────────────────────────────────────────────
type DateMode = "single" | "range";

interface DateRange {
  start: string;
  end: string;
}

interface SummaryRow {
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface DetailRow {
  time: string;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// ─── Mock Data Generators ────────────────────────────────────────────────────
const MODELS = ["腾讯云 DeepSeek（DeepSeek V3 0324）", "腾讯云混元（混元 TurboS Latest）", "自定义模型（Claude Opus 4.6）"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateSummary(dateStr: string, groupId?: string): SummaryRow[] {
  const seed = dateStr.replace(/-/g, "").slice(-4);
  const n = parseInt(seed, 10);
  const groupSeed = groupId ? hashStr(groupId) : 0;
  return MODELS.map((model, i) => {
    const base = (((n + groupSeed) * (i + 1) * 137) % 800) + 200;
    const inputTokens = base * 120 + ((n + groupSeed) % 50) * 10;
    const outputTokens = base * 80 + ((n + groupSeed) % 30) * 5;
    return {
      model,
      requests: base,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  });
}

function generateDetails(dateStr: string, groupId?: string): DetailRow[] {
  const seed = parseInt(dateStr.replace(/-/g, "").slice(-4), 10);
  const groupSeed = groupId ? hashStr(groupId) : 0;
  const combinedSeed = seed + groupSeed;
  const rows: DetailRow[] = [];
  for (let i = 0; i < 28; i++) {
    const hour = String(Math.floor((combinedSeed * (i + 1) * 7) % 24)).padStart(2, "0");
    const min = String(Math.floor((combinedSeed * (i + 3) * 13) % 60)).padStart(2, "0");
    const sec = String(Math.floor((combinedSeed * (i + 5) * 17) % 60)).padStart(2, "0");
    const model = MODELS[i % MODELS.length];
    const inputTokens = 800 + ((combinedSeed * (i + 1) * 31) % 3200);
    const outputTokens = 400 + ((combinedSeed * (i + 2) * 19) % 1600);
    rows.push({
      time: `${dateStr} ${hour}:${min}:${sec}`,
      model,
      requests: 1 + (i % 5),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    });
  }
  return rows.sort((a, b) => b.time.localeCompare(a.time));
}

function aggregateRange(start: string, end: string, groupId?: string): { summary: SummaryRow[]; details: DetailRow[] } {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  const allDetails: DetailRow[] = dates.flatMap(d => generateDetails(d, groupId));
  const summaryMap: Record<string, SummaryRow> = {};
  for (const d of allDetails) {
    if (!summaryMap[d.model]) {
      summaryMap[d.model] = { model: d.model, requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    }
    summaryMap[d.model].requests += d.requests;
    summaryMap[d.model].inputTokens += d.inputTokens;
    summaryMap[d.model].outputTokens += d.outputTokens;
    summaryMap[d.model].totalTokens += d.totalTokens;
  }
  return { summary: Object.values(summaryMap), details: allDetails };
}

const TODAY = new Date().toISOString().slice(0, 10);
const TODAY_QUOTA_TOTAL = 500000;

// ─── Sub-components ──────────────────────────────────────────────────────────

// 统计卡片图标（与 TokensMonitor 一致，渐变色 #202020→#0080FF）
const StatIcons = {
  requests: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.1557 0.568474C11.2759 0.547602 11.3997 0.565694 11.5083 0.621208C11.6168 0.676751 11.7039 0.766463 11.7573 0.876091C11.8107 0.985788 11.8275 1.10986 11.8042 1.22961L10.77 6.39172L14.8227 7.91125C14.9089 7.94398 14.9857 7.99716 15.0464 8.06652C15.1071 8.13609 15.1505 8.2197 15.1714 8.30968C15.1922 8.39969 15.1905 8.4939 15.1665 8.58312C15.1425 8.67222 15.0968 8.75406 15.0337 8.8214H15.0366L7.1616 17.2589L7.09421 17.3204C7.0224 17.3757 6.9373 17.4131 6.84714 17.4288L6.7573 17.4366C6.69672 17.4373 6.63627 17.4288 6.57859 17.4103L6.49461 17.3751C6.386 17.3195 6.29798 17.2299 6.24461 17.1202C6.20472 17.0381 6.18625 16.9479 6.18894 16.8575L6.19871 16.7667L7.22996 11.6105L3.17722 10.089C3.11208 10.0646 3.05213 10.0285 3.00046 9.98254L2.95164 9.93273C2.9057 9.8803 2.86992 9.82011 2.84617 9.755L2.82664 9.68859C2.80577 9.59809 2.80709 9.50378 2.83152 9.41418C2.85597 9.32456 2.90234 9.2423 2.96629 9.17492L10.8413 0.737419C10.9247 0.648358 11.0355 0.589437 11.1557 0.568474ZM5.34324 9.09972L9.1655 10.5353L8.63035 13.2111L11.1528 10.5089H11.1401L12.6479 8.89758L8.83445 7.46789L9.37058 4.78527L5.34324 9.09972Z" fill="url(#stat_icon_requests)"/>
      <defs><radialGradient id="stat_icon_requests" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.81201 8.99836) scale(12.3738 747.725)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
    </svg>
  ),
  input: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.02805 6.22195C4.86954 6.06344 4.78049 5.84846 4.78049 5.6243C4.78049 5.40013 4.86954 5.18515 5.02805 5.02664C5.18656 4.86813 5.40154 4.77908 5.6257 4.77908C5.84987 4.77908 6.06485 4.86813 6.22336 5.02664L8.15625 6.96094V1.6875C8.15625 1.46372 8.24514 1.24911 8.40338 1.09088C8.56161 0.932645 8.77622 0.84375 9 0.84375C9.22378 0.84375 9.43839 0.932645 9.59662 1.09088C9.75485 1.24911 9.84375 1.46372 9.84375 1.6875V6.96094L11.778 5.02594C11.9366 4.86743 12.1515 4.77838 12.3757 4.77838C12.5999 4.77838 12.8149 4.86743 12.9734 5.02594C13.1319 5.18445 13.2209 5.39943 13.2209 5.62359C13.2209 5.84776 13.1319 6.06274 12.9734 6.22125L9.59836 9.59625C9.51997 9.67491 9.42683 9.73732 9.32427 9.77991C9.22171 9.82249 9.11175 9.84442 9.0007 9.84442C8.88965 9.84442 8.7797 9.82249 8.67714 9.77991C8.57458 9.73732 8.48143 9.67491 8.40305 9.59625L5.02805 6.22195ZM15.75 8.15625H13.2188C12.995 8.15625 12.7804 8.24514 12.6221 8.40338C12.4639 8.56161 12.375 8.77622 12.375 9C12.375 9.22378 12.4639 9.43839 12.6221 9.59662C12.7804 9.75485 12.995 9.84375 13.2188 9.84375H15.4688V13.7812H2.53125V9.84375H4.78125C5.00503 9.84375 5.21964 9.75485 5.37787 9.59662C5.53611 9.43839 5.625 9.22378 5.625 9C5.625 8.77622 5.53611 8.56161 5.37787 8.40338C5.21964 8.24514 5.00503 8.15625 4.78125 8.15625H2.25C1.87704 8.15625 1.51935 8.30441 1.25563 8.56813C0.991908 8.83185 0.84375 9.18954 0.84375 9.5625V14.0625C0.84375 14.4355 0.991908 14.7931 1.25563 15.0569C1.51935 15.3206 1.87704 15.4688 2.25 15.4688H15.75C16.123 15.4688 16.4806 15.3206 16.7444 15.0569C17.0081 14.7931 17.1562 14.4355 17.1562 14.0625V9.5625C17.1563 9.18954 17.0081 8.83185 16.7444 8.56813C16.4806 8.30441 16.123 8.15625 15.75 8.15625ZM14.3438 11.8125C14.3438 11.59 14.2778 11.3725 14.1542 11.1875C14.0305 11.0025 13.8548 10.8583 13.6493 10.7731C13.4437 10.688 13.2175 10.6657 12.9993 10.7091C12.781 10.7525 12.5806 10.8597 12.4233 11.017C12.2659 11.1743 12.1588 11.3748 12.1154 11.593C12.072 11.8113 12.0942 12.0375 12.1794 12.243C12.2645 12.4486 12.4087 12.6243 12.5937 12.7479C12.7787 12.8715 12.9962 12.9375 13.2188 12.9375C13.5171 12.9375 13.8033 12.819 14.0142 12.608C14.2252 12.397 14.3438 12.1109 14.3438 11.8125Z" fill="url(#stat_icon_input)"/>
      <defs><radialGradient id="stat_icon_input" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.843749 8.15625) scale(16.3125 647.966)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
    </svg>
  ),
  output: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8157 10.653C13.9742 10.8116 14.0633 11.0265 14.0633 11.2507C14.0633 11.4749 13.9742 11.6899 13.8157 11.8484C13.6572 12.0069 13.4422 12.0959 13.2181 12.0959C12.9939 12.0959 12.7789 12.0069 12.6204 11.8484L11.8125 11.0391V14.625C11.8125 14.8488 11.7236 15.0634 11.5654 15.2216C11.4071 15.3799 11.1925 15.4688 10.9688 15.4688C10.745 15.4688 10.5304 15.3799 10.3721 15.2216C10.2139 15.0634 10.125 14.8488 10.125 14.625V11.0391L9.31572 11.8491C9.15721 12.0076 8.94222 12.0966 8.71806 12.0966C8.4939 12.0966 8.27891 12.0076 8.1204 11.8491C7.9619 11.6906 7.87285 11.4756 7.87285 11.2514C7.87285 11.0272 7.9619 10.8123 8.1204 10.6538L10.3704 8.40375C10.4488 8.32509 10.5419 8.26268 10.6445 8.22009C10.7471 8.17751 10.857 8.15558 10.9681 8.15558C11.0791 8.15558 11.1891 8.17751 11.2916 8.22009C11.3942 8.26268 11.4873 8.32509 11.5657 8.40375L13.8157 10.653ZM11.25 2.53125C10.0822 2.53181 8.93632 2.84821 7.9337 3.44694C6.93107 4.04567 6.10905 4.90443 5.5547 5.93227C4.9091 5.86465 4.2565 5.9292 3.63666 6.12198C3.01682 6.31477 2.44272 6.63175 1.94937 7.05361C1.45601 7.47547 1.05372 7.99337 0.767018 8.57575C0.480315 9.15814 0.315204 9.7928 0.281746 10.4411C0.248288 11.0893 0.347185 11.7376 0.57241 12.3464C0.797634 12.9552 1.14447 13.5118 1.59178 13.9822C2.03908 14.4526 2.57749 14.827 3.17419 15.0826C3.77089 15.3382 4.41338 15.4695 5.06251 15.4688H7.03126C7.25504 15.4688 7.46965 15.3799 7.62788 15.2216C7.78612 15.0634 7.87501 14.8488 7.87501 14.625C7.87501 14.4012 7.78612 14.1866 7.62788 14.0284C7.46965 13.8701 7.25504 13.7812 7.03126 13.7812H5.06251C4.25632 13.7763 3.4839 13.4569 2.90972 12.8909C2.33554 12.325 2.00496 11.5573 1.98838 10.7512C1.97179 9.94518 2.2705 9.1645 2.82091 8.57542C3.37132 7.98633 4.12994 7.63537 4.93525 7.59727C4.83275 8.0578 4.78111 8.5282 4.78126 9C4.78126 9.22378 4.87016 9.43839 5.02839 9.59662C5.18663 9.75485 5.40124 9.84375 5.62501 9.84375C5.84879 9.84375 6.0634 9.75485 6.22163 9.59662C6.37987 9.43839 6.46876 9.22378 6.46876 9C6.46934 8.30834 6.61998 7.62505 6.91028 6.99726C7.20057 6.36948 7.62362 5.81215 8.15022 5.36373C8.67682 4.91532 9.29445 4.58649 9.96047 4.39995C10.6265 4.2134 11.3251 4.17358 12.008 4.28322C12.6909 4.39287 13.3419 4.64938 13.916 5.03504C14.4902 5.42071 14.9738 5.92635 15.3336 6.51708C15.6933 7.10781 15.9206 7.76956 15.9998 8.45666C16.079 9.14377 16.0082 9.83988 15.7922 10.497C15.7575 10.6022 15.7439 10.7133 15.7522 10.8238C15.7604 10.9343 15.7904 11.0421 15.8403 11.1411C15.8902 11.24 15.9591 11.3282 16.0431 11.4005C16.1271 11.4728 16.2245 11.5279 16.3297 11.5625C16.435 11.5972 16.5461 11.6108 16.6566 11.6026C16.7671 11.5943 16.8749 11.5644 16.9739 11.5145C17.0728 11.4645 17.161 11.3956 17.2333 11.3116C17.3056 11.2277 17.3607 11.1303 17.3953 11.025C17.7147 10.0532 17.7992 9.01945 17.6418 8.00864C17.4845 6.99784 17.0898 6.03872 16.4902 5.20992C15.8905 4.38112 15.103 3.70624 14.1921 3.24063C13.2812 2.77501 12.273 2.5319 11.25 2.53125Z" fill="url(#stat_icon_output)"/>
      <defs><radialGradient id="stat_icon_output" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.27539 9) scale(17.4435 573.201)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
    </svg>
  ),
  total: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.6322 7.68155L12.2953 6.10444L10.7182 1.76757C10.6198 1.49691 10.4405 1.26309 10.2047 1.09786C9.9688 0.932629 9.68779 0.843994 9.39982 0.843994C9.11184 0.843994 8.83084 0.932629 8.59498 1.09786C8.35912 1.26309 8.17983 1.49691 8.08146 1.76757L6.50435 6.10444L2.16747 7.68155C1.89682 7.77992 1.66299 7.95921 1.49776 8.19507C1.33253 8.43093 1.2439 8.71193 1.2439 8.99991C1.2439 9.28789 1.33253 9.56889 1.49776 9.80475C1.66299 10.0406 1.89682 10.2199 2.16747 10.3183L6.50435 11.8954L8.08146 16.2323C8.17983 16.5029 8.35912 16.7367 8.59498 16.902C8.83084 17.0672 9.11184 17.1558 9.39982 17.1558C9.68779 17.1558 9.9688 17.0672 10.2047 16.902C10.4405 16.7367 10.6198 16.5029 10.7182 16.2323L12.2953 11.8954L16.6322 10.3183C16.9028 10.2199 17.1366 10.0406 17.3019 9.80475C17.4671 9.56889 17.5557 9.28789 17.5557 8.99991C17.5557 8.71193 17.4671 8.43093 17.3019 8.19507C17.1366 7.95921 16.9028 7.77992 16.6322 7.68155ZM11.3489 10.4441C11.2329 10.4863 11.1277 10.5533 11.0404 10.6405C10.9532 10.7278 10.8862 10.833 10.844 10.949L9.39982 14.9209L7.9556 10.949C7.91347 10.833 7.84643 10.7278 7.7592 10.6405C7.67198 10.5533 7.56669 10.4863 7.45075 10.4441L3.4788 8.99991L7.45075 7.55569C7.56669 7.51356 7.67198 7.44653 7.7592 7.3593C7.84643 7.27208 7.91347 7.16679 7.9556 7.05085L9.39982 3.0789L10.844 7.05085C10.8862 7.16679 10.9532 7.27208 11.0404 7.3593C11.1277 7.44653 11.2329 7.51356 11.3489 7.55569L15.3208 8.99991L11.3489 10.4441Z" fill="url(#stat_icon_total)"/>
      <defs><radialGradient id="stat_icon_total" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.2439 8.99991) scale(16.3118 722.702)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
    </svg>
  ),
  quota: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.7085 0.84375C12.9323 0.84375 13.1469 0.932586 13.3052 1.09082C13.4634 1.24905 13.5522 1.46372 13.5522 1.6875V1.96875H14.9585C15.3315 1.96875 15.6889 2.11714 15.9526 2.38086C16.2164 2.64458 16.3647 3.00204 16.3647 3.375V14.625C16.3647 14.998 16.2164 15.3554 15.9526 15.6191C15.6889 15.8829 15.3315 16.0312 14.9585 16.0312H3.7085C3.33554 16.0312 2.97808 15.8829 2.71436 15.6191C2.45063 15.3554 2.30225 14.998 2.30225 14.625V3.375C2.30225 3.00204 2.45063 2.64458 2.71436 2.38086C2.97808 2.11714 3.33554 1.96875 3.7085 1.96875H5.11475V1.6875C5.11475 1.46372 5.20358 1.24905 5.36182 1.09082C5.52005 0.932587 5.73472 0.84375 5.9585 0.84375C6.18227 0.84375 6.39694 0.932587 6.55518 1.09082C6.71341 1.24905 6.80225 1.46372 6.80225 1.6875V1.96875H11.8647V1.6875C11.8647 1.46372 11.9536 1.24905 12.1118 1.09082C12.2701 0.932586 12.4847 0.84375 12.7085 0.84375ZM3.98975 3.65625V14.3438H14.6772V3.65625H13.5522C13.5522 3.88003 13.4634 4.0947 13.3052 4.25293C13.1469 4.41116 12.9323 4.5 12.7085 4.5C12.4847 4.5 12.2701 4.41116 12.1118 4.25293C11.9536 4.0947 11.8647 3.88003 11.8647 3.65625H6.80225C6.80225 3.88003 6.71341 4.0947 6.55518 4.25293C6.39694 4.41116 6.18227 4.5 5.9585 4.5C5.73472 4.5 5.52005 4.41116 5.36182 4.25293C5.20358 4.0947 5.11475 3.88003 5.11475 3.65625H3.98975ZM9.01709 5.70508C9.12582 5.41124 9.54117 5.41124 9.6499 5.70508L10.4731 7.92871L12.6968 8.75195C12.9905 8.86075 12.9906 9.27605 12.6968 9.38477L10.4731 10.208L9.6499 12.4316C9.54784 12.7068 9.1762 12.7242 9.04053 12.4834L9.01709 12.4316L8.19385 10.208L5.97021 9.38477C5.67641 9.27605 5.67647 8.86073 5.97021 8.75195L8.19385 7.92871L9.01709 5.70508Z" fill="url(#stat_icon_quota)"/>
      <defs><radialGradient id="stat_icon_quota" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.30225 8.4375) scale(14.0625 672.888)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs>
    </svg>
  ),
};

function StatCard({
  svgIcon,
  label,
  value,
}: {
  svgIcon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <TenantCard padding="none" className="p-5">
      <div className="flex items-center gap-2 mb-3">
        {svgIcon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <StatNumber>{value}</StatNumber>
    </TenantCard>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
const SUMMARY_PAGE_SIZE = 5;
const DETAIL_PAGE_SIZE = 10;

export default function ModelQuota() {
  const [dateMode, setDateMode] = useState<DateMode>("single");
  const [singleDate, setSingleDate] = useState(TODAY);
  const [dateRange, setDateRange] = useState<DateRange>({ start: TODAY, end: TODAY });
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryPage, setSummaryPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);

  // 多分组模式
  const [groupMode] = useState<UserGroupMode>(() => {
    return (localStorage.getItem("openclaw_group_mode") as UserGroupMode) || "normal";
  });
  const groupList = groupMode === "multi-group" ? MOCK_GROUPS : MOCK_DEFAULT_GROUP;
  const [selectedGroup, setSelectedGroup] = useState<SimpleGroup>(() => getDefaultGroup(groupMode === "multi-group" ? MOCK_GROUPS : MOCK_DEFAULT_GROUP));

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Compute data based on current filter
  const { summary, details, overviewStats } = useMemo(() => {
    const groupId = groupMode === "multi-group" ? selectedGroup.id : undefined;
    let s: SummaryRow[];
    let d: DetailRow[];
    if (dateMode === "single") {
      s = generateSummary(singleDate, groupId);
      d = generateDetails(singleDate, groupId);
    } else {
      const agg = aggregateRange(dateRange.start, dateRange.end, groupId);
      s = agg.summary;
      d = agg.details;
    }
    const totalRequests = s.reduce((acc, r) => acc + r.requests, 0);
    const totalInput = s.reduce((acc, r) => acc + r.inputTokens, 0);
    const totalOutput = s.reduce((acc, r) => acc + r.outputTokens, 0);
    const totalTokens = s.reduce((acc, r) => acc + r.totalTokens, 0);
    return {
      summary: s,
      details: d,
      overviewStats: { totalRequests, totalInput, totalOutput, totalTokens },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMode, singleDate, dateRange, refreshKey, groupMode, selectedGroup]);

  // Today quota: always based on today's data (not affected by filter)
  const todaySummary = useMemo(() => {
    const groupId = groupMode === "multi-group" ? selectedGroup.id : undefined;
    return generateSummary(TODAY, groupId);
  }, [groupMode, selectedGroup]);
  const todayTotalTokens = todaySummary.reduce((acc, r) => acc + r.totalTokens, 0);
  const quotaPct = (todayTotalTokens / TODAY_QUOTA_TOTAL) * 100;
  const quotaPctStr = quotaPct.toFixed(1);
  const isQuotaWarning = quotaPct > 80;

  // Paginated slices
  const summarySlice = summary.slice(
    (summaryPage - 1) * SUMMARY_PAGE_SIZE,
    summaryPage * SUMMARY_PAGE_SIZE
  );
  const detailSlice = details.slice(
    (detailPage - 1) * DETAIL_PAGE_SIZE,
    detailPage * DETAIL_PAGE_SIZE
  );

  return (
    <TenantLayout>
      <TooltipProvider>
        {/* SKILL §7.4 用户端通用骨架 — 统一 120px 左右内边距 */}
        <div className="min-w-[1200px]">
          <div className="max-w-[1920px] mx-auto page-enter">
            <div className="relative min-h-[calc(100vh-64px)] pb-[75px]" style={{ paddingLeft: 120, paddingRight: 120 }}>
          {/* Hero 段 — 112px / 标题居中对齐（对齐「我的 Agent」） */}
          <div className="relative h-[112px]">
            <div className="h-[112px] flex flex-col justify-center gap-2 overflow-hidden">
              <h1 className="font-sans font-medium text-[26px] leading-[35.56px] tracking-[-0.0427em] m-0 text-[#0A0A0A]">
                模型额度
              </h1>
              <div className="flex items-center gap-2">
                <p className="font-sans font-normal text-xs leading-[22.22px] tracking-[0.015em] text-[#737373] m-0">
                  查看所选时间范围内的模型 Token 使用情况。
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-help h-auto p-0 whitespace-nowrap">
                      查看Token使用规则
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm text-xs">
                    <div className="space-y-1.5">
                      <p>统计数据为模型 API 处理的全量 Token，包含输入 Token(缓存未命中)、输入 Token(缓存命中)、输出 Token。</p>
                      <p>缓存命中 Token 的实际计费价格通常远低于缓存未命中 Token。</p>
                      <p>因此页面展示的总 Token 数不等于等额的实际计费成本。</p>
                      <p>如需了解各模型的缓存输入 Token 定价，请参考对应模型提供商的官方计费文档。</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* 内容区 */}
          <div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            {/* Left: 分组筛选 */}
            <Select
              value={selectedGroup.id}
              onValueChange={(value) => {
                const nextGroup = groupList.find((group) => group.id === value);
                if (!nextGroup || !nextGroup.allowViewQuota) return;
                setSelectedGroup(nextGroup);
                setSummaryPage(1);
                setDetailPage(1);
              }}
            >
              <SelectTrigger tenant size="default" className="h-9 text-[#334155]">
                <span className="flex items-center gap-2">
                  <Filter className="size-4 text-[#737373]" />
                  <SelectValue placeholder="选择分组" />
                </span>
              </SelectTrigger>
              <SelectContent align="start">
                {groupList.map((group) => (
                  <SelectItem key={group.id} value={group.id} disabled={!group.allowViewQuota}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Right: 日期模式 + 日期 + 刷新 */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Mode Toggle（统一 segment 样式） */}
              <TenantSegmentGroup>
                <TenantSegmentOption
                  active={dateMode === "single"}
                  onClick={() => { setDateMode("single"); setSummaryPage(1); setDetailPage(1); }}
                >
                  单日
                </TenantSegmentOption>
                <TenantSegmentOption
                  active={dateMode === "range"}
                  onClick={() => { setDateMode("range"); setSummaryPage(1); setDetailPage(1); }}
                >
                  时间段
                </TenantSegmentOption>
              </TenantSegmentGroup>

              {/* Date Input(s) */}
              {dateMode === "single" ? (
                <DatePicker
                  tenant
                  value={singleDate}
                  max={TODAY}
                  onChange={(v) => { setSingleDate(v); setSummaryPage(1); setDetailPage(1); }}
                  className="h-9"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <DatePicker
                    tenant
                    value={dateRange.start}
                    max={dateRange.end}
                    onChange={(v) => { setDateRange((r) => ({ ...r, start: v })); setSummaryPage(1); setDetailPage(1); }}
                    className="h-9"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <DatePicker
                    tenant
                    value={dateRange.end}
                    min={dateRange.start}
                    max={TODAY}
                    onChange={(v) => { setDateRange((r) => ({ ...r, end: v })); setSummaryPage(1); setDetailPage(1); }}
                    className="h-9"
                  />
                </div>
              )}

              {/* Refresh */}
              <Button
                variant="tenant-outline"
                size="icon"
                onClick={handleRefresh}
                className="w-9 h-9 !rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              svgIcon={StatIcons.requests}
              label="总请求数"
              value={overviewStats.totalRequests.toLocaleString()}
            />
            <StatCard
              svgIcon={StatIcons.input}
              label="输入 Tokens"
              value={overviewStats.totalInput.toLocaleString()}
            />
            <StatCard
              svgIcon={StatIcons.output}
              label="输出 Tokens"
              value={overviewStats.totalOutput.toLocaleString()}
            />
            <StatCard
              svgIcon={StatIcons.total}
              label="总 Tokens"
              value={overviewStats.totalTokens.toLocaleString()}
            />

            {/* Today Quota Card — not affected by time filter */}
            <TenantCard padding="none" className="p-5 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                {StatIcons.quota}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  今日配额消耗
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[180px] text-xs leading-relaxed text-justify"
                     
                    >
                      此配额为公司提供的外部模型 Token 额度，按自然日统计和刷新
                    </TooltipContent>
                  </Tooltip>
                </span>
              </div>
              <div className="flex items-center gap-8">
                <StatNumber className="shrink-0">
                  {quotaPctStr}%
                </StatNumber>
              {/* Progress bar — hover to see token details */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Progress
                    value={Math.min(quotaPct, 100)}
                    className={cn("h-1.5 cursor-default bg-gray-100 flex-1", isQuotaWarning ? "[&>[data-slot=progress-indicator]]:bg-orange-500" : "[&>[data-slot=progress-indicator]]:bg-blue-500")}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {todayTotalTokens.toLocaleString()} / {TODAY_QUOTA_TOTAL.toLocaleString()} Tokens
                </TooltipContent>
              </Tooltip>
              </div>
            </TenantCard>
          </div>

          {/* Model Usage Summary
           * 布局规范：段标题独立于卡片之外，与卡片之间留 12px 间距；
           * 卡片只承载表格，遵循 Figma 用户端「标题 + 表格分体」结构。
           * 标题字号沿用页面内段标题统一规范：text-sm / font-semibold / #111827。 */}
          <h2 className="text-sm font-semibold text-gray-900 mb-3">模型使用汇总</h2>
          <TenantCard padding="none" className="mb-5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型名称</TableHead>
                  <TableHead className="text-right w-32">总请求数</TableHead>
                  <TableHead className="text-right w-32">输入 Tokens</TableHead>
                  <TableHead className="text-right w-32">输出 Tokens</TableHead>
                  <TableHead className="text-right w-32">总 Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summarySlice.map((row) => (
                  <TableRow key={row.model}>
                    <TableCell>{row.model}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.requests.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.inputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.outputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.totalTokens.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {summarySlice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[#a3a3a3]">暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              total={summary.length}
              current={summaryPage}
              pageSize={SUMMARY_PAGE_SIZE}
              simple
              hideOnSinglePage
              onChange={(p) => setSummaryPage(p)}
            />
          </TenantCard>

          {/* Detail Usage Records
           * 同上：段标题独立于卡片，与卡片留 12px 间距；卡片仅承载表格 + 分页。 */}
          <h2 className="text-sm font-semibold text-gray-900 mb-3">详细使用记录</h2>
          <TenantCard padding="none" className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">请求时间</TableHead>
                  <TableHead>模型名称</TableHead>
                  <TableHead className="text-right w-32">输入 Tokens</TableHead>
                  <TableHead className="text-right w-32">输出 Tokens</TableHead>
                  <TableHead className="text-right w-32">总 Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailSlice.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="tabular-nums text-gray-500 w-44">{row.time}</TableCell>
                    <TableCell>{row.model}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.inputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.outputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{row.totalTokens.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {detailSlice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t border-gray-200">
              <Pagination
                total={details.length}
                current={detailPage}
                pageSize={DETAIL_PAGE_SIZE}
                showTotal={(total) => `共 ${total} 条记录`}
                className="w-full justify-between"
                hideOnSinglePage
                onChange={(p) => setDetailPage(p)}
              />
            </div>
          </TenantCard>

          </div>{/* end 内容区 py-6 */}

          {/* 底部提示语 */}
          <p className="absolute bottom-7 left-0 right-0 text-xs text-gray-400 text-center">
            额度由企业管理员统一配置，如需调整请联系管理员
          </p>
            </div>{/* end padding wrapper */}
          </div>{/* end max-w-[1920px] */}
        </div>{/* end min-w-[1200px] */}
      </TooltipProvider>
    </TenantLayout>
  );
}
