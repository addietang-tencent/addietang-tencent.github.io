import React from 'react';

/**
 * Free 版 vs Pro 版对比表格
 * 
 * 展示两个版本的功能差异
 */
export const ComparisonTable: React.FC = () => {
  const comparisonData = [
    {
      feature: '存储方式',
      free: '本地单机数据库',
      pro: '腾讯云向量数据库（VDB）',
    },
    {
      feature: '检索方式',
      free: '关键词匹配',
      pro: '语义 + 关键字双路检索',
    },
    {
      feature: '数据安全',
      free: '无备份',
      pro: '✓ 备份 / 回档 / 权限',
    },
    {
      feature: '规模化支持',
      free: '建议 < 1万条',
      pro: '✓ 无限制',
    },
    {
      feature: 'Embedding 能力',
      free: '无',
      pro: '✓ 内置专业 Embedding',
    },
  ];

  return (
    <div>
      {/* 表格标题 */}
      <h3 className="text-[15px] font-semibold text-[#5c5c7a] mb-3.5 text-center">
        Free 版 vs Pro 版
      </h3>

      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-[12px] overflow-hidden border border-[#E8EAF0]">
          <thead>
            <tr>
              <th className="px-[18px] py-[14px] text-left text-[13.5px] font-semibold bg-[#F9FAFB] text-[#6B7280] w-[34%]">
                对比项
              </th>
              <th className="px-[18px] py-[14px] text-center text-[13.5px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                🧠 Free 版
              </th>
              <th className="px-[18px] py-[14px] text-center text-[13.5px] font-semibold bg-[#FAF5FF] text-[#7C3AED]">
                ⚡ Pro 版
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="border-t border-[#F0F0F5]">
                <td className="px-[18px] py-[12px] text-left text-[13px] font-medium text-[#374151] bg-[#FAFBFE]">
                  {row.feature}
                </td>
                <td className="px-[18px] py-[12px] text-center text-[13px] text-[#5c5c7a] bg-white">
                  {row.free}
                </td>
                <td className="px-[18px] py-[12px] text-center text-[13px] font-semibold text-[#7C3AED] bg-white">
                  {row.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
