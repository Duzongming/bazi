import { Gender, ZiweiResult, ZiweiPalace, ZiweiStar } from '../types';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from './baziHelper';

// --- Constants ---
export const PALACE_NAMES = [
    '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
    '迁移', '交友', '官禄', '田宅', '福德', '父母'
];

// Si Hua Lookup by Year Stem (甲=0 ... 癸=9)
// Lu, Quan, Ke, Ji
export const SI_HUA_TABLE = [
    ['廉贞', '破军', '武曲', '太阳'], // Jia
    ['天机', '天梁', '紫微', '太阴'], // Yi
    ['天同', '天机', '文昌', '廉贞'], // Bing
    ['太阴', '天同', '天机', '巨门'], // Ding
    ['贪狼', '太阴', '右弼', '天机'], // Wu
    ['武曲', '贪狼', '天梁', '文曲'], // Ji
    ['太阳', '武曲', '太阴', '天同'], // Geng
    ['巨门', '太阳', '文曲', '文昌'], // Xin
    ['天梁', '紫微', '左辅', '武曲'], // Ren
    ['破军', '巨门', '太阴', '贪狼']  // Gui
];

// 0: Metal 4, 1: Water 2, 2: Fire 6, 3: Earth 5, 4: Wood 3
export const BUREAU_LOOKUP: Record<string, number> = {
    '甲子': 0, '乙丑': 0, '丙寅': 2, '丁卯': 2, '戊辰': 4, '己巳': 4, '庚午': 3, '辛未': 3, '壬申': 0, '癸酉': 0,
    '甲戌': 2, '乙亥': 2, '丙子': 1, '丁丑': 1, '戊寅': 3, '己卯': 3, '庚辰': 0, '辛巳': 0, '壬午': 4, '癸未': 4,
    '甲申': 1, '乙酉': 1, '丙戌': 3, '丁亥': 3, '戊子': 2, '己丑': 2, '庚寅': 4, '辛卯': 4, '壬辰': 1, '癸巳': 1,
    '甲午': 0, '乙未': 0, '丙申': 2, '丁酉': 2, '戊戌': 4, '己亥': 4, '庚子': 3, '辛丑': 3, '壬寅': 0, '癸卯': 0,
    '甲辰': 2, '乙巳': 2, '丙午': 1, '丁未': 1, '戊申': 3, '己酉': 3, '庚戌': 0, '辛亥': 0, '壬子': 4, '癸丑': 4,
    '甲寅': 1, '乙卯': 1, '丙辰': 3, '丁巳': 3, '戊午': 2, '己未': 2, '庚申': 4, '辛酉': 4, '壬戌': 1, '癸亥': 1
};

// Placeholder function as main Bazi app doesn't currently rely on full Ziwei logic
export const calculateZiwei = (
    yearGan: string, yearZhi: string,
    month: number,
    day: number,
    hourZhi: string,
    gender: Gender
): ZiweiResult | null => {
    // Simplified implementation or stub to prevent compile errors if called
    return null;
};