import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for categorized entities
interface CategorizedEntities {
  [category: string]: string[]; // category -> array of entity IDs (not names)
}
interface EntitiesByCountry {
  [country: string]: string[]; // country -> array of entity IDs (not names)
}

interface QuestionnaireState {
  currentStep: number;
  completedSteps: number[];
  enabledSteps: number[];
  informationCategory: string[];
  /**
   * dataSubjectType can be either:
   * - string[] (legacy)
   * - { Client: string[]; Employee: string[] } (categorized)
   */
  dataSubjectType: string[] | { CID: string[]; ED: string[] };
  countries: string[];
  entities: CategorizedEntities;
  entitiesByCountry: EntitiesByCountry;
  transferLocation: string[];
  recipientType: string[];
  reviewDataTransferPurpose: { [infoCat: string]: { [dataSubjectType: string]: { [recipientType: string]: string[] } } };
  cidInfoMessageShown: boolean; // Track if CID info message has been shown
}

const initialState: QuestionnaireState = {
  currentStep: 0,
  completedSteps: [],
  enabledSteps: [0],
  informationCategory: [],
  dataSubjectType: [], // default to legacy format for backward compatibility
  countries: [],
  entities: {},
  entitiesByCountry: {},
  transferLocation: [],
  recipientType: [],
  reviewDataTransferPurpose: {},
  cidInfoMessageShown: false,
};

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    setCompletedSteps(state, action: PayloadAction<number[]>) {
      state.completedSteps = action.payload;
    },
    setEnabledSteps(state, action: PayloadAction<number[]>) {
      state.enabledSteps = action.payload;
    },
    addCompletedStep(state, action: PayloadAction<number>) {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },
    addEnabledStep(state, action: PayloadAction<number>) {
      if (!state.enabledSteps.includes(action.payload)) {
        state.enabledSteps.push(action.payload);
      }
    },
    resetQuestionnaire(state) {
      state.currentStep = 0;
      state.completedSteps = [];
      state.enabledSteps = [0];
      state.informationCategory = [];
      state.dataSubjectType = [];
      state.countries = [];
      state.entities = {};
      state.entitiesByCountry = {};
      state.transferLocation = [];
      state.recipientType = [];
      state.reviewDataTransferPurpose = {};
      state.cidInfoMessageShown = false;
    },
    setInformationCategory(state, action: PayloadAction<string[]>) {
      state.informationCategory = action.payload;
      // Reset CID info message flag when information category changes
      state.cidInfoMessageShown = false;
    },
    setDataSubjectType(state, action: PayloadAction<string[] | { CID: string[]; ED: string[] }>) {
      // Accept both legacy array and new categorized object
      if (Array.isArray(action.payload)) {
        state.dataSubjectType = action.payload;
      } else if (
        typeof action.payload === 'object' &&
        action.payload !== null &&
        ('CID' in action.payload || 'ED' in action.payload)
      ) {
        state.dataSubjectType = {
          CID: action.payload.CID || [],
          ED: action.payload.ED || []
        };
      } else {
        // fallback: set as empty array
        state.dataSubjectType = [];
      }
    },
    setCountries(state, action: PayloadAction<string[]>) {
      state.countries = action.payload;
    },
    setCategorizedEntities(state, action: PayloadAction<CategorizedEntities>) {
      state.entities = action.payload;
    },
    addEntityToCategory(state, action: PayloadAction<{category: string, entityId: string, name: string}>) {
      const { category, entityId } = action.payload;
      if (!state.entities[category]) {
        state.entities[category] = [];
      }
      if (!state.entities[category].includes(entityId)) {
        state.entities[category].push(entityId);
      }
    },
    removeEntityFromCategory(state, action: PayloadAction<{category: string, entityId: string}>) {
      const { category, entityId } = action.payload;
      if (state.entities[category]) {
        state.entities[category] = state.entities[category].filter(id => id !== entityId);
        // Remove empty category
        if (state.entities[category].length === 0) {
          delete state.entities[category];
        }
      }
    },
    addEntityToCountry(state, action: PayloadAction<{country: string, entityId: string, name: string}>) {
      const { country, entityId } = action.payload;
      if (!state.entitiesByCountry[country]) {
        state.entitiesByCountry[country] = [];
      }
      if (!state.entitiesByCountry[country].includes(entityId)) {
        state.entitiesByCountry[country].push(entityId);
      }
    },
    removeEntityFromCountry(state, action: PayloadAction<{country: string, entityId: string}>) {
      const { country, entityId } = action.payload;
      if (state.entitiesByCountry[country]) {
        state.entitiesByCountry[country] = state.entitiesByCountry[country].filter(id => id !== entityId);
        if (state.entitiesByCountry[country].length === 0) {
          delete state.entitiesByCountry[country];
        }
      }
    },
    setTransferLocation(state, action: PayloadAction<string[]>) {
      state.transferLocation = action.payload;
    },
    setRecipientType(state, action: PayloadAction<string[]>) {
      state.recipientType = action.payload;
    },
    setReviewDataTransferPurpose(state, action: PayloadAction<{ [infoCat: string]: { [dataSubjectType: string]: { [recipientType: string]: string[] } } }>) {
      state.reviewDataTransferPurpose = action.payload;
    },
    setCidInfoMessageShown(state, action: PayloadAction<boolean>) {
      state.cidInfoMessageShown = action.payload;
    },
  },
});

export const {
  setCurrentStep,
  setCompletedSteps,
  setEnabledSteps,
  addCompletedStep,
  addEnabledStep,
  resetQuestionnaire,
  setInformationCategory,
  setDataSubjectType,
  setCountries,
  setCategorizedEntities,
  addEntityToCategory,
  removeEntityFromCategory,
  addEntityToCountry,
  removeEntityFromCountry,
  setTransferLocation,
  setRecipientType,
  setReviewDataTransferPurpose,
  setCidInfoMessageShown,
} = questionnaireSlice.actions;

export default questionnaireSlice.reducer; 