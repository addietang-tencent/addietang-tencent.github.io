# ClawPro 全局组件展示台：设计、构建与发布指南

> 本文用于说明 `ClawPro 全局组件展示台` 的页面定位、构建方式、部署链路，以及后续更新组件后如何同步更新线上展示页。

## 1. 页面定位

`ClawPro 全局组件展示台` 是 ClawPro 设计系统组件的内部展示与评审页面，主要用于：

- 集中展示 ClawPro 已沉淀的全局组件资产；
- 查看组件真实样式、交互状态、使用指引和迁移建议；
- 通过 `查看应用页面` 跳转到真实业务页面，校验组件在实际场景中的效果；
- 给设计、产品、前端同事提供统一的组件参考入口。

当前线上访问地址：

```text
https://clawpro-design-system.pages.woa.com
```

## 2. 源码位置

展示台源码仍然维护在 `clawpro` 主仓库中：

```text
/Users/miekoyychen/CodeBuddy/clawpro
```

核心页面：

```text
client/src/pages/DesignSystemComponents.tsx
```

相关组件主要来自：

```text
client/src/components/ui/
client/src/components/topnav/
client/src/components/AdminLayout.tsx
client/src/pages/admin/
client/src/pages/tenant/
```

注意：不要在展示仓库中直接修改源码。展示仓库只放构建后的静态网页产物。

## 3. 页面设计方式

展示台页面的主要结构如下：

1. **顶部说明区**
   - 展示页面标题：`ClawPro 全局组件展示台`
   - 展示维护人、数据来源和组件统计信息。

2. **组件筛选区**
   - 支持按组件平台筛选：
     - `全部组件`
     - `Global 全局`
     - `Tenant 用户端`
     - `Admin 管控端`
   - 支持关键词搜索。

3. **左侧组件目录**
   - 按组件类别分组，例如：
     - 基础视觉
     - 操作组件
     - 表单组件
     - 反馈组件
     - 数据展示
     - 导航与布局
     - 管控端专属

4. **右侧组件详情区**
   - 组件名称、中文名、说明；
   - 应用范围、组件实例数量；
   - `查看应用页面` 入口；
   - 真实组件预览与全状态展示；
   - 使用指引、注意事项、页面效果校准建议。

5. **真实应用页面跳转**
   - `查看应用页面` 中的页面会跳转到展示包内的示例页面，例如：

```text
/admin/model-config
/admin/members
/admin/platform-policy
/my-openclaw
/model-quota
/skill-square
/openclaw/1
```

## 4. 为什么不直接部署整个 clawpro 项目

`clawpro` 主项目默认入口是产品 Landing 页，不是展示台页面。直接构建整个项目上传时，访问 `/` 会看到主站首页，而不是 `ClawPro 全局组件展示台`。

因此，当前采用 **展示台专用构建入口**：

- 默认入口直接渲染 `DesignSystemComponents`；
- 不改正式 `client/src/App.tsx`；
- 不影响 `clawpro` 主项目协作；
- 只在构建时临时生成入口文件，构建完成后删除。

## 5. 构建方式

### 5.1 临时入口

构建时会临时创建以下文件：

```text
client/covibe-index.html
client/src/__covibe__/main.tsx
vite.covibe.temp.config.ts
```

这些文件只用于发布展示台，构建结束后会删除，不提交到 `clawpro` 主仓库。

### 5.2 为什么临时入口要放在 client 内

项目使用 Tailwind CSS v4。Tailwind 会根据项目源码扫描 class。如果临时入口完全放在仓库外，可能导致 Tailwind 没有扫描到 `client/src` 中的组件样式，页面会出现“内容有了但样式丢失”的问题。

所以临时入口需要放在 `client` / `client/src` 范围内，确保 Tailwind 能正确生成完整 CSS。

### 5.3 构建输出目录

构建产物输出到仓库外目录：

```text
/Users/miekoyychen/CodeBuddy/clawpro-deploy/clawpro-design-system-only
```

构建 ZIP 曾用于 Covibe 预览，但目前正式发布走 OA Pages，因此重点使用该目录中的静态产物。

## 6. History Mode 与路由处理

展示台希望 `查看应用页面` 后 URL 变成路径形式，而不是 query 参数形式，例如：

```text
/admin/model-config
/my-openclaw
/model-quota
```

因此当前发布包采用 **history mode**。

由于 OA Pages / 静态站点直达子路径时需要 fallback，构建后会为常用示例路由补充 `index.html` 副本，例如：

```text
admin/model-config/index.html
admin/members/index.html
admin/platform-policy/index.html
admin/session-management/index.html
admin/tokens-monitor/index.html
my-openclaw/index.html
model-quota/index.html
skill-square/index.html
openclaw/1/index.html
openclaw-guide/index.html
openclaw-guide/1/index.html
```

这样可以提升刷新、前进后退、直接访问子路径时的稳定性。

## 7. 展示仓库与 OA Pages 部署

### 7.1 展示仓库

展示仓库地址：

```text
https://git.woa.com/miekoyychen/clawpro-design-system-showcase.git
```

本地路径：

```text
/Users/miekoyychen/CodeBuddy/clawpro-design-system-showcase
```

这个仓库只存放构建后的静态网页产物，不在这里写业务源码。

### 7.2 分支

OA Pages 使用分支：

```text
oa-pages
```

静态资源位于 `oa-pages` 分支根目录。

### 7.3 域名

仓库根目录中包含 `CNAME` 文件，内容为：

```text
clawpro-design-system.pages.woa.com
```

线上访问地址：

```text
https://clawpro-design-system.pages.woa.com
```

### 7.4 权限

OA Pages 后台需要配置访问权限。当前目标是让公司同事可访问，建议使用：

```text
tof 验证（需经过内网 iOA 登录）
```

如果同事访问时看到：

```json
{"message":"无权限访问，请联系该域名管理员 miekoyychen"}
```

说明 OA Pages 权限或公开路径还未配置好，需要到：

```text
https://pages.woa.com/admin
```

找到站点 `clawpro-design-system.pages.woa.com` 调整权限。

## 8. 后续更新组件后的发布流程

### 8.1 你日常应该在哪里改

继续在 `clawpro` 主仓库里开发：

```text
/Users/miekoyychen/CodeBuddy/clawpro
```

常见修改位置：

```text
client/src/pages/DesignSystemComponents.tsx
client/src/components/ui/
client/src/components/topnav/
client/src/pages/admin/
client/src/pages/tenant/
```

不要直接修改：

```text
/Users/miekoyychen/CodeBuddy/clawpro-design-system-showcase
```

展示仓库只是“发布后的网页成品”。

### 8.2 本地确认

更新组件或展示台后，先在本地确认效果：

```bash
cd /Users/miekoyychen/CodeBuddy/clawpro
pnpm dev
```

打开：

```text
http://localhost:3002/design-system/components
```

如果端口不是 `3002`，以终端实际输出为准。

重点检查：

- 展示台首页是否正常；
- 左侧组件切换是否正常；
- 新增/修改组件预览是否正确；
- `查看应用页面` 是否可跳转；
- 浏览器后退/前进是否符合预期；
- 点击组件是否有运行时报错。

### 8.3 通知 AI 重新构建发布

确认本地没问题后，可以直接对 AI 说：

```text
我已经在 clawpro 里更新并本地确认了 ClawPro 全局组件展示台，请重新构建并发布到 OA Pages。
```

或者简短说：

```text
帮我发布展示台
```

### 8.4 AI 会执行的发布动作

AI 收到发布指令后，会执行：

1. 检查 `clawpro` 当前状态；
2. 临时创建展示台专用入口；
3. 构建静态产物到：

```text
/Users/miekoyychen/CodeBuddy/clawpro-deploy/clawpro-design-system-only
```

4. 为 history mode 示例路由补充 fallback `index.html`；
5. 同步产物到展示仓库：

```text
/Users/miekoyychen/CodeBuddy/clawpro-design-system-showcase
```

6. 确保 `CNAME` 内容为：

```text
clawpro-design-system.pages.woa.com
```

7. 提交并推送 `oa-pages` 分支；
8. 删除临时入口和临时配置；
9. 确认 `clawpro` 主仓库没有残留部署临时文件。

## 9. 两个仓库的关系

可以这样理解：

```text
clawpro 主仓库 = 源码 / Word 原稿
clawpro-design-system-showcase 展示仓库 = 构建产物 / 导出的 PDF
```

日常开发只改 `clawpro`。
需要发布时，把 `clawpro` 构建成静态网页，再同步到 `clawpro-design-system-showcase` 的 `oa-pages` 分支。

## 10. 注意事项

1. 不要在展示仓库里手改源码；
2. 不要把构建产物提交回 `clawpro` 主仓库；
3. 如果新增了 `查看应用页面` 的新路径，需要同步更新构建入口里的路由表和 fallback index 列表；
4. 如果展示台中新增了图标或组件，确保相关依赖已正确 import；
5. 如果线上访问异常，优先检查：
   - OA Pages 日志：`https://pages.woa.com/logs`
   - OA Pages 权限：`https://pages.woa.com/admin`
   - 展示仓库 `oa-pages` 分支是否更新；
   - `CNAME` 是否仍是 `clawpro-design-system.pages.woa.com`。

## 11. 常用信息速查

| 项目 | 内容 |
|---|---|
| 主仓库 | `/Users/miekoyychen/CodeBuddy/clawpro` |
| 展示仓库 | `/Users/miekoyychen/CodeBuddy/clawpro-design-system-showcase` |
| 展示仓库远程 | `https://git.woa.com/miekoyychen/clawpro-design-system-showcase.git` |
| 发布分支 | `oa-pages` |
| 构建产物目录 | `/Users/miekoyychen/CodeBuddy/clawpro-deploy/clawpro-design-system-only` |
| 线上地址 | `https://clawpro-design-system.pages.woa.com` |
| OA Pages 管理 | `https://pages.woa.com/admin` |
| OA Pages 日志 | `https://pages.woa.com/logs` |
