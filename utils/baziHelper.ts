
import { Pillar, LuckPillar, Gender, BaziResult, LiuNian, LiuYue, SolarTermInfo, Interaction, MangpaiInfo, ReverseResult, WuyunLiuqi, TCMProfile } from '../types';

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// Colors: Wood(Green), Fire(Red), Earth(Brown), Metal(Orange/Gold), Water(Blue)
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const BRANCH_ELEMENTS = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

const ZHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

const NAYIN_MAP: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
};

const HIDDEN_STEMS_MAP: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

const ZHANG_SHENG_START: Record<string, string> = {
    '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅', 
    '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯'
};

const JIE_CONSTANTS = [
    { name: '小寒', c: 5.4055, month: 0 }, { name: '立春', c: 3.87, month: 1 },
    { name: '惊蛰', c: 5.63, month: 2 },   { name: '清明', c: 4.81, month: 3 },
    { name: '立夏', c: 5.52, month: 4 },   { name: '芒种', c: 5.678, month: 5 },
    { name: '小暑', c: 7.108, month: 6 },  { name: '立秋', c: 7.5, month: 7 },
    { name: '白露', c: 7.646, month: 8 },  { name: '寒露', c: 8.318, month: 9 },
    { name: '立冬', c: 7.438, month: 10 }, { name: '大雪', c: 7.18, month: 11 }
];

// --- Mangpai Constants ---
const LU_MAP: Record<string, string> = {
    '甲': '寅', '乙': '卯', 
    '丙': '巳', '戊': '巳', // Bing/Wu share Si (Lu)
    '丁': '午', '己': '午', // Ding/Ji share Wu (Lu)
    '庚': '申', '辛': '酉', 
    '壬': '亥', '癸': '子'
};

const YANG_REN_MAP: Record<string, string> = {
    '甲': '卯', '乙': '辰', 
    '丙': '午', '戊': '午', 
    '丁': '未', '己': '未', 
    '庚': '酉', '辛': '戌', 
    '壬': '子', '癸': '丑'
};

// Simplified Root checking: if Branch contains the same element or is a grave/birth place
const ROOTS_MAP: Record<string, string[]> = {
    '甲': ['寅', '卯', '亥', '辰', '未'],
    '乙': ['寅', '卯', '亥', '辰', '未'],
    '丙': ['巳', '午', '寅', '未', '戌'],
    '丁': ['巳', '午', '寅', '未', '戌'],
    '戊': ['巳', '午', '辰', '戌', '丑', '未'],
    '己': ['巳', '午', '辰', '戌', '丑', '未'],
    '庚': ['申', '酉', '巳', '戌', '丑'],
    '辛': ['申', '酉', '巳', '戌', '丑'],
    '壬': ['亥', '子', '申', '辰', '丑'],
    '癸': ['亥', '子', '申', '辰', '丑']
};

// --- Interaction Constants ---
const GAN_HE = [['甲','己'], ['乙','庚'], ['丙','辛'], ['丁','壬'], ['戊','癸']];
const GAN_CHONG = [['甲','庚'], ['乙','辛'], ['丙','壬'], ['丁','癸']];

const ZHI_LIU_HE = [['子','丑'], ['寅','亥'], ['卯','戌'], ['辰','酉'], ['巳','申'], ['午','未']];
const ZHI_LIU_CHONG = [['子','午'], ['丑','未'], ['寅','申'], ['卯','酉'], ['辰','戌'], ['巳','亥']];
// Chuan (Hai)
const ZHI_CHUAN = [['子','未'], ['丑','午'], ['寅','巳'], ['卯','辰'], ['申','亥'], ['酉','戌']];
// Po
const ZHI_PO = [['子','酉'], ['丑','辰'], ['寅','亥'], ['卯','午'], ['巳','申'], ['未','戌']];
// Jue (Four Jue)
const ZHI_JUE = [['寅','酉'], ['卯','申'], ['午','亥'], ['子','巳']];

const ZHI_SAN_HE = [
    { branches: ['申','子','辰'], name: '三合水局' },
    { branches: ['亥','卯','未'], name: '三合木局' },
    { branches: ['寅','午','戌'], name: '三合火局' },
    { branches: ['巳','酉','丑'], name: '三合金局' }
];
const ZHI_SAN_HUI = [
    { branches: ['亥','子','丑'], name: '三会水局' },
    { branches: ['寅','卯','辰'], name: '三会木局' },
    { branches: ['巳','午','未'], name: '三会火局' },
    { branches: ['申','酉','戌'], name: '三会金局' }
];
const ZHI_SAN_XING = [
    { branches: ['寅','巳','申'], name: '寅巳申三刑' },
    { branches: ['丑','未','戌'], name: '丑未戌三刑' }
];
const ZHI_ZI_XING = ['辰','午','酉','亥'];
const MU_KU_MAP: Record<string, string> = {
    '辰': '水库', '戌': '火库', '丑': '金库', '未': '木库'
};

export const getJieDate = (year: number, jieIndex: number): number => {
    const y = year % 100;
    const jie = JIE_CONSTANTS[jieIndex];
    const day = Math.floor((y * 0.2422) + jie.c) - Math.floor(y / 4);
    return day;
};

const getGanZhi = (offset: number) => ({
    gan: HEAVENLY_STEMS[offset % 10],
    zhi: EARTHLY_BRANCHES[offset % 12]
});

export const getGanZhiIndex = (gan: string, zhi: string): number => {
    for(let i=0; i<60; i++) {
        const p = getGanZhi(i);
        if(p.gan === gan && p.zhi === zhi) return i;
    }
    return -1;
};

const getTenGod = (dayStem: string, targetStem: string): string => {
    if (!dayStem || !targetStem || dayStem === '?' || targetStem === '?') return '';
    const dIdx = HEAVENLY_STEMS.indexOf(dayStem);
    const tIdx = HEAVENLY_STEMS.indexOf(targetStem);
    if (dIdx === -1 || tIdx === -1) return '';

    const dElem = Math.floor(dIdx / 2);
    const tElem = Math.floor(tIdx / 2);
    const relation = (tElem - dElem + 5) % 5;
    const samePolarity = (dIdx % 2) === (tIdx % 2);
    
    if (relation === 0) return samePolarity ? '比肩' : '劫财';
    if (relation === 1) return samePolarity ? '食神' : '伤官';
    if (relation === 2) return samePolarity ? '偏财' : '正财';
    if (relation === 3) return samePolarity ? '七杀' : '正官';
    if (relation === 4) return samePolarity ? '偏印' : '正印';
    return '';
};

const getBranchTenGod = (dayStem: string, branch: string): string => {
    if (!branch || branch === '?') return '';
    const mainQi = HIDDEN_STEMS_MAP[branch]?.[0];
    if (!mainQi) return '';
    return getTenGod(dayStem, mainQi);
};

const wuHuDun = (yearStem: string, branch: string): string => {
    if (!yearStem || yearStem === '?' || !branch || branch === '?') return '?';
    const yearIdx = HEAVENLY_STEMS.indexOf(yearStem);
    if (yearIdx === -1) return '?';
    const startStemIdx = (yearIdx % 5) * 2 + 2; 
    const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
    let dist = branchIdx - 2; 
    if (dist < 0) dist += 12;
    return HEAVENLY_STEMS[(startStemIdx + dist) % 10];
};

const wuShuDun = (dayStem: string, hBranch: string): string => {
    if (!dayStem || dayStem === '?' || !hBranch || hBranch === '?') return '?';
    const dIdx = HEAVENLY_STEMS.indexOf(dayStem);
    if (dIdx === -1) return '?';
    const startIdx = (dIdx % 5) * 2; 
    const hIdx = EARTHLY_BRANCHES.indexOf(hBranch);
    return HEAVENLY_STEMS[(startIdx + hIdx) % 10];
};

const getXunKong = (stem: string, branch: string): string => {
    if (stem === '?' || branch === '?') return '';
    const sIdx = HEAVENLY_STEMS.indexOf(stem);
    const bIdx = EARTHLY_BRANCHES.indexOf(branch);
    if (sIdx === -1 || bIdx === -1) return '';
    const diff = (bIdx - sIdx + 12) % 12;
    
    if (diff === 0) return '戌亥';
    if (diff === 10) return '申酉';
    if (diff === 8) return '午未';
    if (diff === 6) return '辰巳';
    if (diff === 4) return '寅卯';
    if (diff === 2) return '子丑';
    return '';
};

const getZhangSheng = (dayStem: string, branch: string): string => {
    if (!dayStem || dayStem === '?' || !branch || branch === '?') return '';
    const startBranch = ZHANG_SHENG_START[dayStem];
    if (!startBranch) return '';
    const startIdx = EARTHLY_BRANCHES.indexOf(startBranch);
    const currentIdx = EARTHLY_BRANCHES.indexOf(branch);
    const stemIdx = HEAVENLY_STEMS.indexOf(dayStem);
    
    const isYang = stemIdx % 2 === 0;
    let offset;
    if (isYang) offset = (currentIdx - startIdx + 12) % 12;
    else offset = (startIdx - currentIdx + 12) % 12;
    return ZHANG_SHENG[offset];
};

const getShenSha = (gan: string, branch: string, yearBranch: string, dayBranch: string, dayStem: string, monthBranch: string): string[] => {
    if ([gan, branch, yearBranch, dayBranch, dayStem, monthBranch].some(x => x === '?' || !x)) return [];

    const list: string[] = [];
    const bIdx = EARTHLY_BRANCHES.indexOf(branch);
    const ybIdx = EARTHLY_BRANCHES.indexOf(yearBranch);
    const dbIdx = EARTHLY_BRANCHES.indexOf(dayBranch);
    
    if (bIdx === -1 || ybIdx === -1 || dbIdx === -1) return [];

    // Basic Shen Sha
    const checkTianYi = (stem: string) => {
        if (['甲', '戊', '庚'].includes(stem) && ['丑', '未'].includes(branch)) list.push('天乙');
        if (['乙', '己'].includes(stem) && ['子', '申'].includes(branch)) list.push('天乙');
        if (['丙', '丁'].includes(stem) && ['亥', '酉'].includes(branch)) list.push('天乙');
        if (['辛'].includes(stem) && ['午', '寅'].includes(branch)) list.push('天乙');
        if (['壬', '癸'].includes(stem) && ['巳', '卯'].includes(branch)) list.push('天乙');
    };
    checkTianYi(dayStem);
    if (gan && gan !== '?') checkTianYi(gan === dayStem ? '' : gan); 

    if (LU_MAP[dayStem] === branch) list.push('禄神');
    if (YANG_REN_MAP[dayStem] === branch) list.push('羊刃');
    
    // Yi Ma, Tao Hua, etc.
    const checkTaoHua = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 9) list.push('桃花');
        if ([2, 6, 10].includes(refIdx) && bIdx === 3) list.push('桃花');
        if ([5, 9, 1].includes(refIdx) && bIdx === 6) list.push('桃花');
        if ([11, 3, 7].includes(refIdx) && bIdx === 0) list.push('桃花');
    };
    checkTaoHua(ybIdx);
    checkTaoHua(dbIdx);

    const checkYiMa = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 2) list.push('驿马');
        if ([2, 6, 10].includes(refIdx) && bIdx === 8) list.push('驿马');
        if ([5, 9, 1].includes(refIdx) && bIdx === 11) list.push('驿马');
        if ([11, 3, 7].includes(refIdx) && bIdx === 5) list.push('驿马');
    };
    checkYiMa(ybIdx);
    checkYiMa(dbIdx);

    const checkHuaGai = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 4) list.push('华盖');
        if ([2, 6, 10].includes(refIdx) && bIdx === 10) list.push('华盖');
        if ([5, 9, 1].includes(refIdx) && bIdx === 1) list.push('华盖');
        if ([11, 3, 7].includes(refIdx) && bIdx === 7) list.push('华盖');
    };
    checkHuaGai(ybIdx);
    checkHuaGai(dbIdx);

    return [...new Set(list)];
};

// --- Tiao Hou (Climate) Logic ---
const getTiaoHou = (dayMaster: string, monthBranch: string): { status: string, advice: string, detail: string } => {
    const mbIdx = EARTHLY_BRANCHES.indexOf(monthBranch);
    
    if ([11, 0, 1].includes(mbIdx)) { // Winter
        return {
            status: '寒',
            advice: '喜火暖局',
            detail: '生于冬季，天寒地冻，首重调候，宜见丙火/丁火/巳/午以解冻除寒。'
        };
    } else if ([5, 6, 7].includes(mbIdx)) { // Summer
        return {
            status: '燥',
            advice: '喜水润局',
            detail: '生于夏季，火炎土燥，首重调候，宜见壬水/癸水/亥/子以滋润降燥。'
        };
    } else if (mbIdx === 2) { // Yin (Early Spring)
        return {
            status: '寒余',
            advice: '略喜火',
            detail: '生于孟春，余寒未尽，可酌情见火以发荣。'
        };
    }
    
    return { status: '平', advice: '无需刻意调候', detail: '气候适中，以扶抑/通关为主。' };
};

// --- Wu Xing Flow Logic ---
const getWuXingFlow = (stems: string[], branches: string[]): string => {
    const counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    stems.forEach(s => {
        if(s && s !== '?') counts[ELEMENTS[HEAVENLY_STEMS.indexOf(s)] as keyof typeof counts]++;
    });
    branches.forEach(b => {
        if(b && b !== '?') counts[BRANCH_ELEMENTS[EARTHLY_BRANCHES.indexOf(b)] as keyof typeof counts]++;
    });

    const present = Object.keys(counts).filter(e => counts[e as keyof typeof counts] > 0);
    
    // Check specific flows
    const pairs = [
        { from: '水', to: '木' }, { from: '木', to: '火' }, { from: '火', to: '土' },
        { from: '土', to: '金' }, { from: '金', to: '水' }
    ];
    
    const flows = pairs.filter(p => present.includes(p.from) && present.includes(p.to));
    if (flows.length === 0) return '五行之气也偏枯，流通受阻。';
    
    // Describe sequence
    let desc = flows.map(f => `${f.from}生${f.to}`).join('，');
    
    if (flows.length >= 4) return `五行流通极佳，生生不息 (${desc})。`;
    if (flows.length >= 2) return `五行有情，气势顺遂 (${desc})。`;
    return `五行流通一般 (${desc})。`;
};

// --- Wuyun Liuqi Calculation ---
const getWuyunLiuqi = (yearStem: string, yearBranch: string): WuyunLiuqi => {
    const stemIdx = HEAVENLY_STEMS.indexOf(yearStem);
    const isYang = stemIdx % 2 === 0;
    
    let daYun = '';
    let yunQi = '';
    
    if (['甲', '己'].includes(yearStem)) { daYun = isYang ? '土运太过 (雨湿流行)' : '土运不及 (风乃大行)'; yunQi = '土'; }
    else if (['乙', '庚'].includes(yearStem)) { daYun = isYang ? '金运太过 (燥气流行)' : '金运不及 (炎火乃行)'; yunQi = '金'; }
    else if (['丙', '辛'].includes(yearStem)) { daYun = isYang ? '水运太过 (寒气流行)' : '水运不及 (湿乃大行)'; yunQi = '水'; }
    else if (['丁', '壬'].includes(yearStem)) { daYun = isYang ? '木运太过 (风气流行)' : '木运不及 (燥乃大行)'; yunQi = '木'; }
    else if (['戊', '癸'].includes(yearStem)) { daYun = isYang ? '火运太过 (炎暑流行)' : '火运不及 (寒乃大行)'; yunQi = '火'; }

    const branchMap: Record<string, string> = {
        '子': '少阴君火', '午': '少阴君火',
        '丑': '太阴湿土', '未': '太阴湿土',
        '寅': '少阳相火', '申': '少阳相火',
        '卯': '阳明燥金', '酉': '阳明燥金',
        '辰': '太阳寒水', '戌': '太阳寒水',
        '巳': '厥阴风木', '亥': '厥阴风木'
    };
    
    const siTian = branchMap[yearBranch] || '';
    
    const zaiQuanMap: Record<string, string> = {
        '少阴君火': '阳明燥金',
        '太阴湿土': '太阳寒水',
        '少阳相火': '厥阴风木',
        '阳明燥金': '少阴君火',
        '太阳寒水': '太阴湿土',
        '厥阴风木': '少阳相火'
    };
    const zaiQuan = zaiQuanMap[siTian] || '';

    return {
        daYun,
        yunQi,
        siTian,
        zaiQuan,
        description: `${daYun}，上半年${siTian}司天，下半年${zaiQuan}在泉。`
    };
};

// --- TCM Profile Calculation ---
const getTCMProfile = (stems: string[], branches: string[]): TCMProfile => {
    const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    stems.forEach(s => {
        if(s && s !== '?') {
            const idx = HEAVENLY_STEMS.indexOf(s);
            if (idx >= 0) counts[ELEMENTS[idx]]++;
        }
    });
    branches.forEach(b => {
        if(b && b !== '?') {
            const idx = EARTHLY_BRANCHES.indexOf(b);
            if (idx >= 0) counts[BRANCH_ELEMENTS[idx]]++;
        }
    });

    const excess: string[] = [];
    const deficient: string[] = [];
    const organRisk: string[] = [];

    Object.keys(counts).forEach(k => {
        if (counts[k] >= 3) excess.push(k);
        if (counts[k] === 0) deficient.push(k);
    });

    const organMap: Record<string, string> = {
        '木': '肝胆',
        '火': '心小肠',
        '土': '脾胃',
        '金': '肺大肠',
        '水': '肾膀胱'
    };

    excess.forEach(e => organRisk.push(`${organMap[e]}太过`));
    deficient.forEach(e => organRisk.push(`${organMap[e]}不及`));

    let constitution = '平和质';
    let advice = '五行基本平衡，注意饮食起居规律即可。';

    const hasExcess = (e: string) => excess.includes(e);
    const hasDeficient = (e: string) => deficient.includes(e);

    if (hasExcess('水') && hasDeficient('火')) {
        constitution = '阳虚质';
        advice = '阳气不足，畏寒怕冷。宜温补阳气，少食生冷寒凉，注意保暖。';
    } else if (hasExcess('火') && hasDeficient('水')) {
        constitution = '阴虚质';
        advice = '阴液亏少，口干舌燥。宜滋阴降火，多食甘凉滋润之物，忌辛辣。';
    } else if (hasExcess('土')) {
        constitution = '痰湿质';
        advice = '湿浊内蕴，身重易倦。宜健脾利湿，饮食清淡，坚持运动。';
    } else if (hasDeficient('土')) {
        constitution = '气虚质';
        advice = '元气不足，乏力气短。宜益气健脾，规律饮食，避免过劳。';
    } else if (hasExcess('木')) {
        constitution = '气郁质';
        advice = '气机郁滞，神情抑郁。宜疏肝解郁，调节心情，多参加社交活动。';
    } else if (hasExcess('火') && hasExcess('土') && (hasDeficient('金') || hasDeficient('水'))) {
        constitution = '湿热质';
        advice = '宜清热利湿，少烟酒，忌辛辣燥热食物。';
    }
    
    if (organRisk.length > 0 && constitution === '平和质') {
        constitution = '偏颇质';
        advice = '五行有偏，建议针对具体脏腑进行调理。';
    }

    return {
        constitution,
        excess,
        deficient,
        organRisk,
        advice
    };
};

// --- Mangpai / Blind Man Logic ---
const getMangpaiInfo = (stem: string, branch: string, pillarIndex: number, allBranches: string[], dayMaster: string): MangpaiInfo => {
    // Safety Check
    if (stem === '?' || branch === '?' || !branch) {
        return { scope: '主', strength: '虚', roots: [], huTong: [], specialGods: [] };
    }

    // 1. Scope (Home vs Outside)
    // Year(0) / Month(1) = Outside (Bin)
    // Day(2) / Hour(3) = Home (Zhu)
    const scope = (pillarIndex === 0 || pillarIndex === 1) ? '宾' : '主';

    // 2. Root Seeking (Roots)
    const possibleRoots = ROOTS_MAP[stem] || [];
    const foundRoots: string[] = [];
    const branchNames = ['年', '月', '日', '时'];
    
    allBranches.forEach((b, idx) => {
        if (possibleRoots.includes(b) && b !== '?') {
            foundRoots.push(`${branchNames[idx]}(${b})`);
        }
    });

    // 3. Solidity (Shi/Xu)
    const isSolid = foundRoots.length > 0;

    // 4. Interconnection (Hu Tong) - Lu
    const luBranch = LU_MAP[stem];
    const huTong: string[] = [];
    if (luBranch) {
        allBranches.forEach((b, idx) => {
            if (b === luBranch) {
                huTong.push(`${branchNames[idx]}(${b})`);
            }
        });
    }
    
    // 5. Special Gods (Lu / Yang Ren)
    const specialGods: string[] = [];
    if (dayMaster && dayMaster !== '?') {
        if (LU_MAP[dayMaster] === branch) specialGods.push('禄神');
        if (YANG_REN_MAP[dayMaster] === branch) specialGods.push('羊刃');
    }

    return {
        scope,
        strength: isSolid ? '实' : '虚',
        roots: foundRoots,
        huTong,
        specialGods
    };
};

// --- Updated: Interactions Calculation ---
export const calculateInteractions = (
    pillars: {gan: string, zhi: string, name: string}[]
): Interaction[] => {
    const results: Interaction[] = [];
    
    // Filter out unknown pillars
    const validPillars = pillars.filter(p => p.gan !== '?' && p.zhi !== '?' && p.gan && p.zhi);

    const hasPair = (a: string, b: string, pairList: string[][]) => {
        return pairList.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    };

    // 1. Pairwise Interactions
    for (let i = 0; i < validPillars.length; i++) {
        for (let j = i + 1; j < validPillars.length; j++) {
            const p1 = validPillars[i];
            const p2 = validPillars[j];
            const pNames = [p1.name, p2.name];
            
            // Gan He
            if (hasPair(p1.gan, p2.gan, GAN_HE)) {
                results.push({ type: '天干五合', label: `${p1.gan}${p2.gan}合`, pillars: pNames, description: `${p1.name}${p1.gan}与${p2.name}${p2.gan}相合`, severity: 'good' });
            }
            // Gan Chong
            if (hasPair(p1.gan, p2.gan, GAN_CHONG)) {
                results.push({ type: '天干相冲', label: `${p1.gan}${p2.gan}冲`, pillars: pNames, description: `${p1.name}${p1.gan}与${p2.name}${p2.gan}相冲`, severity: 'bad' });
            }

            // Zhi Liu He
            if (hasPair(p1.zhi, p2.zhi, ZHI_LIU_HE)) {
                results.push({ type: '地支六合', label: `${p1.zhi}${p2.zhi}合`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}六合`, severity: 'good' });
            }
            // Zhi Liu Chong
            if (hasPair(p1.zhi, p2.zhi, ZHI_LIU_CHONG)) {
                results.push({ type: '地支六冲', label: `${p1.zhi}${p2.zhi}冲`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}六冲`, severity: 'bad' });
            }
            // Zhi Chuan (Hai)
            if (hasPair(p1.zhi, p2.zhi, ZHI_CHUAN)) {
                results.push({ type: '地支相穿', label: `${p1.zhi}${p2.zhi}穿`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相害(穿)`, severity: 'bad' });
            }
            // Zhi Po
            if (hasPair(p1.zhi, p2.zhi, ZHI_PO)) {
                results.push({ type: '地支相破', label: `${p1.zhi}${p2.zhi}破`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相破`, severity: 'neutral' });
            }
            // Zhi Jue
            if (hasPair(p1.zhi, p2.zhi, ZHI_JUE)) {
                results.push({ type: '地支相绝', label: `${p1.zhi}${p2.zhi}绝`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相绝`, severity: 'bad' });
            }
            // Zi Xing
            if (p1.zhi === p2.zhi && ZHI_ZI_XING.includes(p1.zhi)) {
                results.push({ type: '自刑', label: `${p1.zhi}${p2.zhi}自刑`, pillars: pNames, description: `${p1.name}与${p2.name} ${p1.zhi}自刑`, severity: 'bad' });
            }
            // Tian Ke Di Chong
            const isGanChong = hasPair(p1.gan, p2.gan, GAN_CHONG); 
            const isZhiChong = hasPair(p1.zhi, p2.zhi, ZHI_LIU_CHONG);
            if (isGanChong && isZhiChong) {
                results.push({ type: '天克地冲', label: `${p1.gan}${p1.zhi} vs ${p2.gan}${p2.zhi}`, pillars: pNames, description: `${p1.name}与${p2.name} 天克地冲`, severity: 'bad' });
            }
            
            // Tian He Di He
            const isGanHe = hasPair(p1.gan, p2.gan, GAN_HE);
            const isZhiHe = hasPair(p1.zhi, p2.zhi, ZHI_LIU_HE);
            if (isGanHe && isZhiHe) {
                results.push({ type: '天合地合', label: `${p1.gan}${p1.zhi} - ${p2.gan}${p2.zhi}`, pillars: pNames, description: `${p1.name}与${p2.name} 天合地合`, severity: 'good' });
            }
        }
    }

    // 2. Global / Multi-branch Interactions
    const branches = validPillars.map(p => p.zhi);
    const branchSet = new Set(branches);

    // San He
    ZHI_SAN_HE.forEach(item => {
        if (item.branches.every(b => branchSet.has(b))) {
            const contributors = validPillars.filter(p => item.branches.includes(p.zhi)).map(p => p.name);
            const uniqueContributors = [...new Set(contributors)];
            results.push({ type: '三合局', label: item.name, pillars: uniqueContributors, description: `地支(${uniqueContributors.join('+')})成${item.name}`, severity: 'good' });
        }
    });
    
    // San Hui
    ZHI_SAN_HUI.forEach(item => {
        if (item.branches.every(b => branchSet.has(b))) {
             const contributors = validPillars.filter(p => item.branches.includes(p.zhi)).map(p => p.name);
             const uniqueContributors = [...new Set(contributors)];
             results.push({ type: '三会局', label: item.name, pillars: uniqueContributors, description: `地支(${uniqueContributors.join('+')})成${item.name}`, severity: 'good' });
        }
    });

    // San Xing (Trios)
    ZHI_SAN_XING.forEach(item => {
        if (item.branches.every(b => branchSet.has(b))) {
             const contributors = validPillars.filter(p => item.branches.includes(p.zhi)).map(p => p.name);
             const uniqueContributors = [...new Set(contributors)];
             results.push({ type: '三刑', label: item.name, pillars: uniqueContributors, description: `地支(${uniqueContributors.join('+')})成${item.name}`, severity: 'bad' });
        }
    });

    const tombs = validPillars.filter(p => MU_KU_MAP[p.zhi]);
    const tombGroups: Record<string, string[]> = {};
    tombs.forEach(t => {
        if(!tombGroups[t.zhi]) tombGroups[t.zhi] = [];
        tombGroups[t.zhi].push(t.name);
    });
    Object.keys(tombGroups).forEach(t => {
        const names = tombGroups[t];
        results.push({ type: '墓库', label: `${t}(${MU_KU_MAP[t]})`, pillars: names, description: `${names.join(',')} 见${t}为${MU_KU_MAP[t]}`, severity: 'neutral' });
    });

    return results;
};

const createPillar = (
    gan: string, 
    zhi: string, 
    dayStem: string, 
    yearBranch: string, 
    dayBranch: string, 
    monthBranch: string, 
    yearKWBranches: string[],
    dayKWBranches: string[],
    allBranches?: string[], // Optional: pass all branches for Mangpai analysis
    pillarIndex?: number // Optional: 0-3
): Pillar => {
    // Handle Unknown Pillar
    if (gan === '?' || zhi === '?') {
        return { 
            gan: '?', 
            zhi: '?', 
            wuxing: '?', 
            canggan: [], 
            shishen: '', 
            cangganTenGods: [], 
            zhangsheng: '', 
            zizuo: '',
            nayin: '', 
            shensha: [], 
            xunKong: '',
            kongwang: '',
            isKongWang: false,
            kwType: '',
            mangpai: { scope: (pillarIndex === 0 || pillarIndex === 1) ? '宾' : '主', strength: '虚', roots: [], huTong: [], specialGods: [] }
        };
    }

    const canggan = HIDDEN_STEMS_MAP[zhi] || [];
    const shishen = dayStem ? getTenGod(dayStem, gan) : '日主';
    const cangganTenGods = dayStem ? canggan.map(cg => getTenGod(dayStem, cg)) : [];
    const zhangsheng = dayStem ? getZhangSheng(dayStem, zhi) : '';
    const zizuo = getZhangSheng(gan, zhi);
    const nayin = NAYIN_MAP[`${gan}${zhi}`] || '';
    const shensha = dayStem ? getShenSha(gan, zhi, yearBranch, dayBranch, dayStem, monthBranch) : [];
    const xunKong = getXunKong(gan, zhi);

    const isYearKW = yearKWBranches.includes(zhi);
    const isDayKW = dayKWBranches.includes(zhi);
    
    let kwType: '年空' | '日空' | '双空' | '' = '';
    if (isYearKW && isDayKW) kwType = '双空';
    else if (isYearKW) kwType = '年空';
    else if (isDayKW) kwType = '日空';

    let mangpai: MangpaiInfo | undefined;
    if (allBranches && pillarIndex !== undefined) {
        mangpai = getMangpaiInfo(gan, zhi, pillarIndex, allBranches, dayStem);
    }

    return { 
        gan, 
        zhi, 
        wuxing: HEAVENLY_STEMS.indexOf(gan) > -1 ? ELEMENTS[HEAVENLY_STEMS.indexOf(gan)] : '', 
        canggan, 
        shishen, 
        cangganTenGods, 
        zhangsheng, 
        zizuo,
        nayin, 
        shensha, 
        xunKong,
        kongwang: kwType,
        isKongWang: !!kwType,
        kwType,
        mangpai
    };
};

const calcLiuYueList = (year: number, dayMaster: string): LiuYue[] => {
    const yearOffset = (year - 1984) % 60;
    const adjYearOffset = yearOffset < 0 ? yearOffset + 60 : yearOffset;
    const yearStem = HEAVENLY_STEMS[adjYearOffset % 10];
    const list: LiuYue[] = [];
    
    for(let m=0; m<12; m++) {
        const branchIdx = (m + 2) % 12; 
        const branch = EARTHLY_BRANCHES[branchIdx];
        const stem = wuHuDun(yearStem, branch);
        const shishen = getTenGod(dayMaster, stem);
        const zhiShishen = getBranchTenGod(dayMaster, branch);
        
        let jieIdx = (m + 1) % 12;
        let jieYear = year;
        if (m === 11) {
            jieIdx = 0;
            jieYear = year + 1;
        }
        
        const jieDay = getJieDate(jieYear, jieIdx);
        const jieMonth = JIE_CONSTANTS[jieIdx].month + 1;
        const jieName = JIE_CONSTANTS[jieIdx].name;
        
        list.push({
            month: m + 1,
            gan: stem,
            zhi: branch,
            shishen,
            zhiShishen,
            jieQi: {
                name: jieName,
                dateStr: `${jieMonth}月${jieDay}日`,
                fullDate: `${jieYear}/${jieMonth}/${jieDay}`
            }
        });
    }
    return list;
};

const calcLiuNianList = (startYear: number, startAge: number, count: number, dayMaster: string, yearBranch: string, dayBranch: string, monthBranch: string): LiuNian[] => {
    const list: LiuNian[] = [];
    for(let i=0; i<count; i++) {
        const y = startYear + i;
        const age = Math.floor(startAge) + i;
        const offset = (y - 1984) % 60;
        const idx = offset < 0 ? offset + 60 : offset;
        const { gan, zhi } = getGanZhi(idx);
        
        const nayin = NAYIN_MAP[`${gan}${zhi}`] || '';
        const shishen = getTenGod(dayMaster, gan);
        const zhiShishen = getBranchTenGod(dayMaster, zhi);
        const shensha = getShenSha(gan, zhi, yearBranch, dayBranch, dayMaster, monthBranch);
        const liuYue = calcLiuYueList(y, dayMaster);

        list.push({
            year: y,
            age,
            gan,
            zhi,
            nayin,
            shishen,
            zhiShishen,
            shensha,
            liuYue
        });
    }
    return list;
};

const calcXiaoYun = (
    gender: Gender, 
    yearGan: string, 
    hourPillar: {gan: string, zhi: string}, 
    startYear: number, 
    qiyunAge: number,
    dayMaster: string, yearBranch: string, dayBranch: string, monthZhi: string
): LuckPillar => {
    const yearsBeforeLuck = Math.floor(qiyunAge);
    const gapList = calcLiuNianList(startYear, 1, yearsBeforeLuck, dayMaster, yearBranch, dayBranch, monthZhi);
    
    return {
        gan: '小', 
        zhi: '运',
        startAge: 1,
        startYear: startYear,
        endYear: startYear + yearsBeforeLuck - 1,
        startAgeText: '1岁',
        nayin: '',
        shishen: '',
        zhiShishen: '',
        zhangsheng: '',
        liuNian: gapList,
        isSmallLuck: true
    };
};

export const convertLunarToSolar = (year: number, month: number, day: number, isLeap: boolean = false): string => {
    if (typeof (window as any).Lunar === 'undefined') return '';
    try {
        const lunar = (window as any).Lunar.fromYmd(year, month, day);
        const solar = lunar.getSolar();
        return solar.toString(); // YYYY-MM-DD
    } catch (e) {
        console.error('Lunar convert error', e);
        return '';
    }
};

export const calculateAllPillars = (dateString: string, timeString: string, gender: Gender, isLunar: boolean = false, isUnknownTime: boolean = false, lunarLeap: boolean = false): BaziResult => {
    let d: Date;
    let lunarStr = '';

    if (isLunar) {
        const [y, m, day] = dateString.split('-').map(Number);
        const solarStr = convertLunarToSolar(y, m, day, lunarLeap);
        d = new Date(solarStr);
        lunarStr = `农历 ${y}年${lunarLeap?'闰':''}${m}月${day}日`;
    } else {
        d = new Date(dateString);
        // Try to get Lunar string if library exists
        if (typeof (window as any).Solar !== 'undefined') {
             const [y, m, day] = dateString.split('-').map(Number);
             const solar = (window as any).Solar.fromYmd(y, m, day);
             const lunar = solar.getLunar();
             lunarStr = `农历 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
        }
    }

    let hours = 12;
    let minutes = 0;
    if (!isUnknownTime) {
        const [h, m] = timeString.split(':').map(Number);
        hours = h;
        minutes = m;
    }
    d.setHours(hours, minutes);

    const yearNum = d.getFullYear();
    const liChunDay = getJieDate(yearNum, 1); 
    const liChunDate = new Date(yearNum, 1, liChunDay, 12, 0, 0);
    let baziYear = yearNum;
    if (d < liChunDate) baziYear--;
    
    let yearOffset = (baziYear - 1984) % 60;
    if (yearOffset < 0) yearOffset += 60;
    const yearGZ = getGanZhi(yearOffset);

    let currentJieIndex = -1;
    const terms = JIE_CONSTANTS.map((j, idx) => {
       return { ...j, idx, date: new Date(yearNum, j.month, getJieDate(yearNum, idx), 12, 0, 0) };
    }).sort((a,b) => a.date.getTime() - b.date.getTime());

    for(let i=0; i<terms.length; i++) {
        if (d >= terms[i].date) currentJieIndex = terms[i].idx;
        else break;
    }

    let monthZhiIdx;
    if (currentJieIndex === -1) monthZhiIdx = 0; 
    else monthZhiIdx = (currentJieIndex + 1) % 12;
    
    const monthZhi = EARTHLY_BRANCHES[monthZhiIdx];
    const monthGan = wuHuDun(yearGZ.gan, monthZhi);

    const utcCurrent = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    const utcBase = Date.UTC(2000, 0, 1);
    const diffDays = Math.floor((utcCurrent - utcBase) / (86400000));
    let dayOffset = (54 + diffDays) % 60; 
    if (dayOffset < 0) dayOffset += 60;
    const dayGZ = getGanZhi(dayOffset);
    const dayMaster = dayGZ.gan;

    let hourGan = '?', hourZhi = '?';
    if (!isUnknownTime) {
        let hBranchIdx = 0;
        if (hours >= 23 || hours < 1) hBranchIdx = 0; 
        else hBranchIdx = Math.floor((hours + 1) / 2) % 12;
        hourZhi = EARTHLY_BRANCHES[hBranchIdx];
        hourGan = wuShuDun(dayMaster, hourZhi);
    }

    const yearXun = getXunKong(yearGZ.gan, yearGZ.zhi);
    const dayXun = getXunKong(dayGZ.gan, dayGZ.zhi);
    
    const splitKW = (str: string) => str.split('');
    const yearKWBranches = splitKW(yearXun);
    const dayKWBranches = splitKW(dayXun);
    const kwInfo = `年空[${yearXun}] 日空[${dayXun}]`;

    // All Branches for Mangpai analysis
    const allBranches = [yearGZ.zhi, monthZhi, dayGZ.zhi, hourZhi];
    const allStems = [yearGZ.gan, monthGan, dayGZ.gan, hourGan];

    const yearPillar = createPillar(yearGZ.gan, yearGZ.zhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 0);
    const monthPillar = createPillar(monthGan, monthZhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 1);
    const dayPillar = createPillar(dayGZ.gan, dayGZ.zhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 2);
    const hourPillar = createPillar(hourGan, hourZhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 3);
    
    // Original Chart Interactions
    const interactions = calculateInteractions([
        { name: '年', gan: yearGZ.gan, zhi: yearGZ.zhi },
        { name: '月', gan: monthGan, zhi: monthZhi },
        { name: '日', gan: dayGZ.gan, zhi: dayGZ.zhi },
        { name: '时', gan: hourGan, zhi: hourZhi }
    ]);

    // Advanced Analysis
    const tiaoHou = getTiaoHou(dayMaster, monthZhi);
    const wuXingFlow = getWuXingFlow(allStems, allBranches);
    const wuyunLiuqi = getWuyunLiuqi(yearGZ.gan, yearGZ.zhi);
    const tcmProfile = getTCMProfile(allStems, allBranches);

    const mgIdx = HEAVENLY_STEMS.indexOf(monthGan);
    const tGan = HEAVENLY_STEMS[(mgIdx + 1) % 10];
    const tZhi = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf(monthZhi) + 3) % 12];
    const realTaiYuan = createPillar(tGan, tZhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches);

    const getOrderForGong = (zhi: string) => {
        const idx = EARTHLY_BRANCHES.indexOf(zhi);
        if (idx === -1) return 0;
        return idx >= 2 ? idx - 1 : idx + 11; 
    };
    const mapOrderToBranch = (order: number) => {
         let bi = order === 11 ? 0 : (order === 12 ? 1 : order + 1);
         return EARTHLY_BRANCHES[bi];
    };

    const calcGong = (isMing: boolean) => {
        if (isUnknownTime) return createPillar('?', '?', dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, [], []);
        
        const mVal = getOrderForGong(monthZhi);
        const hVal = getOrderForGong(hourZhi);
        let sum;
        if (isMing) {
            sum = 14 - (mVal + hVal);
        } else {
            sum = mVal + hVal - 2; 
        }
        
        while (sum <= 0) sum += 12;
        while (sum > 12) sum -= 12;
        const b = mapOrderToBranch(sum);
        return createPillar(wuHuDun(yearGZ.gan, b), b, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches);
    };

    const minggong = calcGong(true);
    const shengong = calcGong(false);

    const yearGanIdx = HEAVENLY_STEMS.indexOf(yearGZ.gan);
    const yearIsYang = yearGanIdx % 2 === 0;
    const isMale = gender === Gender.MALE;
    let forward = (isMale && yearIsYang) || (!isMale && !yearIsYang);

    let termTerms = [];
    for (let y = yearNum - 1; y <= yearNum + 1; y++) {
        for (let i = 0; i < 12; i++) {
            termTerms.push({ time: new Date(y, JIE_CONSTANTS[i].month, getJieDate(y, i), 12, 0, 0).getTime(), name: JIE_CONSTANTS[i].name });
        }
    }
    termTerms.sort((a,b) => a.time - b.time);
    const nowTime = d.getTime();
    let prevTerm = termTerms[0], nextTerm = termTerms[termTerms.length-1];
    for(let i=0; i<termTerms.length-1; i++){
        if(termTerms[i].time <= nowTime && termTerms[i+1].time > nowTime) {
            prevTerm = termTerms[i];
            nextTerm = termTerms[i+1];
            break;
        }
    }

    const diffMs = forward ? (nextTerm.time - nowTime) : (nowTime - prevTerm.time);
    const diffMins = Math.floor(diffMs / 60000);
    const years = Math.floor(diffMins / 4320);
    const rem1 = diffMins % 4320;
    const months = Math.floor(rem1 / 360);
    const rem2 = rem1 % 360;
    const days = Math.floor(rem2 / 12);
    
    const qiyunAge = years + (months/12) + (days/365);
    const firstLuckYear = yearNum + years + (months > 6 ? 1 : 0);
    
    const qiyunDetail = `${years}岁${months}个月${days}天起运`;
    const distanceText = forward 
        ? `顺行 | 下个节气：${nextTerm.name} | 距 ${Math.floor(diffMins/1440)}天`
        : `逆行 | 上个节气：${prevTerm.name} | 距 ${Math.floor(diffMins/1440)}天`;

    let smallLuck = null;
    if ((years > 0 || months > 0) && !isUnknownTime) {
         smallLuck = calcXiaoYun(gender, yearGZ.gan, {gan: hourGan, zhi: hourZhi}, baziYear, qiyunAge, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi);
    }

    const luckPillars: LuckPillar[] = [];
    let startOffset = 0;
    for(let i=0; i<60; i++) {
        if (HEAVENLY_STEMS[i%10] === monthGan && EARTHLY_BRANCHES[i%12] === monthZhi) {
            startOffset = i;
            break;
        }
    }

    // Extended Luck Pillars to 12 (approx 120 years)
    for(let i=1; i<=12; i++) {
        let offset = forward ? (startOffset + i) : (startOffset - i);
        if (offset < 0) offset += 60;
        offset = offset % 60;
        
        const p = getGanZhi(offset);
        const stem = p.gan;
        const branch = p.zhi;
        const nayin = NAYIN_MAP[`${stem}${branch}`] || '';
        const shishen = getTenGod(dayMaster, stem);
        const zhiShishen = getBranchTenGod(dayMaster, branch);
        const zhangsheng = getZhangSheng(dayMaster, branch);
        
        const lpStartYear = firstLuckYear + ((i-1) * 10);
        const lpStartAge = Math.floor(years + 1 + (i-1)*10);

        const liuNian = calcLiuNianList(lpStartYear, lpStartAge, 10, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi);

        luckPillars.push({
            gan: stem,
            zhi: branch,
            startAge: lpStartAge,
            startYear: lpStartYear,
            endYear: lpStartYear + 9,
            startAgeText: `${lpStartAge}岁`,
            nayin,
            shishen,
            zhiShishen,
            zhangsheng,
            liuNian
        });
    }

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
        taiyuan: realTaiYuan,
        minggong,
        shengong,
        luckPillars,
        smallLuck,
        solarTermDistance: distanceText,
        qiyunDetail,
        kongwangInfo: kwInfo,
        yearKongWang: yearKWBranches,
        dayKongWang: dayKWBranches,
        gender,
        dayMaster,
        solarDate: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${isUnknownTime ? '吉时' : `${hours}:${minutes.toString().padStart(2, '0')}`}`,
        lunarDateString: lunarStr,
        interactions,
        tiaoHou,
        wuXingFlow,
        wuyunLiuqi,
        tcmProfile
    };
};

// --- Reverse Bazi Lookup ---
export const findDatesFromPillars = (
    yearGanZhi: string, 
    monthGanZhi: string, 
    dayGanZhi: string, 
    hourGanZhi: string,
    startYear: number = 1900, 
    endYear: number = 2099    
): ReverseResult[] => {
    const results: ReverseResult[] = [];
    
    // Parse inputs
    const yearGan = yearGanZhi[0], yearZhi = yearGanZhi[1];
    const monthGan = monthGanZhi[0], monthZhi = monthGanZhi[1];
    const dayGan = dayGanZhi[0], dayZhi = dayGanZhi[1];
    const hourGan = hourGanZhi[0], hourZhi = hourGanZhi[1];

    for(let y = startYear; y <= endYear; y++) {
        const yOffset = (y - 1984) % 60;
        const yIdx = yOffset < 0 ? yOffset + 60 : yOffset;
        const p = getGanZhi(yIdx);
        
        // 1. Check Year Pillar
        if (p.gan !== yearGan || p.zhi !== yearZhi) continue;

        // 2. Check Month Pillar (Based on Wu Hu Dun, Month Gan is derived from Year Gan)
        // We only need to check if the requested Month GanZhi is valid for this year
        const mZhiIdx = EARTHLY_BRANCHES.indexOf(monthZhi);
        const mGanDerived = wuHuDun(yearGan, monthZhi);
        if (mGanDerived !== monthGan) continue; // The requested month pillar is impossible for this year

        let jieIndex = -1;
        // Map Month Branch Index to JIE index: Zi(0)->DaXue(11), Chou(1)->XiaoHan(0), Yin(2)->LiChun(1)...
        if (mZhiIdx === 0) jieIndex = 11;
        else if (mZhiIdx === 1) jieIndex = 0;
        else jieIndex = mZhiIdx - 1;

        const startDay = getJieDate(y, jieIndex);
        const startMonth = JIE_CONSTANTS[jieIndex].month; // 0-11
        
        const startDate = new Date(y, startMonth, startDay, 12, 0, 0);
        
        // End date is next term
        const nextJieIndex = (jieIndex + 1) % 12;
        let nextYear = y;
        if (jieIndex === 11) nextYear = y + 1;
        const nextDay = getJieDate(nextYear, nextJieIndex);
        const nextMonth = JIE_CONSTANTS[nextJieIndex].month;
        const endDate = new Date(nextYear, nextMonth, nextDay, 12, 0, 0);

        // 3. Iterate days in this solar month
        for(let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
            // Check Day Pillar
            const utcCurrent = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
            const utcBase = Date.UTC(2000, 0, 1);
            const diffDays = Math.floor((utcCurrent - utcBase) / (86400000));
            let dOffset = (54 + diffDays) % 60; 
            if (dOffset < 0) dOffset += 60;
            const dGZ = getGanZhi(dOffset);
            
            if (dGZ.gan === dayGan && dGZ.zhi === dayZhi) {
                // 4. Check Hour Pillar
                const hZhiIdx = EARTHLY_BRANCHES.indexOf(hourZhi);
                const hGanDerived = wuShuDun(dayGan, hourZhi);
                
                if (hGanDerived === hourGan) {
                    // Hour ranges mapping
                    const hoursMap = [
                        "23:00-01:00 (子时)", "01:00-03:00 (丑时)", "03:00-05:00 (寅时)", 
                        "05:00-07:00 (卯时)", "07:00-09:00 (辰时)", "09:00-11:00 (巳时)",
                        "11:00-13:00 (午时)", "13:00-15:00 (未时)", "15:00-17:00 (申时)", 
                        "17:00-19:00 (酉时)", "19:00-21:00 (戌时)", "21:00-23:00 (亥时)"
                    ];
                    
                    const hourStr = hoursMap[hZhiIdx];
                    
                    results.push({
                        year: d.getFullYear(),
                        month: d.getMonth() + 1,
                        day: d.getDate(),
                        hourStr: hourStr,
                        solarTerm: JIE_CONSTANTS[jieIndex].name
                    });
                }
            }
        }
    }
    
    return results;
};
