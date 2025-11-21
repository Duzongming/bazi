import { Pillar, LuckPillar, Gender, BaziResult, LiuNian, LiuYue, SolarTermInfo, Interaction, MangpaiInfo, ReverseResult, WuyunLiuqi, TCMProfile, ShenShaItem } from '../types';

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

// --- City Data for True Solar Time ---
export const CHINA_CITIES: Record<string, {name: string, lng: number}[]> = {
    '直辖市': [
        {name: '北京', lng: 116.46}, {name: '上海', lng: 121.47}, {name: '天津', lng: 117.20}, {name: '重庆', lng: 106.55}
    ],
    // ... (keep existing cities data - simplified for brevity in this output, assume it's preserved from original)
    '广东': [
        {name: '广州', lng: 113.26}, {name: '深圳', lng: 114.05}, {name: '珠海', lng: 113.57}, {name: '汕头', lng: 116.68},
        {name: '佛山', lng: 113.12}, {name: '东莞', lng: 113.75}, {name: '湛江', lng: 110.36}, {name: '惠州', lng: 114.41}
    ],
     '其他': [
        {name: '香港', lng: 114.16}, {name: '澳门', lng: 113.54}, {name: '台北', lng: 121.50}, {name: '乌鲁木齐', lng: 87.61}
    ]
};

// --- Mangpai Constants ---
const LU_MAP: Record<string, string> = {
    '甲': '寅', '乙': '卯', 
    '丙': '巳', '戊': '巳', 
    '丁': '午', '己': '午', 
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

const HONG_YAN_MAP: Record<string, string> = {
    '甲': '午', '乙': '申', '丙': '寅', '丁': '未', '戊': '辰', 
    '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申'
};

// Simplified Root checking
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
const ZHI_CHUAN = [['子','未'], ['丑','午'], ['寅','巳'], ['卯','辰'], ['申','亥'], ['酉','戌']];
const ZHI_PO = [['子','酉'], ['丑','辰'], ['寅','亥'], ['卯','午'], ['巳','申'], ['未','戌']];
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

export const getWuxing = (char: string): string => {
    const sIdx = HEAVENLY_STEMS.indexOf(char);
    if (sIdx > -1) return ELEMENTS[sIdx];
    const bIdx = EARTHLY_BRANCHES.indexOf(char);
    if (bIdx > -1) return BRANCH_ELEMENTS[bIdx];
    return '';
};

export const getElementColorClass = (wuxing: string): string => {
    switch (wuxing) {
      case '金': return 'text-yellow-600'; // Metal - Golden Yellow
      case '木': return 'text-emerald-600'; // Wood - Emerald Green
      case '水': return 'text-blue-600'; // Water - Bright Blue
      case '火': return 'text-red-600'; // Fire - Red
      case '土': return 'text-amber-700'; // Earth - Earth Yellow/Brown
      default: return 'text-stone-500';
    }
};

export const getNayinColorClass = (nayin: string): string => {
    if (!nayin) return 'text-stone-400';
    return getElementColorClass(nayin.slice(-1));
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

// --- NEW ShenSha Logic (Tiered) ---
const getShenShaList = (gan: string, branch: string, yearBranch: string, dayBranch: string, dayStem: string, monthBranch: string, pillarXunKong: string): ShenShaItem[] => {
    if ([gan, branch, yearBranch, dayBranch, dayStem, monthBranch].some(x => x === '?' || !x)) return [];

    const list: ShenShaItem[] = [];
    const bIdx = EARTHLY_BRANCHES.indexOf(branch);
    const ybIdx = EARTHLY_BRANCHES.indexOf(yearBranch);
    const dbIdx = EARTHLY_BRANCHES.indexOf(dayBranch);
    
    if (bIdx === -1 || ybIdx === -1 || dbIdx === -1) return [];

    // --- Tier 1: Core (Lu, Yangren, Kongwang, Grave) ---
    
    // Lu (禄)
    if (LU_MAP[dayStem] === branch) {
        list.push({ name: '禄神', type: '吉', tier: 1 });
    }
    
    // Yangren (羊刃)
    if (YANG_REN_MAP[dayStem] === branch) {
        list.push({ name: '羊刃', type: '凶', tier: 1 });
    }

    // Kongwang (空亡)
    // Passed in xunKong is the valid empty branches for this pillar's stem/branch combination? 
    // No, Kongwang usually checks Day Pillar's Xun, then checks if Year/Month/Hour branch matches.
    // Or Year Pillar's Xun checking others.
    // Here we assume external logic passes 'isKongWang' flag to Pillar, but we can also check if THIS branch is Kongwang relative to Day or Year.
    // For simplicity, we rely on the 'isKongWang' flag in createPillar, but here we can add it if we have access to DayXun. 
    // Actually the previous logic checked DayXun and YearXun against 'branch'. 
    // For this function, we'll leave Kongwang marking to `createPillar` logic which sets `isKongWang`. 
    // However, we can detect 'Grave' here.

    // MuKu (墓库 - Grave/Treasury)
    // Logic: Check if branch is Chen/Xu/Chou/Wei and relate to DayMaster
    const graves = ['辰', '戌', '丑', '未'];
    if (graves.includes(branch)) {
        let graveDesc = '杂气';
        const dmWuxing = getWuxing(dayStem);
        
        // Simplified Wealth Treasury Logic: Grave of the Wealth Element
        // Earth DM (Wealth=Water) -> Chen (Water Grave) -> Wealth Treasury
        // Water DM (Wealth=Fire) -> Xu (Fire Grave) -> Wealth Treasury
        // Fire DM (Wealth=Metal) -> Chou (Metal Grave) -> Wealth Treasury
        // Metal DM (Wealth=Wood) -> Wei (Wood Grave) -> Wealth Treasury
        // Wood DM (Wealth=Earth) -> Chen/Xu/Chou/Wei. Often Xu is considered Fire/Earth grave.
        
        if (dmWuxing === '土' && branch === '辰') graveDesc = '财库';
        else if (dmWuxing === '水' && branch === '戌') graveDesc = '财库';
        else if (dmWuxing === '火' && branch === '丑') graveDesc = '财库';
        else if (dmWuxing === '金' && branch === '未') graveDesc = '财库';
        
        // Official Treasury Logic (Grave of Guan/Sha)
        // Earth DM (Guan=Wood) -> Wei
        // Water DM (Guan=Earth) -> Chen
        // Fire DM (Guan=Water) -> Chen
        // Metal DM (Guan=Fire) -> Xu
        // Wood DM (Guan=Metal) -> Chou
        
        if (dmWuxing === '土' && branch === '未') graveDesc = '官库';
        else if (dmWuxing === '水' && branch === '辰') graveDesc = '官库';
        else if (dmWuxing === '火' && branch === '辰') graveDesc = '官库';
        else if (dmWuxing === '金' && branch === '戌') graveDesc = '官库';
        else if (dmWuxing === '木' && branch === '丑') graveDesc = '官库';

        list.push({ name: '墓库', type: '平', tier: 1, description: graveDesc });
    }

    // --- Tier 2: Major (Tianyi, Yima, Taohua, Huagai, Kuigang) ---

    // Tianyi (天乙贵人)
    const checkTianYi = (stem: string) => {
        if (['甲', '戊', '庚'].includes(stem) && ['丑', '未'].includes(branch)) return true;
        if (['乙', '己'].includes(stem) && ['子', '申'].includes(branch)) return true;
        if (['丙', '丁'].includes(stem) && ['亥', '酉'].includes(branch)) return true;
        if (['辛'].includes(stem) && ['午', '寅'].includes(branch)) return true;
        if (['壬', '癸'].includes(stem) && ['巳', '卯'].includes(branch)) return true;
        return false;
    };
    if (checkTianYi(dayStem)) list.push({ name: '天乙', type: '吉', tier: 2 });
    else if (gan && gan !== '?' && gan !== dayStem && checkTianYi(gan)) list.push({ name: '天乙', type: '吉', tier: 2 });

    // Yima (驿马)
    const checkYiMa = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 2) return true; // ShenZiChen -> Yin
        if ([2, 6, 10].includes(refIdx) && bIdx === 8) return true; // YinWuXu -> Shen
        if ([5, 9, 1].includes(refIdx) && bIdx === 11) return true; // SiYouChou -> Hai
        if ([11, 3, 7].includes(refIdx) && bIdx === 5) return true; // HaiMaoWei -> Si
        return false;
    };
    if (checkYiMa(ybIdx) || checkYiMa(dbIdx)) list.push({ name: '驿马', type: '平', tier: 2 });

    // Taohua (桃花)
    const checkTaoHua = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 9) return true;
        if ([2, 6, 10].includes(refIdx) && bIdx === 3) return true;
        if ([5, 9, 1].includes(refIdx) && bIdx === 6) return true;
        if ([11, 3, 7].includes(refIdx) && bIdx === 0) return true;
        return false;
    };
    if (checkTaoHua(ybIdx) || checkTaoHua(dbIdx)) list.push({ name: '桃花', type: '吉', tier: 2 });

    // Huagai (华盖)
    const checkHuaGai = (refIdx: number) => {
        if ([8, 0, 4].includes(refIdx) && bIdx === 4) return true;
        if ([2, 6, 10].includes(refIdx) && bIdx === 10) return true;
        if ([5, 9, 1].includes(refIdx) && bIdx === 1) return true;
        if ([11, 3, 7].includes(refIdx) && bIdx === 7) return true;
        return false;
    };
    if (checkHuaGai(ybIdx) || checkHuaGai(dbIdx)) list.push({ name: '华盖', type: '平', tier: 2 });

    // Kuigang (魁罡) - Usually Day Pillar, but logic here checks stem/branch combo
    // GengChen, GengXu, RenChen, WuXu
    const isKuigang = (gan === '庚' && (branch === '辰' || branch === '戌')) ||
                      (gan === '壬' && branch === '辰') ||
                      (gan === '戊' && branch === '戌');
    if (isKuigang) list.push({ name: '魁罡', type: '平', tier: 2 });

    // --- Tier 3: Minor (Hongyan, Guchen, Guasu, etc.) ---
    
    // Hongyan (红艳)
    if (HONG_YAN_MAP[dayStem] === branch) list.push({ name: '红艳', type: '吉', tier: 3 });

    // Guchen (孤辰) / Guasu (寡宿) - Based on Year Branch
    // HaiZiChou (N) -> Yin / Xu
    // YinMaoChen (E) -> Si / Chou
    // SiWuWei (S) -> Shen / Chen
    // ShenYouXu (W) -> Hai / Wei
    
    // Helper for Year Branch Group (San Hui)
    // 0(Zi), 1(Chou), 11(Hai) -> Water Group (North)
    // 2(Yin), 3(Mao), 4(Chen) -> Wood Group (East)
    // 5(Si), 6(Wu), 7(Wei) -> Fire Group (South)
    // 8(Shen), 9(You), 10(Xu) -> Metal Group (West)
    
    let guchen = '', guasu = '';
    if ([11, 0, 1].includes(ybIdx)) { guchen = '寅'; guasu = '戌'; }
    else if ([2, 3, 4].includes(ybIdx)) { guchen = '巳'; guasu = '丑'; }
    else if ([5, 6, 7].includes(ybIdx)) { guchen = '申'; guasu = '辰'; }
    else if ([8, 9, 10].includes(ybIdx)) { guchen = '亥'; guasu = '未'; }

    if (branch === guchen) list.push({ name: '孤辰', type: '凶', tier: 3 });
    if (branch === guasu) list.push({ name: '寡宿', type: '凶', tier: 3 });

    // Jiesha (劫煞) - Opposite of Wangshen?
    // ShenZiChen -> Si
    // HaiMaoWei -> Shen
    // YinWuXu -> Hai
    // SiYouChou -> Yin
    let jiesha = '';
    if ([8, 0, 4].includes(ybIdx)) jiesha = '巳';
    else if ([11, 3, 7].includes(ybIdx)) jiesha = '申';
    else if ([2, 6, 10].includes(ybIdx)) jiesha = '亥';
    else if ([5, 9, 1].includes(ybIdx)) jiesha = '寅';
    if (branch === jiesha) list.push({ name: '劫煞', type: '凶', tier: 3 });

    // Wangshen (亡神)
    // ShenZiChen -> Hai
    // HaiMaoWei -> Yin
    // YinWuXu -> Si
    // SiYouChou -> Shen
    let wangshen = '';
    if ([8, 0, 4].includes(ybIdx)) wangshen = '亥';
    else if ([11, 3, 7].includes(ybIdx)) wangshen = '寅';
    else if ([2, 6, 10].includes(ybIdx)) wangshen = '巳';
    else if ([5, 9, 1].includes(ybIdx)) wangshen = '申';
    if (branch === wangshen) list.push({ name: '亡神', type: '凶', tier: 3 });

    // Filter duplicates (e.g. Tianyi from Day vs Year)
    const uniqueList: ShenShaItem[] = [];
    const seen = new Set();
    list.forEach(item => {
        if (!seen.has(item.name)) {
            seen.add(item.name);
            uniqueList.push(item);
        }
    });

    return uniqueList;
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
    let plainEnglish = '';
    
    // Five Movements (Da Yun)
    if (['甲', '己'].includes(yearStem)) { 
        daYun = isYang ? '土运太过 (雨湿流行)' : '土运不及 (风乃大行)'; 
        yunQi = '土'; 
        plainEnglish += isYang ? '今年气候多雨湿，需防腹泻、风湿。' : '今年风气大行，需防肝风、胃痛。';
    }
    else if (['乙', '庚'].includes(yearStem)) { 
        daYun = isYang ? '金运太过 (燥气流行)' : '金运不及 (炎火乃行)'; 
        yunQi = '金'; 
        plainEnglish += isYang ? '今年气候干燥，需防咳喘、皮肤干裂。' : '今年火气偏旺，需防心烦、肺热。';
    }
    else if (['丙', '辛'].includes(yearStem)) { 
        daYun = isYang ? '水运太过 (寒气流行)' : '水运不及 (湿乃大行)'; 
        yunQi = '水'; 
        plainEnglish += isYang ? '今年气候寒冷，需防关节痛、肾虚。' : '今年湿气较重，需防困倦、水肿。';
    }
    else if (['丁', '壬'].includes(yearStem)) { 
        daYun = isYang ? '木运太过 (风气流行)' : '木运不及 (燥乃大行)'; 
        yunQi = '木'; 
        plainEnglish += isYang ? '今年多大风，需防头痛、眩晕、肝火。' : '今年气候燥热，需防皮肤病、血虚。';
    }
    else if (['戊', '癸'].includes(yearStem)) { 
        daYun = isYang ? '火运太过 (炎暑流行)' : '火运不及 (寒乃大行)'; 
        yunQi = '火'; 
        plainEnglish += isYang ? '今年酷热难耐，需防中暑、心脏负荷。' : '今年阳气不足，需防畏寒、手脚冰凉。';
    }

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
    
    let seasonText = "";
    if (siTian.includes("火")) seasonText = "上半年热气主导，注意心脑血管。";
    else if (siTian.includes("土")) seasonText = "上半年湿气主导，注意脾胃消化。";
    else if (siTian.includes("金")) seasonText = "上半年燥气主导，注意呼吸系统。";
    else if (siTian.includes("水")) seasonText = "上半年寒气主导，注意肾脏保暖。";
    else if (siTian.includes("木")) seasonText = "上半年风气主导，注意肝胆神经。";

    plainEnglish = plainEnglish + " " + seasonText;

    return {
        daYun,
        yunQi,
        siTian,
        zaiQuan,
        description: `${daYun}，上半年${siTian}司天，下半年${zaiQuan}在泉。`,
        plainEnglish
    };
};

// --- TCM Profile Calculation ---
const getTCMProfile = (stems: string[], branches: string[], tiaoHouStatus: string): TCMProfile => {
    const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    stems.forEach(s => {
        if(s && s !== '?') {
            const idx = HEAVENLY_STEMS.indexOf(s);
            if (idx >= 0) counts[ELEMENTS[idx]] += 1;
        }
    });
    branches.forEach((b, i) => {
        if(b && b !== '?') {
            const idx = EARTHLY_BRANCHES.indexOf(b);
            const weight = i === 1 ? 2 : 1;
            if (idx >= 0) counts[BRANCH_ELEMENTS[idx]] += weight;
        }
    });

    const totalPoints = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const elementScores: { [key: string]: number } = {
        '木': Math.round((counts['木'] / totalPoints) * 100),
        '火': Math.round((counts['火'] / totalPoints) * 100),
        '土': Math.round((counts['土'] / totalPoints) * 100),
        '金': Math.round((counts['金'] / totalPoints) * 100),
        '水': Math.round((counts['水'] / totalPoints) * 100),
    };

    const excess: string[] = [];
    const deficient: string[] = [];
    const organRisk: string[] = [];
    const symptoms: string[] = [];
    const diet: string[] = [];
    const lifestyle: string[] = [];

    Object.keys(elementScores).forEach(k => {
        if (elementScores[k] > 35) excess.push(k); 
        if (elementScores[k] < 10) deficient.push(k); 
    });

    const organMap: Record<string, string> = {
        '木': '肝胆 (目/筋)',
        '火': '心小肠 (舌/脉)',
        '土': '脾胃 (口/肉)',
        '金': '肺大肠 (鼻/皮毛)',
        '水': '肾膀胱 (耳/骨)'
    };

    excess.forEach(e => organRisk.push(`${organMap[e]} 实火`));
    deficient.forEach(e => organRisk.push(`${organMap[e]} 虚弱`));

    let constitution = '平和质';
    let advice = '五行基本平衡，注意饮食起居规律即可。';

    // Constitution Logic
    if (excess.includes('水') && deficient.includes('火')) {
        constitution = '阳虚质';
        advice = '阳气不足，畏寒怕冷。';
        symptoms.push('手脚冰凉', '腰膝酸软', '易水肿');
        diet.push('多吃温热食物：羊肉、韭菜、生姜、核桃', '少吃生冷瓜果');
        lifestyle.push('多晒太阳（尤其是背部）', '坚持泡脚', '动则生阳，多做有氧运动');
    } else if (excess.includes('火') && deficient.includes('水')) {
        constitution = '阴虚质';
        advice = '阴液亏少，口干舌燥。';
        symptoms.push('手心发热', '口干舌燥', '失眠多梦', '便秘');
        diet.push('多吃滋阴食物：鸭肉、百合、银耳、梨', '忌辛辣、油炸、烧烤');
        lifestyle.push('保证充足睡眠，熬夜最伤阴', '静坐冥想', '避免剧烈出汗');
    } else if (excess.includes('土')) {
        constitution = '痰湿质';
        advice = '湿浊内蕴，身重易倦。';
        symptoms.push('身体沉重', '面部油光', '腹部肥满', '痰多');
        diet.push('多吃健脾利湿：薏米、红豆、冬瓜、陈皮', '少吃甜食、油腻');
        lifestyle.push('坚持运动出汗', '居住环境保持干燥', '避免久坐');
    } else if (deficient.includes('土')) {
        constitution = '气虚质';
        advice = '元气不足，乏力气短。';
        symptoms.push('容易疲劳', '说话声音小', '食欲不振', '易感冒');
        diet.push('多吃益气健脾：小米、山药、红薯、鸡肉', '规律饮食');
        lifestyle.push('避免过劳', '中午小睡', '动作柔和的运动（太极/八段锦）');
    } else if (excess.includes('木')) {
        constitution = '气郁质';
        advice = '气机郁滞，神情抑郁。';
        symptoms.push('胸闷胁痛', '情绪低落或易怒', '乳房胀痛', '叹气');
        diet.push('多吃疏肝解郁：黄花菜、海带、萝卜、柑橘', '喝玫瑰花茶');
        lifestyle.push('多参加社交活动', '唱歌大喊释放压力', '旅游散心');
    } else if (excess.includes('火') && excess.includes('土') && (deficient.includes('金') || deficient.includes('水'))) {
        constitution = '湿热质';
        advice = '湿热内蕴，面垢油光。';
        symptoms.push('面垢油光', '易生痤疮', '口苦口臭', '身重困倦');
        diet.push('多吃清热利湿：绿豆、苦瓜、芹菜、黄瓜', '戒烟酒');
        lifestyle.push('保持皮肤清洁', '穿透气衣物', '避免湿热环境');
    }

    if (deficient.includes('金')) {
        diet.push('补金：多吃白色食物（梨、百合、银耳、白萝卜）');
        lifestyle.push('养肺：练习深呼吸', '秋季注意防燥');
        symptoms.push('易感冒', '鼻塞', '皮肤干燥');
    }
    if (deficient.includes('木')) {
        diet.push('补木：多吃绿色蔬菜', '适当吃酸味食物');
        lifestyle.push('养肝：晚上11点前睡觉', '少生气');
        symptoms.push('眼睛干涩', '筋骨僵硬');
    }
     if (deficient.includes('水') && !symptoms.includes('手脚冰凉')) {
        diet.push('补水：多吃黑色食物（黑豆、黑芝麻、黑木耳）');
        lifestyle.push('养肾：节制房事', '注意腰部保暖');
        symptoms.push('听力下降', '脱发');
    }
    if (deficient.includes('火') && !symptoms.includes('手心发热')) {
        diet.push('补火：多吃红色食物（红豆、红枣、番茄）');
        lifestyle.push('养心：中午养心觉', '多笑');
        symptoms.push('面色苍白', '精神不振');
    }

    if (diet.length === 0) diet.push('饮食均衡，五味调和', '顺应四时');
    if (lifestyle.length === 0) lifestyle.push('起居有常', '不妄作劳');

    return {
        constitution,
        excess,
        deficient,
        organRisk,
        advice,
        elementScores,
        wellnessGuide: {
            diet: [...new Set(diet)],
            lifestyle: [...new Set(lifestyle)],
            symptoms: [...new Set(symptoms)]
        }
    };
};

// --- Mangpai / Blind Man Logic ---
const getMangpaiInfo = (stem: string, branch: string, pillarIndex: number, allBranches: string[], dayMaster: string): MangpaiInfo => {
    if (stem === '?' || branch === '?' || !branch) {
        return { scope: '主', strength: '虚', roots: [], huTong: [], specialGods: [] };
    }

    const scope = (pillarIndex === 0 || pillarIndex === 1) ? '宾' : '主';
    const possibleRoots = ROOTS_MAP[stem] || [];
    const foundRoots: string[] = [];
    const branchNames = ['年', '月', '日', '时'];
    
    allBranches.forEach((b, idx) => {
        if (possibleRoots.includes(b) && b !== '?') {
            foundRoots.push(`${branchNames[idx]}(${b})`);
        }
    });

    const isSolid = foundRoots.length > 0;
    const luBranch = LU_MAP[stem];
    const huTong: string[] = [];
    if (luBranch) {
        allBranches.forEach((b, idx) => {
            if (b === luBranch) {
                huTong.push(`${branchNames[idx]}(${b})`);
            }
        });
    }
    
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
    const validPillars = pillars.filter(p => p.gan !== '?' && p.zhi !== '?' && p.gan && p.zhi);

    const hasPair = (a: string, b: string, pairList: string[][]) => {
        return pairList.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    };

    for (let i = 0; i < validPillars.length; i++) {
        for (let j = i + 1; j < validPillars.length; j++) {
            const p1 = validPillars[i];
            const p2 = validPillars[j];
            const pNames = [p1.name, p2.name];
            
            if (hasPair(p1.gan, p2.gan, GAN_HE)) {
                results.push({ type: '天干五合', label: `${p1.gan}${p2.gan}合`, pillars: pNames, description: `${p1.name}${p1.gan}与${p2.name}${p2.gan}相合`, severity: 'good' });
            }
            if (hasPair(p1.gan, p2.gan, GAN_CHONG)) {
                results.push({ type: '天干相冲', label: `${p1.gan}${p2.gan}冲`, pillars: pNames, description: `${p1.name}${p1.gan}与${p2.name}${p2.gan}相冲`, severity: 'bad' });
            }

            if (hasPair(p1.zhi, p2.zhi, ZHI_LIU_HE)) {
                results.push({ type: '地支六合', label: `${p1.zhi}${p2.zhi}合`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}六合`, severity: 'good' });
            }
            if (hasPair(p1.zhi, p2.zhi, ZHI_LIU_CHONG)) {
                results.push({ type: '地支六冲', label: `${p1.zhi}${p2.zhi}冲`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}六冲`, severity: 'bad' });
            }
            if (hasPair(p1.zhi, p2.zhi, ZHI_CHUAN)) {
                results.push({ type: '地支相穿', label: `${p1.zhi}${p2.zhi}穿`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相害(穿)`, severity: 'bad' });
            }
            if (hasPair(p1.zhi, p2.zhi, ZHI_PO)) {
                results.push({ type: '地支相破', label: `${p1.zhi}${p2.zhi}破`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相破`, severity: 'neutral' });
            }
            if (hasPair(p1.zhi, p2.zhi, ZHI_JUE)) {
                results.push({ type: '地支相绝', label: `${p1.zhi}${p2.zhi}绝`, pillars: pNames, description: `${p1.name}${p1.zhi}与${p2.name}${p2.zhi}相绝`, severity: 'bad' });
            }
            if (p1.zhi === p2.zhi && ZHI_ZI_XING.includes(p1.zhi)) {
                results.push({ type: '自刑', label: `${p1.zhi}${p2.zhi}自刑`, pillars: pNames, description: `${p1.name}与${p2.name} ${p1.zhi}自刑`, severity: 'bad' });
            }
            
            const isGanChong = hasPair(p1.gan, p2.gan, GAN_CHONG); 
            const isZhiChong = hasPair(p1.zhi, p2.zhi, ZHI_LIU_CHONG);
            if (isGanChong && isZhiChong) {
                results.push({ type: '天克地冲', label: `${p1.gan}${p1.zhi} vs ${p2.gan}${p2.zhi}`, pillars: pNames, description: `${p1.name}与${p2.name} 天克地冲`, severity: 'bad' });
            }
            
            const isGanHe = hasPair(p1.gan, p2.gan, GAN_HE);
            const isZhiHe = hasPair(p1.zhi, p2.zhi, ZHI_LIU_HE);
            if (isGanHe && isZhiHe) {
                results.push({ type: '天合地合', label: `${p1.gan}${p1.zhi} - ${p2.gan}${p2.zhi}`, pillars: pNames, description: `${p1.name}与${p2.name} 天合地合`, severity: 'good' });
            }
        }
    }

    const branches = validPillars.map(p => p.zhi);
    const branchSet = new Set(branches);

    ZHI_SAN_HE.forEach(item => {
        if (item.branches.every(b => branchSet.has(b))) {
            const contributors = validPillars.filter(p => item.branches.includes(p.zhi)).map(p => p.name);
            const uniqueContributors = [...new Set(contributors)];
            results.push({ type: '三合局', label: item.name, pillars: uniqueContributors, description: `地支(${uniqueContributors.join('+')})成${item.name}`, severity: 'good' });
        }
    });
    
    ZHI_SAN_HUI.forEach(item => {
        if (item.branches.every(b => branchSet.has(b))) {
             const contributors = validPillars.filter(p => item.branches.includes(p.zhi)).map(p => p.name);
             const uniqueContributors = [...new Set(contributors)];
             results.push({ type: '三会局', label: item.name, pillars: uniqueContributors, description: `地支(${uniqueContributors.join('+')})成${item.name}`, severity: 'good' });
        }
    });

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
    allBranches?: string[], 
    pillarIndex?: number 
): Pillar => {
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
            shenshaList: [],
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
    const xunKong = getXunKong(gan, zhi);

    const isYearKW = yearKWBranches.includes(zhi);
    const isDayKW = dayKWBranches.includes(zhi);
    
    let kwType: '年空' | '日空' | '双空' | '' = '';
    if (isYearKW && isDayKW) kwType = '双空';
    else if (isYearKW) kwType = '年空';
    else if (isDayKW) kwType = '日空';

    // New ShenSha Logic
    let shenshaList: ShenShaItem[] = [];
    if (dayStem) {
        shenshaList = getShenShaList(gan, zhi, yearBranch, dayBranch, dayStem, monthBranch, xunKong);
        
        // Manually add Kongwang as a ShenSha Item if applicable
        if (kwType) {
            shenshaList.unshift({ name: '空亡', type: '平', tier: 1, isKongWang: true, description: kwType });
        }
    }
    const shensha = shenshaList.map(s => s.name);

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
        shenshaList,
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
        const ssList = getShenShaList(gan, zhi, yearBranch, dayBranch, dayMaster, monthBranch, '');
        const shensha = ssList.map(s => s.name);
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
        return solar.toString(); 
    } catch (e) {
        console.error('Lunar convert error', e);
        return '';
    }
};

export const calculateTrueSolarTime = (date: Date, longitude: number) => {
    const lonOffsetMins = (longitude - 120) * 4;
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const B = 360 * (dayOfYear - 81) / 365;
    const bRad = B * (Math.PI / 180);
    const eotMins = 9.87 * Math.sin(2 * bRad) - 7.53 * Math.cos(bRad) - 1.5 * Math.sin(bRad);
    const totalOffsetMins = lonOffsetMins + eotMins;
    const trueSolarDate = new Date(date.getTime() + totalOffsetMins * 60 * 1000);

    return {
        date: trueSolarDate,
        offset: totalOffsetMins,
        lonOffset: lonOffsetMins,
        eot: eotMins
    };
};

export const calculateAllPillars = (dateString: string, timeString: string, gender: Gender, isLunar: boolean = false, isUnknownTime: boolean = false, lunarLeap: boolean = false, longitude?: number): BaziResult => {
    let d: Date;
    let lunarStr = '';

    if (isLunar) {
        const [y, m, day] = dateString.split('-').map(Number);
        const solarStr = convertLunarToSolar(y, m, day, lunarLeap);
        d = new Date(solarStr);
        lunarStr = `农历 ${y}年${lunarLeap?'闰':''}${m}月${day}日`;
    } else {
        d = new Date(dateString);
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
    d.setHours(hours, minutes, 0);

    let trueSolarTimeStr = undefined;
    if (longitude !== undefined && !isUnknownTime) {
         const { date: tstDate, offset } = calculateTrueSolarTime(d, longitude);
         d = tstDate;
         const tHours = d.getHours();
         const tMins = d.getMinutes();
         const sign = offset >= 0 ? '+' : '';
         trueSolarTimeStr = `${tHours}:${tMins.toString().padStart(2, '0')} (真太阳时 ${sign}${offset.toFixed(0)}分)`;
         hours = tHours;
         minutes = tMins;
    }

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

    const allBranches = [yearGZ.zhi, monthZhi, dayGZ.zhi, hourZhi];
    const allStems = [yearGZ.gan, monthGan, dayGZ.gan, hourGan];

    const yearPillar = createPillar(yearGZ.gan, yearGZ.zhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 0);
    const monthPillar = createPillar(monthGan, monthZhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 1);
    const dayPillar = createPillar(dayGZ.gan, dayGZ.zhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 2);
    const hourPillar = createPillar(hourGan, hourZhi, dayMaster, yearGZ.zhi, dayGZ.zhi, monthZhi, yearKWBranches, dayKWBranches, allBranches, 3);
    
    // Interactions
    const interactions = calculateInteractions([
        { name: '年', gan: yearGZ.gan, zhi: yearGZ.zhi },
        { name: '月', gan: monthGan, zhi: monthZhi },
        { name: '日', gan: dayGZ.gan, zhi: dayGZ.zhi },
        { name: '时', gan: hourGan, zhi: hourZhi }
    ]);

    // Post-Process: Dynamic ShenSha Logic
    // If ShenSha branch is involved in Chong/He/Xing, activate it.
    const checkAndActivate = (p: Pillar, name: string) => {
        if (p.zhi === '?' || !p.zhi) return;
        // Check if this pillar is involved in interactions
        const involved = interactions.filter(i => i.pillars.includes(name));
        const isInteracted = involved.length > 0;
        
        if (isInteracted) {
            p.shenshaList.forEach(ss => {
                // Logic: Any interaction activates ShenSha on that branch
                ss.isActivated = true;
                // Find specific message
                const types = involved.map(i => i.type.replace('地支', '').replace('天干', ''));
                ss.interactionMsg = types.join(',');

                // Special logic for Kongwang Filling
                if (ss.isKongWang) {
                    // If Chong or He or Hui, Kongwang is filled (Solid)
                    // Interactions usually include '冲', '合', '刑'
                    // Just assume any interaction fills it for visual simplicity, or filter specifically
                    const fills = involved.some(i => i.type.includes('冲') || i.type.includes('合') || i.type.includes('会'));
                    if (fills) {
                       ss.interactionMsg = "冲空则实";
                       ss.isActivated = true; 
                    }
                }
            });
        }
    };
    
    checkAndActivate(yearPillar, '年');
    checkAndActivate(monthPillar, '月');
    checkAndActivate(dayPillar, '日');
    checkAndActivate(hourPillar, '时');

    const tiaoHou = getTiaoHou(dayMaster, monthZhi);
    const wuXingFlow = getWuXingFlow(allStems, allBranches);
    const wuyunLiuqi = getWuyunLiuqi(yearGZ.gan, yearGZ.zhi);
    const tcmProfile = getTCMProfile(allStems, allBranches, tiaoHou.status);

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
        if (isMing) sum = 14 - (mVal + hVal);
        else sum = mVal + hVal - 2; 
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
        trueSolarTimeStr,
        interactions,
        tiaoHou,
        wuXingFlow,
        wuyunLiuqi,
        tcmProfile
    };
};

export const findDatesFromPillars = (
    yearStr: string, 
    monthStr: string,
    dayStr: string,
    hourStr: string,
    startYear: number,
    endYear: number
): ReverseResult[] => {
    const results: ReverseResult[] = [];
    const yg = yearStr[0], yz = yearStr[1];
    const mg = monthStr[0], mz = monthStr[1];
    const dg = dayStr[0], dz = dayStr[1];
    const hg = hourStr[0], hz = hourStr[1];

    if (wuHuDun(yg, mz) !== mg) return []; 
    if (wuShuDun(dg, hz) !== hg) return [];

    const targetYIdx = getGanZhiIndex(yg, yz);
    const targetDIdx = getGanZhiIndex(dg, dz);

    for (let y = startYear; y <= endYear; y++) {
        let yOffset = (y - 1984) % 60;
        if (yOffset < 0) yOffset += 60;
        
        if (yOffset !== targetYIdx) continue;

        let termIndex = -1;
        const bIdx = EARTHLY_BRANCHES.indexOf(mz);
        
        if (bIdx >= 2) termIndex = bIdx - 1;
        else if (bIdx === 0) termIndex = 11;
        else if (bIdx === 1) termIndex = 0;

        if (termIndex === -1) continue;

        let termYear = y;
        let jieIdx = termIndex;
        
        if (jieIdx === 0) termYear = y + 1;
        
        const dayStart = getJieDate(termYear, jieIdx);
        const monthStart = JIE_CONSTANTS[jieIdx].month;
        
        const startDate = new Date(termYear, monthStart, dayStart, 12, 0, 0);
        
        let nextJieIdx = (jieIdx + 1) % 12;
        let nextTermYear = y;
        if (nextJieIdx === 0) nextTermYear = y + 1;
        else if (jieIdx === 0) nextTermYear = y + 1;
        
        const dayEnd = getJieDate(nextTermYear, nextJieIdx);
        const monthEnd = JIE_CONSTANTS[nextJieIdx].month;
        
        const endDate = new Date(nextTermYear, monthEnd, dayEnd, 12, 0, 0);
        
        const oneDay = 24 * 60 * 60 * 1000;
        const startUTC = Date.UTC(termYear, monthStart, dayStart);
        const diffDaysAtStart = Math.floor((startUTC - Date.UTC(2000, 0, 1)) / oneDay);
        const currentDayOffset = (54 + diffDaysAtStart) % 60;
        const adjustedCurrent = currentDayOffset < 0 ? currentDayOffset + 60 : currentDayOffset;
        
        let gap = (targetDIdx - adjustedCurrent + 60) % 60;
        
        let currentCheckDate = new Date(startDate);
        currentCheckDate.setDate(startDate.getDate() + gap);
        
        while (currentCheckDate < endDate) {
             const hIdx = EARTHLY_BRANCHES.indexOf(hz);
             let timeStr = '';
             if (hIdx === 0) timeStr = '23:00-01:00';
             else {
                 const startH = hIdx * 2 - 1;
                 const endH = hIdx * 2 + 1;
                 timeStr = `${String(startH).padStart(2,'0')}:00-${String(endH).padStart(2,'0')}:00`;
             }
             
             results.push({
                 year: currentCheckDate.getFullYear(),
                 month: currentCheckDate.getMonth() + 1,
                 day: currentCheckDate.getDate(),
                 hourStr: `${timeStr} (${hourStr})`,
                 solarTerm: JIE_CONSTANTS[jieIdx].name
             });
             
             currentCheckDate.setDate(currentCheckDate.getDate() + 60);
        }
    }
    return results;
};