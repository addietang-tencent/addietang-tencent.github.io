# design-audit / 设计审查档案

本目录是**一次性诊断 / 参考材料**的归档，**不属于业务代码或交付物**。  
保留它是为了在做"组件库重构 / Figma 还原"时有据可查；将来如果不再需要，可以整目录删掉，零副作用。

## 目录结构

```
docs/design-audit/
├── README.md                          ← 本文件
│
├── component-index/                   ← 子主题 A：组件 ↔ 页面交叉索引
│   ├── scan.mjs                       ← 扫描脚本（生成 data.json）
│   ├── build.mjs                      ← 渲染脚本（data.json + template → report.html）
│   ├── template.html                  ← 报告页面模板
│   ├── data.json                      ← 扫描产物（自动生成）
│   └── report.html                    ← 最终报告（双击打开即可）
│
└── figma-730_665/                     ← 子主题 B：Figma 节点 730:665 设计稿快照
    ├── snapshot.html                  ← Figma 导出的 HTML 快照（已修为相对路径）
    └── assets/                        ← 节点引用的 42 个 SVG 图标
        ├── 1.svg
        └── ... (1-42.svg)
```

---

## 子主题 A：component-index（组件交叉索引）

### 用途

扫描 `client/src/pages/**` 下所有 `.tsx` 文件，统计：

1. 每个 shadcn UI 组件被多少个页面引用
2. 每个页面引用了哪些组件
3. 按 **顶级 / 用户端 / 管理端·顶级 / 管理端·子组件** 四档分类汇总

输出一份单文件 HTML 报告，用于和设计搭档对齐组件优先级（P0 / P1 / P2）。

### 怎么用

```bash
# 1. 重新扫描代码库，生成 data.json
node docs/design-audit/component-index/scan.mjs

# 2. 把 data.json 渲染进模板，生成最终报告
node docs/design-audit/component-index/build.mjs

# 3. 双击 report.html 在浏览器中查看
open docs/design-audit/component-index/report.html
```

### 重要约束

- **只读不改业务代码**——脚本只读 `client/src/pages/**` 和 `client/src/components/ui/**`，不会修改任何文件
- **草稿性质**——P0/P1 标注是设计搭档当时的判断，不是稳定接口，仅供参考

---

## 子主题 B：figma-730_665（Figma 设计稿快照）

### 用途

Figma 节点 `730:665`（**管控端 ClawPro Admin** 主页面）的 HTML 快照 + 引用的 SVG 图标，用作 UI 还原参考。

### 怎么用

直接在浏览器中打开 `snapshot.html` 即可查看（路径已使用相对引用，clone 仓库后任何机器都能正常显示）。

```bash
open docs/design-audit/figma-730_665/snapshot.html
```

### 重要约束

- 这是 Figma 导出的**只读静态快照**，不是可维护的源代码
- 如果设计稿更新，请重新从 Figma 导出整个目录覆盖，**不要手动修改** `snapshot.html` 或 SVG

---

## 何时清理本目录？

- ✅ **可以整目录删除**的时机：组件库重构完成、Figma 节点 730:665 不再作为设计基准时
- ❌ **不要**单独删 `component-index/data.json` 或 `figma-730_665/assets/` 子目录——会让对应主题失效
