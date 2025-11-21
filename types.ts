
export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export interface MangpaiInfo {
  scope: '宾' | '主';      // Bin (Guest/Outside) vs Zhu (Host/Home)
  strength: '实' | '虚';   // Shi (Solid) vs Xu (Empty)
  roots: string[];        // List of branches providing roots (e.g. "年支(寅)")
  huTong: string[];       // List of interconnected branches (e.g. "时支(禄)")
  specialGods: string[];  // '禄', '刃' specific markers for Mangpai analysis
}

export interface ShenShaItem {
  name: string;
  type: '吉' | '凶' | '平';
  tier: 1 | 2 | 3; // 1: Core, 2: Major, 3: Minor
  description?: string; // e.g., "财库", "官库"
  isActivated?: boolean; // If true, engaged in Chong/He/Xing
  interactionMsg?: string; // e.g., "被冲", "填实"
  isKongWang?: boolean; // Special marker for Kongwang logic
}

export interface Pillar {
  gan: string; // Heavenly Stem
  zhi: string; // Earthly Branch
  wuxing: string; // Element
  canggan: string[]; // Hidden Stems
  cangganTenGods: string[]; // Ten Gods for Hidden Stems
  shishen: string; // Ten God (relative to Day Master)
  nayin: string; // Melodic Element
  zhangsheng: string; // 12 Life Stage (Day Master vs Branch)
  zizuo: string; // Self Sit (Stem vs Branch)
  shensha: string[]; // Legacy string array (kept for compatibility if needed)
  shenshaList: ShenShaItem[]; // New detailed list
  xunKong: string; // The empty branches for THIS pillar's Xun (e.g. "申酉")
  kongwang: string; // Status text
  isKongWang?: boolean;
  kwType?: '年空' | '日空' | '双空' | '';
  mangpai?: MangpaiInfo; // New Mangpai Analysis Data
}

export interface SolarTermInfo {
  name: string;
  dateStr: string;
  fullDate: string;
}

export interface LiuYue {
  month: number; // 1-12
  gan: string;
  zhi: string;
  shishen: string; // Gan Ten God
  zhiShishen: string; // Branch Main Qi Ten God
  jieQi: SolarTermInfo;
}

export interface LiuNian {
  year: number;
  age: number;
  gan: string;
  zhi: string;
  nayin: string;
  shishen: string; // Gan Ten God
  zhiShishen: string; // Branch Main Qi Ten God
  shensha: string[];
  liuYue: LiuYue[];
}

export interface LuckPillar {
  gan: string;
  zhi: string;
  startAge: number;
  startYear: number;
  endYear: number;
  startAgeText: string;
  nayin: string;
  shishen: string; // Gan Ten God
  zhiShishen: string; // Branch Main Qi Ten God
  zhangsheng: string;
  liuNian: LiuNian[];
  isSmallLuck?: boolean;
}

export interface Interaction {
  type: string; // e.g. "天克地冲", "三合"
  label: string; // e.g. "子午冲", "申子辰三合水局"
  pillars: string[]; // e.g. ["年", "日"] or [] for global
  description: string;
  severity: 'good' | 'bad' | 'neutral'; 
}

export interface WuyunLiuqi {
    daYun: string;   // Great Movement (e.g. 土运太过)
    yunQi: string;   // Element description
    siTian: string;  // Heaven Control (First half year)
    zaiQuan: string; // Earth Control (Second half year)
    description: string; // General character
    plainEnglish: string; // Simplified explanation for laypeople
}

export interface TCMProfile {
    constitution: string; // e.g., "Yin Deficiency", "Phlegm Dampness"
    excess: string[]; // Elements that are too strong
    deficient: string[]; // Elements that are too weak
    organRisk: string[]; // Associated organs at risk
    advice: string; // General conditioning advice
    elementScores: { [key: string]: number }; // 0-100 score for chart
    wellnessGuide: {
        diet: string[];
        lifestyle: string[];
        symptoms: string[]; // Likely symptoms
    };
}

export interface BaziResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  taiyuan: Pillar;
  minggong: Pillar;
  shengong: Pillar;
  luckPillars: LuckPillar[];
  smallLuck: LuckPillar | null;
  gender: Gender;
  solarDate: string;
  lunarDateString?: string;
  trueSolarTimeStr?: string; // Calculated True Solar Time
  dayMaster: string;
  solarTermDistance: string;
  qiyunDetail: string;
  kongwangInfo: string;
  yearKongWang: string[];
  dayKongWang: string[];
  interactions: Interaction[];
  tiaoHou: { status: string; advice: string; detail: string }; // Climate Adjustment
  wuXingFlow: string; // Elemental Flow
  wuyunLiuqi: WuyunLiuqi; // Five Movements and Six Qi
  tcmProfile: TCMProfile; // New TCM Data
}

export interface ReverseResult {
    year: number;
    month: number;
    day: number;
    hourStr: string;
    solarTerm: string;
}

export interface SavedCase {
    id: string;
    name: string;
    gender: Gender;
    birthDate: string;
    birthTime: string;
    isUnknownTime: boolean;
    isLunar: boolean;
    province?: string;
    city?: string;
    longitude?: number | '';
    notes?: string;
    createdAt: number;
}

// --- Ziwei Dou Shu Types ---

export interface ZiweiStar {
    name: string;
    type: 'major' | 'minor' | 'aux' | 'bad';
    brightness?: string; // Miao, Wang, De, Li, Ping, Bu, Xian
    siHua?: 'lu' | 'quan' | 'ke' | 'ji'; // Transformations
    color?: string; // Helper for UI
}

export interface ZiweiPalace {
    index: number; // 0 (Zi) to 11 (Hai)
    zhi: string; // Earthly branch of the palace
    gan: string; // Heavenly stem of the palace
    name: string; // Ming, Brothers, Spouse, etc.
    isBodyPalace: boolean; // Shen Gong
    majorStars: ZiweiStar[];
    minorStars: ZiweiStar[];
    auxStars: ZiweiStar[]; // Year/Month/Hour stars
    decades: string; // e.g. "2-11" (Da Xian)
    smallLuck: string[]; // e.g. "Year 2024" positions
}

export interface ZiweiResult {
    palaces: ZiweiPalace[]; // Array of 12 palaces
    element: string; // Five Element Bureau (e.g. Wood 3)
    mingZhu: string; // Ming Lord Star
    shenZhu: string; // Body Lord Star
    bureauName: string; // Full name of the Bureau
}