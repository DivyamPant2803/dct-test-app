import { Entity } from '../types';

// Simulated entity data - In a real app, this would come from an API
const generateEntitiesForCountry = (countryCode: string): Entity[] => {
  const clientCategories = ['Investment', 'Securities', 'Wealth', 'Banking', 'Insurance'];
  const entities: Entity[] = [];

  // Generate Client entities
  clientCategories.forEach(category => {
    // Generate 20-30 entities per category
    const count = Math.floor(Math.random() * 11) + 20;
    for (let i = 0; i < count; i++) {
      entities.push({
        id: `${countryCode}-${category}-${i}`,
        name: `${countryCode} ${category} Entity ${i + 1}`,
        category,
        countryCode,
        description: `${category} services provider in ${countryCode}`,
      });
    }
  });

  // Generate Employee entities
  const employeeCount = Math.floor(Math.random() * 11) + 20; // 20-30 employee entities
  for (let i = 0; i < employeeCount; i++) {
    entities.push({
      id: `${countryCode}-Employee-${i}`,
      name: `${countryCode} Employee Entity ${i + 1}`,
      category: 'Employee',
      countryCode,
      description: `Employee entity in ${countryCode}`,
    });
  }

  return entities;
};

// Cache for entity data
const entityCache = new Map<string, Entity[]>();

export const fetchEntitiesForCountry = async (countryCode: string): Promise<Entity[]> => {
  // Check cache first
  if (entityCache.has(countryCode)) {
    return entityCache.get(countryCode)!;
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate and cache entities
  const entities = generateEntitiesForCountry(countryCode);
  entityCache.set(countryCode, entities);
  
  return entities;
};

export const groupEntitiesByCategory = (entities: Entity[]): { category: string; entities: Entity[] }[] => {
  const groupedMap = entities.reduce((acc, entity) => {
    if (!acc.has(entity.category)) {
      acc.set(entity.category, []);
    }
    acc.get(entity.category)!.push(entity);
    return acc;
  }, new Map<string, Entity[]>());

  return Array.from(groupedMap.entries()).map(([category, entities]) => ({
    category,
    entities: entities.sort((a, b) => a.name.localeCompare(b.name)),
  }));
};

export const searchEntities = (entities: Entity[], searchTerm: string): Entity[] => {
  const lowercaseSearch = searchTerm.toLowerCase();
  return entities.filter(entity => 
    entity.name.toLowerCase().includes(lowercaseSearch) ||
    entity.description?.toLowerCase().includes(lowercaseSearch)
  );
}; 