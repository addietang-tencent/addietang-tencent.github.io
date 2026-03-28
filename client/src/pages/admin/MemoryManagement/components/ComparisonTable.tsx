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
      feature: 'Embedding 能力（语义理解能力）',
      free: '无',
      pro: '✓ 内置专业 Embedding能力（语义匹配）',
    },
  ];

  return (
    <div>
      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-[12px] overflow-hidden border border-[#E8EAF0]">
          <thead>
            <tr>
              <th className="px-[18px] py-[14px] text-left text-[13.5px] font-semibold bg-[#f3f4f6] text-[#374151] w-[34%]">
                对比项
              </th>
              <th className="px-[18px] py-[14px] text-center text-[13.5px] font-semibold bg-[#d1fae5] text-[#065f46]">
                Free 版
              </th>
              <th className="px-[18px] py-[14px] text-center text-[13.5px] font-semibold bg-[#ede9fe] text-[#5b21b6]">
                Pro 版
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="border-t border-[#E8EAF0] hover:bg-[#fafbfc] transition-colors">
                <td className="px-[18px] py-[14px] text-left text-[13px] font-medium text-[#374151] bg-white">
                  {row.feature}
                </td>
                <td className="px-[18px] py-[14px] text-center text-[13px] text-[#374151] bg-white">
                  {row.free}
                </td>
                <td className="px-[18px] py-[14px] text-center text-[13px] font-medium text-[#5b21b6] bg-white">
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
