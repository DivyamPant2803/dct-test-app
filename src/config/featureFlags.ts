export const FEATURE_FLAGS = {
    SHOW_HOME_TAB: false,
    SHOW_GUIDANCE_TAB: false,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURE_FLAGS[flag];
};
