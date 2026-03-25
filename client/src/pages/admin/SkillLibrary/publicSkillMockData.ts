/**
 * 公共技能库 & 技能初始包 Mock 数据
 */

export interface PublicSkill {
  id: string;
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  downloads: number;
  stars: number;
  version: string;
  category: string; // category slug
  tags: string[];
  files: PublicSkillFile[];
  versions: PublicSkillVersion[];
}

export interface PublicSkillFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: PublicSkillFile[];
  content?: string;
}

export interface PublicSkillVersion {
  version: string;
  date: string;
  isLatest: boolean;
}

export interface FavoriteSkill {
  skillId: string;
  tags: string[]; // user-assigned tags
  addedAt: Date;
}

export interface SkillInitialPackage {
  id: string;
  name: string;
  scope: string; // 应用范围，目前固定"全部成员"
  isActive: boolean; // 是否生效
  hasDraft: boolean; // 是否有未发布修改
  skills: PackageSkillItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageSkillItem {
  skillId: string;
  skillName: string;
  skillNameZh?: string;
  source: 'public' | 'enterprise'; // 来源
  version: string;
  addedAt: Date;
}

// ─── 公共技能 Mock 数据 ───────────────────────────────────────────────────────

export const PUBLIC_SKILL_CATEGORIES = [
  { id: 'featured', name: '精选', slug: 'featured' },
  { id: 'favorites', name: '我的收藏', slug: 'favorites' },
  { id: 'dev-tools', name: '开发工具', slug: 'dev-tools' },
  { id: 'data-analysis', name: '数据分析', slug: 'data-analysis' },
  { id: 'general-office', name: '通用办公', slug: 'general-office' },
  { id: 'ops', name: '运维工具', slug: 'ops' },
  { id: 'security', name: '安全合规', slug: 'security' },
];

const SKILL_CONTENT_SELF_IMPROVING = `---
name: self-improving-agent
description: "记录错误、纠正、能力缺口与最佳实践，形成可复用的持续改进闭环。适用于：命令失败、用户纠正、外部 API 失败"
---

# Self-Improving Agent（自我改进）

把"踩坑"变成"资产"。
每次失败、纠正或新发现，都写入结构化记录，后续可检索、可复盘、可沉淀到长期规则。

---

## 1. 什么时候必须记录

出现以下情况时，立即记录：

1. **命令/操作失败**（非 0 退出、超时、异常输出）
2. **用户纠正你**（"不对""应该是…"）
3. **用户提出你当前不具备的能力**
4. **外部服务失败**（API 报错、限流、鉴权失败）
5. **你意识到知识已过时或理解错误**
6. **你发现了可复用的更优流程**

---

## 2. 记录到哪里

在工作区使用 \`.learnings/\` 目录：

- \`.learnings/LEARNINGS.md\`：纠正、认知缺口、最佳实践
- \`.learnings/ERRORS.md\`：失败与异常
- \`.learnings/FEATURE_REQUESTS.md\`：能力请求

若目录不存在，先创建：

\`\`\`bash
mkdir -p .learnings
\`\`\`
`;

const SKILL_CONTENT_GITHUB = `---
name: github
description: "Interact with GitHub using the gh CLI. Use gh issue, gh pr, gh run, and gh api for issues, PRs, CI runs, and advanced queries."
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

## API for Advanced Queries

The \`gh api\` command is useful for accessing data not available through other subcommands.
`;

export const PUBLIC_SKILLS: PublicSkill[] = [
  {
    id: 'pub-1',
    slug: 'self-improving-agent',
    name: 'self-improving-agent',
    nameZh: '自我改进代理',
    description: 'Records errors, corrections, capability gaps and best practices to form a reusable continuous improvement loop.',
    descriptionZh: '记录错误、纠正、能力缺口与最佳实践，形成可复用的持续改进闭环。',
    downloads: 12300,
    stars: 4200,
    version: '1.0.0',
    category: 'dev-tools',
    tags: ['agent', 'learning', 'self-improvement'],
    versions: [
      { version: '1.0.0', date: '2026-03-22 22:56:11', isLatest: true },
    ],
    files: [
      {
        name: 'assets', path: 'assets', type: 'folder',
        children: [
          { name: 'logo.png', path: 'assets/logo.png', type: 'file', content: '（二进制图片文件）' },
        ]
      },
      {
        name: 'hooks', path: 'hooks', type: 'folder',
        children: [
          { name: 'post-run.sh', path: 'hooks/post-run.sh', type: 'file', content: '#!/bin/bash\n# Post-run hook\necho "Run completed"' },
        ]
      },
      {
        name: 'scripts', path: 'scripts', type: 'folder',
        children: [
          { name: 'record.py', path: 'scripts/record.py', type: 'file', content: '# Record learning script\nimport json\n\ndef record_learning(entry):\n    pass' },
        ]
      },
      { name: '_meta.json', path: '_meta.json', type: 'file', content: '{\n  "name": "self-improving-agent",\n  "version": "1.0.0"\n}' },
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: SKILL_CONTENT_SELF_IMPROVING },
    ],
  },
  {
    id: 'pub-2',
    slug: 'github',
    name: 'github',
    nameZh: 'GitHub 工具',
    description: 'Interact with GitHub using the gh CLI for issues, PRs, CI runs, and advanced queries.',
    descriptionZh: '使用 gh CLI 与 GitHub 交互，支持 Issue、PR、CI 运行和高级查询。',
    downloads: 9800,
    stars: 3100,
    version: '2.1.0',
    category: 'dev-tools',
    tags: ['github', 'cli', 'devops'],
    versions: [
      { version: '2.1.0', date: '2026-03-20 10:00:00', isLatest: true },
      { version: '2.0.0', date: '2026-02-15 08:30:00', isLatest: false },
      { version: '1.5.0', date: '2026-01-10 14:20:00', isLatest: false },
    ],
    files: [
      {
        name: 'hha', path: 'hha', type: 'folder',
        children: [
          { name: 'ha.md', path: 'hha/ha.md', type: 'file', content: '## 我好\n### niha\n**默认有：**\n通用办公  研发工具  系统运维   质量测试   需求设计    信息检索    项目管理    数据分析    安全合规' },
        ]
      },
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: SKILL_CONTENT_GITHUB },
    ],
  },
  {
    id: 'pub-3',
    slug: 'web-search-pro',
    name: 'web-search-pro',
    nameZh: '网络搜索增强',
    description: 'Enhanced web search with multi-source aggregation, result ranking, and content extraction.',
    descriptionZh: '增强型网络搜索，支持多源聚合、结果排序和内容提取。',
    downloads: 8500,
    stars: 2900,
    version: '3.2.1',
    category: 'general-office',
    tags: ['search', 'web', 'information-retrieval'],
    versions: [
      { version: '3.2.1', date: '2026-03-18 16:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Web Search Pro\n\n增强型网络搜索技能，支持多源聚合。' },
    ],
  },
  {
    id: 'pub-4',
    slug: 'code-reviewer',
    name: 'code-reviewer',
    nameZh: '代码审查助手',
    description: 'Automated code review with best practices, security checks, and performance suggestions.',
    descriptionZh: '自动化代码审查，包含最佳实践、安全检查和性能建议。',
    downloads: 7600,
    stars: 2700,
    version: '1.4.0',
    category: 'dev-tools',
    tags: ['code-review', 'security', 'quality'],
    versions: [
      { version: '1.4.0', date: '2026-03-15 12:00:00', isLatest: true },
      { version: '1.3.0', date: '2026-02-20 09:00:00', isLatest: false },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Code Reviewer\n\n自动化代码审查技能。' },
    ],
  },
  {
    id: 'pub-5',
    slug: 'data-analyst',
    name: 'data-analyst',
    nameZh: '数据分析专家',
    description: 'Comprehensive data analysis with visualization, statistical insights, and report generation.',
    descriptionZh: '全面的数据分析技能，支持可视化、统计洞察和报告生成。',
    downloads: 6900,
    stars: 2400,
    version: '2.0.0',
    category: 'data-analysis',
    tags: ['data', 'analysis', 'visualization'],
    versions: [
      { version: '2.0.0', date: '2026-03-10 11:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Data Analyst\n\n数据分析专家技能。' },
    ],
  },
  {
    id: 'pub-6',
    slug: 'sql-expert',
    name: 'sql-expert',
    nameZh: 'SQL 专家',
    description: 'Advanced SQL query optimization, schema design, and database performance tuning.',
    descriptionZh: '高级 SQL 查询优化、模式设计和数据库性能调优。',
    downloads: 6200,
    stars: 2200,
    version: '1.8.0',
    category: 'data-analysis',
    tags: ['sql', 'database', 'optimization'],
    versions: [
      { version: '1.8.0', date: '2026-03-08 10:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# SQL Expert\n\nSQL 专家技能，支持查询优化和性能调优。' },
    ],
  },
  {
    id: 'pub-7',
    slug: 'docker-ops',
    name: 'docker-ops',
    nameZh: 'Docker 运维',
    description: 'Docker container management, image optimization, and deployment automation.',
    descriptionZh: 'Docker 容器管理、镜像优化和部署自动化。',
    downloads: 5800,
    stars: 2000,
    version: '1.2.0',
    category: 'ops',
    tags: ['docker', 'container', 'devops'],
    versions: [
      { version: '1.2.0', date: '2026-03-05 09:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Docker Ops\n\nDocker 运维技能。' },
    ],
  },
  {
    id: 'pub-8',
    slug: 'email-writer',
    name: 'email-writer',
    nameZh: '邮件撰写助手',
    description: 'Professional email drafting with tone adjustment, template management, and multilingual support.',
    descriptionZh: '专业邮件撰写，支持语气调整、模板管理和多语言。',
    downloads: 5400,
    stars: 1900,
    version: '2.3.0',
    category: 'general-office',
    tags: ['email', 'writing', 'communication'],
    versions: [
      { version: '2.3.0', date: '2026-03-01 08:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Email Writer\n\n邮件撰写助手技能。' },
    ],
  },
  {
    id: 'pub-9',
    slug: 'k8s-manager',
    name: 'k8s-manager',
    nameZh: 'Kubernetes 管理',
    description: 'Kubernetes cluster management, pod debugging, and resource optimization.',
    descriptionZh: 'Kubernetes 集群管理、Pod 调试和资源优化。',
    downloads: 4900,
    stars: 1700,
    version: '1.6.0',
    category: 'ops',
    tags: ['kubernetes', 'k8s', 'cloud'],
    versions: [
      { version: '1.6.0', date: '2026-02-25 15:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# K8s Manager\n\nKubernetes 管理技能。' },
    ],
  },
  {
    id: 'pub-10',
    slug: 'ppt-generator',
    name: 'ppt-generator',
    nameZh: 'PPT 生成助手',
    description: 'Automated PowerPoint generation from outlines with theme customization and chart integration.',
    descriptionZh: '从大纲自动生成 PPT，支持主题定制和图表集成。',
    downloads: 4500,
    stars: 1600,
    version: '1.1.0',
    category: 'general-office',
    tags: ['ppt', 'presentation', 'automation'],
    versions: [
      { version: '1.1.0', date: '2026-02-20 14:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# PPT Generator\n\nPPT 生成助手技能。' },
    ],
  },
  {
    id: 'pub-11',
    slug: 'security-scanner',
    name: 'security-scanner',
    nameZh: '安全扫描工具',
    description: 'Automated security vulnerability scanning for code, dependencies, and infrastructure.',
    descriptionZh: '自动化安全漏洞扫描，覆盖代码、依赖和基础设施。',
    downloads: 4200,
    stars: 1500,
    version: '2.0.1',
    category: 'security',
    tags: ['security', 'vulnerability', 'scanning'],
    versions: [
      { version: '2.0.1', date: '2026-02-18 11:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# Security Scanner\n\n安全扫描工具技能。' },
    ],
  },
  {
    id: 'pub-12',
    slug: 'api-tester',
    name: 'api-tester',
    nameZh: 'API 测试助手',
    description: 'Comprehensive API testing with request generation, response validation, and load testing.',
    descriptionZh: '全面的 API 测试，支持请求生成、响应验证和负载测试。',
    downloads: 3900,
    stars: 1400,
    version: '1.5.0',
    category: 'dev-tools',
    tags: ['api', 'testing', 'http'],
    versions: [
      { version: '1.5.0', date: '2026-02-15 10:00:00', isLatest: true },
    ],
    files: [
      { name: 'SKILL.md', path: 'SKILL.md', type: 'file', content: '# API Tester\n\nAPI 测试助手技能。' },
    ],
  },
];

// ─── 技能初始包 Mock 数据 ─────────────────────────────────────────────────────

export const INITIAL_SKILL_PACKAGES_DEFAULT: SkillInitialPackage[] = [
  {
    id: 'pkg-1',
    name: '全员通用技能包',
    scope: '全部成员',
    isActive: true,
    hasDraft: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-01'),
    skills: [
      {
        skillId: 'pub-3',
        skillName: 'web-search-pro',
        skillNameZh: '网络搜索增强',
        source: 'public',
        version: '3.2.1',
        addedAt: new Date('2026-01-15'),
      },
      {
        skillId: 'pub-8',
        skillName: 'email-writer',
        skillNameZh: '邮件撰写助手',
        source: 'public',
        version: '2.3.0',
        addedAt: new Date('2026-01-20'),
      },
      {
        skillId: 'pub-10',
        skillName: 'ppt-generator',
        skillNameZh: 'PPT 生成助手',
        source: 'public',
        version: '1.1.0',
        addedAt: new Date('2026-02-01'),
      },
    ],
  },
  {
    id: 'pkg-2',
    name: '高级开发技能包',
    scope: '全部成员',
    isActive: false,
    hasDraft: true,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-03-20'),
    skills: [
      {
        skillId: 'pub-1',
        skillName: 'self-improving-agent',
        skillNameZh: '自我改进代理',
        source: 'public',
        version: '1.0.0',
        addedAt: new Date('2026-02-10'),
      },
      {
        skillId: 'pub-2',
        skillName: 'github',
        skillNameZh: 'GitHub 工具',
        source: 'public',
        version: '2.1.0',
        addedAt: new Date('2026-02-10'),
      },
      {
        skillId: 'pub-4',
        skillName: 'code-reviewer',
        skillNameZh: '代码审查助手',
        source: 'public',
        version: '1.4.0',
        addedAt: new Date('2026-02-15'),
      },
      {
        skillId: 'pub-7',
        skillName: 'docker-ops',
        skillNameZh: 'Docker 运维',
        source: 'public',
        version: '1.2.0',
        addedAt: new Date('2026-03-01'),
      },
    ],
  },
];
