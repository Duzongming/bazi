
import React from 'react';
import { Pillar, ShenShaItem } from '../types';
import { getWuxing, getElementColorClass, getNayinColorClass } from '../utils/baziHelper';

interface PillarCardProps {
  title: string;
  pillar: Pillar;
  isMain?: boolean;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, pillar, isMain }) => {
  const isUnknown = pillar.gan === '?' || pillar.zhi === '?';
  
  const ganColor = isUnknown ? 'text-stone-400' : getElementColorClass(getWuxing(pillar.gan));
  const zhiColor = isUnknown ? 'text-stone-400' : getElementColorClass(getWuxing(pillar.zhi));
  const nayinColor = getNayinColorClass(pillar.nayin);

  // Helper for ShenSha Styling
  const getShenShaStyle = (ss: ShenShaItem) => {
      let baseClass = "px-1.5 py-0.5 text-[8px] sm:text-[9px] rounded-full border whitespace-nowrap transition-all ";
      
      // Activation Effect (Glow/Shadow)
      if (ss.isActivated) {
          baseClass += "shadow-[0_0_8px_rgba(0,0,0,0.1)] ring-1 ring-offset-1 ";
      }

      // Special logic for Kongwang
      if (ss.isKongWang) {
          if (ss.isActivated) {
              // Filled Kongwang (Solid)
              baseClass += "bg-stone-600 text-white border-stone-600 "; // Solid
          } else {
              // Empty Kongwang (Ghost)
              baseClass += "bg-stone-50 text-stone-300 border-stone-200 border-dashed ";
          }
          return baseClass;
      }

      // Type Coloring
      if (ss.type === '吉') {
          baseClass += "bg-amber-50 text-amber-700 border-amber-200 ";
          if (ss.isActivated) baseClass += "ring-amber-400 ";
      } else if (ss.type === '凶') {
          baseClass += "bg-rose-50 text-rose-700 border-rose-200 ";
          if (ss.isActivated) baseClass += "ring-rose-400 ";
      } else {
          // Neutral
          baseClass += "bg-slate-50 text-slate-600 border-slate-200 ";
          if (ss.isActivated) baseClass += "ring-slate-400 ";
      }
      
      return baseClass;
  };

  return (
    <div className={`flex flex-col items-center relative min-w-[90px] flex-1 py-4 px-1 ${isMain ? 'bg-[#fdfbf7] shadow-lg ring-1 ring-stone-200 z-10 rounded-lg transform scale-105' : 'bg-white/60 hover:bg-white/80 transition-colors border-r border-stone-100 last:border-0'}`}>
      
      {/* Header */}
      <div className="mb-3 flex flex-col items-center">
        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full ${isMain ? 'bg-stone-800 text-stone-100' : 'text-stone-400 bg-stone-100'}`}>
            {title}
        </span>
        <span className="text-[10px] text-stone-500 font-medium h-4">{pillar.shishen}</span>
      </div>
      
      {/* Core Pillar Characters */}
      <div className="flex flex-col items-center gap-2 mb-4 w-full relative">
        {/* Gan */}
        <div className={`text-4xl font-serif font-bold leading-none ${ganColor} filter drop-shadow-sm`}>
            {isUnknown ? '?' : pillar.gan}
        </div>
        
        {/* Zhi */}
        <div className="relative group flex justify-center">
            <div className={`text-4xl font-serif font-bold leading-none ${zhiColor} filter drop-shadow-sm ${pillar.isKongWang && !pillar.shenshaList.find(s=>s.isKongWang && s.isActivated) ? 'opacity-50 blur-[0.5px]' : ''}`}>
                {isUnknown ? '?' : pillar.zhi}
            </div>
        </div>

        {/* Embedded ShenSha Tags */}
        {!isUnknown && (
             <div className="flex flex-wrap justify-center gap-1 px-1 min-h-[20px] max-w-[100px]">
                 {pillar.shenshaList.map((ss, idx) => (
                     <div key={idx} className={getShenShaStyle(ss)} title={ss.interactionMsg || ss.description || ss.name}>
                         {ss.name}
                         {/* Tiny indicator for interaction if needed, though glow is sufficient */}
                         {ss.isActivated && <span className="ml-0.5 opacity-70 text-[7px]">!</span>}
                     </div>
                 ))}
             </div>
        )}
      </div>

      {/* Hidden Stems (Canggan) */}
      <div className="w-full space-y-1 mb-3 opacity-90">
        {!isUnknown && pillar.canggan.map((char, i) => (
          <div key={i} className="flex items-center justify-between text-[9px] px-2">
            <span className="text-stone-400 scale-90 transform origin-left w-8 text-right">{pillar.cangganTenGods[i]}</span>
            <div className="flex-1 mx-1 border-b border-stone-200 border-dashed h-px opacity-50"></div>
            <span className={`font-bold ${getElementColorClass(getWuxing(char))}`}>{char}</span>
          </div>
        ))}
        {isUnknown && <div className="text-center text-stone-300 text-[10px] py-2">未知</div>}
      </div>

      {/* Footer Stats */}
      <div className="w-full mt-auto space-y-1.5 px-1 pt-2 border-t border-stone-100">
         <div className="flex flex-col items-center mb-1">
            <span className={`text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${nayinColor}`}>
                {isUnknown ? '-' : pillar.nayin}
            </span>
         </div>
         
         <div className="flex justify-between items-center text-[9px] bg-stone-50 rounded px-1.5 py-1">
             <span className="text-stone-400">星运</span>
             <span className="text-stone-700 font-bold">{isUnknown ? '-' : pillar.zhangsheng}</span>
         </div>
      </div>
    </div>
  );
};

export default PillarCard;
