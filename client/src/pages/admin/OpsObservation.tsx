/**
 * OpsObservation - 运维观测页面
 * Design: 「流动蓝图」Fluid Blueprint
 * - 标题、副标题、卡片、icon 与其他子页面保持一致
 */
import { useState, useEffect } from "react";
import { ArrowUpRight, RefreshCw, CheckCircle2, Download, Eye, EyeOff, X } from "lucide-react";
import { Dialog, DialogContent, DialogBody, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle, AlertOperationInfoIcon } from "@/components/ui/alert";
import { StatusTag } from "@/components/ui/status-tag";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SurfaceCard, SurfaceInner } from "@/components/ui/Surface";
import { StatNumber } from "@/components/ui/Typography";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { AdminPageHeader } from "@/components/ui/admin-page-header";

// Mock data for charts
const logLevelData = [
  { level: "ERROR", count: 498 },
  { level: "WARNING", count: 1974 },
  { level: "INFO", count: 33124 },
  { level: "DEBUG", count: 56937 },
];

const logModuleData = [
  { name: "gateway/channels/qpo...", count: 62413 },
  { name: "gateway/health-monit...", count: 11206 },
  { name: "plugins", count: 1145 },
  { name: "agent/embedded", count: 630 },
  { name: "gateway/channels/fei...", count: 95 },
  { name: "gateway/canvas", count: 9 },
  { name: "browser/server", count: 9 },
  { name: "gmail-watcher", count: 1 },
  { name: "browser/service", count: 1 },
];

const messageProcessData = [
  { time: "01:59", processed: 10, queued: 8 },
  { time: "02:04", processed: 12, queued: 9 },
  { time: "02:09", processed: 11, queued: 7 },
  { time: "02:14", processed: 13, queued: 8 },
  { time: "02:19", processed: 12, queued: 6 },
  { time: "02:24", processed: 14, queued: 7 },
  { time: "02:29", processed: 11, queued: 8 },
  { time: "02:34", processed: 13, queued: 9 },
  { time: "02:39", processed: 12, queued: 7 },
  { time: "02:44", processed: 14, queued: 6 },
];

const queueStatusData = [
  { time: "01:59", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:04", depth_avg: 1.9, wait_ms_avg: 1.7 },
  { time: "02:09", depth_avg: 2.1, wait_ms_avg: 1.9 },
  { time: "02:14", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:19", depth_avg: 1.8, wait_ms_avg: 1.6 },
  { time: "02:24", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:29", depth_avg: 1.9, wait_ms_avg: 1.7 },
  { time: "02:34", depth_avg: 2.1, wait_ms_avg: 1.9 },
  { time: "02:39", depth_avg: 2.0, wait_ms_avg: 1.8 },
  { time: "02:44", depth_avg: 1.9, wait_ms_avg: 1.7 },
];

const runDurationData = [
  { time: "01:59", run_duration_p50: 45000, run_duration_p95: 60000 },
  { time: "02:04", run_duration_p50: 46000, run_duration_p95: 62000 },
  { time: "02:09", run_duration_p50: 44000, run_duration_p95: 59000 },
  { time: "02:14", run_duration_p50: 47000, run_duration_p95: 61000 },
  { time: "02:19", run_duration_p50: 43000, run_duration_p95: 58000 },
  { time: "02:24", run_duration_p50: 45000, run_duration_p95: 60000 },
  { time: "02:29", run_duration_p50: 46000, run_duration_p95: 61000 },
  { time: "02:34", run_duration_p50: 44000, run_duration_p95: 59000 },
  { time: "02:39", run_duration_p50: 47000, run_duration_p95: 62000 },
  { time: "02:44", run_duration_p50: 45000, run_duration_p95: 60000 },
];

const METRIC_CARDS = [
  { title: "消息处理总量", value: "13" },
  { title: "消息入队", value: "13" },
  { title: "执行耗时 P95", value: "10s" },
  { title: "队列深度 P95", value: "0" },
  { title: "卡死会话", value: "4" },
];

/** 5 个设计系统标准 SVG icon（渐变黑→蓝，与 TokensMonitor 统一风格）*/
const METRIC_ICONS: React.ReactNode[] = [
  /* 闪电 - 消息处理总量 */
  <svg key="i0" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1557 0.568474C11.2759 0.547602 11.3997 0.565694 11.5083 0.621208C11.6168 0.676751 11.7039 0.766463 11.7573 0.876091C11.8107 0.985788 11.8275 1.10986 11.8042 1.22961L10.77 6.39172L14.8227 7.91125C14.9089 7.94398 14.9857 7.99716 15.0464 8.06652C15.1071 8.13609 15.1505 8.2197 15.1714 8.30968C15.1922 8.39969 15.1905 8.4939 15.1665 8.58312C15.1425 8.67222 15.0968 8.75406 15.0337 8.8214H15.0366L7.1616 17.2589L7.09421 17.3204C7.0224 17.3757 6.9373 17.4131 6.84714 17.4288L6.7573 17.4366C6.69672 17.4373 6.63627 17.4288 6.57859 17.4103L6.49461 17.3751C6.386 17.3195 6.29798 17.2299 6.24461 17.1202C6.20472 17.0381 6.18625 16.9479 6.18894 16.8575L6.19871 16.7667L7.22996 11.6105L3.17722 10.089C3.11208 10.0646 3.05213 10.0285 3.00046 9.98254L2.95164 9.93273C2.9057 9.8803 2.86992 9.82011 2.84617 9.755L2.82664 9.68859C2.80577 9.59809 2.80709 9.50378 2.83152 9.41418C2.85597 9.32456 2.90234 9.2423 2.96629 9.17492L10.8413 0.737419C10.9247 0.648358 11.0355 0.589437 11.1557 0.568474ZM5.34324 9.09972L9.1655 10.5353L8.63035 13.2111L11.1528 10.5089H11.1401L12.6479 8.89758L8.83445 7.46789L9.37058 4.78527L5.34324 9.09972Z" fill="url(#ops_icon_0)"/><defs><radialGradient id="ops_icon_0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.81201 8.99836) scale(12.3738 747.725)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>,
  /* 下载/入队 - 消息入队 */
  <svg key="i1" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.02805 6.22195C4.86954 6.06344 4.78049 5.84846 4.78049 5.6243C4.78049 5.40013 4.86954 5.18515 5.02805 5.02664C5.18656 4.86813 5.40154 4.77908 5.6257 4.77908C5.84987 4.77908 6.06485 4.86813 6.22336 5.02664L8.15625 6.96094V1.6875C8.15625 1.46372 8.24514 1.24911 8.40338 1.09088C8.56161 0.932645 8.77622 0.84375 9 0.84375C9.22378 0.84375 9.43839 0.932645 9.59662 1.09088C9.75485 1.24911 9.84375 1.46372 9.84375 1.6875V6.96094L11.778 5.02594C11.9366 4.86743 12.1515 4.77838 12.3757 4.77838C12.5999 4.77838 12.8149 4.86743 12.9734 5.02594C13.1319 5.18445 13.2209 5.39943 13.2209 5.62359C13.2209 5.84776 13.1319 6.06274 12.9734 6.22125L9.59836 9.59625C9.51997 9.67491 9.42683 9.73732 9.32427 9.77991C9.22171 9.82249 9.11175 9.84442 9.0007 9.84442C8.88965 9.84442 8.7797 9.82249 8.67714 9.77991C8.57458 9.73732 8.48143 9.67491 8.40305 9.59625L5.02805 6.22195ZM15.75 8.15625H13.2188C12.995 8.15625 12.7804 8.24514 12.6221 8.40338C12.4639 8.56161 12.375 8.77622 12.375 9C12.375 9.22378 12.4639 9.43839 12.6221 9.59662C12.7804 9.75485 12.995 9.84375 13.2188 9.84375H15.4688V13.7812H2.53125V9.84375H4.78125C5.00503 9.84375 5.21964 9.75485 5.37787 9.59662C5.53611 9.43839 5.625 9.22378 5.625 9C5.625 8.77622 5.53611 8.56161 5.37787 8.40338C5.21964 8.24514 5.00503 8.15625 4.78125 8.15625H2.25C1.87704 8.15625 1.51935 8.30441 1.25563 8.56813C0.991908 8.83185 0.84375 9.18954 0.84375 9.5625V14.0625C0.84375 14.4355 0.991908 14.7931 1.25563 15.0569C1.51935 15.3206 1.87704 15.4688 2.25 15.4688H15.75C16.123 15.4688 16.4806 15.3206 16.7444 15.0569C17.0081 14.7931 17.1562 14.4355 17.1562 14.0625V9.5625C17.1563 9.18954 17.0081 8.83185 16.7444 8.56813C16.4806 8.30441 16.123 8.15625 15.75 8.15625ZM14.3438 11.8125C14.3438 11.59 14.2778 11.3725 14.1542 11.1875C14.0305 11.0025 13.8548 10.8583 13.6493 10.7731C13.4437 10.688 13.2175 10.6657 12.9993 10.7091C12.781 10.7525 12.5806 10.8597 12.4233 11.017C12.2659 11.1743 12.1588 11.3748 12.1154 11.593C12.072 11.8113 12.0942 12.0375 12.1794 12.243C12.2645 12.4486 12.4087 12.6243 12.5937 12.7479C12.7787 12.8715 12.9962 12.9375 13.2188 12.9375C13.5171 12.9375 13.8033 12.819 14.0142 12.608C14.2252 12.397 14.3438 12.1109 14.3438 11.8125Z" fill="url(#ops_icon_1)"/><defs><radialGradient id="ops_icon_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.843749 8.15625) scale(16.3125 647.966)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>,
  /* 星星 - 执行耗时 P95 */
  <svg key="i2" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6322 7.68155L12.2953 6.10444L10.7182 1.76757C10.6198 1.49691 10.4405 1.26309 10.2047 1.09786C9.9688 0.932629 9.68779 0.843994 9.39982 0.843994C9.11184 0.843994 8.83084 0.932629 8.59498 1.09786C8.35912 1.26309 8.17983 1.49691 8.08146 1.76757L6.50435 6.10444L2.16747 7.68155C1.89682 7.77992 1.66299 7.95921 1.49776 8.19507C1.33253 8.43093 1.2439 8.71193 1.2439 8.99991C1.2439 9.28789 1.33253 9.56889 1.49776 9.80475C1.66299 10.0406 1.89682 10.2199 2.16747 10.3183L6.50435 11.8954L8.08146 16.2323C8.17983 16.5029 8.35912 16.7367 8.59498 16.902C8.83084 17.0672 9.11184 17.1558 9.39982 17.1558C9.68779 17.1558 9.9688 17.0672 10.2047 16.902C10.4405 16.7367 10.6198 16.5029 10.7182 16.2323L12.2953 11.8954L16.6322 10.3183C16.9028 10.2199 17.1366 10.0406 17.3019 9.80475C17.4671 9.56889 17.5557 9.28789 17.5557 8.99991C17.5557 8.71193 17.4671 8.43093 17.3019 8.19507C17.1366 7.95921 16.9028 7.77992 16.6322 7.68155ZM11.3489 10.4441C11.2329 10.4863 11.1277 10.5533 11.0404 10.6405C10.9532 10.7278 10.8862 10.833 10.844 10.949L9.39982 14.9209L7.9556 10.949C7.91347 10.833 7.84643 10.7278 7.7592 10.6405C7.67198 10.5533 7.56669 10.4863 7.45075 10.4441L3.4788 8.99991L7.45075 7.55569C7.56669 7.51356 7.67198 7.44653 7.7592 7.3593C7.84643 7.27208 7.91347 7.16679 7.9556 7.05085L9.39982 3.0789L10.844 7.05085C10.8862 7.16679 10.9532 7.27208 11.0404 7.3593C11.1277 7.44653 11.2329 7.51356 11.3489 7.55569L15.3208 8.99991L11.3489 10.4441Z" fill="url(#ops_icon_2)"/><defs><radialGradient id="ops_icon_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.2439 8.99991) scale(16.3118 722.702)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>,
  /* 云上传 - 队列深度 P95 */
  <svg key="i3" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.8157 10.653C13.9742 10.8116 14.0633 11.0265 14.0633 11.2507C14.0633 11.4749 13.9742 11.6899 13.8157 11.8484C13.6572 12.0069 13.4422 12.0959 13.2181 12.0959C12.9939 12.0959 12.7789 12.0069 12.6204 11.8484L11.8125 11.0391V14.625C11.8125 14.8488 11.7236 15.0634 11.5654 15.2216C11.4071 15.3799 11.1925 15.4688 10.9688 15.4688C10.745 15.4688 10.5304 15.3799 10.3721 15.2216C10.2139 15.0634 10.125 14.8488 10.125 14.625V11.0391L9.31572 11.8491C9.15721 12.0076 8.94222 12.0966 8.71806 12.0966C8.4939 12.0966 8.27891 12.0076 8.1204 11.8491C7.9619 11.6906 7.87285 11.4756 7.87285 11.2514C7.87285 11.0272 7.9619 10.8123 8.1204 10.6538L10.3704 8.40375C10.4488 8.32509 10.5419 8.26268 10.6445 8.22009C10.7471 8.17751 10.857 8.15558 10.9681 8.15558C11.0791 8.15558 11.1891 8.17751 11.2916 8.22009C11.3942 8.26268 11.4873 8.32509 11.5657 8.40375L13.8157 10.653ZM11.25 2.53125C10.0822 2.53181 8.93632 2.84821 7.9337 3.44694C6.93107 4.04567 6.10905 4.90443 5.5547 5.93227C4.9091 5.86465 4.2565 5.9292 3.63666 6.12198C3.01682 6.31477 2.44272 6.63175 1.94937 7.05361C1.45601 7.47547 1.05372 7.99337 0.767018 8.57575C0.480315 9.15814 0.315204 9.7928 0.281746 10.4411C0.248288 11.0893 0.347185 11.7376 0.57241 12.3464C0.797634 12.9552 1.14447 13.5118 1.59178 13.9822C2.03908 14.4526 2.57749 14.827 3.17419 15.0826C3.77089 15.3382 4.41338 15.4695 5.06251 15.4688H7.03126C7.25504 15.4688 7.46965 15.3799 7.62788 15.2216C7.78612 15.0634 7.87501 14.8488 7.87501 14.625C7.87501 14.4012 7.78612 14.1866 7.62788 14.0284C7.46965 13.8701 7.25504 13.7812 7.03126 13.7812H5.06251C4.25632 13.7763 3.4839 13.4569 2.90972 12.8909C2.33554 12.325 2.00496 11.5573 1.98838 10.7512C1.97179 9.94518 2.2705 9.1645 2.82091 8.57542C3.37132 7.98633 4.12994 7.63537 4.93525 7.59727C4.83275 8.0578 4.78111 8.5282 4.78126 9C4.78126 9.22378 4.87016 9.43839 5.02839 9.59662C5.18663 9.75485 5.40124 9.84375 5.62501 9.84375C5.84879 9.84375 6.0634 9.75485 6.22163 9.59662C6.37987 9.43839 6.46876 9.22378 6.46876 9C6.46934 8.30834 6.61998 7.62505 6.91028 6.99726C7.20057 6.36948 7.62362 5.81215 8.15022 5.36373C8.67682 4.91532 9.29445 4.58649 9.96047 4.39995C10.6265 4.2134 11.3251 4.17358 12.008 4.28322C12.6909 4.39287 13.3419 4.64938 13.916 5.03504C14.4902 5.42071 14.9738 5.92635 15.3336 6.51708C15.6933 7.10781 15.9206 7.76956 15.9998 8.45666C16.079 9.14377 16.0082 9.83988 15.7922 10.497C15.7575 10.6022 15.7439 10.7133 15.7522 10.8238C15.7604 10.9343 15.7904 11.0421 15.8403 11.1411C15.8902 11.24 15.9591 11.3282 16.0431 11.4005C16.1271 11.4728 16.2245 11.5279 16.3297 11.5625C16.435 11.5972 16.5461 11.6108 16.6566 11.6026C16.7671 11.5943 16.8749 11.5644 16.9739 11.5145C17.0728 11.4645 17.161 11.3956 17.2333 11.3116C17.3056 11.2277 17.3607 11.1303 17.3953 11.025C17.7147 10.0532 17.7992 9.01945 17.6418 8.00864C17.4845 6.99784 17.0898 6.03872 16.4902 5.20992C15.8905 4.38112 15.103 3.70624 14.1921 3.24063C13.2812 2.77501 12.273 2.5319 11.25 2.53125Z" fill="url(#ops_icon_3)"/><defs><radialGradient id="ops_icon_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.27539 9) scale(17.4435 573.201)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>,
  /* 日历星 - 卡死会话 */
  <svg key="i4" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7085 0.84375C12.9323 0.84375 13.1469 0.932586 13.3052 1.09082C13.4634 1.24905 13.5522 1.46372 13.5522 1.6875V1.96875H14.9585C15.3315 1.96875 15.6889 2.11714 15.9526 2.38086C16.2164 2.64458 16.3647 3.00204 16.3647 3.375V14.625C16.3647 14.998 16.2164 15.3554 15.9526 15.6191C15.6889 15.8829 15.3315 16.0312 14.9585 16.0312H3.7085C3.33554 16.0312 2.97808 15.8829 2.71436 15.6191C2.45063 15.3554 2.30225 14.998 2.30225 14.625V3.375C2.30225 3.00204 2.45063 2.64458 2.71436 2.38086C2.97808 2.11714 3.33554 1.96875 3.7085 1.96875H5.11475V1.6875C5.11475 1.46372 5.20358 1.24905 5.36182 1.09082C5.52005 0.932587 5.73472 0.84375 5.9585 0.84375C6.18227 0.84375 6.39694 0.932587 6.55518 1.09082C6.71341 1.24905 6.80225 1.46372 6.80225 1.6875V1.96875H11.8647V1.6875C11.8647 1.46372 11.9536 1.24905 12.1118 1.09082C12.2701 0.932586 12.4847 0.84375 12.7085 0.84375ZM3.98975 3.65625V14.3438H14.6772V3.65625H13.5522C13.5522 3.88003 13.4634 4.0947 13.3052 4.25293C13.1469 4.41116 12.9323 4.5 12.7085 4.5C12.4847 4.5 12.2701 4.41116 12.1118 4.25293C11.9536 4.0947 11.8647 3.88003 11.8647 3.65625H6.80225C6.80225 3.88003 6.71341 4.0947 6.55518 4.25293C6.39694 4.41116 6.18227 4.5 5.9585 4.5C5.73472 4.5 5.52005 4.41116 5.36182 4.25293C5.20358 4.0947 5.11475 3.88003 5.11475 3.65625H3.98975ZM9.01709 5.70508C9.12582 5.41124 9.54117 5.41124 9.6499 5.70508L10.4731 7.92871L12.6968 8.75195C12.9905 8.86075 12.9906 9.27605 12.6968 9.38477L10.4731 10.208L9.6499 12.4316C9.54784 12.7068 9.1762 12.7242 9.04053 12.4834L9.01709 12.4316L8.19385 10.208L5.97021 9.38477C5.67641 9.27605 5.67647 8.86073 5.97021 8.75195L8.19385 7.92871L9.01709 5.70508Z" fill="url(#ops_icon_4)"/><defs><radialGradient id="ops_icon_4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.30225 8.4375) scale(14.0625 672.888)"><stop stopColor="#202020"/><stop offset="1" stopColor="#0080FF"/></radialGradient></defs></svg>,
];

const SESSION_MGMT_ICON_BASE = "/assets/admin-session-management";

// 现有观测功能卡片
const EXISTING_OBSERVATION_CARDS = [
  {
    id: "health-monitoring",
    title: "业务运行健康度实时监控",
    description: "聚焦消息处理总量、入队效率与卡死会话，保障系统稳定运行",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/business-health-monitoring.svg`,
  },
  {
    id: "log-metrics-insight",
    title: "应用日志与 OTEL 指标全景洞察",
    description: "多维度分析日志级别与模块分布，精细化追踪消息处理、队列状态与执行耗时",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/app-log-otel-insight.svg`,
  },
];

// CLS 新增功能卡片
const CLS_NEW_CARDS = [
  {
    id: "high-cost-session",
    title: "高Token会话实时分析与管控",
    description: "聚焦 TOP 会话的 Token 消耗、轮次分布与耗时特征，精准定位高Token交互，优化模型调用成本与资源效率",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/high-token-session-control.svg`,
  },
  {
    id: "single-session-cost",
    title: "单会话全链路Token透视",
    description: "拆解每轮交互的 Token 流量与耗时分布，可视化工具调用与上下文膨胀对成本的影响",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/single-session-token-insight.svg`,
  },
  {
    id: "session-global-monitoring",
    title: "会话全局运行态势监控",
    description: "聚合总会话数、平均轮次与工具调用量，多维度洞察渠道与模型分布，实现会话全生命周期可追溯、可分析",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/session-global-monitoring.svg`,
  },
  {
    id: "session-efficiency",
    title: "会话详情与交互效率精细化分析",
    description: "聚焦单会话 Token 消耗，可视化渠道与模型分布特征，精准定位高Token会话，优化资源配置与调用效率",
    iconSrc: `${SESSION_MGMT_ICON_BASE}/session-detail-analysis.svg`,
  },
];

// CLS 采集插件版本历史
interface CLSPluginVersion {
  version: string;
  releaseDate: string;
  changelog: string;
  status: 'current' | 'available' | 'deprecated';
}

const CLS_PLUGIN_VERSIONS: CLSPluginVersion[] = [
  { version: "v5", releaseDate: "2026-03-24", changelog: "修复会话追踪精度问题，优化 Token 计算算法", status: "available" },
  { version: "v4", releaseDate: "2026-03-17", changelog: "新增会话全局监控功能，支持多渠道分析", status: "available" },
  { version: "v3", releaseDate: "2026-03-10", changelog: "优化日志采集性能，降低 CPU 占用率", status: "current" },
  { version: "v2", releaseDate: "2026-03-03", changelog: "修复 CLS 连接超时问题", status: "deprecated" },
  { version: "v1", releaseDate: "2026-02-24", changelog: "首次发布 CLS 采集插件", status: "deprecated" },
];

// Legend 说明映射
const legendTooltips: Record<string, string> = {
  "已处理完成的消息数量": "已处理完成：已成功处理完成的消息数量",
  "等待处理的消息数量": "等待处理：等待处理的消息数量",
  "队列长度 P95": "队列长度 P95：95% 的时间队列长度不超过此值，反映队列拥堵程度",
  "等待时间 P95": "等待时间 P95：95% 的消息等待时间不超过此值，反映队列延迟",
  "处理耗时 P50": "处理耗时 P50：50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险",
  "处理耗时 P95": "处理耗时 P95：95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验",
};

// Custom Y Axis Tick with Tooltip
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const [showTooltip, setShowTooltip] = useState(false);
  const fullName = logModuleData.find(item => item.name.includes(payload.value.split('...')[0]))?.name || payload.value;
  
  return (
    <g>
      <text 
        x={x} 
        y={y} 
        textAnchor="end" 
        fontSize={12} 
        fill="#6b7280"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'pointer' }}
      >
        {payload.value}
      </text>
      {showTooltip && (
        <foreignObject x={x - 150} y={y - 25} width={140} height={40}>
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-normal break-words">
            {fullName}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  console.log('CustomLegend payload:', payload);
  if (!payload || payload.length === 0) {
    return null;
  }
  return (
    <div className="flex gap-6 justify-center flex-wrap">
      {payload.map((entry: any, index: number) => {
        console.log('Legend entry:', entry);
        return (
          <div key={`legend-${index}`} className="group relative flex items-center gap-2 cursor-help">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[#737373] inline-block">{entry.name}</span>
            {legendTooltips[entry.name] && (
              <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 w-max whitespace-nowrap">
                {legendTooltips[entry.name]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 工具函数
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayStr() {
  return toDateStr(new Date());
}
function addDays(base: string, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export default function OpsObservation() {
  const today = todayStr();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [clsEnabled, setClsEnabled] = useState(() => {
    const stored = localStorage.getItem("globalClsEnabled");
    return stored === "true";
  });
  const [isEnablingCls, setIsEnablingCls] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCloseClsConfirm, setShowCloseClsConfirm] = useState(false);
  const [isClosingCls, setIsClosingCls] = useState(false);
  const [deleteLogTopic, setDeleteLogTopic] = useState(false);
  const [showClsAgreementDialog, setShowClsAgreementDialog] = useState(false);
  const [clsAgreed, setClsAgreed] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authCheckInterval, setAuthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFreeQuotaDialog, setShowFreeQuotaDialog] = useState(false);
  const [freeQuotaAgreed, setFreeQuotaAgreed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(""); // Agent 名称筛选
  const [showPluginUpgradeDialog, setShowPluginUpgradeDialog] = useState(false);
  const [selectedPluginVersion, setSelectedPluginVersion] = useState<any>(null);
  const [isUpgradingPlugin, setIsUpgradingPlugin] = useState(false);

  // 当弹窗打开时，自动选中最新版本
  useEffect(() => {
    if (showPluginUpgradeDialog && !selectedPluginVersion) {
      setSelectedPluginVersion(CLS_PLUGIN_VERSIONS[0]); // v5 是最新版本
    }
  }, [showPluginUpgradeDialog]);

  // 处理日期变化
  const handleFromChange = (value: string) => {
    setDateFrom(value);
  };

  const handleToChange = (value: string) => {
    setDateTo(value);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); }, 1000);
  };

  // 监听 localStorage 变化，实现跨页面同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "globalClsEnabled") {
        setClsEnabled(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 监听 clsOpenClicked 标记，显示协议弹窗
  useEffect(() => {
    const checkClsOpen = () => {
      if (localStorage.getItem('clsOpenClicked') === 'true') {
        localStorage.removeItem('clsOpenClicked');
        setShowClsAgreementDialog(true);
      }
    };
    
    // 页面加载时检查
    checkClsOpen();
    
    // 监听 focus 事件
    window.addEventListener('focus', checkClsOpen);
    return () => window.removeEventListener('focus', checkClsOpen);
  }, []);

  const handleOpenCLS = () => {
    // 检查授权状态（从后台缓存数据中获取）
    const isAuthorized = localStorage.getItem('clsAuthorized') === 'true';
    
    if (!isAuthorized) {
      // 未授权，显示授权 Dialog
      setShowAuthDialog(true);
      // 启动自动检测授权状态
      setIsCheckingAuth(true);
      const interval = setInterval(() => {
        const authorized = localStorage.getItem('clsAuthorized') === 'true';
        if (authorized) {
          // 已授权，关闭 Dialog 并继续
          setShowAuthDialog(false);
          setIsCheckingAuth(false);
          clearInterval(interval);
          // 继续开启 CLS 日志服务
          proceedWithClsSetup();
        }
      }, 2000);
      setAuthCheckInterval(interval);
    } else {
      // 已授权，直接继续
      proceedWithClsSetup();
    }
  };

  const proceedWithClsSetup = () => {
    // 显示免费额度 Dialog
    setShowFreeQuotaDialog(true);
    setFreeQuotaAgreed(false);
  };

  const handleGoToAuth = () => {
    // Mock 授权流程：5 秒后自动检测授权完成
    // 不真正打开腾讯云页面，而是模拟授权完成
    // 先显示检测状态
    setIsCheckingAuth(true);
    setAuthCompleted(false);
    
    setTimeout(() => {
      localStorage.setItem('clsAuthorized', 'true');
      // 检测完成，显示完成状态
      setIsCheckingAuth(false);
      setAuthCompleted(true);
      // 1秒后自动关闭Dialog并进入下一步
      setTimeout(() => {
        setShowAuthDialog(false);
        setAuthCompleted(false);
        proceedWithClsSetup();
      }, 1000);
    }, 5000);
  };

  const handleConfirmFreeQuota = () => {
    if (!freeQuotaAgreed) return;
    setShowFreeQuotaDialog(false);
    setIsEnablingCls(true);
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setFreeQuotaAgreed(false);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleGoToCalcDetail = () => {
    window.open('https://cloud.tencent.com/document/product/614/45802', '_blank');
  };

  const handleCancelFreeQuota = () => {
    setShowFreeQuotaDialog(false);
    setFreeQuotaAgreed(false);
  };

  const handleConfirmClsAgreement = () => {
    if (!clsAgreed) return;
    setIsEnablingCls(true);
    // 模拟 loading 1.5 秒
    setTimeout(() => {
      setClsEnabled(true);
      localStorage.setItem('globalClsEnabled', 'true');
      setIsEnablingCls(false);
      setShowSuccessMessage(true);
      setShowClsAgreementDialog(false);
      setClsAgreed(false);
      // 3 秒后隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const handleCancelAuth = () => {
    setShowAuthDialog(false);
    setIsCheckingAuth(false);
    setAuthCompleted(false);
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
      setAuthCheckInterval(null);
    }
  };

  const handleCloseCls = () => {
    setIsClosingCls(true);
    setTimeout(() => {
      setClsEnabled(false);
      localStorage.setItem("globalClsEnabled", "false");
      setIsClosingCls(false);
      setShowCloseClsConfirm(false);
      setDeleteLogTopic(false);
      const message = deleteLogTopic ? "CLS 日志服务已关闭，日志主题资源已删除" : "CLS 日志服务已关闭";
      // toast.success(message);
    }, 1000);
  };

  const handleCloseClsConfirmCancel = () => {
    setShowCloseClsConfirm(false);
    setDeleteLogTopic(false);
  };

  return (
    <div className="page-enter">
      <AdminPageHeader
        title="运维观测"
        description="全方位守护系统稳定运行，从被动救火到主动防御"
        actions={
          <div className="flex items-center gap-2">
            <DatePicker
              value={dateFrom}
              onChange={handleFromChange}
            />
            <span className="text-[#A3A3A3] text-sm">—</span>
            <DatePicker
              value={dateTo}
              onChange={handleToChange}
            />
            <Button
              variant="claw-outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              title="刷新数据"
              className="w-9 h-9"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
        className="mb-8"
      />

      {/* CLS 日志服务未开启提示 */}
      {!clsEnabled && (
        <>
          {/* CLS 提示弹框 */}
          <div className="bg-white border border-gray-200 rounded-[4px] p-6 mb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">运维观测需要开启 CLS 日志服务</h3>
                <p className="text-xs text-[#737373]">开启后，为您赠送3个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 500台 Agent 机器3个月的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-[#355EF1] hover:underline inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a></p>
              </div>
              <Button
                onClick={handleOpenCLS}
                disabled={isEnablingCls}
                className="ml-4 text-xs h-8 px-4 whitespace-nowrap flex-shrink-0"
              >
                {isEnablingCls ? "开启中..." : "开启 CLS 日志服务"}
              </Button>
            </div>
          </div>



          {/* CLS 协议确认弹窗 */}
          <Dialog open={showClsAgreementDialog} onOpenChange={setShowClsAgreementDialog}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>确认免费额度</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="cls-agreement"
                    checked={clsAgreed}
                    onCheckedChange={(checked) => setClsAgreed(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="cls-agreement" className="text-sm text-[#525252] cursor-pointer flex-1 font-normal leading-relaxed">
                    为您赠送三个月ClawPro 专属 CLS 日志服务免费额度，预估可覆盖 700 台 Agent 机器的日志用量；服务到期后，CLS 将按量计费。<a href="https://cloud.tencent.com/document/product/614/45802" target="_blank" className="text-[#355EF1] hover:text-[#355EF1] inline-flex items-center gap-1">计费详情 <ArrowUpRight className="w-3 h-3" /></a>
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClsAgreementDialog(false);
                    setClsAgreed(false);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="dialog-confirm"
                  onClick={handleConfirmClsAgreement}
                  disabled={!clsAgreed || isEnablingCls}
                >
                  {isEnablingCls ? "开启中..." : "确认"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 卡片功能展示 - 现有观测功能 + CLS 新增功能 */}
          <div className="space-y-4 mb-8">
            {/* 第一块：CLS 新增功能 */}
            <SurfaceCard className="px-6 py-5">
              <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您可以在此处获得以下观测数据：</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {EXISTING_OBSERVATION_CARDS.map((card) => {
                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-[14px] py-5"
                    >
                      <img src={card.iconSrc} alt="" className="shrink-0 w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">
                          {card.title}
                        </h5>
                        <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
            <SurfaceCard className="px-6 py-5">
              <h4 className="text-[14px] font-medium text-[#737373] mb-4">开启CLS日志服务后您还可以在Tokens监控和运维观测页面中获得以下观测数据：</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {CLS_NEW_CARDS.map((card) => {
                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-[14px] py-5"
                    >
                      <img src={card.iconSrc} alt="" className="shrink-0 w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[14px] font-medium tracking-[0.005em] text-[#020617] leading-[22px]">
                          {card.title}
                        </h5>
                        <p className="text-[12px] leading-[20px] tracking-[0.015em] text-[#737373]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </div>
        </>
      )}

      {/* CLS 采集插件升级对话框 - 普通弹窗 */}
      <Dialog open={showPluginUpgradeDialog} onOpenChange={setShowPluginUpgradeDialog}>
        <DialogContent
          className="sm:max-w-[720px]"
          style={{ maxHeight: 'min(90vh, 780px)', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader>
            <DialogTitle>升级 CLS 采集插件</DialogTitle>
            <DialogDescription>选择要升级的版本并查看更新内容</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1">
            <div className="rounded-[4px] border border-gray-200 overflow-hidden">
              <RadioGroup
                value={selectedPluginVersion?.version ?? ""}
                onValueChange={(val) => {
                  const v = CLS_PLUGIN_VERSIONS.find((x) => x.version === val);
                  if (v) setSelectedPluginVersion(v);
                }}
                className="contents"
              >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: 40 }} />
                    <TableHead style={{ width: 100 }}>版本号</TableHead>
                    <TableHead>更新内容</TableHead>
                    <TableHead style={{ width: 120 }}>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLS_PLUGIN_VERSIONS.map((v) => {
                    const isUpgradeable = v.status !== 'current' && v.status !== 'deprecated';
                    return (
                      <TableRow
                        key={v.version}
                        onClick={() => isUpgradeable && setSelectedPluginVersion(v)}
                        className={
                          isUpgradeable
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-60"
                        }
                      >
                        <TableCell className="py-2">
                          <RadioGroupItem
                            value={v.version}
                            disabled={!isUpgradeable}
                            aria-label={`选择版本 ${v.version}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{v.version}</TableCell>
                        <TableCell className="text-[#525252]">{v.changelog}</TableCell>
                        <TableCell>
                          {v.status === 'current' && <StatusTag mode="text" variant="green">当前版本</StatusTag>}
                          {v.status === 'deprecated' && <StatusTag mode="text" variant="gray">已弃用</StatusTag>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </RadioGroup>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPluginUpgradeDialog(false);
                setSelectedPluginVersion(null);
              }}
              disabled={isUpgradingPlugin}
            >
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={() => {
                setIsUpgradingPlugin(true);
                setTimeout(() => {
                  setIsUpgradingPlugin(false);
                  setShowPluginUpgradeDialog(false);
                  if (selectedPluginVersion) {
                    toast.success(`成功升级到 ${selectedPluginVersion?.version}`);
                  }
                }, 2000);
              }}
              disabled={isUpgradingPlugin || !selectedPluginVersion || selectedPluginVersion?.status === 'current'}
            >
              {isUpgradingPlugin ? "升级中..." : "确认升级"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CLS 开启成功提示 */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-[4px] px-4 py-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
            <div>
              <p className="text-sm font-medium text-green-800">CLS 日志服务开启成功</p>
            </div>
          </div>
        </div>
      )}

      {/* 已开启时显示工具栏：左侧 Agent 下拉；右侧 关闭CLS（次级）/ 升级CLS（主按钮） */}
      {clsEnabled && (
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* 左侧：Agent 名称筛选 */}
          <Select value={selectedAgent || "all"} onValueChange={(v) => setSelectedAgent(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[240px] bg-white">
              <SelectValue placeholder="全部 Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部 Agent</SelectItem>
              <SelectItem value="Agent-A">Agent-A</SelectItem>
              <SelectItem value="Agent-B">Agent-B</SelectItem>
              <SelectItem value="Agent-C">Agent-C</SelectItem>
              <SelectItem value="Agent-D">Agent-D</SelectItem>
              <SelectItem value="Agent-E">Agent-E</SelectItem>
              <SelectItem value="Agent-F">Agent-F</SelectItem>
              <SelectItem value="Agent-G">Agent-G</SelectItem>
              <SelectItem value="Agent-H">Agent-H</SelectItem>
            </SelectContent>
          </Select>
          {/* 右侧：关闭CLS（次级）/ 升级CLS（主按钮）— 同档 32px 高度 */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setShowCloseClsConfirm(true)}
              variant="claw-outline"
              size="claw-sm"
            >
              关闭CLS服务
            </Button>
            <Button
              onClick={() => setShowPluginUpgradeDialog(true)}
              variant="claw-primary"
              size="claw-sm"
            >
              升级CLS采集插件
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards - 仅在 CLS 启用时显示 */}
      {clsEnabled && (
        <>
      <div className="grid grid-cols-5 gap-5 mb-8">
        {METRIC_CARDS.map((card, idx) => (
          <SurfaceCard key={idx} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              {METRIC_ICONS[idx]}
              <span className="text-sm text-[#737373]">{card.title}</span>
            </div>
            <StatNumber>{card.value}</StatNumber>
          </SurfaceCard>
        ))}
      </div>

      {/* Application Logs Dashboard */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#09090b] mb-4">应用日志大盘</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Log Level Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#09090b]">日志级别分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={logLevelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Log Module Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#09090b]">日志模块分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={logModuleData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OTEL Metrics Dashboard */}
      <div>
        <h2 className="text-lg font-bold text-[#09090b] mb-4">OTEL 指标大盘</h2>
        <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-3 gap-6">
          {/* Message Processing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <UITooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-semibold text-[#09090b] cursor-help">消息处理</h3>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  已处理完成：已成功处理完成的消息数量；等待处理：等待处理的消息数量
                </TooltipContent>
              </UITooltip>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={messageProcessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="processed" name="已处理完成的消息数量" stroke="#10B981" dot={false} />
                <Line type="monotone" dataKey="queued" name="等待处理的消息数量" stroke="#3B82F6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span className="text-[#737373]">已处理完成的消息数量</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">已成功处理完成的消息数量</TooltipContent>
              </UITooltip>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                    <span className="text-[#737373]">等待处理的消息数量</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">等待处理的消息数量</TooltipContent>
              </UITooltip>
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <UITooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-semibold text-[#09090b] cursor-help">队列状态</h3>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <div>队列长度 P95：95% 的时间队列长度不超过此值，反映队列拥堵程度</div>
                  <div>等待时间 P95：95% 的消息等待时间不超过此值，反映队列延迟</div>
                </TooltipContent>
              </UITooltip>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={queueStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="depth_avg" name="队列长度 P95" stroke="#8B5CF6" dot={false} />
                <Line type="monotone" dataKey="wait_ms_avg" name="等待时间 P95" stroke="#06B6D4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                    <span className="text-[#737373]">队列长度 P95</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">95% 的时间队列长度不超过此值，反映队列拥堵程度</TooltipContent>
              </UITooltip>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                    <span className="text-[#737373]">等待时间 P95</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">95% 的消息等待时间不超过此值，反映队列延迟</TooltipContent>
              </UITooltip>
            </div>
          </div>

          {/* Run Duration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <UITooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-semibold text-[#09090b] cursor-help">执行耗时</h3>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <div>处理耗时 P50：50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险</div>
                  <div>处理耗时 P95：95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验</div>
                </TooltipContent>
              </UITooltip>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={runDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="run_duration_p50" name="处理耗时 P50" stroke="#F59E0B" dot={false} />
                <Line type="monotone" dataKey="run_duration_p95" name="处理耗时 P95" stroke="#EF4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs flex-wrap">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span className="text-[#737373]">处理耗时 P50</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">50% 的消息处理时间不超过此值，反映最差场景性能与边缘业务的延迟风险</TooltipContent>
              </UITooltip>
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                    <span className="text-[#737373]">处理耗时 P95</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">95% 的消息处理时间不超过此值，反映典型处理性能与大部分业务的实际延迟体验</TooltipContent>
              </UITooltip>
            </div>
          </div>
        </div>
        </TooltipProvider>
      </div>
        </>
      )}

        {/* CLS 授权 Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>开通服务授权</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {!isCheckingAuth && !authCompleted && (
              <p className="text-sm text-[#525252]">开启CLS日志服务后您可以获取会话数据和观测数据</p>
            )}
            <div className="space-y-3 flex flex-col items-center min-h-16 justify-center">
              {isCheckingAuth ? (
                <>
                  {/* 检测中的旋转动画 */}
                  <div className="w-8 h-8 border-2 border-[#355EF1] border-t-[#355EF1] rounded-full animate-spin"></div>
                  <p className="text-xs text-[#737373] text-center">检测中...</p>
                </>
              ) : authCompleted ? (
                <>
                  {/* 检测完成后显示完成 icon */}
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-xs text-[#737373] text-center">检测到已授权</p>
                </>
              ) : null}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelAuth}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleGoToAuth}
            >
              前往授权
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 免费额度 Dialog */}
      <Dialog open={showFreeQuotaDialog} onOpenChange={setShowFreeQuotaDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>开启CLS日志服务-免费额度说明</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <Alert variant="info">
              <AlertOperationInfoIcon />
              <AlertDescription>
                为您赠送<span className="font-semibold text-[#355EF1]">3个月</span>ClawPro 专属 CLS 日志服务免费额度（共<span className="font-semibold text-[#355EF1]">3000U</span>），预估可覆盖 <span className="font-semibold text-[#355EF1]">500台</span> Agent 机器<span className="font-semibold text-[#355EF1]">3个月</span>的日志用量；超过免费额度达到上限或<span className="font-semibold text-[#355EF1]">3个月</span>到期后，CLS 将按量计费。计费详情请参考{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoToCalcDetail();
                  }}
                  className="text-[#355EF1] hover:text-[#355EF1] underline"
                >
                  计费详情
                </a>
                。
              </AlertDescription>
            </Alert>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id="free-quota-agreement"
                checked={freeQuotaAgreed}
                onCheckedChange={(checked) => setFreeQuotaAgreed(checked === true)}
              />
              <Label htmlFor="free-quota-agreement" className="text-sm text-[#525252] cursor-pointer font-normal">我已阅读并同意免费额度说明</Label>
            </label>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelFreeQuota}>
              取消
            </Button>
            <Button
              variant="dialog-confirm"
              onClick={handleConfirmFreeQuota}
              disabled={!freeQuotaAgreed}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关闭CLS服务 - 警示弹窗 */}
      <AlertDialog open={showCloseClsConfirm} onOpenChange={setShowCloseClsConfirm}>
        <AlertDialogContent className="sm:max-w-[560px]">
          <button
            type="button"
            aria-label="关闭"
            onClick={handleCloseClsConfirmCancel}
            className="absolute top-5 right-5 flex items-center justify-center size-5 rounded-sm text-[#737373] transition-colors hover:text-[#0A0A0A] focus:outline-none"
          >
            <X className="size-5" />
            <span className="sr-only">关闭</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A0A0A]">确定要关闭 CLS 日志服务吗？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-sm text-[#0A0A0A]">
                  关闭后以下功能将无法使用，<span className="text-[#DC2626]">此操作可能影响业务运行。</span>
                </p>
                <Alert variant="warning">
                  <AlertOperationInfoIcon />
                  <AlertTitle>受影响的功能</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><span className="font-medium">运维观测：</span>支持通过全链路性能监控采集核心运行指标</li>
                      <li><span className="font-medium">会话管理：</span>支持通过会话总览、会话链下钻还原及渠道模型分布分析</li>
                      <li><span className="font-medium">Tokens 监控（按会话）：</span>支持从按会话、消息维度查看 tokens、费用使用情况</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <SurfaceInner
                  className="p-3 cursor-pointer transition-colors hover:bg-[#FAFAFA]"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDeleteLogTopic((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDeleteLogTopic((prev) => !prev);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="deleteLogTopic"
                      checked={deleteLogTopic}
                      onCheckedChange={(checked) => setDeleteLogTopic(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor="deleteLogTopic"
                        className="text-sm font-medium text-[#0A0A0A] cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        同时删除关联的日志主题资源
                      </Label>
                      <p className="text-sm text-[#525252] leading-relaxed">
                        勾选后将永久删除该日志主题及所有日志数据，
                        <span className="text-[#DC2626]">数据不可恢复</span>
                        ；未删除则会持续产生存储费用。
                      </p>
                    </div>
                  </div>
                </SurfaceInner>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseClsConfirmCancel}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseCls}
              disabled={isClosingCls}
            >
              {isClosingCls ? "关闭中..." : "确定关闭"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
