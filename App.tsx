
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Sparkles, Copy, Check, Compass, Bot, Zap, Activity, GitMerge, Eye, Thermometer, Wind, Search, RotateCcw, BookOpen, ChevronRight, Layers, Feather, Moon, Settings, Plus, Trash2, X, Edit3, Undo, ExternalLink, Anchor, LayoutGrid, ScrollText, User, MapPin, MessageSquare, GraduationCap, HeartHandshake, Leaf, Droplets, Flame, Mountain, Diamond, Star, Save, FolderOpen, Briefcase, Stethoscope, MonitorPlay, AlertTriangle, HelpCircle, Coffee, Video, Users, MessageCircle, Sun } from 'lucide-react';
import { Gender, BaziResult, LuckPillar, LiuNian, LiuYue, ReverseResult, Pillar, ShenShaItem, SavedCase } from './types';
import { calculateAllPillars, calculateInteractions, findDatesFromPillars, HEAVENLY_STEMS, EARTHLY_BRANCHES, CHINA_CITIES, getWuxing, getElementColorClass } from './utils/baziHelper';
import { 
    PRESET_THEORIES, ANALYSIS_MODES, TheoryModule, TONE_PRESETS, SCHOOL_PRESETS, PROMPT_SCHEMES, PromptConfigItem,
    OUTPUT_LENGTHS, MODE_CATEGORIES, MODE_THEORY_MAPPING, MODE_PLACEHOLDERS 
} from './utils/mangpaiKnowledge';
import PillarCard from './components/PillarCard';

const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [isUnknownTime, setIsUnknownTime] = useState<boolean>(false);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [isLunar, setIsLunar] = useState<boolean>(false);
  
  // True Solar Time State
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [longitude, setLongitude] = useState<number | ''>(120.00); // Default ~Beijing Time
  const [useTrueSolarTime, setUseTrueSolarTime] = useState<boolean>(false);

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

  // Prompt Configuration State (NEW)
  const [promptConfigs, setPromptConfigs] = useState({
      modes: ANALYSIS_MODES,
      tones: TONE_PRESETS,
      schools: SCHOOL_PRESETS
  });
  const [editingPromptItem, setEditingPromptItem] = useState<{type: 'mode'|'tone'|'school', item: PromptConfigItem} | null>(null);
  
  const [analysisMode, setAnalysisMode] = useState<string>('comprehensive');
  const [tone, setTone] = useState<string>('strict');
  const [schoolPreference, setSchoolPreference] = useState<string[]>(['mangpai', 'ziping']);

  // New States for Optimization
  const [isAutoMatch, setIsAutoMatch] = useState(true);
  const [outputLength, setOutputLength] = useState('standard');
  const [showTimeGuidance, setShowTimeGuidance] = useState(false); // For Unknown Time Toast

  // Case Management State
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showCaseLibrary, setShowCaseLibrary] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<string>('deep');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [contactToast, setContactToast] = useState(false);

  // Helpers for Current Time Highlighting
  const currentSystemYear = new Date().getFullYear();
  const currentSystemMonth = new Date().getMonth() + 1;

  // Helper for Fortune Score (Heuristic)
  const getFortuneConfig = (shishen: string, zhangsheng: string = '衰') => {
      // Heuristic: "Good" Ten Gods get warmer colors, "Bad" get cooler/gray.
      // High Energy (ZhangSheng) gets higher score.
      const goodGods = ['正财', '偏财', '正官', '正印', '食神'];
      const isGood = goodGods.includes(shishen);
      
      const energyMap: Record<string, number> = {
          '长生': 80, '沐浴': 70, '冠带': 85, '临官': 90, '帝旺': 95,
          '衰': 60, '病': 50, '死': 40, '墓': 30, '绝': 20, '胎': 40, '养': 60
      };
      
      let baseScore = energyMap[zhangsheng] || 50;
      if (isGood) baseScore += 10;
      else baseScore -= 5;

      const score = Math.min(100, Math.max(20, baseScore));
      
      // Visual mapping
      // Good -> Red/Rose
      // Neutral/Bad -> Slate/Gray/Blue
      const colorClass = isGood ? 'bg-rose-500' : 'bg-slate-400';
      
      return { score, colorClass };
  };

  const FortuneBar = ({ score, colorClass }: { score: number, colorClass: string }) => (
      <div className="w-full h-1 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${score}%` }}></div>
      </div>
  );

  // Load Cases from LocalStorage
  useEffect(() => {
      const storedCases = localStorage.getItem('bazi_cases');
      if (storedCases) {
          try {
              setSavedCases(JSON.parse(storedCases));
          } catch (e) {
              console.error("Failed to load cases", e);
          }
      }
  }, []);

  useEffect(() => {
    const lng = useTrueSolarTime && longitude !== '' ? Number(longitude) : undefined;
    const result = calculateAllPillars(birthDate, birthTime, gender, isLunar, isUnknownTime, false, lng);
    setBazi(result);
    
    // Auto-select current luck pillar if possible
    let foundCurrentLuck = false;
    result.luckPillars.forEach((lp, idx) => {
        if (currentSystemYear >= lp.startYear && currentSystemYear <= lp.endYear) {
            setSelectedLuckId(`luck-${idx}`);
            foundCurrentLuck = true;
        }
    });
    
    if (!foundCurrentLuck) {
        if (result.smallLuck && currentSystemYear < result.luckPillars[0]?.startYear) {
             setSelectedLuckId('small');
        } else {
             setSelectedLuckId('luck-0');
        }
    }

    setSelectedYear(null);
    setSelectedMonth(null);
    
    if (isUnknownTime) {
        if (analysisMode !== 'three_pillars' && analysisMode !== 'deduce_time') {
             setAnalysisMode('deduce_time');
        }
    } else {
        if (analysisMode === 'deduce_time' || analysisMode === 'three_pillars') {
            setAnalysisMode('comprehensive');
        }
    }

  }, [birthDate, birthTime, gender, isLunar, isUnknownTime, useTrueSolarTime, longitude]);

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
        // Try to find current year in the luck pillar
        const currYearLn = currentLuck.liuNian.find(ln => ln.year === currentSystemYear);
        setSelectedYear(currYearLn || currentLuck.liuNian[0]);
        setSelectedMonth(null); 
    }
  }, [selectedLuckId, bazi]);

  // Auto-Mapping Effect
  useEffect(() => {
    if (isAutoMatch && MODE_THEORY_MAPPING[analysisMode]) {
        const mappedTheories = MODE_THEORY_MAPPING[analysisMode];
        if (mappedTheories && mappedTheories.length > 0) {
            setActiveTheories(new Set(mappedTheories));
        }
    }
  }, [analysisMode, isAutoMatch]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const prov = e.target.value;
      setSelectedProvince(prov);
      setSelectedCity('');
      if (prov === '') {
          setUseTrueSolarTime(false);
      }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const city = e.target.value;
      setSelectedCity(city);
      const cityData = CHINA_CITIES[selectedProvince]?.find(c => c.name === city);
      if (cityData) {
          setLongitude(cityData.lng);
          setUseTrueSolarTime(true);
      }
  };

  const toggleSchool = (schoolId: string) => {
      setSchoolPreference(prev => {
          if (prev.includes(schoolId)) {
              return prev.filter(s => s !== schoolId);
          } else {
              return [...prev, schoolId];
          }
      });
  };

  // --- Prompt Config Handlers ---
  const applyScheme = (schemeId: string) => {
      const scheme = PROMPT_SCHEMES.find(s => s.id === schemeId);
      if (scheme) {
          setAnalysisMode(scheme.config.mode);
          setTone(scheme.config.tone);
          setSchoolPreference(scheme.config.schools);
      }
  };

  const handleSavePromptItem = () => {
      if (!editingPromptItem) return;
      const { type, item } = editingPromptItem;
      
      setPromptConfigs(prev => {
          const key = type === 'mode' ? 'modes' : type === 'tone' ? 'tones' : 'schools';
          return {
              ...prev,
              [key]: prev[key].map((i: PromptConfigItem) => i.id === item.id ? item : i)
          };
      });
      setEditingPromptItem(null);
  };

  const toggleUnknownTime = () => {
      const next = !isUnknownTime;
      setIsUnknownTime(next);
      if (next) {
          setShowTimeGuidance(true);
          setTimeout(() => setShowTimeGuidance(false), 10000);
      } else {
          setShowTimeGuidance(false);
      }
  };

  // --- Case Management Handlers ---

  const handleSaveCase = () => {
    if (!newCaseName.trim()) return;
    const newCase: SavedCase = {
      id: Date.now().toString(),
      name: newCaseName,
      gender,
      birthDate,
      birthTime,
      isUnknownTime,
      isLunar,
      province: selectedProvince,
      city: selectedCity,
      longitude,
      notes: customNotes,
      createdAt: Date.now()
    };
    const updatedCases = [newCase, ...savedCases];
    setSavedCases(updatedCases);
    localStorage.setItem('bazi_cases', JSON.stringify(updatedCases));
    setShowSaveModal(false);
    setNewCaseName('');
  };

  const handleDeleteCase = (id: string) => {
      const updatedCases = savedCases.filter(c => c.id !== id);
      setSavedCases(updatedCases);
      localStorage.setItem('bazi_cases', JSON.stringify(updatedCases));
  };

  const handleLoadCase = (c: SavedCase) => {
      setGender(c.gender);
      setBirthDate(c.birthDate);
      setBirthTime(c.birthTime);
      setIsUnknownTime(c.isUnknownTime);
      setIsLunar(c.isLunar);
      
      if (c.province && c.city) {
          setSelectedProvince(c.province);
          setSelectedCity(c.city);
          if (c.longitude) {
              setLongitude(c.longitude);
              setUseTrueSolarTime(true);
          }
      } else {
          setSelectedProvince('');
          setSelectedCity('');
          setUseTrueSolarTime(false);
      }

      if (c.notes) setCustomNotes(c.notes);
      setShowCaseLibrary(false);
  };

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
  
  const allCoreShenSha = useMemo(() => {
      if (!bazi) return [];
      const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
      const collected: { ss: ShenShaItem, pillarIdx: number }[] = [];
      
      pillars.forEach((p, idx) => {
          p.shenshaList.forEach(ss => {
              if (ss.tier <= 2) {
                  collected.push({ ss, pillarIdx: idx });
              }
          });
      });
      
      return collected.sort((a, b) => a.ss.tier - b.ss.tier);
  }, [bazi]);

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

  const handleCopyContact = (text: string) => {
      navigator.clipboard.writeText(text);
      setContactToast(true);
      setTimeout(() => setContactToast(false), 2000);
  };

  const renderDeepPillar = (pillar: Pillar, title: string, index: number) => {
      const mp = pillar.mangpai;
      if (!mp) return null;
      
      const isSolid = mp.strength === '实';
      const positions = ['年', '月', '日', '时'];
      
      const rootIndices: number[] = mp.roots.map(r => {
          if(r.includes('年')) return 0;
          if(r.includes('月')) return 1;
          if(r.includes('日')) return 2;
          if(r.includes('时')) return 3;
          return -1;
      });

      const huTongIndices: number[] = mp.huTong.map(h => {
          if(h.includes('年')) return 0;
          if(h.includes('月')) return 1;
          if(h.includes('日')) return 2;
          if(h.includes('时')) return 3;
          return -1;
      });

      const ganColor = getElementColorClass(getWuxing(pillar.gan));
      const zhiColor = getElementColorClass(getWuxing(pillar.zhi));

      return (
          <div className={`flex-1 flex flex-col items-center p-2 sm:p-4 border-r border-stone-100 last:border-0 relative group transition-colors ${mp.scope === '主' ? 'bg-orange-50/30' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{title}</span>
                  {mp.scope === '主' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400/50"></span>}
              </div>
              <div className={`text-2xl sm:text-4xl font-serif font-bold mb-2 transition-all ${ganColor} ${isSolid ? '' : 'opacity-70'}`}>
                  {pillar.gan}
              </div>
              <div className="w-full px-1 sm:px-2 mb-2">
                  <div className="flex justify-between items-center gap-1 bg-white p-1.5 rounded-lg border border-stone-100 shadow-sm">
                      {positions.map((p, idx) => {
                          const isRoot = rootIndices.includes(idx);
                          const isHuTong = huTongIndices.includes(idx);
                          const isSelf = idx === index;
                          let colorClass = 'bg-stone-50 text-stone-300 border-stone-100';
                          if (isRoot) {
                              if (idx === 0) colorClass = 'bg-stone-200 border-stone-300 text-stone-700';
                              if (idx === 1) colorClass = 'bg-slate-200 border-slate-300 text-slate-700';
                              if (idx === 2) colorClass = 'bg-amber-200 border-amber-300 text-amber-800';
                              if (idx === 3) colorClass = 'bg-orange-200 border-orange-300 text-orange-800';
                          } else if (isHuTong) {
                               colorClass = 'bg-purple-100 border-purple-200 text-purple-600';
                          } else if (isSelf) {
                              colorClass = 'border-stone-200 border-dashed text-stone-400 bg-transparent';
                          }
                          return (
                              <div key={idx} className={`relative w-4 h-6 sm:w-6 sm:h-8 rounded-[2px] border flex flex-col items-center justify-center transition-all ${colorClass}`} title={p + (isRoot ? '(根)' : '') + (isHuTong ? '(互通)' : '')}>
                                  <span className="text-[8px] scale-75 font-bold leading-none">{p}</span>
                                  {(isRoot || isHuTong) && (
                                     <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isHuTong && !isRoot ? 'bg-purple-500' : 'bg-current'}`}></div>
                                  )}
                              </div>
                          )
                      })}
                  </div>
                  <div className="h-4 mt-1 flex items-center justify-center gap-2">
                       {isSolid ? <span className="text-[9px] text-emerald-600 font-medium flex items-center"><Anchor className="w-2 h-2 mr-1"/>有根</span> : <span className="text-[9px] text-stone-400">虚浮</span>}
                       {mp.huTong.length > 0 && <span className="text-[9px] text-purple-500 font-medium flex items-center"><GitMerge className="w-2 h-2 mr-1"/>互通</span>}
                  </div>
              </div>
              <div className={`h-8 w-px my-1 ${isSolid ? 'bg-stone-300' : 'bg-stone-200 border-l border-dashed border-stone-300 opacity-30'}`}></div>
              <div className={`text-2xl sm:text-4xl font-serif font-bold relative ${zhiColor}`}>
                  {pillar.zhi}
                   {mp.specialGods.length > 0 && (
                      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 translate-x-full">
                          {mp.specialGods.map((g, i) => <span key={i} className="text-[8px] px-1 py-0.5 rounded-l-none rounded-r-sm bg-rose-100 text-rose-600 border border-rose-200 whitespace-nowrap">{g}</span>)}
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
${bazi.trueSolarTimeStr ? `- **真太阳时**：${bazi.trueSolarTimeStr}` : ''}
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
| **月柱** | ${bazi.month.gan} | ${bazi.month.zhi} | ${bazi.year.nayin} | ${bazi.month.shishen} | ${bazi.month.canggan.join('')} | ${bazi.month.shensha.join(' ') || '无'} |
| **日柱** | ${bazi.day.gan} | ${bazi.day.zhi} | ${bazi.year.nayin} | **日元** | ${bazi.day.canggan.join('')} | ${bazi.day.shensha.join(' ') || '无'} |
| **时柱** | ${bazi.hour.gan} | ${bazi.hour.zhi} | ${bazi.year.nayin} | ${bazi.hour.shishen} | ${bazi.hour.canggan.join('')} | ${bazi.hour.shensha.join(' ') || '无'} |

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

    // Get dynamic content from configs
    const modeConfig = promptConfigs.modes.find(m => m.id === analysisMode);
    const toneConfig = promptConfigs.tones.find(t => t.id === tone);
    const selectedSchools = promptConfigs.schools.filter(s => schoolPreference.includes(s.id));
    
    const taskInstruction = modeConfig ? modeConfig.content : '请进行综合分析';
    const toneInstruction = toneConfig ? toneConfig.content : '';
    const schoolInstruction = selectedSchools.length > 0 ? selectedSchools.map(s => s.content).join('\n') : '流派偏好：综合分析。';
    const lengthInstruction = OUTPUT_LENGTHS.find(l => l.id === outputLength)?.instruction || '';

    knowledgePrompt += `\n====== ⚡ 核心指令与分析任务 (Core Instruction) ======\n
### 1. 角色与风格设定 (Role & Tone)
你是一位**精通传统子平术与盲派命理的资深大师**。
- **${toneInstruction}**
- **${schoolInstruction}**

### 2. 任务模式：【${modeConfig?.label || '通用模式'}】
${taskInstruction}

### 3. 输出篇幅要求 (Output Length)
${lengthInstruction}

### 4. 通用分析原则
1. **全局观**：先看日元旺衰与格局成败，再看细节引动。
2.  **理论应用**：若上文中提供了【理论参考】，请优先尝试用该理论进行套用分析，并指出命局是否符合该理论的某种配置（如“顶配/高配/低配”）。
3.  **流年动态**：分析必须结合当前的【大运】与【流年】（${selectedYear ? selectedYear.year : '当前流年'}），指出具体的吉凶应期。
4.  **格式要求**：使用 Markdown 排版，逻辑清晰，重点加粗。

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

  const FiveElementBar = ({ type, score, color, icon: Icon }: { type: string, score: number, color: string, icon: any }) => (
      <div className="flex items-center gap-3 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
              <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-stone-600">{type}</span>
                  <span className="text-[10px] font-mono text-stone-400">{score}%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(score, 100)}%` }} />
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen py-4 px-4 md:py-8 md:px-6 font-sans text-stone-800 selection:bg-stone-200">
      {/* Toast Notification for Unknown Time */}
      {showTimeGuidance && (
        <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in flex items-center justify-between gap-4 border border-stone-700/50 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-1.5 rounded-full text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xs">
                    <p className="font-bold text-stone-100 leading-tight">缺少时辰会导致分析准确率下降</p>
                    <p className="text-stone-400 mt-0.5">晚年运势及子女宫将无法精准测算</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                 <button 
                    onClick={() => { setShowReverse(true); setShowTimeGuidance(false); }}
                    className="px-3 py-1.5 bg-stone-100 text-stone-900 text-xs font-bold rounded-lg hover:bg-white transition-colors whitespace-nowrap shadow-sm"
                 >
                    尝试反推
                 </button>
                 <button onClick={() => setShowTimeGuidance(false)} className="p-1.5 text-stone-500 hover:text-white transition-colors rounded-full hover:bg-white/10">
                    <X className="w-4 h-4" />
                 </button>
            </div>
        </div>
      )}

      {/* Contact Copy Toast */}
      {contactToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-stone-800/95 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 flex items-center gap-3 border border-stone-700/50">
            <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-400">
                <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">已复制！期待与你交流。</span>
        </div>
      )}

      {/* ... (Header and Main Inputs remain the same) ... */}
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Brand */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-300/50">
            <div className="relative">
                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center tracking-tight select-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-900 rounded-xl flex items-center justify-center mr-3 text-stone-50 shadow-lg ring-2 ring-stone-100 shrink-0">
                        <span className="font-serif text-2xl md:text-3xl font-black">易</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                         <span className="font-serif text-2xl md:text-3xl font-black text-stone-900 tracking-wide">八字</span>
                         <span className="mx-2 text-stone-300 font-light">·</span>
                         <span className="font-tech text-xl md:text-2xl font-bold text-stone-800 tracking-tighter">AI</span>
                         <span className="font-tech text-sm md:text-base font-light text-stone-500 ml-2 tracking-wider">提示词生成器</span>
                    </div>
                </h1>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setShowAboutModal(true)}
                    className="text-xs flex items-center px-4 py-2 rounded-full transition-all border font-bold shadow-sm bg-stone-900 text-stone-50 border-stone-900 hover:bg-stone-700"
                 >
                    <MessageCircle className="w-3.5 h-3.5 mr-2" />
                    软件更新
                 </button>
                 <button 
                    onClick={() => setShowCaseLibrary(true)}
                    className="text-xs flex items-center px-4 py-2 rounded-full transition-all border font-bold shadow-sm bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                 >
                    <FolderOpen className="w-3.5 h-3.5 mr-2" />
                    案例库
                    {savedCases.length > 0 && (
                        <span className="ml-2 bg-stone-100 text-stone-500 px-1.5 rounded-full text-[10px]">{savedCases.length}</span>
                    )}
                 </button>
                 <button 
                    onClick={() => setShowReverse(!showReverse)}
                    className={`text-xs flex items-center px-4 py-2 rounded-full transition-all border font-bold shadow-sm ${showReverse ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50'}`}
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    {showReverse ? '返回排盘' : '反推时辰'}
                </button>
            </div>
        </div>

        {/* ... (Main Inputs logic same) ... */}
        {!showReverse ? (
             <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-stone-200 p-4 md:p-6 relative overflow-hidden">
                 <button onClick={() => setShowSaveModal(true)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all z-20" title="保存当前案例">
                     <Save className="w-5 h-5" />
                 </button>
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end relative z-10">
                    {/* Gender Switch */}
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">命主性别</label>
                        <div className="flex bg-stone-100 p-1 rounded-lg shadow-inner">
                            <button onClick={() => setGender(Gender.MALE)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${gender === Gender.MALE ? 'bg-white shadow-sm text-stone-800 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${gender === Gender.MALE ? 'bg-sky-500' : 'bg-transparent'}`}></div>乾造 (男)
                            </button>
                            <button onClick={() => setGender(Gender.FEMALE)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${gender === Gender.FEMALE ? 'bg-white shadow-sm text-stone-800 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${gender === Gender.FEMALE ? 'bg-rose-500' : 'bg-transparent'}`}></div>坤造 (女)
                            </button>
                        </div>
                    </div>
                    {/* Date & Time */}
                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                             <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">出生日期</label>
                                <div className="flex bg-stone-100 rounded-md p-0.5 text-[10px]">
                                    <button onClick={() => setIsLunar(false)} className={`px-2 py-0.5 rounded transition-all ${!isLunar ? 'bg-white shadow-sm text-stone-800 font-bold' : 'text-stone-400'}`}>公历</button>
                                    <button onClick={() => setIsLunar(true)} className={`px-2 py-0.5 rounded transition-all ${isLunar ? 'bg-white shadow-sm text-stone-800 font-bold' : 'text-stone-400'}`}>农历</button>
                                </div>
                            </div>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-800 transition-colors pointer-events-none" />
                                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-serif text-base focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all hover:bg-white" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest">出生时辰</label>
                                <div className="relative group">
                                    <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${isUnknownTime ? 'text-stone-200' : 'text-stone-400 group-focus-within:text-stone-800'}`} />
                                    <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} disabled={isUnknownTime} className={`block w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-serif text-base focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all hover:bg-white ${isUnknownTime ? 'opacity-40 cursor-not-allowed bg-stone-100' : ''}`} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <button onClick={toggleUnknownTime} className={`h-[42px] px-3 rounded-lg border transition-all flex flex-col items-center justify-center min-w-[60px] ${isUnknownTime ? 'bg-stone-800 border-stone-800 text-white shadow-md' : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600'}`}>
                                    <span className="text-[10px] font-bold whitespace-nowrap">未知</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center mb-2"><MapPin className="w-3 h-3 mr-1" /> 出生地点 (校正真太阳时)</label>
                        <div className="flex gap-2">
                             <select value={selectedProvince} onChange={handleProvinceChange} className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/10 cursor-pointer hover:bg-white transition-colors">
                                 <option value="">省份/直辖市</option>
                                 {Object.keys(CHINA_CITIES).map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                             <select value={selectedCity} onChange={handleCityChange} disabled={!selectedProvince} className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/10 cursor-pointer hover:bg-white transition-colors disabled:opacity-50">
                                 <option value="">城市</option>
                                 {selectedProvince && CHINA_CITIES[selectedProvince]?.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                             </select>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">经度 & 开关</label>
                             <div className="flex items-center">
                                 <button onClick={() => setUseTrueSolarTime(!useTrueSolarTime)} disabled={longitude === ''} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${useTrueSolarTime ? 'bg-stone-800' : 'bg-stone-200'}`}>
                                     <span className={`${useTrueSolarTime ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                 </button>
                                 <span className="ml-2 text-[10px] font-bold text-stone-500">{useTrueSolarTime ? '已开启' : '未开启'}</span>
                             </div>
                         </div>
                         <div className="flex gap-2 items-center">
                             <div className="relative flex-1">
                                 <input type="number" step="0.01" placeholder="东经" value={longitude} onChange={(e) => { setLongitude(e.target.value === '' ? '' : Number(e.target.value)); if (e.target.value !== '') setUseTrueSolarTime(true); }} className="block w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/10 hover:bg-white transition-colors" />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">°E</span>
                             </div>
                             {useTrueSolarTime && bazi?.trueSolarTimeStr && (
                                 <div className="flex-1 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium flex items-center justify-center whitespace-nowrap shadow-sm">
                                     <Sun className="w-3 h-3 mr-1.5" />
                                     {bazi.trueSolarTimeStr.split(' ')[0]}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
             </div>
        ) : (
            <div className="bg-stone-100 rounded-2xl p-8 border border-stone-200 animate-in fade-in slide-in-from-top-4 shadow-inner">
                {/* ... (Reverse search UI same as previous) ... */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-stone-700 flex items-center"><Search className="w-5 h-5 mr-3" />四柱反推查询 (Beta)</h3>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm mt-4 md:mt-0">
                            <span className="text-xs font-bold text-stone-400">年份范围</span>
                            <input type="number" value={revRange.start} onChange={(e) => setRevRange({...revRange, start: parseInt(e.target.value)})} className="w-16 text-center text-sm border-b border-stone-300 focus:border-stone-900 bg-transparent focus:outline-none" />
                            <span className="text-xs text-stone-300">-</span>
                            <input type="number" value={revRange.end} onChange={(e) => setRevRange({...revRange, end: parseInt(e.target.value)})} className="w-16 text-center text-sm border-b border-stone-300 focus:border-stone-900 bg-transparent focus:outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[{l:'年柱', g:'yg', z:'yz'}, {l:'月柱', g:'mg', z:'mz'}, {l:'日柱', g:'dg', z:'dz'}, {l:'时柱', g:'hg', z:'hz'}].map((p, i) => (
                            <div key={i} className="flex flex-col p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                                <span className="text-xs font-bold text-stone-400 mb-3 text-center tracking-widest">{p.l}</span>
                                <div className="flex gap-2">
                                    <select value={revInputs[p.g as keyof typeof revInputs]} onChange={e => setRevInputs({...revInputs, [p.g]: e.target.value})} className={`flex-1 p-2 rounded border border-stone-200 text-xl font-serif font-bold text-center bg-stone-50 hover:bg-stone-100 cursor-pointer appearance-none ${getElementColorClass(getWuxing(revInputs[p.g as keyof typeof revInputs] as string))}`}>{HEAVENLY_STEMS.map(s => <option key={s} value={s} className="text-stone-800">{s}</option>)}</select>
                                    <select value={revInputs[p.z as keyof typeof revInputs]} onChange={e => setRevInputs({...revInputs, [p.z]: e.target.value})} className={`flex-1 p-2 rounded border border-stone-200 text-xl font-serif font-bold text-center bg-stone-50 hover:bg-stone-100 cursor-pointer appearance-none ${getElementColorClass(getWuxing(revInputs[p.z as keyof typeof revInputs] as string))}`}>{EARTHLY_BRANCHES.map(s => <option key={s} value={s} className="text-stone-800">{s}</option>)}</select>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                         <button onClick={handleReverseSearch} disabled={isSearching} className="w-full md:w-2/3 py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center disabled:opacity-70">
                            {isSearching ? <Zap className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                            {isSearching ? '正在全量遍历...' : '开始反推匹配日期'}
                        </button>
                    </div>
                    {revResults.length > 0 && (
                        <div className="mt-8">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 text-center">找到 {revResults.length} 个匹配结果</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-hide">
                                {revResults.map((r, i) => (
                                    <button key={i} onClick={() => { setBirthDate(`${r.year}-${String(r.month).padStart(2,'0')}-${String(r.day).padStart(2,'0')}`); const hStr = r.hourStr.split(' ')[0]; const startTime = hStr.split('-')[0]; const [h] = startTime.split(':').map(Number); const dateObj = new Date(); dateObj.setHours(h, 30); const safeTime = `${String(dateObj.getHours()).padStart(2,'0')}:30`; setBirthTime(safeTime); setIsUnknownTime(false); setShowReverse(false); }} className="flex items-center justify-between p-4 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all group text-left">
                                        <div>
                                            <div className="font-serif font-bold text-lg text-stone-800">{r.year}年 {r.month}月 {r.day}日</div>
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
          <div className="animate-in slide-in-from-bottom-4 duration-700 space-y-6">
            
            {/* Chart Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden relative card-shadow">
                 {/* ... (Chart Content Same) ... */}
                 <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <button onClick={handleCopyOnly} className="p-1.5 bg-white hover:bg-stone-50 rounded-lg border border-stone-100 text-stone-400 hover:text-stone-600 transition-colors shadow-sm" title="复制Prompt">
                         {copyFeedback === 'full-text' ? <Check className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
                     </button>
                 </div>
                <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">公历</span>
                            <span className="font-serif font-bold text-stone-800 text-lg">{bazi.solarDate}</span>
                            {bazi.trueSolarTimeStr && useTrueSolarTime && (<span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 rounded-sm border border-amber-100 w-fit mt-1">真太阳时: {bazi.trueSolarTimeStr}</span>)}
                        </div>
                        <div className="hidden sm:block w-px h-6 bg-stone-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">农历</span>
                            <span className="font-serif font-medium text-stone-600 text-base">{bazi.lunarDateString}</span>
                        </div>
                    </div>
                    <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm">
                        <Compass className="w-3.5 h-3.5 mr-2 text-stone-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">起运</span>
                            <span className="text-xs font-bold text-stone-700">{bazi.qiyunDetail}</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center md:items-stretch">
                         <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                             <PillarCard title="年柱" pillar={bazi.year} />
                             <PillarCard title="月柱" pillar={bazi.month} />
                             <PillarCard title="日柱" pillar={bazi.day} isMain />
                             <PillarCard title="时柱" pillar={bazi.hour} />
                         </div>
                         <div className="hidden md:flex flex-col items-center justify-center gap-1 opacity-30">
                             <div className="w-px h-8 bg-stone-300 border-l border-dashed"></div>
                             <span className="text-[9px] writing-vertical text-stone-400 tracking-widest">三元</span>
                             <div className="w-px h-8 bg-stone-300 border-l border-dashed"></div>
                         </div>
                         <div className="flex gap-2 p-2 bg-stone-50 rounded-xl border border-stone-100 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                             <PillarCard title="胎元" pillar={bazi.taiyuan} />
                             <PillarCard title="命宫" pillar={bazi.minggong} />
                             <PillarCard title="身宫" pillar={bazi.shengong} />
                         </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-1 grid grid-cols-4 gap-1">
                <button onClick={() => setActiveTab('deep')} className={`flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'deep' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}><Eye className="w-3.5 h-3.5 mr-2" /><span className="hidden sm:inline">深度透视</span><span className="sm:hidden">透视</span></button>
                <button onClick={() => setActiveTab('luck')} className={`flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'luck' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}><Layers className="w-3.5 h-3.5 mr-2" /><span className="hidden sm:inline">大运流年</span><span className="sm:hidden">运势</span></button>
                 <button onClick={() => setActiveTab('health')} className={`flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'health' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}><Activity className="w-3.5 h-3.5 mr-2" /><span className="hidden sm:inline">五行健康</span><span className="sm:hidden">五行</span></button>
                <button onClick={() => setActiveTab('prompt')} className={`flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'prompt' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}><ScrollText className="w-3.5 h-3.5 mr-2" /><span className="hidden sm:inline">AI 提示词</span><span className="sm:hidden">提示词</span></button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'deep' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* ... (Deep tab content same) ... */}
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 relative overflow-hidden">
                            <div className="pb-4 border-b border-stone-100 flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-stone-800 flex items-center tracking-widest uppercase"><LayoutGrid className="w-4 h-4 mr-2 text-stone-500" />命理深度透视 (盲派视角)</h3>
                                <div className="flex gap-3 text-[9px] font-medium text-stone-400">
                                    <div className="flex items-center"><div className="w-2 h-2 rounded-[1px] bg-stone-200 border border-stone-300 mr-1.5"></div>根(Root)</div>
                                    <div className="flex items-center"><div className="w-2 h-2 rounded-[1px] bg-purple-100 border border-purple-200 mr-1.5"></div>互通(Connect)</div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row rounded-xl overflow-hidden border border-stone-200 bg-stone-50/30 mb-6">
                               <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-stone-100 relative">
                                   <div className="absolute top-2 left-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">宾 (Guest)</div>
                                   <div className="flex flex-1 pt-8">{renderDeepPillar(bazi.year, '年柱', 0)}{renderDeepPillar(bazi.month, '月柱', 1)}</div>
                               </div>
                               <div className="flex-1 flex flex-col relative bg-white">
                                   <div className="absolute top-2 left-3 text-[10px] font-bold text-orange-500/70 uppercase tracking-wider">主 (Host)</div>
                                   <div className="flex flex-1 pt-8">{renderDeepPillar(bazi.day, '日柱', 2)}{renderDeepPillar(bazi.hour, '时柱', 3)}</div>
                               </div>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-4">
                                {/* Static Interactions */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center"><GitMerge className="w-3 h-3 mr-2"/> 原局五行作用</h4>
                                    </div>
                                    {bazi.interactions.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {bazi.interactions.map((interaction, idx) => (
                                                <div key={idx} className={`px-3 py-2 rounded-lg text-xs border-l-2 flex items-center justify-between bg-white shadow-sm ${interaction.severity === 'good' ? 'border-emerald-400' : interaction.severity === 'bad' ? 'border-rose-400' : 'border-stone-300'}`}>
                                                    <span className={`font-bold ${interaction.severity === 'good' ? 'text-emerald-600' : interaction.severity === 'bad' ? 'text-rose-600' : 'text-stone-600'}`}>{interaction.label}</span>
                                                    <span className="text-[10px] text-stone-400 ml-2 truncate" title={interaction.description}>{interaction.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (<div className="text-center py-2 text-stone-400 text-xs italic">局内气势流通，无明显刑冲</div>)}
                                </div>

                                {/* Dynamic Interactions */}
                                {dynamicInteractions.length > 0 && (
                                    <div className="pt-4 border-t border-stone-200/60">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
                                                <Zap className="w-3 h-3 mr-2 text-amber-500"/> 
                                                运岁引动 (大运/流年/流月)
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {dynamicInteractions.map((interaction, idx) => (
                                                <div key={idx} className={`px-3 py-2 rounded-lg text-xs border-l-2 flex items-center justify-between bg-white shadow-sm ${interaction.severity === 'good' ? 'border-emerald-400' : interaction.severity === 'bad' ? 'border-rose-400' : 'border-stone-300'}`}>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${interaction.severity === 'good' ? 'text-emerald-600' : interaction.severity === 'bad' ? 'text-rose-600' : 'text-stone-600'}`}>{interaction.label}</span>
                                                        <span className="text-[9px] text-stone-400 mt-0.5">{interaction.pillars.join(' + ')}</span>
                                                    </div>
                                                    <span className="text-[10px] text-stone-400 ml-2 text-right max-w-[100px] leading-tight line-clamp-2" title={interaction.description}>{interaction.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 relative overflow-hidden">
                            <div className="pb-4 border-b border-stone-100 flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-stone-800 flex items-center tracking-widest uppercase"><Star className="w-4 h-4 mr-2 text-stone-500" />核心神煞与特征</h3>
                                <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-400">仅展示核心</span>
                            </div>
                            {allCoreShenSha.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {allCoreShenSha.map((item, idx) => (
                                        <div key={idx} className={`flex items-center p-2 rounded-lg border ${item.ss.type === '吉' ? 'bg-amber-50/50 border-amber-100' : item.ss.type === '凶' ? 'bg-rose-50/50 border-rose-100' : 'bg-stone-50/50 border-stone-100'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 font-serif font-bold text-xs ${item.ss.type === '吉' ? 'bg-amber-100 text-amber-700' : item.ss.type === '凶' ? 'bg-rose-100 text-rose-700' : 'bg-stone-200 text-stone-600'}`}>{item.ss.name[0]}</div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center"><span className={`text-xs font-bold ${item.ss.type === '吉' ? 'text-amber-800' : item.ss.type === '凶' ? 'text-rose-800' : 'text-stone-700'}`}>{item.ss.name}</span><span className="text-[9px] text-stone-400 ml-2 font-mono">{['年','月','日','时'][item.pillarIdx]}柱</span></div>
                                                {item.ss.description && <span className="text-[10px] text-stone-500">{item.ss.description}</span>}
                                                {item.ss.isActivated && item.ss.interactionMsg && <span className="text-[9px] text-rose-500 font-bold animate-pulse">! {item.ss.interactionMsg}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-4 text-stone-400 text-xs">命局平稳，无显著特殊神煞</div>)}
                        </div>
                    </div>
                )}

                {activeTab === 'luck' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 animate-in fade-in slide-in-from-bottom-2">
                         {/* ... (Luck Content Same) ... */}
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-stone-800 flex items-center tracking-widest uppercase"><Layers className="w-4 h-4 mr-2 text-stone-500"/>大运征程</h3>
                            <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-1 rounded border border-stone-100">每十年一运</span>
                        </div>
                        <div className="pb-4 overflow-x-auto scrollbar-hide">
                            <div className="flex relative min-w-max space-x-2 px-2 pb-4 pt-2">
                                <div className="absolute top-[42px] left-0 right-0 h-px bg-stone-200 z-0"></div>
                                {bazi.smallLuck && (
                                    <button onClick={() => setSelectedLuckId('small')} className={`relative z-10 flex flex-col items-center min-w-[60px] group transition-all duration-300 ${selectedLuckId === 'small' ? 'scale-105 -translate-y-1' : 'opacity-60 hover:opacity-100 hover:-translate-y-0.5'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 mb-4 bg-white transition-colors ${selectedLuckId === 'small' ? 'border-stone-800 scale-125' : 'border-stone-300'}`}></div>
                                        <span className="text-[10px] text-stone-400 mb-2 font-medium">童限</span>
                                        <div className={`w-14 h-20 rounded-xl border flex flex-col items-center justify-center shadow-sm transition-all ${selectedLuckId === 'small' ? 'bg-stone-800 border-stone-800 text-white shadow-lg' : 'bg-white border-stone-200 text-stone-800'}`}><span className="font-serif font-bold text-lg">小运</span></div>
                                    </button>
                                )}
                                {bazi.luckPillars.map((lp, idx) => {
                                    const isCurrentLuck = currentSystemYear >= lp.startYear && currentSystemYear <= lp.endYear;
                                    const fConfig = getFortuneConfig(lp.shishen, lp.zhangsheng);
                                    return (
                                    <button key={idx} onClick={() => setSelectedLuckId(`luck-${idx}`)} className={`relative z-10 flex flex-col items-center min-w-[64px] transition-all duration-300 ${selectedLuckId === `luck-${idx}` ? 'scale-105 -translate-y-1' : 'opacity-80 hover:opacity-100 hover:-translate-y-0.5'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 mb-4 bg-white transition-colors z-20 ${isCurrentLuck ? 'border-rose-500 ring-4 ring-rose-100' : selectedLuckId === `luck-${idx}` ? 'border-stone-800' : 'border-stone-300'}`}></div>
                                        {isCurrentLuck && <span className="absolute top-[-18px] text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold z-30 animate-bounce shadow-sm">当前</span>}
                                        <span className={`text-[10px] mb-2 font-mono ${isCurrentLuck ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>{lp.startAge}岁</span>
                                        <div className={`w-16 rounded-xl border flex flex-col items-center justify-center shadow-sm transition-all px-1 py-2 relative overflow-hidden ${selectedLuckId === `luck-${idx}` ? 'bg-stone-800 border-stone-800 text-white shadow-xl' : isCurrentLuck ? 'bg-white border-rose-300 text-stone-800 ring-2 ring-rose-100' : 'bg-white border-stone-200 text-stone-800'}`}>
                                            <span className="text-[9px] mb-0.5 opacity-60 scale-90">{lp.shishen}</span>
                                            <span className="font-serif font-bold text-xl leading-none mb-1"><span className={getElementColorClass(getWuxing(lp.gan))}>{lp.gan}</span><span className={getElementColorClass(getWuxing(lp.zhi))}>{lp.zhi}</span></span>
                                            <span className="text-[9px] opacity-60 scale-90 mb-1">{lp.zhiShishen}</span>
                                            <FortuneBar score={fConfig.score} colorClass={fConfig.colorClass} />
                                        </div>
                                    </button>
                                )})}
                            </div>
                        </div>
                        {activeLuck && (
                            <div className="mt-4 pt-6 border-t border-stone-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-serif font-bold">
                                            <span className={getElementColorClass(getWuxing(activeLuck.gan))}>{activeLuck.gan}</span>
                                            <span className={getElementColorClass(getWuxing(activeLuck.zhi))}>{activeLuck.zhi}</span>
                                        </span>
                                        <div className="h-8 w-px bg-stone-200"></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-stone-500 font-bold">{activeLuck.startYear} - {activeLuck.endYear}</span>
                                            <span className="text-[10px] text-stone-400">{activeLuck.nayin}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                    {activeLuck.liuNian.map((ln) => {
                                        const isCurrentYear = ln.year === currentSystemYear;
                                        // LiuNian doesn't store zhangsheng directly in type, fallback to '衰' default
                                        const fConfig = getFortuneConfig(ln.shishen, '衰'); 
                                        return (
                                        <button key={ln.year} onClick={() => setSelectedYear(ln)} className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${selectedYear?.year === ln.year ? 'bg-white border-stone-800 ring-1 ring-stone-800 shadow-md z-10 transform -translate-y-1' : isCurrentYear ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200' : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-sm'}`}>
                                            {isCurrentYear && <span className="absolute -top-2 -right-1 text-[8px] bg-rose-500 text-white px-1 rounded-sm z-20 shadow-sm">今</span>}
                                            <span className={`text-[9px] mb-1 ${isCurrentYear ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>{ln.year}</span>
                                            <span className="font-serif font-bold text-lg mb-1"><span className={getElementColorClass(getWuxing(ln.gan))}>{ln.gan}</span><span className={getElementColorClass(getWuxing(ln.zhi))}>{ln.zhi}</span></span>
                                            <span className="text-[9px] text-stone-500 bg-stone-100 px-1.5 rounded-sm scale-90 mb-1">{ln.shishen}</span>
                                            <div className="w-full px-1"><FortuneBar score={fConfig.score} colorClass={fConfig.colorClass} /></div>
                                        </button>
                                    )})}
                                </div>
                                {selectedYear && (
                                    <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col gap-4">
                                        <div className="flex justify-between items-center"><div className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center"><div className="w-2 h-2 bg-stone-400 rounded-full mr-2"></div>{selectedYear.year} {selectedYear.gan}{selectedYear.zhi}年 · 流月细批</div></div>
                                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                                            {selectedYear.liuYue.map((m) => {
                                                const isCurrentMonth = selectedYear.year === currentSystemYear && m.month === currentSystemMonth;
                                                const fConfig = getFortuneConfig(m.shishen, '衰');
                                                return (
                                                <button key={m.month} onClick={() => setSelectedMonth(m)} className={`relative flex flex-col items-center py-2 rounded-md border text-[10px] transition-all ${selectedMonth?.month === m.month ? 'bg-stone-800 text-white border-stone-800 shadow-lg transform scale-105' : isCurrentMonth ? 'bg-rose-50 border-rose-300' : 'bg-white border-stone-100 text-stone-600 hover:bg-white hover:border-stone-300 hover:shadow-sm'}`}>
                                                    {isCurrentMonth && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
                                                    <span className="scale-90 opacity-60 mb-0.5">{m.month}月</span>
                                                    <span className={`font-serif font-bold text-sm mb-0.5 ${selectedMonth?.month === m.month ? 'text-white' : ''}`}><span className={selectedMonth?.month === m.month ? 'text-white' : getElementColorClass(getWuxing(m.gan))}>{m.gan}</span><span className={selectedMonth?.month === m.month ? 'text-white' : getElementColorClass(getWuxing(m.zhi))}>{m.zhi}</span></span>
                                                    <span className="scale-75 opacity-60 mb-1">{m.jieQi.name}</span>
                                                    <div className="w-8"><FortuneBar score={fConfig.score} colorClass={fConfig.colorClass} /></div>
                                                </button>
                                            )})}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                )}

                {activeTab === 'health' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* ... (Health Content Same) ... */}
                        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center"><Wind className="w-4 h-4 mr-2"/> 五行能量分布</h4>
                            <div className="space-y-5">
                                <FiveElementBar type="木 (肝/胆)" score={bazi.tcmProfile.elementScores['木']} color="text-emerald-600" icon={Leaf} />
                                <FiveElementBar type="火 (心/肠)" score={bazi.tcmProfile.elementScores['火']} color="text-red-600" icon={Flame} />
                                <FiveElementBar type="土 (脾/胃)" score={bazi.tcmProfile.elementScores['土']} color="text-amber-600" icon={Mountain} />
                                <FiveElementBar type="金 (肺/皮)" score={bazi.tcmProfile.elementScores['金']} color="text-yellow-600" icon={Diamond} />
                                <FiveElementBar type="水 (肾/耳)" score={bazi.tcmProfile.elementScores['水']} color="text-blue-600" icon={Droplets} />
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col relative">
                             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center"><Activity className="w-4 h-4 mr-2"/> 脏腑风险热图</h4>
                             <div className="flex-1 flex justify-center items-center relative min-h-[240px]">
                                 <svg width="160" height="280" viewBox="0 0 160 280" className="text-stone-200 fill-current opacity-30">
                                     <path d="M80,20 C100,20 110,30 110,45 C110,55 105,65 85,65 C65,65 60,55 60,45 C60,30 70,20 80,20 Z M80,65 C110,65 130,75 130,100 L130,160 C130,170 120,180 120,200 L115,200 L115,270 C115,275 110,280 105,280 C100,280 95,275 95,270 L95,200 L65,200 L65,270 C65,275 60,280 55,280 C50,280 45,275 45,270 L45,200 L40,200 C40,180 30,170 30,160 L30,100 C30,75 50,65 80,65 Z" />
                                 </svg>
                                 <div className="absolute inset-0 pointer-events-none">
                                     <div className="absolute top-[75px] left-[80px] -translate-x-1/2 w-32 h-[1px] bg-stone-300"></div>
                                     <div className="absolute top-[75px] left-[80px] -translate-x-1/2 w-2 h-2 bg-yellow-500 rounded-full border border-white shadow-sm"></div>
                                     <div className="absolute top-[65px] right-[10px] text-right">
                                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bazi.tcmProfile.deficient.includes('金') ? 'bg-yellow-100 text-yellow-700' : bazi.tcmProfile.excess.includes('金') ? 'bg-yellow-500 text-white' : 'bg-stone-100 text-stone-400'}`}>肺/呼吸 {bazi.tcmProfile.deficient.includes('金') ? '(弱)' : bazi.tcmProfile.excess.includes('金') ? '(盛)' : ''}</span>
                                     </div>
                                     <div className="absolute top-[95px] left-[80px] -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm z-10"></div>
                                     <div className="absolute top-[95px] left-[20px] w-16 h-[1px] bg-stone-300"></div>
                                     <div className="absolute top-[85px] left-[10px] text-left">
                                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bazi.tcmProfile.deficient.includes('火') ? 'bg-red-100 text-red-700' : bazi.tcmProfile.excess.includes('火') ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-400'}`}>心/脑 {bazi.tcmProfile.deficient.includes('火') ? '(弱)' : bazi.tcmProfile.excess.includes('火') ? '(盛)' : ''}</span>
                                     </div>
                                     <div className="absolute top-[120px] left-[95px] w-2 h-2 bg-emerald-500 rounded-full border border-white shadow-sm"></div>
                                     <div className="absolute top-[120px] left-[95px] w-12 h-[1px] bg-stone-300"></div>
                                     <div className="absolute top-[110px] right-[10px] text-right">
                                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bazi.tcmProfile.deficient.includes('木') ? 'bg-emerald-100 text-emerald-700' : bazi.tcmProfile.excess.includes('木') ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>肝/胆 {bazi.tcmProfile.deficient.includes('木') ? '(弱)' : bazi.tcmProfile.excess.includes('木') ? '(盛)' : ''}</span>
                                     </div>
                                     <div className="absolute top-[130px] left-[65px] w-2 h-2 bg-amber-500 rounded-full border border-white shadow-sm"></div>
                                     <div className="absolute top-[130px] left-[35px] w-8 h-[1px] bg-stone-300"></div>
                                      <div className="absolute top-[120px] left-[10px] text-left">
                                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bazi.tcmProfile.deficient.includes('土') ? 'bg-amber-100 text-amber-700' : bazi.tcmProfile.excess.includes('土') ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>脾/胃 {bazi.tcmProfile.deficient.includes('土') ? '(弱)' : bazi.tcmProfile.excess.includes('土') ? '(盛)' : ''}</span>
                                     </div>
                                     <div className="absolute top-[160px] left-[80px] -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm"></div>
                                     <div className="absolute top-[160px] left-[80px] w-24 h-[1px] bg-stone-300"></div>
                                     <div className="absolute top-[150px] right-[10px] text-right">
                                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${bazi.tcmProfile.deficient.includes('水') ? 'bg-blue-100 text-blue-700' : bazi.tcmProfile.excess.includes('水') ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-400'}`}>肾/泌尿 {bazi.tcmProfile.deficient.includes('水') ? '(弱)' : bazi.tcmProfile.excess.includes('水') ? '(盛)' : ''}</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="mt-2 text-center">
                                <span className="px-3 py-1 bg-stone-800 text-white text-xs rounded-full font-bold shadow-sm">{bazi.tcmProfile.constitution}</span>
                                <p className="mt-2 text-xs text-stone-500">{bazi.tcmProfile.advice}</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                <h5 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center"><Leaf className="w-3 h-3 mr-1.5"/> 开运食补</h5>
                                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">{bazi.tcmProfile.wellnessGuide.diet.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                            </div>
                             <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                                <h5 className="text-xs font-bold text-sky-800 uppercase mb-2 flex items-center"><Zap className="w-3 h-3 mr-1.5"/> 生活指南</h5>
                                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">{bazi.tcmProfile.wellnessGuide.lifestyle.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                            </div>
                        </div>
                         <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all md:col-span-2">
                             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center"><Moon className="w-4 h-4 mr-2"/> 五运六气 (气候与宏观健康)</h4>
                            <div className="space-y-4">
                                 <div className="flex items-start gap-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                                     <div className="shrink-0 pt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div></div>
                                     <div><div className="text-xs font-bold text-stone-700 mb-1">专业术语</div><p className="text-sm font-serif text-stone-600">{bazi.wuyunLiuqi.description}</p></div>
                                 </div>
                                 <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                      <div className="shrink-0 pt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div></div>
                                     <div><div className="text-xs font-bold text-emerald-800 mb-1">白话解读</div><p className="text-sm text-emerald-700 leading-relaxed">{bazi.wuyunLiuqi.plainEnglish}</p></div>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prompt' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 animate-in fade-in slide-in-from-bottom-2">
                         <div className="mb-6">
                            <h2 className="text-base font-bold flex items-center mb-2 font-serif tracking-tight text-stone-900">
                                <Sparkles className="w-4 h-4 mr-2 text-stone-600" />
                                AI 提示词生成
                            </h2>
                            <p className="text-stone-400 text-xs">
                                配置并复制以下提示词，发送给 ChatGPT/Claude 获得详细分析
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* 1. Categorized Mode Selection */}
                            <div>
                                <label className="text-[10px] font-bold text-stone-400 mb-3 block uppercase tracking-widest">分析模式 (Mode)</label>
                                <div className="space-y-3">
                                    {MODE_CATEGORIES.map(cat => (
                                        <div key={cat.id} className={`rounded-xl border p-3 ${cat.color.replace('text-', 'border-').replace('700', '100')} bg-opacity-30`}>
                                            <div className="text-xs font-bold mb-2 opacity-80 flex items-center">
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${cat.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-100 ')}`}></div>
                                                {cat.title}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.modes.map(modeId => {
                                                    const m = promptConfigs.modes.find(pm => pm.id === modeId);
                                                    if (!m) return null;
                                                    const isActive = analysisMode === modeId;
                                                    return (
                                                        <button 
                                                            key={m.id} 
                                                            onClick={() => setAnalysisMode(m.id)}
                                                            className={`relative group px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center ${
                                                                isActive 
                                                                ? 'bg-stone-800 border-stone-800 text-white shadow-md transform scale-105' 
                                                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:shadow-sm'
                                                            }`}
                                                        >
                                                            {m.label.split(' ')[1]}
                                                            {/* Edit Button on Hover */}
                                                            <div 
                                                                onClick={(e) => { e.stopPropagation(); setEditingPromptItem({ type: 'mode', item: m }); }}
                                                                className={`absolute -top-1 -right-1 p-1 rounded-full bg-white border border-stone-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity scale-75 text-stone-400 hover:text-stone-800 ${isActive ? 'text-stone-800' : ''}`}
                                                            >
                                                                <Edit3 className="w-3 h-3" />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             {/* 2. Output Length Control */}
                             <div>
                                <label className="text-[10px] font-bold text-stone-400 mb-2 block uppercase tracking-widest">输出篇幅 (Output Length)</label>
                                <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl">
                                    {OUTPUT_LENGTHS.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setOutputLength(l.id)}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                                                outputLength === l.id 
                                                ? 'bg-white text-stone-800 shadow-sm ring-1 ring-black/5' 
                                                : 'text-stone-500 hover:text-stone-700'
                                            }`}
                                        >
                                            <span>{l.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-[10px] text-stone-400 text-center">
                                    {OUTPUT_LENGTHS.find(l => l.id === outputLength)?.desc}
                                </p>
                            </div>

                            {/* 3. Configuration (Tone & School) */}
                            <div className="p-4 bg-stone-50/50 rounded-xl border border-stone-200/60 space-y-4">
                                {/* Tone Selection */}
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-2 block uppercase tracking-widest">风格语调 (Tone)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {promptConfigs.tones.map(t => (
                                            <div key={t.id} className={`relative group rounded-lg border transition-all ${tone === t.id ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                                <button 
                                                    onClick={() => setTone(t.id)}
                                                    className="w-full h-full py-2 text-xs font-bold flex items-center justify-center"
                                                >
                                                    {t.label}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setEditingPromptItem({ type: 'tone', item: t }); }}
                                                    className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* School Selection */}
                                <div>
                                    <label className="text-[10px] font-bold text-stone-400 mb-2 block uppercase tracking-widest">理论流派 (School)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {promptConfigs.schools.map(s => {
                                            const isActive = schoolPreference.includes(s.id);
                                            return (
                                                <div key={s.id} className={`relative group rounded-full border transition-all flex items-center ${isActive ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                                    <button 
                                                        onClick={() => toggleSchool(s.id)}
                                                        className="px-3 py-1.5 text-[11px] font-medium flex items-center"
                                                    >
                                                        {isActive && <Check className="w-3 h-3 mr-1.5" />}
                                                        {s.label}
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setEditingPromptItem({ type: 'school', item: s }); }}
                                                        className="mr-1.5 p-0.5 rounded-full hover:bg-stone-600 text-stone-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Theories (Smart Linkage) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-bold text-stone-400 block uppercase tracking-widest">理论模型 (Theory)</label>
                                    <div className="flex items-center gap-3">
                                         {/* Auto Match Switch */}
                                        <button 
                                            onClick={() => setIsAutoMatch(!isAutoMatch)}
                                            className={`text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${isAutoMatch ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-stone-50 text-stone-400 border-stone-200'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${isAutoMatch ? 'bg-blue-500' : 'bg-stone-300'}`}></div>
                                            智能匹配
                                        </button>
                                        <button 
                                            onClick={() => { setIsManagingTheories(!isManagingTheories); setEditingTheory(null); }}
                                            className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${isManagingTheories ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
                                        >
                                            <Settings className="w-3 h-3" />
                                            {isManagingTheories ? '完成' : '管理'}
                                        </button>
                                    </div>
                                </div>

                                {isManagingTheories ? (
                                    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                                        {/* ... (Theory Management Same) ... */}
                                         {editingTheory ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center border-b border-stone-200 pb-2 mb-2">
                                                    <span className="text-xs font-bold text-stone-600">{editingTheory.id ? '编辑' : '新增'}</span>
                                                    <button onClick={() => setEditingTheory(null)} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="标题"
                                                    className="w-full p-2 rounded border border-stone-300 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-500"
                                                    value={editingTheory.title || ''}
                                                    onChange={e => setEditingTheory({...editingTheory, title: e.target.value})}
                                                />
                                                <textarea 
                                                    placeholder="内容 (Prompt)"
                                                    className="w-full h-24 p-2 rounded border border-stone-300 text-sm text-stone-600 font-mono focus:outline-none focus:border-stone-500"
                                                    value={editingTheory.content || ''}
                                                    onChange={e => setEditingTheory({...editingTheory, content: e.target.value})}
                                                />
                                                <button 
                                                    onClick={handleSaveTheory}
                                                    disabled={!editingTheory.title || !editingTheory.content}
                                                    className="w-full py-2 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-black disabled:opacity-50"
                                                >
                                                    保存
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <button 
                                                    onClick={() => setEditingTheory({ id: '', title: '', content: '', description: '' })}
                                                    className="w-full py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-400 text-xs font-bold hover:border-stone-400 hover:text-stone-600 flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" /> 新增
                                                </button>
                                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                                                    {theories.map(t => (
                                                        <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded border border-stone-200 shadow-sm group">
                                                            <span className="text-xs font-bold text-stone-600 truncate flex-1">{t.title}</span>
                                                            <div className="flex items-center gap-1 pl-2 shrink-0 opacity-60 group-hover:opacity-100">
                                                                <button onClick={() => setEditingTheory(t)} className="p-1 hover:bg-stone-100 rounded text-stone-500"><Edit3 className="w-3 h-3" /></button>
                                                                <button onClick={() => handleDeleteTheory(t.id)} className="p-1 hover:bg-rose-50 rounded text-rose-400"><Trash2 className="w-3 h-3" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-1 text-center">
                                                     <button onClick={() => setTheories(PRESET_THEORIES)} className="text-[10px] text-stone-400 hover:text-stone-600 underline flex items-center justify-center gap-1 mx-auto">
                                                        <Undo className="w-3 h-3" /> 重置默认
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
                                                    className={`px-3 py-1.5 rounded-full border text-[11px] transition-all flex items-center font-medium ${isActive ? 'bg-stone-800 border-stone-800 text-white shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50 hover:border-stone-300'}`}
                                                >
                                                    {isActive && <Check className="w-3 h-3 mr-1.5" />}
                                                    {t.title}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 5. Notes with Dynamic Placeholder */}
                            <div>
                                <label className="text-[10px] font-bold text-stone-400 mb-2 block uppercase tracking-widest">补充信息 (Context)</label>
                                <div className="relative">
                                    <Feather className="absolute top-3 left-3 w-4 h-4 text-stone-400" />
                                    <textarea 
                                        value={customNotes}
                                        onChange={(e) => setCustomNotes(e.target.value)}
                                        placeholder={MODE_PLACEHOLDERS[analysisMode] || "可选：输入您的断语、问题或第二人的八字信息（用于合盘）..."}
                                        className="w-full h-20 bg-white border border-stone-200 rounded-lg pl-9 p-2 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sticky-ish Action Bar */}
                        <div className="flex flex-col gap-3 mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t border-stone-100 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] -mx-6 px-6 -mb-6 rounded-b-2xl z-10">
                             <button
                                onClick={handleCopyOnly}
                                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-md bg-stone-900 text-white hover:bg-black hover:shadow-lg group"
                             >
                                {copyFeedback === 'full-text' ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2 text-emerald-400" />
                                        已复制
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2 text-stone-300 group-hover:text-white transition-colors" />
                                        复制完整 Prompt
                                    </>
                                )}
                             </button>

                             <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                 <button 
                                     onClick={() => handleJump('https://chat.openai.com', 'ChatGPT')}
                                     className="px-3 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center shadow-sm bg-white whitespace-nowrap"
                                 >
                                     {copyFeedback === 'ChatGPT' ? <Check className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                     ChatGPT
                                 </button>
                                 <button 
                                     onClick={() => handleJump('https://claude.ai', 'Claude')}
                                     className="px-3 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center shadow-sm bg-white whitespace-nowrap"
                                 >
                                     {copyFeedback === 'Claude' ? <Check className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                     Claude
                                 </button>
                                 <button 
                                     onClick={() => handleJump('https://gemini.google.com', 'Gemini')}
                                     className="px-3 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center shadow-sm bg-white whitespace-nowrap"
                                 >
                                     {copyFeedback === 'Gemini' ? <Check className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                     Gemini
                                 </button>
                                 <button 
                                     onClick={() => handleJump('https://chat.deepseek.com', 'DeepSeek')}
                                     className="px-3 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm bg-white whitespace-nowrap"
                                 >
                                     {copyFeedback === 'DeepSeek' ? <Check className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                     DeepSeek
                                 </button>
                                 <button 
                                     onClick={() => handleJump('https://kimi.moonshot.cn', 'Kimi')}
                                     className="px-3 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center shadow-sm bg-white whitespace-nowrap"
                                 >
                                     {copyFeedback === 'Kimi' ? <Check className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                                     Kimi
                                 </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* ... (Modals remain largely the same) ... */}
      
      {/* 1. Edit Prompt Config Modal (NEW) */}
      {editingPromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-stone-200">
                <h3 className="text-lg font-serif font-bold text-stone-800 mb-4 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-stone-600" />
                    编辑提示词模板
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">标题 / 标签</label>
                        <input 
                            type="text" 
                            value={editingPromptItem.item.label} 
                            onChange={(e) => setEditingPromptItem({ ...editingPromptItem, item: { ...editingPromptItem.item, label: e.target.value } })} 
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">指令内容 (Content)</label>
                         <textarea 
                            value={editingPromptItem.item.content} 
                            onChange={(e) => setEditingPromptItem({ ...editingPromptItem, item: { ...editingPromptItem.item, content: e.target.value } })} 
                            className="w-full h-40 px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => setEditingPromptItem(null)} 
                            className="flex-1 py-2.5 border border-stone-200 rounded-lg text-stone-500 font-bold text-sm hover:bg-stone-50 transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleSavePromptItem} 
                            className="flex-1 py-2.5 bg-stone-800 text-white rounded-lg font-bold text-sm hover:bg-stone-900 transition-colors shadow-md"
                        >
                            保存修改
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ... (Other modals: Save Case, Case Library) ... */}
       {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-stone-200">
                <h3 className="text-lg font-serif font-bold text-stone-800 mb-4 flex items-center"><Save className="w-5 h-5 mr-2 text-stone-600" />保存案例</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">案例名称 / 命主</label>
                        <input type="text" placeholder="如：张三 2024问事" value={newCaseName} onChange={(e) => setNewCaseName(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent font-medium" autoFocus />
                    </div>
                    <div className="text-xs text-stone-400 bg-stone-50 p-2 rounded border border-stone-100"><p>将保存当前排盘的所有参数（日期、时间、真太阳时地点、备注等）。</p></div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2.5 border border-stone-200 rounded-lg text-stone-500 font-bold text-sm hover:bg-stone-50 transition-colors">取消</button>
                        <button onClick={handleSaveCase} disabled={!newCaseName.trim()} className="flex-1 py-2.5 bg-stone-800 text-white rounded-lg font-bold text-sm hover:bg-stone-900 disabled:opacity-50 transition-colors shadow-md">确认保存</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showCaseLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-stone-200">
                <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                    <h3 className="text-xl font-serif font-bold text-stone-800 flex items-center"><FolderOpen className="w-6 h-6 mr-3 text-stone-700" />我的案例库<span className="ml-3 text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-sans font-bold">{savedCases.length}</span></h3>
                    <button onClick={() => setShowCaseLibrary(false)} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
                    {savedCases.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                            <FolderOpen className="w-16 h-16 opacity-20" />
                            <p className="text-sm font-medium">暂无保存的案例</p>
                            <button onClick={() => { setShowCaseLibrary(false); }} className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold shadow-sm hover:bg-stone-50 text-stone-600">去排盘并保存</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedCases.map((c) => (
                                <div key={c.id} className="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.gender === Gender.MALE ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'}`}><span className="text-xs font-bold">{c.gender === Gender.MALE ? '乾' : '坤'}</span></div>
                                            <div><h4 className="font-bold text-stone-800 leading-tight">{c.name}</h4><span className="text-[10px] text-stone-400">{new Date(c.createdAt).toLocaleDateString()}</span></div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(c.id); }} className="text-stone-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="删除案例"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="space-y-1 mb-4 px-1">
                                        <div className="flex justify-between text-xs"><span className="text-stone-500">日期:</span><span className="font-serif font-bold text-stone-700">{c.birthDate} {c.birthTime}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-stone-500">历法:</span><span className="text-stone-600">{c.isLunar ? '农历' : '公历'} {c.isUnknownTime ? '(未知时)' : ''}</span></div>
                                        {c.province && (<div className="flex justify-between text-xs"><span className="text-stone-500">地点:</span><span className="text-stone-600">{c.province} {c.city}</span></div>)}
                                    </div>
                                    <button onClick={() => handleLoadCase(c)} className="w-full py-2 bg-stone-50 text-stone-600 border border-stone-100 rounded-lg text-xs font-bold hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all flex items-center justify-center">加载排盘</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 relative">
                 <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>

                {/* Header Image/Gradient */}
                <div className="h-32 bg-stone-900 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="text-center relative z-10 px-6">
                        <h3 className="text-xl font-serif font-bold text-stone-100 mb-1 tracking-wide">致力用 AI 重构传统命理</h3>
                        <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full opacity-80"></div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* 初心 & 声明 */}
                    <div className="text-center space-y-4">
                        <p className="text-stone-600 text-sm leading-relaxed italic font-serif">
                            “市面上的排盘太丑了，所以我自己做了一个 AI 八字提示词生成器。”
                        </p>
                        
                        <div className="text-xs text-stone-500 space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-100">
                            <p className="font-bold text-stone-700">注：会在微信公众号第一时间发布软件的最新版本</p>
                            <p>本工具完全免费开源。旨在通过精细化的 PromptEngineering，激发大模型(通义千问/豆包/deepseek等)在传统命理分析上的潜力。</p>
                            <p className="text-rose-500 font-bold">严禁用于商业算命或封建迷信活动</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-stone-50 rounded-xl p-2 border border-stone-100 space-y-1">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center my-2">点击复制联系方式</h4>
                        <button 
                            onClick={() => handleCopyContact('QvQ888688 / YHY31419')}
                            className="w-full flex items-center justify-between text-sm text-stone-600 hover:bg-white hover:shadow-sm p-3 rounded-lg transition-all group border border-transparent hover:border-stone-100"
                        >
                            <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-3 text-emerald-500"/> 微信号</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium font-mono">QvQ888688 / YHY31419</span>
                                <Copy className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                        <button 
                            onClick={() => handleCopyContact('瀚萌要分享')}
                            className="w-full flex items-center justify-between text-sm text-stone-600 hover:bg-white hover:shadow-sm p-3 rounded-lg transition-all group border border-transparent hover:border-stone-100"
                        >
                            <span className="flex items-center"><Users className="w-4 h-4 mr-3 text-emerald-500"/> 公众号</span>
                             <div className="flex items-center gap-2">
                                <span className="font-medium">瀚萌要分享</span>
                                <Copy className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                        <button 
                            onClick={() => handleCopyContact('神算子（不收徒）')}
                            className="w-full flex items-center justify-between text-sm text-stone-600 hover:bg-white hover:shadow-sm p-3 rounded-lg transition-all group border border-transparent hover:border-stone-100"
                        >
                            <span className="flex items-center"><Video className="w-4 h-4 mr-3 text-emerald-500"/> 抖音号</span>
                             <div className="flex items-center gap-2">
                                <span className="font-medium">神算子（不收徒）</span>
                                <Copy className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
