import { txt_engines, txt_m_lasers, txt_scanners, txt_shields, txt_weapons } from "../text";

export let systemNames = [txt_engines, txt_shields, txt_scanners, txt_m_lasers, txt_weapons];
export let systemUpgradeCosts: [number, number][] = [[100, 100], [250, 250], [500, 500], [1000, 1000]];