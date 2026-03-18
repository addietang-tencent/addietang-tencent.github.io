# OpenClaw Enterprise 管控端核心页面 PRD

## 目录
1. [Tokens 监控](#tokens-监控)
2. [运维观测](#运维观测)
3. [会话管理](#会话管理)

---

## Tokens 监控

### 页面概述
**Tokens 监控** 是管控端的核心数据分析页面，用于实时监控企业全局和用户级别的 Token 消耗情况，帮助管理员了解资源使用状况、成本分布和趋势。

### 核心功能

#### 1. 全局配额监控卡片
**位置**：页面顶部，五个关键指标卡

| 指标 | 说明 | 数据来源 |
|------|------|--------|
| 总请求数 | 选定时间范围内的总请求数 | `GET /api/tokens/summary` |
| 输入 Tokens | 选定时间范围内的输入 Token 总数 | `GET /api/tokens/summary` |
| 输出 Tokens | 选定时间范围内的输出 Token 总数 | `GET /api/tokens/summary` |
| 总 Tokens | 输入 + 输出 Token 总数 | 计算字段 |
| 今日全局配额消耗 | 当日 Token 消耗占全局上限的百分比 | `GET /api/tokens/global-quota` |

**接口规范**：
- **GET /api/tokens/summary**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`{ totalRequests, inputTokens, outputTokens }`
  - 功能说明：[待补充]

- **GET /api/tokens/global-quota**
  - 参数：`date`
  - 返回：`{ consumed, limit, percentage, isUnlimited }`
  - 功能说明：[待补充]

#### 2. CLS 日志服务管理
**位置**：全局配额消耗卡片右侧

**功能**：
- 显示 CLS 日志服务的当前状态（开启/关闭）
- 支持开启 CLS 日志服务
- 支持关闭 CLS 日志服务（需要确认）

**状态显示**：
- 开启时：显示绿色对勾 + "CLS 日志服务已开启" + 功能说明
- 关闭时：显示"开启 CLS 日志服务"按钮

**接口规范**：
- **POST /api/cls/enable**
  - 参数：无
  - 返回：`{ success, message }`
  - 功能说明：[待补充]

- **POST /api/cls/disable**
  - 参数：无
  - 返回：`{ success, message }`
  - 功能说明：[待补充]

- **GET /api/cls/status**
  - 参数：无
  - 返回：`{ enabled, features: [] }`
  - 功能说明：[待补充]

#### 3. Token 消耗趋势图
**位置**：顶部指标卡下方

**功能**：
- 展示最近 7 天或选定时间范围内的 Token 消耗趋势
- 支持两条线：输入 Token 和输出 Token
- 支持日期范围选择

**接口规范**：
- **GET /api/tokens/trend**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ date, inputTokens, outputTokens }, ...]`
  - 功能说明：[待补充]

#### 4. 按用户分类统计
**位置**：趋势图下方，标签页 "按用户"

**功能**：
- 展示每个用户的 Token 消耗情况
- 支持按总请求数、输入 Token、输出 Token 排序
- 支持分页显示（每页 10 条）

**表格列**：
| 列名 | 说明 | 数据来源 |
|------|------|--------|
| 用户 ID | 用户邮箱或 ID | `GET /api/tokens/by-user` |
| 总请求数 | 该用户的请求总数 | 计算字段 |
| 输入 Tokens | 该用户的输入 Token 总数 | 计算字段 |
| 输出 Tokens | 该用户的输出 Token 总数 | 计算字段 |
| 总 Tokens | 输入 + 输出 | 计算字段 |

**接口规范**：
- **GET /api/tokens/by-user**
  - 参数：`dateFrom`, `dateTo`, `page`, `pageSize`
  - 返回：`{ data: [{ userId, requests, inputTokens, outputTokens }], total }`
  - 功能说明：[待补充]

#### 5. 按模型分类统计
**位置**：标签页 "按模型"

**功能**：
- 展示每个模型的 Token 消耗情况
- 支持按总请求数、输入 Token、输出 Token 排序
- 支持分页显示

**表格列**：同按用户分类

**接口规范**：
- **GET /api/tokens/by-model**
  - 参数：`dateFrom`, `dateTo`, `page`, `pageSize`
  - 返回：`{ data: [{ modelName, requests, inputTokens, outputTokens }], total }`
  - 功能说明：[待补充]

#### 6. 按会话分类统计
**位置**：标签页 "按会话"

**功能**：
- 展示每个会话的 Token 消耗情况
- 支持按总请求数、输入 Token、输出 Token 排序
- 支持分页显示

**接口规范**：
- **GET /api/tokens/by-session**
  - 参数：`dateFrom`, `dateTo`, `page`, `pageSize`
  - 返回：`{ data: [{ sessionId, requests, inputTokens, outputTokens }], total }`
  - 功能说明：[待补充]

### 交互流程

1. **初始加载**：
   - 加载今天的数据
   - 显示全局配额消耗
   - 显示最近 7 天的趋势图

2. **日期范围选择**：
   - 用户选择日期范围
   - 刷新所有数据和图表

3. **开启/关闭 CLS 日志服务**：
   - 用户点击"开启 CLS 日志服务"按钮
   - 调用 `POST /api/cls/enable` 接口
   - 显示加载状态
   - 成功后显示成功提示（Toast）
   - 更新 CLS 状态显示

4. **关闭 CLS 日志服务**：
   - 用户点击"关闭 CLS 日志服务"按钮
   - 显示确认对话框
   - 用户确认后调用 `POST /api/cls/disable` 接口
   - 显示加载状态
   - 成功后显示成功提示

### 数据刷新
- 支持手动刷新按钮
- 刷新时显示加载状态
- 刷新完成后显示成功提示

---

## 运维观测

### 页面概述
**运维观测** 是管控端的系统监控页面，用于实时监控系统的日志、消息处理、队列状态等运维指标，帮助运维人员快速定位和解决系统问题。

### 核心功能

#### 1. 日志级别分布
**位置**：页面左上方

**功能**：
- 展示不同日志级别（ERROR、WARNING、INFO、DEBUG）的日志数量
- 支持柱状图展示

**接口规范**：
- **GET /api/logs/level-distribution**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ level, count }, ...]`
  - 功能说明：[待补充]

#### 2. 日志模块分布
**位置**：页面右上方

**功能**：
- 展示不同模块的日志数量
- 支持水平柱状图展示
- 显示模块名称和日志数量

**接口规范**：
- **GET /api/logs/module-distribution**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ moduleName, count }, ...]`
  - 功能说明：[待补充]

#### 3. 消息处理统计
**位置**：页面中间

**功能**：
- 展示消息处理数量和队列中的消息数量
- 支持折线图展示
- 显示处理速度和队列深度

**接口规范**：
- **GET /api/messages/processing-stats**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ time, processed, queued }, ...]`
  - 功能说明：[待补充]

#### 4. 队列状态监控
**位置**：页面下方

**功能**：
- 展示队列的平均深度和平均等待时间
- 支持折线图展示
- 实时监控队列健康状态

**接口规范**：
- **GET /api/queue/status**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ time, depthAvg, waitMsAvg }, ...]`
  - 功能说明：[待补充]

#### 5. 日志搜索和筛选
**位置**：页面底部

**功能**：
- 支持按日志级别筛选
- 支持按模块筛选
- 支持按关键词搜索
- 支持日期范围筛选

**接口规范**：
- **GET /api/logs/search**
  - 参数：`level`, `module`, `keyword`, `dateFrom`, `dateTo`, `page`, `pageSize`
  - 返回：`{ data: [{ timestamp, level, module, message }], total }`
  - 功能说明：[待补充]

### 交互流程

1. **初始加载**：
   - 加载最近 24 小时的日志统计数据
   - 显示各个图表

2. **日期范围选择**：
   - 用户选择日期范围
   - 刷新所有数据和图表

3. **日志搜索**：
   - 用户输入搜索条件
   - 调用搜索接口
   - 显示搜索结果

4. **数据刷新**：
   - 支持手动刷新按钮
   - 刷新时显示加载状态

---

## 会话管理

### 页面概述
**会话管理** 是管控端的会话监控页面，用于查看和管理企业内所有的对话会话，包括会话统计、渠道分布、模型分布等信息。

### 核心功能

#### 1. 会话统计卡片
**位置**：页面顶部，四个关键指标卡

| 指标 | 说明 | 数据来源 |
|------|------|--------|
| 总会话数 | 企业内的会话总数 | `GET /api/sessions/stats` |
| 平均轮次 | 每个会话的平均轮次 | `GET /api/sessions/stats` |
| 工具调用 | 所有会话中的工具调用总数 | `GET /api/sessions/stats` |
| 活跃渠道 | 当前活跃的渠道数量 | `GET /api/sessions/stats` |

**接口规范**：
- **GET /api/sessions/stats**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`{ totalSessions, avgRounds, toolCalls, activeChannels: [] }`
  - 功能说明：[待补充]

#### 2. 按渠道分布
**位置**：页面左下方

**功能**：
- 展示不同渠道（Feishu、QQ、Webchat 等）的会话分布
- 支持柱状图展示

**接口规范**：
- **GET /api/sessions/by-channel**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ channelName, count }, ...]`
  - 功能说明：[待补充]

#### 3. 按模型分布
**位置**：页面右下方

**功能**：
- 展示不同模型的会话分布
- 支持饼图展示

**接口规范**：
- **GET /api/sessions/by-model**
  - 参数：`dateFrom`, `dateTo`
  - 返回：`[{ modelName, count }, ...]`
  - 功能说明：[待补充]

#### 4. 会话列表
**位置**：页面中间

**功能**：
- 展示所有会话的详细信息
- 支持按会话名称、渠道、模型、状态筛选
- 支持按 Token 消耗、创建时间排序
- 支持分页显示（每页 10 条）
- 支持点击进入会话详情页

**表格列**：
| 列名 | 说明 | 数据来源 |
|------|------|--------|
| 会话名称 | 会话的显示名称 | `GET /api/sessions/list` |
| 渠道 | 会话所属的渠道 | `GET /api/sessions/list` |
| 模型 | 会话使用的模型 | `GET /api/sessions/list` |
| Tokens | 会话消耗的 Token 数量 | `GET /api/sessions/list` |
| 成本 | 会话的成本（美元） | 计算字段 |
| 最后消息 | 会话的最后一条消息摘要 | `GET /api/sessions/list` |
| 更新时间 | 会话的最后更新时间 | `GET /api/sessions/list` |
| 状态 | 会话的当前状态（活跃/已关闭） | `GET /api/sessions/list` |

**接口规范**：
- **GET /api/sessions/list**
  - 参数：`channel`, `model`, `status`, `sortBy`, `sortOrder`, `page`, `pageSize`
  - 返回：`{ data: [{ id, name, channel, model, tokens, cost, lastMessage, updatedAt, status }], total }`
  - 功能说明：[待补充]

#### 5. 会话详情页
**位置**：点击会话列表中的会话后跳转

**功能**：
- 展示会话的详细信息
- 展示会话的对话历史
- 支持返回会话列表

**接口规范**：
- **GET /api/sessions/{sessionId}**
  - 参数：`sessionId`
  - 返回：`{ id, name, channel, model, tokens, cost, createdAt, updatedAt, status, messages: [] }`
  - 功能说明：[待补充]

- **GET /api/sessions/{sessionId}/messages**
  - 参数：`sessionId`, `page`, `pageSize`
  - 返回：`{ data: [{ timestamp, role, content }], total }`
  - 功能说明：[待补充]

### 交互流程

1. **初始加载**：
   - 加载会话统计数据
   - 加载会话列表（第一页）
   - 加载渠道和模型分布数据

2. **筛选和排序**：
   - 用户选择筛选条件（渠道、模型、状态）
   - 用户选择排序方式
   - 刷新会话列表

3. **分页**：
   - 用户点击分页按钮
   - 加载对应页的数据

4. **查看会话详情**：
   - 用户点击会话列表中的会话
   - 跳转到会话详情页
   - 加载会话的详细信息和对话历史

5. **返回列表**：
   - 用户点击返回按钮
   - 返回会话列表页

---

## 通用接口规范

### 错误处理
所有接口返回格式：
```json
{
  "success": true/false,
  "data": {},
  "error": "错误信息（仅在失败时返回）"
}
```

### 分页
- `page`：页码（从 1 开始）
- `pageSize`：每页条数（默认 10）
- 返回：`{ data: [], total, page, pageSize }`

### 日期格式
- 所有日期参数使用 `YYYY-MM-DD` 格式
- 所有返回的时间戳使用 ISO 8601 格式

### 认证
- 所有接口需要在请求头中包含 `Authorization: Bearer <token>`

---

## 后续补充清单

- [ ] 所有接口的详细功能说明
- [ ] 所有接口的错误处理规范
- [ ] 所有接口的速率限制
- [ ] 所有接口的缓存策略
- [ ] 实时数据更新的推送机制（WebSocket/Server-Sent Events）
- [ ] 数据导出功能（CSV/Excel）
- [ ] 告警和通知机制
- [ ] 权限控制规范
