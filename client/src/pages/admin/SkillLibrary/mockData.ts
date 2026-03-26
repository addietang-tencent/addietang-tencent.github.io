import { Skill, Category, OpenClawInstance } from './types';

// 为 GitHub Skill 创建额外的文件内容
const githubSkillFiles: Record<string, string> = {
  'SKILL.md': `---
name: github
description: "Interact with GitHub using the \`gh\` CLI. Use \`gh issue\`, \`gh pr\`, \`gh run\`, and \`gh api\` for issues, PRs, CI runs, and advanced queries."
---

# GitHub Skill

Use the \`gh\` CLI to interact with GitHub. Always specify \`--repo owner/repo\` when not in a git directory, or use URLs directly.

## Pull Requests

Check CI status on a PR:
\`\`\`bash
gh pr checks 55 --repo owner/repo
\`\`\`

List recent workflow runs:
\`\`\`bash
gh run list --repo owner/repo --limit 10
\`\`\`

View a run and see which steps failed:
\`\`\`bash
gh run view <run-id> --repo owner/repo
\`\`\`

View logs for failed steps only:
\`\`\`bash
gh run view <run-id> --repo owner/repo --log-failed
\`\`\`

## API for Advanced Queries

The \`gh api\` command is useful for accessing data not available through other subcommands.`,
  'hha/ha.md': `## 我好
### niha
**默认有：**
通用办公  研发工具  系统运维   质量测试   需求设计    信息检索    项目管理    数据分析    安全合规
支持新增和删除。

|**序号**|**分类名称**|**描述（核心定位、覆盖范围）**|
|:-:|:-:|:-:|
|**1**|**通用办公**|文档总结、邮件润色、PPT 大纲、翻译助手|
|**2**|**研发工具**|代码 Review、接口调试、技术文档解析、架构建议|`,
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '通用办公', description: '文档总结、邮件润色、PPT 大纲、翻译助手' },
  { id: '2', name: '研发工具', description: '代码 Review、接口调试、技术文档解析、架构建议' },
  { id: '3', name: '系统运维', description: '资源巡检、环境部署、日志分析、告警诊断' },
  { id: '4', name: '质量测试', description: '用例生成、自动化脚本编写、Bug 辅助定位' },
  { id: '5', name: '需求设计', description: '需求评审、PRD 辅助写作、UI/UX 设计灵感' },
  { id: '6', name: '信息检索', description: '企业知识库查询、竞品实时监控、技术趋势搜索' },
  { id: '7', name: '项目管理', description: '进度汇总、周报自动生成、风险预警、任务拆解' },
  { id: '8', name: '数据分析', description: 'SQL 自动编写、报表解释、数据清洗逻辑' },
  { id: '9', name: '安全合规', description: '权限审计、代码漏洞扫描、合规性自查' },
  { id: '10', name: '其他', description: '其他分类' },
];

export const MOCK_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    slug: 'doc-summarizer',
    name: '文档总结助手',
    description: '快速总结长文档，提取关键信息。支持多种文档格式，自动提取核心要点，生成简明扩订。适用于会议记录、研究报告、技术文档等场景。',
    version: '1.0.0',
    categories: ['1', '6'],
    uploadTime: new Date('2025-03-20'),
    content: '# 文档总结助手\n\n这是一个用于快速总结长文档的 Skill...',
    versions: ['1.0.0', '0.9.0'],
    files: [
      { name: 'SKILL.md', size: 1024 },
      { name: 'README.md', size: 512 },
      { name: 'docs/guide.md', size: 768 },
    ],
  },
  {
    id: 'skill-2',
    slug: 'code-reviewer',
    name: '代码审查工具',
    description: '自动审查代码质量和安全问题。支持 Python、JavaScript、Java 等主流语言，检测代码规范、安全漏洞、性能问题。提供详细的修改建议和最佳实践。',
    version: '2.1.0',
    categories: ['2'],
    uploadTime: new Date('2025-03-18'),
    content: '# 代码审查工具\n\n这是一个用于代码审查的 Skill...',
    versions: ['2.1.0', '2.0.0', '1.0.0'],
    files: [
      { name: 'SKILL.md', size: 1024 },
      { name: 'README.md', size: 512 },
      { name: 'config/rules.md', size: 768 },
    ],
  },
  {
    id: 'skill-3',
    slug: 'log-analyzer',
    name: '日志分析器',
    description: '分析系统日志，快速定位问题。支持应用日志、系统日志、数据库日志等多种日志类型。自动提取错误信息、分析异常模式、帮助定位根本原因。',
    version: '1.5.2',
    categories: ['3'],
    uploadTime: new Date('2025-03-15'),
    content: '# 日志分析器\n\n这是一个用于日志分析的 Skill...',
    versions: ['1.5.2', '1.5.0', '1.0.0'],
    files: [
      { name: 'SKILL.md', size: 1024 },
      { name: 'README.md', size: 512 },
      { name: 'examples/usage.md', size: 768 },
    ],
  },
  {
    id: 'skill-4',
    slug: 'github',
    name: 'GitHub',
    description: 'Interact with GitHub using the `gh` CLI. Use `gh issue`, `gh pr`, `gh run`, and `gh api` for issues, PRs, CI runs, and advanced queries.',
    version: '1.0.0',
    categories: ['2'],
    uploadTime: new Date('2025-03-20'),
    content: `---
name: github
description: "Interact with GitHub using the \`gh\` CLI. Use \`gh issue\`, \`gh pr\`, \`gh run\`, and \`gh api\` for issues, PRs, CI runs, and advanced queries."
---

# GitHub Skill

Use the \`gh\` CLI to interact with GitHub. Always specify \`--repo owner/repo\` when not in a git directory, or use URLs directly.

## Pull Requests

Check CI status on a PR:
\`\`\`bash
gh pr checks 55 --repo owner/repo
\`\`\`

List recent workflow runs:
\`\`\`bash
gh run list --repo owner/repo --limit 10
\`\`\`

View a run and see which steps failed:
\`\`\`bash
gh run view <run-id> --repo owner/repo
\`\`\`

View logs for failed steps only:
\`\`\`bash
gh run view <run-id> --repo owner/repo --log-failed
\`\`\`

## API for Advanced Queries

The \`gh api\` command is useful for accessing data not available through other subcommands.`,
    versions: ['1.0.0', '0.9.0', '0.8.0'],
    files: [
      { name: 'SKILL.md', size: 1024 },
      { name: 'hha/ha.md', size: 512 },
    ],
  },
];

export const MOCK_OPENCLAW_INSTANCES: OpenClawInstance[] = [
  { id: 'oc-1', name: 'OpenClaw-生产环境', createdBy: 'admin' },
  { id: 'oc-2', name: 'OpenClaw-测试环境', createdBy: 'dev-team' },
  { id: 'oc-3', name: 'OpenClaw-开发环境', createdBy: 'developer' },
  { id: 'oc-4', name: 'OpenClaw-备用实例', createdBy: 'ops' },
  { id: 'oc-5', name: 'OpenClaw-灾备中心', createdBy: 'admin' },
];
