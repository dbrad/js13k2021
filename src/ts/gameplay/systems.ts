import { txt_engines, txt_m_lasers, txt_scanners, txt_shields, txt_upgrade_hull, txt_weapons } from "../text";

export let systemNames = [txt_engines, txt_shields, txt_scanners, txt_m_lasers, txt_weapons, txt_upgrade_hull];
export let systemUpgradeCosts: [number, number][] = [[100, 100], [250, 250], [750, 750], [1500, 1500]];