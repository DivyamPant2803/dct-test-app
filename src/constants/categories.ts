export interface CategoryMeta {
  icon: string;
  keywords: string[];
}

export interface CategoriesMeta {
  [key: string]: CategoryMeta;
}

export const categoriesMeta: CategoriesMeta = {
  announcements: {
    icon: "some icon for announcements",
    keywords: ['announcement']
  },
  releaseNotes: {
    icon: "some icon for key notes",
    keywords: ['release notes']
  },
  keyNotes: {
    icon: "some icon for key notes",
    keywords: ['key notes']
  },
  trainingMaterials: {
    icon: "some icon for training materials",
    keywords: ['training']
  },
  tips: {
    icon: "some icon for tips",
    keywords: ['tips']
  }
};

export const getCategoryFromTitle = (title: string): keyof CategoriesMeta | null => {
  const lowerTitle = title.toLowerCase();
  
  for (const [category, meta] of Object.entries(categoriesMeta)) {
    if (meta.keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category as keyof CategoriesMeta;
    }
  }
  
  return null;
}; 