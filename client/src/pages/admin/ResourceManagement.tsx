/**
 * ResourceManagement - 资源管理页
 * 管控端「Agent 启动配置」分组下，供管理员统一管理和分发 Agent 资源模板
 */

export default function ResourceManagement() {
  return (
    <div className="page-enter flex h-full min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="flex max-w-[590px] flex-col items-center text-center">
        <img
          src="/assets/admin-resource-management/empty-resource-management.png"
          alt=""
          aria-hidden="true"
          className="h-20 w-[100px] shrink-0 object-contain"
        />
        <div className="w-full">
          <div className="mb-[10px] text-2xl font-medium leading-[1.4] text-[#737373]">Agent 模板</div>
          <p className="text-sm font-normal leading-[1.5] tracking-[0.07px] text-[#737373]">
            在此统一管理企业内可复用的 Agent 模板，包括预设的系统提示词、工具配置与模型参数。<br />
            管理员可发布模板供员工一键创建标准化 Agent，降低配置门槛，保障使用规范。
          </p>
        </div>
      </div>
    </div>
  );
}
