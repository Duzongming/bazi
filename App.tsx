
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, Clock, Sparkles, Copy, Check, Compass, Sun, User, ExternalLink, Bot, Zap, Activity, GitMerge, Eye, Thermometer, Wind, Search, RotateCcw, BookOpen, ChevronRight, Layers, Feather, Moon, Settings, Plus, Trash2, Save, X, Edit3, Undo, GitCommit, Globe, Home, Shield, Anchor } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Gender, BaziResult, LuckPillar, LiuNian, LiuYue, ReverseResult, Pillar } from './types';
import { calculateAllPillars, calculateInteractions, findDatesFromPillars, HEAVENLY_STEMS, EARTHLY_BRANCHES } from './utils/baziHelper';
import { PRESET_THEORIES, ANALYSIS_MODES, TheoryModule } from './utils/mangpaiKnowledge';
import PillarCard from './components/PillarCard';

const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [isUnknownTime, setIsUnknownTime] = useState<boolean>(false);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [isLunar, setIsLunar] = useState<boolean>(false);
  
  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Interaction State
  const [selectedLuckId, setSelectedLuckId] = useState<string>('luck-0'); 
  const [selectedYear, setSelectedYear] = useState<LiuNian | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<LiuYue | null>(null);

  // Reverse Lookup State
  const [showReverse, setShowReverse] = useState(false);
  const [revInputs, setRevInputs] = useState({
      yg: '甲', yz: '子',
      mg: '丙', mz: '寅',
      dg: '戊', dz: '辰',
      hg: '庚', hz: '申'
  });
  const [revRange, setRevRange] = useState({ start: 1920, end: 2040 });
  const [revResults, setRevResults] = useState<ReverseResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // AI Analysis State
  const [customNotes, setCustomNotes] = useState<string>('');
  
  // Theory Management State
  const [theories, setTheories] = useState<TheoryModule[]>(PRESET_THEORIES);
  const [activeTheories, setActiveTheories] = useState<Set<string>>(new Set(['relations_formulas', 'relations_descendants_formulas'])); 
  const [isManagingTheories, setIsManagingTheories] = useState(false);
  const [editingTheory, setEditingTheory] = useState<Partial<TheoryModule> | null>(null);

  const [analysisMode, setAnalysisMode] = useState<string>('comprehensive');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [showNotesInput, setShowNotesInput] = useState(false); 
  const resultEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const result = calculateAllPillars(birthDate, birthTime, gender, isLunar, isUnknownTime);
    setBazi(result);
    if (result.smallLuck) setSelectedLuckId('small');
    else setSelectedLuckId('luck-0');
    setSelectedYear(null);
    setSelectedMonth(null);
    setAiAnalysisResult(''); 
    
    if (isUnknownTime) {
        if (analysisMode !== 'three_pillars' && analysisMode !== 'deduce_time') {
             setAnalysisMode('deduce_time');
        }
    } else {
        if (analysisMode === 'deduce_time' || analysisMode === 'three_pillars') {
            setAnalysisMode('comprehensive');
        }
    }

  }, [birthDate, birthTime, gender, isLunar, isUnknownTime]);

  useEffect(() => {
    if (!bazi) return;
    let currentLuck: LuckPillar | undefined;
    
    if (selectedLuckId === 'small') {
        currentLuck = bazi.smallLuck || undefined;
    } else {
        const idx = parseInt(selectedLuckId.split('-')[1]);
        currentLuck = bazi.luckPillars[idx];
    }

    if (currentLuck && currentLuck.liuNian.length > 0) {
        setSelectedYear(currentLuck.liuNian[0]);
        setSelectedMonth(null); 
    }
  }, [selectedLuckId, bazi]);

  useEffect(() => {
      if (analysisMode === 'tcm_health') {
          setActiveTheories(prev => {
              const next = new Set(prev);
              next.add('health_lifespan_formulas');
              return next;
          });
      } else if (analysisMode === 'personality') {
          setActiveTheories(prev => {
              const next = new Set(prev);
              next.add('personality_formulas');
              return next;
          });
      }
  }, [analysisMode]);

  useEffect(() => {
      if (isAiAnalyzing && resultEndRef.current) {
          resultEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  }, [aiAnalysisResult, isAiAnalyzing]);

  const getActiveLuckPillar = () => {
      if (!bazi) return null;
      if (selectedLuckId === 'small') return bazi.smallLuck;
      const idx = parseInt(selectedLuckId.split('-')[1]);
      return bazi.luckPillars[idx];
  };

  const activeLuck = getActiveLuckPillar();

  const dynamicInteractions = useMemo(() => {
      if (!bazi || !activeLuck) return [];
      
      const pillars = [
          { name: '年', gan: bazi.year.gan, zhi: bazi.year.zhi },
          { name: '月', gan: bazi.month.gan, zhi: bazi.month.zhi },
          { name: '日', gan: bazi.day.gan, zhi: bazi.day.zhi },
          { name: '时', gan: bazi.hour.gan, zhi: bazi.hour.zhi },
          { name: '大运', gan: activeLuck.gan, zhi: activeLuck.zhi }
      ];
      
      if (selectedYear) {
          pillars.push({ name: '流年', gan: selectedYear.gan, zhi: selectedYear.zhi });
      }
      
      if (selectedMonth) {
          pillars.push({ name: '流月', gan: selectedMonth.gan, zhi: selectedMonth.zhi });
      }

      const allInteractions = calculateInteractions(pillars);
      return allInteractions.filter(i => 
          i.pillars.includes('大运') || i.pillars.includes('流年') || i.pillars.includes('流月')
      );

  }, [bazi, activeLuck, selectedYear, selectedMonth]);

  const toggleTheory = (id: string) => {
      const newSet = new Set(activeTheories);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setActiveTheories(newSet);
  };

  const handleSaveTheory = () => {
      if (!editingTheory?.title || !editingTheory?.content) return;
      
      if (editingTheory.id) {
          setTheories(prev => prev.map(t => t.id === editingTheory.id ? { ...t, ...editingTheory } as TheoryModule : t));
      } else {
          const newId = `custom_${Date.now()}`;
          const newTheory = { 
              id: newId, 
              title: editingTheory.title, 
              content: editingTheory.content,
              description: editingTheory.description || '自定义理论'
          } as TheoryModule;
          
          setTheories(prev => [...prev, newTheory]);
          setActiveTheories(prevSet => {
            const next = new Set(prevSet);
            next.add(newId);
            return next;
          });
      }
      setEditingTheory(null);
  };

  const handleDeleteTheory = (id: string) => {
      setTheories(prev => prev.filter(t => t.id !== id));
      setActiveTheories(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
      });
  };

  const renderDeepPillar = (pillar: Pillar, title: string, index: number) => {
      const mp = pillar.mangpai;
      if (!mp) return null;
      
      const isSolid = mp.strength === '实';
      
      // Positions for grid: Year, Month, Day, Hour
      const positions = ['年', '月', '日', '时'];
      
      // Parse roots to indices
      const rootIndices: number[] = mp.roots.map(r => {
          if(r.includes('年')) return 0;
          if(r.includes('月')) return 1;
          if(r.includes('日')) return 2;
          if(r.includes('时')) return 3;
          return -1;
      });

      // Parse HuTong to indices
      const huTongIndices: number[] = mp.huTong.map(h => {
          if(h.includes('年')) return 0;
          if(h.includes('月')) return 1;
          if(h.includes('日')) return 2;
          if(h.includes('时')) return 3;
          return -1;
      });

      return (
          <div className={`flex-1 flex flex-col items-center p-2 sm:p-4 border-r border-white/5 last:border-0 relative group ${mp.scope === '主' ? 'hover:bg-amber-500/5' : 'hover:bg-white/5'} transition-colors`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">{title}</span>
                  {mp.scope === '主' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>}
              </div>
              
              {/* Stem */}
              <div className={`text-2xl sm:text-4xl font-serif font-bold mb-2 transition-all ${isSolid ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-stone-600'}`}>
                  {pillar.gan}
              </div>
              
              {/* Roots & Connections Grid Visualization */}
              <div className="w-full px-1 sm:px-2 mb-2">
                  <div className="flex justify-between items-center gap-1 bg-black/20 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                      {positions.map((p, idx) => {
                          const isRoot = rootIndices.includes(idx);
                          const isHuTong = huTongIndices.includes(idx);
                          const isSelf = idx === index;
                          
                          // Color logic
                          let colorClass = 'bg-stone-800/50 border-stone-800 text-stone-700'; // Default inactive
                          
                          if (isRoot) {
                              if (idx === 0) colorClass = 'bg-stone-300 border-stone-200 text-stone-900 shadow-[0_0_5px_rgba(255,255,255,0.2)]';
                              if (idx === 1) colorClass = 'bg-slate-300 border-slate-200 text-slate-900 shadow-[0_0_5px_rgba(203,213,225,0.2)]';
                              if (idx === 2) colorClass = 'bg-amber-400 border-amber-300 text-amber-900 shadow-[0_0_5px_rgba(251,191,36,0.4)]';
                              if (idx === 3) colorClass = 'bg-orange-400 border-orange-300 text-orange-900 shadow-[0_0_5px_rgba(251,146,60,0.4)]';
                          } else if (isHuTong) {
                               colorClass = 'bg-purple-500/30 border-purple-500/50 text-purple-300 shadow-[0_0_5px_rgba(168,85,247,0.2)]';
                          } else if (isSelf) {
                              colorClass = 'border-white/10 text-stone-600 bg-transparent'; // Self placeholder
                          }

                          return (
                              <div key={idx} className={`relative w-4 h-6 sm:w-6 sm:h-8 rounded-[2px] border flex flex-col items-center justify-center transition-all ${colorClass}`} title={p + (isRoot ? '(根)' : '') + (isHuTong ? '(互通)' : '')}>
                                  <span className="text-[8px] scale-75 font-bold leading-none">{p}</span>
                                  {/* Dot indicator */}
                                  {(isRoot || isHuTong) && (
                                     <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isHuTong && !isRoot ? 'bg-purple-400' : 'bg-current'}`}></div>
                                  )}
                              </div>
                          )
                      })}
                  </div>
                  {/* Helper Text */}
                  <div className="h-4 mt-1 flex items-center justify-center gap-2">
                       {isSolid ? (
                           <span className="text-[9px] text-emerald-500/80 font-medium flex items-center"><Anchor className="w-2 h-2 mr-1"/>有根</span>
                       ) : (
                           <span className="text-[9px] text-stone-600">虚浮</span>
                       )}
                       {mp.huTong.length > 0 && (
                           <span className="text-[9px] text-purple-400/80 font-medium flex items-center"><GitMerge className="w-2 h-2 mr-1"/>互通</span>
                       )}
                  </div>
              </div>

              {/* Connector Line */}
              <div className={`h-8 w-px my-1 ${isSolid ? 'bg-gradient-to-b from-emerald-500/50 to-transparent' : 'bg-stone-800 border-l border-dashed border-stone-700 opacity-30'}`}></div>
              
              {/* Branch */}
              <div className="text-2xl sm:text-4xl font-serif font-bold text-stone-300 relative">
                  {pillar.zhi}
                   {/* Special Gods */}
                   {mp.specialGods.length > 0 && (
                      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 translate-x-full">
                          {mp.specialGods.map((g, i) => (
                              <span key={i} className="text-[8px] px-1 py-0.5 rounded-l-none rounded-r-sm bg-rose-900/60 text-rose-200 border border-rose-800/50 whitespace-nowrap shadow-sm">{g}</span>
                          ))}
                      </div>
                   )}
              </div>
          </div>
      );
  };

  useEffect(() => {
     if(!bazi) return;
     
     const interactionsText = bazi.interactions.length > 0 
        ? bazi.interactions.map(i => `- [${i.pillars.join('-')}] ${i.label}: ${i.description}`).join('\n  ')
        : '无明显冲合刑害';

     const dynInteractionsText = dynamicInteractions.length > 0
        ? dynamicInteractions.map(i => `- [${i.pillars.join('+')}] ${i.label}: ${i.description}`).join('\n  ')
        : '暂无显著运岁引动';

     let dynamicSection = '';
     if (activeLuck) {
         dynamicSection += `\n- **当前大运**：${activeLuck.gan}${activeLuck.zhi} (${activeLuck.startYear}-${activeLuck.endYear}) | 十神: ${activeLuck.shishen}/${activeLuck.zhiShishen} | 纳音: ${activeLuck.nayin}`;
     }
     if (selectedYear) {
         dynamicSection += `\n- **当前选定流年**：${selectedYear.year} ${selectedYear.gan}${selectedYear.zhi} | 十神: ${selectedYear.shishen}/${selectedYear.zhiShishen} | 神煞: ${selectedYear.shensha.join(' ')}`;
     }
     if (selectedMonth) {
         dynamicSection += `\n- **当前选定流月**：${selectedMonth.jieQi.name} (${selectedMonth.month}月) | ${selectedMonth.gan}${selectedMonth.zhi} | 十神: ${selectedMonth.shishen}/${selectedMonth.zhiShishen}`;
     }
     
     const mpInfo = (p: any, name: string) => {
        if (!p.mangpai) return '';
        if (p.gan === '?' || p.zhi === '?') return `| ${name} | 待定 | - | - | - |`;

        const specials = p.mangpai.specialGods.length > 0 ? `(${p.mangpai.specialGods.join('/')})` : '';
        return `| ${name} | ${p.mangpai.scope} | ${p.mangpai.strength} | ${p.mangpai.roots.join(',') || '无'} | ${p.mangpai.huTong.join(',') || '无'} ${specials}|`;
     };

     const prompt = `
# 八字排盘数据 (Bazi Chart Data)

## 1. 基础信息 (Basic)
- **性别**：${gender}
- **公历**：${bazi.solarDate}
- **农历**：${bazi.lunarDateString}
- **起运**：${bazi.qiyunDetail}
- **五行流通**：${bazi.wuXingFlow}
- **调候建议**：${bazi.tiaoHou.status} (${bazi.tiaoHou.advice})
- **五运六气**：${bazi.wuyunLiuqi.daYun}。${bazi.wuyunLiuqi.siTian}司天，${bazi.wuyunLiuqi.zaiQuan}在泉。
${isUnknownTime ? '**注意**：时辰不详（Unknown Time），请基于三柱推断或进行反推。' : ''}

## 2. 原局结构 (Four Pillars)
| 柱 | 天干 | 地支 | 纳音 | 十神 | 藏干 | 神煞 |
|---|---|---|---|---|---|---|
| **年柱** | ${bazi.year.gan} | ${bazi.year.zhi} | ${bazi.year.nayin} | ${bazi.year.shishen} | ${bazi.year.canggan.join('')} | ${bazi.year.shensha.join(' ') || '无'} |
| **月柱** | ${bazi.month.gan} | ${bazi.month.zhi} | ${bazi.month.nayin} | ${bazi.month.shishen} | ${bazi.month.canggan.join('')} | ${bazi.month.shensha.join(' ') || '无'} |
| **日柱** | ${bazi.day.gan} | ${bazi.day.zhi} | ${bazi.day.nayin} | **日元** | ${bazi.day.canggan.join('')} | ${bazi.day.shensha.join(' ') || '无'} |
| **时柱** | ${bazi.hour.gan} | ${bazi.hour.zhi} | ${bazi.hour.nayin} | ${bazi.hour.shishen} | ${bazi.hour.canggan.join('')} | ${bazi.hour.shensha.join(' ') || '无'} |

## 3. 深度技术指标 (Advanced Specs)
- **空亡**：${bazi.kongwangInfo}
| 位置 | 宾主(Bin/Zhu) | 虚实(Xu/Shi) | 根(Roots) | 互通(HuTong) |
|---|---|---|---|---|
${mpInfo(bazi.year, '年柱')}
${mpInfo(bazi.month, '月柱')}
${mpInfo(bazi.day, '日柱')}
${mpInfo(bazi.hour, '时柱')}

## 4. 时空动态 (Time Dimension)
${dynamicSection}

## 5. 能量交互 (Interactions)
**原局内部：**
${interactionsText}

**运岁引动 (含大运/流年/流月)：**
${dynInteractionsText}
`;
     setGeneratedPrompt(prompt);
  }, [bazi, gender, dynamicInteractions, activeLuck, selectedYear, selectedMonth, isUnknownTime]);

  const handleReverseSearch = () => {
      setIsSearching(true);
      setTimeout(() => {
          const res = findDatesFromPillars(
              revInputs.yg + revInputs.yz,
              revInputs.mg + revInputs.mz,
              revInputs.dg + revInputs.dz,
              revInputs.hg + revInputs.hz,
              revRange.start,
              revRange.end
          );
          setRevResults(res);
          setIsSearching(false);
      }, 50);
  };

  const buildFullPrompt = () => {
    if (!generatedPrompt) return '';

    let knowledgePrompt = "\n\n====== 🧠 RAG 知识库与理论模型 (Knowledge Context) ======\n";
    
    const selectedTheoryContents = theories
        .filter(t => activeTheories.has(t.id))
        .map(t => `#### 📖 理论参考：${t.title}\n${t.content}`)
        .join("\n\n---\n\n");
        
    if (selectedTheoryContents) {
        knowledgePrompt += `${selectedTheoryContents}\n`;
    } else {
        knowledgePrompt += "（本次分析未启用特定理论模型，请基于通用命理逻辑分析）\n";
    }

    if (customNotes) {
        knowledgePrompt += `\n====== 📝 用户补充断语/笔记 (User Input) ======\n请重点参考以下信息，并对其进行命理学的事实核查（Fact Check）：\n${customNotes}\n`;
    }

    const modeConfig = ANALYSIS_MODES.find(m => m.id === analysisMode);
    const taskInstruction = modeConfig ? modeConfig.prompt : '请进行综合分析';

    knowledgePrompt += `\n====== ⚡ 核心指令与分析任务 (Core Instruction) ======\n
### 1. 角色设定 (Role)
你是一位**精通传统子平术与盲派命理的资深大师**，同时具备现代心理咨询师的沟通技巧。你的分析应当：
- **专业**：熟练运用十神、纳音、神煞、十二长生及刑冲合害等专业技法。
- **客观**：不危言耸听，不阿谀奉承，实事求是地分析命局的优势与风险。
- **现代**：将古籍口诀转化为现代职场、情感、生活场景的通俗解读。

### 2. 任务模式：【${modeConfig?.label || '通用模式'}】
${taskInstruction}

### 3. 通用分析原则
1. **全局观**：先看日元旺衰与格局成败，再看细节引动。
2. **理论应用**：若上文中提供了【理论参考】，请优先尝试用该理论进行套用分析，并指出命主是否符合该理论的某种配置（如“顶配/高配/低配”）。
3. **流年动态**：分析必须结合当前的【大运】与【流年】（${selectedYear ? selectedYear.year : '当前流年'}），指出具体的吉凶应期。
4. **格式要求**：使用 Markdown 排版，逻辑清晰，重点加粗。

请开始你的推演：`;

    return generatedPrompt + "\n" + knowledgePrompt;
  };

  const handleJump = (url: string, name: string) => {
    const fullText = buildFullPrompt();
    if (!fullText) return;

    navigator.clipboard.writeText(fullText);
    setCopyFeedback(name);
    setTimeout(() => {
        setCopyFeedback(null);
        window.open(url, '_blank');
    }, 800);
  };

  const handleCopyOnly = () => {
    const fullText = buildFullPrompt();
    if (!fullText) return;

    navigator.clipboard.writeText(fullText);
    setCopyFeedback('full-text');
    setTimeout(() => {
        setCopyFeedback(null);
    }, 1500);
  }

  const runAiAnalysis = async () => {
    const finalPrompt = buildFullPrompt();
    if (!finalPrompt) return;

    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            const success = await (window as any).aistudio.openSelectKey();
            if (!success) return;
        }
    }

    setIsAiAnalyzing(true);
    setAiAnalysisResult('');
    setShowNotesInput(false);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: finalPrompt,
        });

        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                setAiAnalysisResult(prev => prev + text);
            }
        }
    } catch (error) {
        console.error("AI Analysis Error:", error);
        setAiAnalysisResult("分析过程中出现错误，请检查网络或API Key设置。");
    } finally {
        setIsAiAnalyzing(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-stone-700 mt-6 mb-3 border-b border-stone-200 pb-1 flex items-center font-serif"><Sparkles className="w-4 h-4 mr-2 text-amber-600"/>{line.replace('### ', '')}</h3>;
        if (line.startsWith('#### ')) return <h4 key={i} className="text-base font-bold text-stone-800 mt-4 mb-2">{line.replace('#### ', '')}</h4>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-stone-800 mt-8 mb-4 border-l-4 border-stone-800 pl-3 bg-stone-100/50 py-1 rounded-r font-serif">{line.replace('## ', '')}</h2>;
        
        if (line.includes('🎯') || line.includes('📝') || line.includes('💡') || line.includes('⚠️')) return <div key={i} className="text-base font-bold text-stone-800 mt-3 mb-2 bg-stone-50 p-3 rounded-lg border border-stone-200 flex items-start gap-2">{line}</div>;
        
        if (line.trim().startsWith('- **')) {
             const content = line.replace('- **', '').replace('**', '');
             const parts = content.split('：');
             return <li key={i} className="ml-4 text-sm text-stone-600 mb-2 list-none relative pl-4 before:content-['•'] before:absolute before:text-stone-400 before:font-bold"><strong className="text-stone-900">{parts[0]}：</strong>{parts.slice(1).join('：')}</li>;
        }
        if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 text-sm text-stone-600 mb-1 list-disc marker:text-stone-400">{line.replace('- ', '')}</li>;
        if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ')) return <div key={i} className="ml-2 text-sm text-stone-600 mb-2 font-medium">{line}</div>;

        return <p key={i} className="text-sm text-stone-700 mb-2 leading-relaxed" dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-900 font-bold">$1</strong>')
        }}></p>;
    });
  };

  return (
    <div className="min-h-screen py-4 px-4 md:py-8 md:px-6 font-sans text-stone-800 selection:bg-stone-200">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header & Brand */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-300/50">
            <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 flex items-center font-serif tracking-tight">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-stone-900 rounded-xl flex items-center justify-center mr-4 text-stone-50 shadow-lg ring-4 ring-stone-100 shrink-0">
                        <span className="font-calligraphy text-3xl md:text-4xl">易</span>
                    </div>
                    <span className="font-calligraphy tracking-widest ml-1 text-2xl md:text-4xl">八字AI提示词生成器</span>
                </h1>
                <p className="text-stone-500 text-sm mt-2 ml-1 font-serif italic">AI-Powered Chinese Metaphysics Workspace</p>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setShowReverse(!showReverse)}
                    className={`text-xs flex items-center px-4 py-2.5 rounded-full transition-all border font-bold shadow-sm ${showReverse ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'}`}
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    {showReverse ? '返回排盘' : '反推时辰'}
                </button>
            </div>
        </div>

        {/* Main Input Area */}
        {!showReverse ? (
             <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end relative z-10">
                    {/* Gender Switch */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-stone-400 mb-3 uppercase tracking-widest">命主性别</label>
                        <div className="flex bg-stone-100 p-1.5 rounded-xl shadow-inner">
                            <button onClick={() => setGender(Gender.MALE)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${gender === Gender.MALE ? 'bg-white shadow-sm text-stone-800 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${gender === Gender.MALE ? 'bg-sky-500' : 'bg-transparent'}`}></div>
                                乾造 (男)
                            </button>
                            <button onClick={() => setGender(Gender.FEMALE)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${gender === Gender.FEMALE ? 'bg-white shadow-sm text-stone-800 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${gender === Gender.FEMALE ? 'bg-rose-500' : 'bg-transparent'}`}></div>
                                坤造 (女)
                            </button>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                             <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">出生日期</label>
                                <div className="flex bg-stone-100 rounded-lg p-0.5 text-[10px]">
                                    <button onClick={() => setIsLunar(false)} className={`px-3 py-1 rounded-md transition-all ${!isLunar ? 'bg-white shadow-sm text-stone-800 font-bold' : 'text-stone-400'}`}>公历</button>
                                    <button onClick={() => setIsLunar(true)} className={`px-3 py-1 rounded-md transition-all ${isLunar ? 'bg-white shadow-sm text-stone-800 font-bold' : 'text-stone-400'}`}>农历</button>
                                </div>
                            </div>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-800 transition-colors pointer-events-none" />
                                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="block w-full pl-12 pr-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 font-serif text-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all hover:bg-white" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-stone-400 mb-3 uppercase tracking-widest">出生时辰</label>
                                <div className="relative group">
                                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${isUnknownTime ? 'text-stone-200' : 'text-stone-400 group-focus-within:text-stone-800'}`} />
                                    <input 
                                        type="time" 
                                        value={birthTime} 
                                        onChange={(e) => setBirthTime(e.target.value)} 
                                        disabled={isUnknownTime}
                                        className={`block w-full pl-12 pr-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 font-serif text-lg focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all hover:bg-white ${isUnknownTime ? 'opacity-40 cursor-not-allowed bg-stone-100' : ''}`} 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={() => setIsUnknownTime(!isUnknownTime)}
                                    className={`h-[54px] px-5 rounded-xl border transition-all flex flex-col items-center justify-center min-w-[70px] ${isUnknownTime ? 'bg-stone-800 border-stone-800 text-white shadow-md' : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600'}`}
                                >
                                    <span className="text-xs font-bold whitespace-nowrap">未知</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        ) : (
            <div className="bg-stone-100 rounded-2xl p-8 border border-stone-200 animate-in fade-in slide-in-from-top-4 shadow-inner">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-stone-700 flex items-center">
                            <Search className="w-5 h-5 mr-3" />
                            四柱反推查询
                        </h3>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm mt-4 md:mt-0">
                            <span className="text-xs font-bold text-stone-400">年份范围</span>
                            <input type="number" value={revRange.start} onChange={(e) => setRevRange({...revRange, start: parseInt(e.target.value)})} className="w-16 text-center text-sm border-b border-stone-300 focus:border-stone-900 bg-transparent focus:outline-none" />
                            <span className="text-xs text-stone-300">-</span>
                            <input type="number" value={revRange.end} onChange={(e) => setRevRange({...revRange, end: parseInt(e.target.value)})} className="w-16 text-center text-sm border-b border-stone-300 focus:border-stone-900 bg-transparent focus:outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            {l:'年柱', g:'yg', z:'yz'}, 
                            {l:'月柱', g:'mg', z:'mz'}, 
                            {l:'日柱', g:'dg', z:'dz'}, 
                            {l:'时柱', g:'hg', z:'hz'}
                        ].map((p, i) => (
                            <div key={i} className="flex flex-col p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                                <span className="text-xs font-bold text-stone-400 mb-3 text-center tracking-widest">{p.l}</span>
                                <div className="flex gap-2">
                                    <select value={revInputs[p.g as keyof typeof revInputs]} onChange={e => setRevInputs({...revInputs, [p.g]: e.target.value})} className="flex-1 p-2 rounded border border-stone-200 text-xl font-serif font-bold text-center bg-stone-50 hover:bg-stone-100 cursor-pointer appearance-none">
                                        {HEAVENLY_STEMS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select value={revInputs[p.z as keyof typeof revInputs]} onChange={e => setRevInputs({...revInputs, [p.z]: e.target.value})} className="flex-1 p-2 rounded border border-stone-200 text-xl font-serif font-bold text-center bg-stone-50 hover:bg-stone-100 cursor-pointer appearance-none">
                                        {EARTHLY_BRANCHES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-center">
                         <button 
                            onClick={handleReverseSearch}
                            disabled={isSearching}
                            className="w-full md:w-2/3 py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
                        >
                            {isSearching ? <Zap className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                            {isSearching ? '正在遍历百年日历...' : '开始反推匹配日期'}
                        </button>
                    </div>
                    
                    {revResults.length > 0 && (
                        <div className="mt-8">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 text-center">找到 {revResults.length} 个匹配结果</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-hide">
                                {revResults.map((r, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => {
                                            setBirthDate(`${r.year}-${String(r.month).padStart(2,'0')}-${String(r.day).padStart(2,'0')}`);
                                            const hStr = r.hourStr.split(' ')[0];
                                            const startTime = hStr.split('-')[0]; 
                                            const [h] = startTime.split(':').map(Number);
                                            const dateObj = new Date(); dateObj.setHours(h, 30);
                                            const safeTime = `${String(dateObj.getHours()).padStart(2,'0')}:30`;
                                            setBirthTime(safeTime);
                                            setIsUnknownTime(false);
                                            setShowReverse(false);
                                        }}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all group text-left"
                                    >
                                        <div>
                                            <div className="font-serif font-bold text-lg text-stone-800">
                                                {r.year}年 {r.month}月 {r.day}日
                                            </div>
                                            <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                                                <span className="bg-stone-100 px-2 py-0.5 rounded-full">{r.hourStr}</span>
                                                <span className="text-amber-600">{r.solarTerm}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        )}

        {bazi && !showReverse && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
            
            {/* Chart Section */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative card-shadow">
                 {/* Toolbar */}
                 <div className="absolute top-6 right-6 z-20 flex gap-2">
                     <button onClick={handleCopyOnly} className="p-2 bg-white hover:bg-stone-50 rounded-lg border border-stone-100 text-stone-400 hover:text-stone-600 transition-colors shadow-sm" title="复制Prompt">
                         {copyFeedback === 'full-text' ? <Check className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
                     </button>
                 </div>

                <div className="bg-gradient-to-b from-white/80 to-stone-50/50 border-b border-stone-100 px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">公历</span>
                            <span className="font-serif font-bold text-stone-800 text-xl">{bazi.solarDate}</span>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-stone-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">农历</span>
                            <span className="font-serif font-medium text-stone-600 text-lg">{bazi.lunarDateString}</span>
                        </div>
                    </div>
                    <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                        <Compass className="w-4 h-4 mr-3 text-stone-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">起运时间</span>
                            <span className="text-sm font-bold text-stone-700">{bazi.qiyunDetail}</span>
                        </div>
                    </div>
                </div>
                
                {/* The 4 Pillars + 3 Yuan */}
                <div className="p-6 md:p-10 overflow-x-auto">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-center md:items-stretch">
                         {/* Four Pillars */}
                         <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 bg-white rounded-2xl shadow-sm border border-stone-100">
                             <PillarCard title="年柱" pillar={bazi.year} />
                             <PillarCard title="月柱" pillar={bazi.month} />
                             <PillarCard title="日柱" pillar={bazi.day} isMain />
                             <PillarCard title="时柱" pillar={bazi.hour} />
                         </div>
                         
                         {/* Spacer */}
                         <div className="hidden md:flex flex-col items-center justify-center gap-2 opacity-30">
                             <div className="w-px h-12 bg-stone-400 border-l border-dashed"></div>
                             <span className="text-[10px] writing-vertical text-stone-500 tracking-widest">三元</span>
                             <div className="w-px h-12 bg-stone-400 border-l border-dashed"></div>
                         </div>

                         {/* Three Yuan */}
                         <div className="flex gap-2 sm:gap-3 p-3 bg-stone-50/50 rounded-2xl border border-stone-100/50 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                             <PillarCard title="胎元" pillar={bazi.taiyuan} />
                             <PillarCard title="命宫" pillar={bazi.minggong} />
                             <PillarCard title="身宫" pillar={bazi.shengong} />
                         </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Status Cards */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                            <Thermometer className="w-4 h-4 mr-2"/> 气候与调候
                        </h4>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-stone-600">当前状态</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bazi.tiaoHou.status === '寒' ? 'bg-sky-100 text-sky-700' : bazi.tiaoHou.status === '燥' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{bazi.tiaoHou.status}</span>
                        </div>
                        <p className="text-sm text-stone-500 leading-relaxed">{bazi.tiaoHou.advice}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                         <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                            <Wind className="w-4 h-4 mr-2"/> 五行流通
                        </h4>
                        <p className="text-sm text-stone-600 leading-relaxed">{bazi.wuXingFlow}</p>
                    </div>

                     <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                         <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                            <Moon className="w-4 h-4 mr-2"/> 五运六气
                        </h4>
                        <div className="space-y-3">
                             <div className="flex justify-between text-sm border-b border-stone-50 pb-2">
                                 <span className="text-stone-400">大运</span>
                                 <span className="font-bold text-stone-700">{bazi.wuyunLiuqi.daYun.split(' ')[0]}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-stone-400">司天 / 在泉</span>
                                 <span className="font-medium text-stone-700">{bazi.wuyunLiuqi.siTian} / {bazi.wuyunLiuqi.zaiQuan}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Deep Perspective (Dark Theme) - Optimized */}
                <div className="bg-[#1c1917] rounded-2xl shadow-2xl text-stone-300 flex flex-col lg:col-span-2 relative overflow-hidden">
                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 border-b border-white/5 flex items-center justify-between relative z-10">
                        <h3 className="text-base font-bold text-amber-500 flex items-center tracking-widest uppercase">
                            <Eye className="w-5 h-5 mr-2" />
                            命理深度透视 (盲派视角)
                        </h3>
                        {/* Legend */}
                        <div className="flex gap-3 text-[9px] font-medium text-stone-500">
                            <div className="flex items-center"><div className="w-2 h-2 rounded-[1px] bg-stone-300 mr-1.5"></div>根(Root)</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-[1px] bg-purple-500/40 border border-purple-500/60 mr-1.5"></div>互通(Connect)</div>
                        </div>
                    </div>

                    {/* Main Visualization */}
                    <div className="p-6 md:p-8 relative z-10">
                        <div className="flex flex-col md:flex-row rounded-xl overflow-hidden border border-white/10 bg-stone-900/50">
                           {/* Guest Section */}
                           <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10 relative">
                               <div className="absolute top-2 left-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">宾 (Guest)</div>
                               <div className="flex flex-1 pt-8">
                                   {renderDeepPillar(bazi.year, '年柱', 0)}
                                   {renderDeepPillar(bazi.month, '月柱', 1)}
                               </div>
                           </div>
                           {/* Host Section */}
                           <div className="flex-1 flex flex-col relative bg-white/[0.02]">
                               <div className="absolute top-2 left-3 text-[10px] font-bold text-amber-600/70 uppercase tracking-wider">主 (Host)</div>
                               <div className="flex flex-1 pt-8">
                                   {renderDeepPillar(bazi.day, '日柱', 2)}
                                   {renderDeepPillar(bazi.hour, '时柱', 3)}
                               </div>
                           </div>
                        </div>
                    </div>
                    
                    {/* Footer Interactions */}
                    <div className="mt-auto p-6 md:p-8 pt-4 border-t border-white/5 relative z-10 bg-[#181615]">
                        <div className="flex items-center justify-between mb-3">
                             <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
                                 <GitMerge className="w-3 h-3 mr-2"/> 五行作用
                             </h4>
                             <span className="text-[10px] text-stone-600 bg-stone-800 px-2 py-0.5 rounded">原局内部</span>
                        </div>
                         {bazi.interactions.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {bazi.interactions.map((interaction, idx) => (
                                    <div key={idx} className={`pl-2 pr-3 py-1.5 rounded text-xs border-l-2 flex items-center justify-between bg-white/5 ${
                                        interaction.severity === 'good' ? 'border-emerald-500/50' : 
                                        interaction.severity === 'bad' ? 'border-rose-500/50' : 
                                        'border-stone-500/50'
                                    }`}>
                                        <span className={`font-bold ${
                                            interaction.severity === 'good' ? 'text-emerald-400' : 
                                            interaction.severity === 'bad' ? 'text-rose-400' : 
                                            'text-stone-400'
                                        }`}>{interaction.label}</span>
                                        <span className="opacity-30 text-[10px] font-mono tracking-tighter">{interaction.pillars.join('')}</span>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <div className="text-center py-2 text-stone-600 text-xs italic bg-white/5 rounded">
                                 局内气势流通，无明显刑冲
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* Luck Pillars Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-700 flex items-center tracking-widest uppercase">
                        <Layers className="w-4 h-4 mr-2 text-stone-400"/>
                        大运征程
                    </h3>
                    <span className="text-[10px] text-stone-400 bg-white px-2 py-1 rounded border border-stone-100">每十年一运</span>
                </div>
                
                <div className="p-6 md:p-8 overflow-x-auto scrollbar-hide">
                    <div className="flex relative min-w-max space-x-2 px-2 pb-4 pt-2">
                        {/* Connector Line */}
                        <div className="absolute top-[42px] left-0 right-0 h-px bg-stone-200 z-0"></div>

                        {bazi.smallLuck && (
                            <button 
                                onClick={() => setSelectedLuckId('small')}
                                className={`relative z-10 flex flex-col items-center min-w-[60px] group transition-all duration-300 ${selectedLuckId === 'small' ? 'scale-105 -translate-y-1' : 'opacity-60 hover:opacity-100 hover:-translate-y-0.5'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full border-2 mb-4 bg-white transition-colors ${selectedLuckId === 'small' ? 'border-stone-800 scale-125' : 'border-stone-300'}`}></div>
                                <span className="text-[10px] text-stone-400 mb-2 font-medium">童限</span>
                                <div className={`w-14 h-20 rounded-xl border flex flex-col items-center justify-center shadow-sm transition-all ${selectedLuckId === 'small' ? 'bg-stone-800 border-stone-800 text-white shadow-lg' : 'bg-white border-stone-200 text-stone-800'}`}>
                                     <span className="font-serif font-bold text-lg">小运</span>
                                </div>
                            </button>
                        )}

                        {bazi.luckPillars.map((lp, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedLuckId(`luck-${idx}`)}
                                className={`relative z-10 flex flex-col items-center min-w-[64px] transition-all duration-300 ${selectedLuckId === `luck-${idx}` ? 'scale-105 -translate-y-1' : 'opacity-60 hover:opacity-100 hover:-translate-y-0.5'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full border-2 mb-4 bg-white transition-colors ${selectedLuckId === `luck-${idx}` ? 'border-stone-800 scale-125' : 'border-stone-300'}`}></div>
                                <span className="text-[10px] text-stone-400 mb-2 font-mono">{lp.startAge}岁</span>
                                <div className={`w-14 h-20 rounded-xl border flex flex-col items-center justify-center shadow-sm transition-all ${selectedLuckId === `luck-${idx}` ? 'bg-stone-800 border-stone-800 text-white shadow-xl' : 'bg-white border-stone-200 text-stone-800'}`}>
                                     <span className="text-[9px] mb-0.5 opacity-60 scale-90">{lp.shishen}</span>
                                     <span className="font-serif font-bold text-xl leading-none mb-1">{lp.gan}{lp.zhi}</span>
                                     <span className="text-[9px] opacity-60 scale-90">{lp.zhiShishen}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expanded Luck Details */}
                {activeLuck && (
                    <div className="border-t border-stone-100 bg-stone-50/30 p-6 md:p-8 animate-in fade-in slide-in-from-top-2">
                         <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-4">
                                <span className="text-2xl font-serif font-bold text-stone-800">{activeLuck.gan}{activeLuck.zhi}</span>
                                <div className="h-8 w-px bg-stone-200"></div>
                                <span className="text-sm text-stone-500">{activeLuck.startYear} - {activeLuck.endYear}</span>
                             </div>
                             {dynamicInteractions.length > 0 && (
                                 <span className="hidden sm:flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                     <GitMerge className="w-3.5 h-3.5 mr-1.5"/> 运岁引动: {dynamicInteractions.length}处
                                 </span>
                             )}
                         </div>
                         
                         <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                            {activeLuck.liuNian.map((ln) => (
                                <button
                                    key={ln.year}
                                    onClick={() => setSelectedYear(ln)}
                                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                        selectedYear?.year === ln.year 
                                        ? 'bg-white border-stone-800 ring-1 ring-stone-800 shadow-md z-10 transform -translate-y-1' 
                                        : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-sm'
                                    }`}
                                >
                                    <span className="text-[9px] text-stone-400 mb-1">{ln.year}</span>
                                    <span className="font-serif font-bold text-stone-800 text-lg mb-1">{ln.gan}{ln.zhi}</span>
                                    <span className="text-[9px] text-stone-500 bg-stone-100 px-1.5 rounded-sm scale-90">{ln.shishen}</span>
                                </button>
                            ))}
                         </div>

                         {selectedYear && (
                             <div className="mt-6 pt-6 border-t border-stone-200/60 flex flex-col gap-4">
                                 <div className="flex justify-between items-center">
                                     <div className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
                                         <div className="w-2 h-2 bg-stone-400 rounded-full mr-2"></div>
                                         {selectedYear.year} {selectedYear.gan}{selectedYear.zhi}年 · 流月细批
                                     </div>
                                     {selectedMonth && <button onClick={() => setSelectedMonth(null)} className="text-xs text-stone-500 hover:text-stone-900 border-b border-dashed border-stone-300">重置流月</button>}
                                 </div>
                                 <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                                     {selectedYear.liuYue.map((m) => (
                                         <button
                                            key={m.month}
                                            onClick={() => setSelectedMonth(m)}
                                            className={`flex flex-col items-center py-2 rounded-md border text-[10px] transition-all ${
                                                selectedMonth?.month === m.month
                                                ? 'bg-stone-800 text-white border-stone-800 shadow-lg transform scale-105'
                                                : 'bg-white border-stone-100 text-stone-600 hover:bg-white hover:border-stone-300 hover:shadow-sm'
                                            }`}
                                         >
                                             <span className="scale-90 opacity-60 mb-0.5">{m.month}月</span>
                                             <span className="font-serif font-bold text-sm mb-0.5">{m.gan}{m.zhi}</span>
                                             <span className="scale-75 opacity-60">{m.jieQi.name}</span>
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* AI Analysis Card - Zen Style */}
            <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center mb-3 font-serif tracking-tight text-stone-900">
                                <Bot className="w-8 h-8 mr-4 text-stone-800 stroke-1" />
                                AI 顾问 · 深度推演
                            </h2>
                            <p className="text-stone-500 text-sm pl-12">
                                融合传统命理与现代大模型逻辑，为您生成专业详批
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowNotesInput(!showNotesInput)}
                            className={`text-xs flex items-center px-5 py-2.5 rounded-full border transition-all font-bold shadow-sm ${showNotesInput ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {showNotesInput ? '收起配置' : '分析配置'}
                        </button>
                    </div>

                    {showNotesInput && (
                        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-8 animate-in slide-in-from-top-2 space-y-8">
                            {/* Mode Selection */}
                            <div>
                                <label className="text-xs font-bold text-stone-400 mb-3 block uppercase tracking-widest">1. 分析模式</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {ANALYSIS_MODES.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setAnalysisMode(m.id)}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-1 ${
                                                analysisMode === m.id 
                                                ? 'bg-white border-stone-900 text-stone-900 shadow-md ring-1 ring-stone-900' 
                                                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                                            }`}
                                        >
                                            <span className="text-base">{m.label.split(' ')[0]}</span>
                                            <span className="opacity-70 font-normal">{m.label.split(' ')[1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theories */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-stone-400 block uppercase tracking-widest">2. 理论参考</label>
                                    <button 
                                        onClick={() => { setIsManagingTheories(!isManagingTheories); setEditingTheory(null); }}
                                        className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${isManagingTheories ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                                    >
                                        <Settings className="w-3 h-3" />
                                        {isManagingTheories ? '完成管理' : '管理/新增'}
                                    </button>
                                </div>

                                {isManagingTheories ? (
                                    <div className="bg-stone-100 rounded-xl p-4 border border-stone-200 animate-in fade-in">
                                        {editingTheory ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center border-b border-stone-200 pb-2 mb-2">
                                                    <span className="text-xs font-bold text-stone-600">{editingTheory.id ? '编辑理论' : '新增理论'}</span>
                                                    <button onClick={() => setEditingTheory(null)} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="理论标题"
                                                    className="w-full p-2 rounded border border-stone-300 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-500"
                                                    value={editingTheory.title || ''}
                                                    onChange={e => setEditingTheory({...editingTheory, title: e.target.value})}
                                                />
                                                <textarea 
                                                    placeholder="理论核心内容 (Prompt)"
                                                    className="w-full h-32 p-2 rounded border border-stone-300 text-sm text-stone-600 font-mono focus:outline-none focus:border-stone-500"
                                                    value={editingTheory.content || ''}
                                                    onChange={e => setEditingTheory({...editingTheory, content: e.target.value})}
                                                />
                                                <button 
                                                    onClick={handleSaveTheory}
                                                    disabled={!editingTheory.title || !editingTheory.content}
                                                    className="w-full py-2 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-black disabled:opacity-50"
                                                >
                                                    保存理论
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <button 
                                                    onClick={() => setEditingTheory({ id: '', title: '', content: '', description: '' })}
                                                    className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-400 text-xs font-bold hover:border-stone-400 hover:text-stone-600 flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" /> 新增自定义理论
                                                </button>
                                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                                                    {theories.map(t => (
                                                        <div key={t.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-sm group">
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-xs font-bold text-stone-700 truncate">{t.title}</span>
                                                                <span className="text-[10px] text-stone-400 truncate">{t.description || '暂无描述'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 pl-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setEditingTheory(t)} className="p-1 hover:bg-stone-100 rounded text-stone-500"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => handleDeleteTheory(t.id)} className="p-1 hover:bg-rose-50 rounded text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-2 text-center">
                                                     <button onClick={() => setTheories(PRESET_THEORIES)} className="text-[10px] text-stone-400 hover:text-stone-600 underline flex items-center justify-center gap-1 mx-auto">
                                                        <Undo className="w-3 h-3" /> 重置为默认库
                                                     </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {theories.map(t => {
                                            const isActive = activeTheories.has(t.id);
                                            return (
                                                <button 
                                                    key={t.id}
                                                    onClick={() => toggleTheory(t.id)}
                                                    className={`px-3 py-1.5 rounded-full border text-[11px] transition-all flex items-center font-medium ${isActive ? 'bg-stone-800 border-stone-800 text-white shadow-md' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300'}`}
                                                >
                                                    {isActive && <Check className="w-3 h-3 mr-1.5" />}
                                                    {t.title}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Custom Notes */}
                            <div>
                                <label className="text-xs font-bold text-stone-400 mb-3 block uppercase tracking-widest">3. 补充断语 / 笔记</label>
                                <div className="relative">
                                    <Feather className="absolute top-3 left-3 w-4 h-4 text-stone-400" />
                                    <textarea 
                                        value={customNotes}
                                        onChange={(e) => setCustomNotes(e.target.value)}
                                        placeholder="输入您的断语或笔记，AI 将以此为核心进行事实核查与润色..."
                                        className="w-full h-24 bg-white border border-stone-200 rounded-xl pl-10 p-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 resize-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex gap-4">
                         <button
                            onClick={runAiAnalysis}
                            disabled={isAiAnalyzing}
                            className={`flex-1 h-14 rounded-xl font-bold text-base flex items-center justify-center transition-all shadow-xl ${
                                isAiAnalyzing 
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                                : 'bg-stone-900 text-white hover:bg-black hover:scale-[1.01] hover:shadow-2xl'
                            }`}
                         >
                            {isAiAnalyzing ? (
                                <>
                                    <Activity className="w-5 h-5 mr-3 animate-spin text-stone-400" />
                                    正在深度推演命理逻辑...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-3 text-amber-300" />
                                    开始 AI 分析
                                </>
                            )}
                         </button>
                         <button
                             onClick={handleCopyOnly}
                             className="w-14 h-14 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all shadow-sm hover:shadow-md"
                             title="复制完整 Prompt"
                         >
                             <Copy className="w-6 h-6" />
                         </button>
                    </div>

                    {/* Result Area */}
                    {aiAnalysisResult && (
                        <div className="mt-10 pt-10 border-t border-dashed border-stone-200 animate-in fade-in">
                            <div className="prose prose-stone max-w-none">
                                {renderMarkdown(aiAnalysisResult)}
                            </div>
                            <div ref={resultEndRef} />
                        </div>
                    )}
                    
                    {!aiAnalysisResult && !isAiAnalyzing && (
                        <div className="mt-10 text-center">
                             <p className="text-xs text-stone-400 mb-4">或复制 Prompt 到其他平台</p>
                             <div className="flex justify-center gap-3">
                                 <button 
                                     onClick={() => handleJump('https://chat.openai.com', 'ChatGPT')}
                                     className="px-4 py-2 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center"
                                 >
                                     {copyFeedback === 'ChatGPT' ? <Check className="w-3 h-3 mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                                     ChatGPT
                                 </button>
                                 <button 
                                     onClick={() => handleJump('https://claude.ai', 'Claude')}
                                     className="px-4 py-2 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold hover:border-orange-500 hover:text-orange-600 transition-all flex items-center"
                                 >
                                     {copyFeedback === 'Claude' ? <Check className="w-3 h-3 mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                                     Claude
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
