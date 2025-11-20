import React from 'react';
import { Pillar } from '../types';

interface PillarCardProps {
  title: string;
  pillar: Pillar;
  isMain?: boolean;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, pillar, isMain }) => {
  const getElementColor = (element: string) => {
    switch (element) {
      case '金': return 'text-yellow-600'; // Metal - Gold/Amber
      case '木': return 'text-emerald-700'; // Wood - Deep Green
      case '水': return 'text-sky-800'; // Water - Deep Blue
      case '火': return 'text-rose-700'; // Fire - Red
      case '土': return 'text-stone-600'; // Earth - Stone/Brown
      default: return 'text-stone-400';
    }
  };

  const getZhiElement = (zhi: string): string => {
    if (['子', '亥'].includes(zhi)) return '水';
    if (['寅', '卯'].includes(zhi)) return '木';
    if (['巳', '午'].includes(zhi)) return '火';
    if (['申', '酉'].includes(zhi)) return '金';
    if (['辰', '戌', '丑', '未'].includes(zhi)) return '土';
    return '';
  };

  const isUnknown = pillar.gan === '?' || pillar.zhi === '?';
  const ganColor = getElementColor(pillar.wuxing);
  const zhiColor = getElementColor(getZhiElement(pillar.zhi));
  const isKw = pillar.isKongWang;

  return (
    <div className={`flex flex-col items-center relative min-w-[85px] flex-1 py-5 px-2 ${isMain ? 'bg-[#fdfbf7] shadow-lg ring-1 ring-stone-200 z-10 rounded-lg transform scale-105' : 'bg-white/60 hover:bg-white/80 transition-colors border-r border-stone-100 last:border-0'}`}>
      
      {/* Header */}
      <div className="mb-4 flex flex-col items-center">
        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full ${isMain ? 'bg-stone-800 text-stone-100' : 'text-stone-400 bg-stone-100'}`}>
            {title}
        </span>
        <span className="text-[10px] text-stone-500 font-medium h-4 mt-1">{pillar.shishen}</span>
      </div>
      
      {/* Core Pillar Characters */}
      <div className="flex flex-col items-center gap-3 mb-6 w-full relative">
        {/* Gan */}
        <div className={`text-4xl font-serif font-bold leading-none ${ganColor} filter drop-shadow-sm`}>
            {isUnknown ? '?' : pillar.gan}
        </div>
        
        {/* Zhi */}
        <div className="relative group flex justify-center">
            <div className={`text-4xl font-serif font-bold leading-none ${zhiColor} filter drop-shadow-sm ${isKw ? 'opacity-50 blur-[0.5px]' : ''}`}>
                {isUnknown ? '?' : pillar.zhi}
            </div>
            {isKw && !isUnknown && (
                <div className="absolute -right-3 -top-2 w-5 h-5 flex items-center justify-center rounded-full bg-stone-200 border border-stone-300 shadow-sm z-10" title="空亡">
                    <span className="text-[8px] text-stone-500 font-bold">空</span>
                </div>
            )}
        </div>
      </div>

      {/* Hidden Stems (Canggan) */}
      <div className="w-full space-y-1.5 mb-4 opacity-90">
        {!isUnknown && pillar.canggan.map((char, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] px-2">
            <span className="text-stone-400 scale-90 transform origin-left w-8 text-right">{pillar.cangganTenGods[i]}</span>
            <div className="flex-1 mx-1 border-b border-stone-200 border-dashed h-px opacity-50"></div>
            <span className="text-stone-700 font-bold">{char}</span>
          </div>
        ))}
        {isUnknown && <div className="text-center text-stone-300 text-[10px] py-2">未知</div>}
      </div>

      {/* Footer Stats */}
      <div className="w-full mt-auto space-y-2 px-1 pt-3 border-t border-stone-100">
         <div className="flex flex-col items-center">
            <span className="text-[9px] text-stone-400 scale-90 mb-0.5">纳音</span>
            <span className="text-[10px] text-stone-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {isUnknown ? '-' : pillar.nayin}
            </span>
         </div>
         
         <div className="flex justify-between items-center text-[9px] bg-stone-50 rounded px-1.5 py-1">
             <span className="text-stone-400">星运</span>
             <span className="text-stone-700 font-bold">{isUnknown ? '-' : pillar.zhangsheng}</span>
         </div>
         <div className="flex justify-between items-center text-[9px] bg-stone-50 rounded px-1.5 py-1">
             <span className="text-stone-400">自坐</span>
             <span className="text-stone-700 font-bold">{isUnknown ? '-' : pillar.zizuo}</span>
         </div>
      </div>
    </div>
  );
};

export default PillarCard;