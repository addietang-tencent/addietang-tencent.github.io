/**
 * ResourceManagement - 资源管理页
 * 管控端「Agent 启动配置」分组下，供管理员统一管理和分发 Agent 资源模板
 */

export default function ResourceManagement() {
  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center text-center max-w-[590px]">
        <img src="/assets/admin-agent-template/agent-template.svg" className="shrink-0" />
        <div className="mt-4">
          <div className="text-2xl font-medium text-[#737373] mb-5">Agent 模板</div>
          <p className="text-sm font-normal text-[#737373] leading-relaxed tracking-[0.07px]">
            在此统一管理企业内可复用的 Agent 模板，包括预设的系统提示词、工具配置与模型参数。<br />
            管理员可发布模板供员工一键创建标准化 Agent，降低配置门槛，保障使用规范。
          </p>
        </div>
      </div>
    </div>
  );
}
