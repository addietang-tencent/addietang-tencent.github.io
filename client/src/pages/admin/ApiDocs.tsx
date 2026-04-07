// API 文档页面 — 管控端子页面，标题 + 描述，内容区域为空白
// 设计规范：与其他管控端子页面保持一致的 page-enter max-w-5xl 布局

export default function ApiDocs() {
  return (
    <div className="page-enter max-w-5xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API 文档</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          查阅平台开放 API 的接口说明、鉴权方式与调用示例，帮助开发者快速集成 OpenClaw 能力。
        </p>
      </div>
    </div>
  );
}
