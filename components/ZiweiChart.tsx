import React from 'react';
import { ZiweiResult, ZiweiPalace, ZiweiStar } from '../types';

interface ZiweiChartProps {
  data: ZiweiResult | null;
}

const ZiweiChart: React.FC<ZiweiChartProps> = ({ data }) => {
  if (!data) return <div className="text-center p-8 text-slate-400">暂无紫微排盘数据</div>;

  // Grid Layout: 
  // 5 (Si)  6 (Wu)  7 (Wei) 8 (Shen)
  // 4 (Chen)               9 (You)
  // 3 (Mao)                10 (Xu)
  // 2 (Yin) 1 (Chou) 0 (Zi)  11 (Hai)
  
  const gridMap = [
      5, 6, 7, 8,
      4,       9,
      3,       10,
      2, 1, 0, 11
  ];

  const renderCell = (idx: number | undefined) => {
      if (idx === undefined) {
          // Center Box
          return (
            <div className="col-span-2 row-span-2 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
               <h3 className="text-lg font-bold text-indigo-900 mb-2">紫微斗数</h3>
               <div className="text-sm text-slate-600 space-y-1">
                   <div><span className="font-bold text-slate-400 mr-2">五行局</span> {data.element}</div>
                   <div><span className="font-bold text-slate-400 mr-2">命主</span> {data.mingZhu || '待定'}</div>
                   <div><span className="font-bold text-slate-400 mr-2">身主</span> {data.shenZhu || '待定'}</div>
               </div>
               <div className="mt-4 text-[10px] text-slate-400 max-w-[180px]">
                   * 仅供参考，高级流年/流日尚未完全展开
               </div>
            </div>
          );
      }

      const palace = data.palaces.find(p => p.index === idx);
      if (!palace) return null;

      // Star Rendering Helper
      const renderStar = (s: ZiweiStar, i: number) => (
          <div key={i} className={`flex items-center justify-between text-[10px] sm:text-xs ${
              s.siHua === 'lu' ? 'text-emerald-600 font-bold' : 
              s.siHua === 'quan' ? 'text-blue-600 font-bold' :
              s.siHua === 'ke' ? 'text-indigo-600 font-bold' :
              s.siHua === 'ji' ? 'text-rose-600 font-bold' :
              s.type === 'major' ? 'text-slate-800 font-bold' :
              s.type === 'bad' ? 'text-slate-500' : 'text-slate-600'
          }`}>
              <span>{s.name}</span>
              <div className="flex items-center">
                 {s.brightness && <span className="text-[9px] text-slate-400 scale-90 mr-0.5">{s.brightness}</span>}
                 {s.siHua && (
                     <span className={`w-3 h-3 flex items-center justify-center text-[8px] text-white rounded-sm scale-90 ${
                         s.siHua === 'lu' ? 'bg-emerald-500' : 
                         s.siHua === 'quan' ? 'bg-blue-500' :
                         s.siHua === 'ke' ? 'bg-indigo-500' : 'bg-rose-500'
                     }`}>
                         {s.siHua === 'lu' ? '禄' : s.siHua === 'quan' ? '权' : s.siHua === 'ke' ? '科' : '忌'}
                     </span>
                 )}
              </div>
          </div>
      );

      return (
        <div className="relative bg-white border border-slate-200 min-h-[110px] p-1 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            {/* Header: Name & Heavenly Stem */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-1 mb-1">
                <span className={`text-xs font-bold ${palace.name === '命宫' || palace.name === '身宫' ? 'text-indigo-600 bg-indigo-50 px-1 rounded' : 'text-slate-500'}`}>
                    {palace.name} {palace.isBodyPalace && <span className="text-[8px] ml-0.5 text-rose-400">(身)</span>}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{palace.gan}</span>
            </div>
            
            {/* Stars Area */}
            <div className="flex-1 flex gap-1">
                {/* Major Stars Left */}
                <div className="flex-1 flex flex-col gap-0.5">
                    {palace.majorStars.map(renderStar)}
                </div>
                {/* Minor/Aux Stars Right */}
                <div className="flex-1 flex flex-col gap-0.5 items-end">
                     {palace.auxStars.map(renderStar)}
                </div>
            </div>

            {/* Footer: Decade & Branch */}
            <div className="mt-1 pt-1 border-t border-slate-50 flex justify-between items-end">
                <span className="text-[10px] text-slate-400 bg-slate-50 px-1 rounded">{palace.decades}</span>
                <span className="text-sm font-serif font-bold text-slate-300">{palace.zhi}</span>
            </div>
        </div>
      );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-100 p-1 rounded-lg shadow-inner">
        <div className="grid grid-cols-4 grid-rows-4 gap-1 h-[500px] sm:h-[600px]">
            {/* Row 1 */}
            {renderCell(5)} {renderCell(6)} {renderCell(7)} {renderCell(8)}
            {/* Row 2 */}
            {renderCell(4)} {renderCell(undefined)} {renderCell(9)}
            {/* Row 3 */}
            {renderCell(3)} {renderCell(10)} 
            {/* Row 4 */}
            {renderCell(2)} {renderCell(1)} {renderCell(0)} {renderCell(11)}
        </div>
    </div>
  );
};

export default ZiweiChart;