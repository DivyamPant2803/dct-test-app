import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/useRedux';

const Sidebar = styled.div`
  width: 170px;
  background: #fff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
`;
const MenuHeader = styled.div`
  font-weight: 400;
  padding: 6px 10px 2px 10px;
  cursor: pointer;
  background: none;
  border-bottom: none;
  font-size: 0.93em;
  color: #64748b;
  letter-spacing: 0.01em;
`;
const MenuContent = styled.div`
  padding: 0 10px 6px 10px;
  background: #fff;
  color: #222;
`;
const Chip = styled.span<{ selected?: boolean }>`
  display: inline-block;
  background: ${({ selected }) => selected ? '#111' : '#f3f4f6'};
  color: ${({ selected }) => selected ? '#fff' : '#222'};
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.82em;
  margin-right: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  border: none;
  font-weight: 400;
  transition: background 0.18s, color 0.18s;
  box-shadow: none;
  line-height: 1.2;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
  text-align: left;
  overflow-wrap: break-word;
  box-sizing: border-box;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px 2px;
  margin-bottom: 2px;
  width: 100%;
`;

// The categories and their display labels
const categories = [
  { key: 'guidanceType', label: 'Legal/Business' },
  { key: 'informationCategory', label: 'Information Category' },
  { key: 'subjectType', label: 'Data Subject Type' },
  { key: 'businessDivision', label: 'Business Division' },
  { key: 'transferLocation', label: 'Transfer Location' },
  { key: 'recipientType', label: 'Recipient Types' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'scope', label: 'Scope of Data' }
];

interface Selections {
  guidanceType?: string | string[];
  informationCategory?: string | string[];
  subjectType?: string | string[];
  recipientType?: string | string[];
  purpose?: string | string[];
  dataType?: string | string[];
}

interface CombinationsSidebarProps {
  selections?: Selections;
  selectedBusinessDivision?: string | null;
  onBusinessDivisionSelect?: (division: string) => void;
  selectedInfoCategory?: string | null;
  onInfoCategorySelect?: (cat: string) => void;
  selectedGuidance?: string | null;
  setSelectedGuidance?: (g: string) => void;
  selectedRecipientTypes?: string | null;
  setSelectedRecipientTypes?: (r: string) => void;
}

const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case 'IB GM': return 'Investment Banking Global Markets (IB GM)';
    case 'IB GB': return 'Investment Banking Global Banking (IB GB)';
    case 'IB': return 'Investment Banking (IB)';
    case 'GWM': return 'Global Wealth Management (GWM)';
    case 'NCL': return 'Non-Core and Legacy (NCL)';
    case 'AM': return 'Asset Management (AM)';
    case 'P&C': return 'Personal & Corporate Banking (PNC)';
    case 'AM ICC/REPM': return 'Asset Management ICC/REPM (AM ICC/REPM)';
    case 'AM WCC': return 'Asset Management WCC (AM WCC)';
    default: return category;
  }
};

const CombinationsSidebar: React.FC<CombinationsSidebarProps> = ({selectedBusinessDivision, onBusinessDivisionSelect, selectedInfoCategory, onInfoCategorySelect, selectedGuidance, setSelectedGuidance, selectedRecipientTypes, setSelectedRecipientTypes }) => {
  const [openMenus, setOpenMenus] = useState<string[]>(categories.map(cat => cat.key)); // all open by default
  const [internalSelectedGuidance, internalSetSelectedGuidance] = useState<string | null>(null);
  const [selectedDataSubjectType, setSelectedDataSubjectType] = useState<string | null>(null);
  const [internalSelectedRecipientTypes, internalSetSelectedRecipientTypes] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [selectedTransferLocation, setSelectedTransferLocation] = useState<string | null>(null);
  // Redux state
  const informationCategory = useAppSelector(state => state.questionnaire.informationCategory);
  const dataSubjectType = useAppSelector(state => state.questionnaire.dataSubjectType);
  const recipientType = useAppSelector(state => state.questionnaire.recipientType);
  const reviewDataTransferPurpose = useAppSelector(state => state.questionnaire.reviewDataTransferPurpose);
  const transferLocation = useAppSelector(state => state.questionnaire.transferLocation);
  const entities = useAppSelector(state => state.questionnaire.entities);

  const showLegal = informationCategory.includes('ED');
  const showBusiness = informationCategory.includes('CID');

  const toggleMenu = (key: string) => {
    setOpenMenus(openMenus =>
      openMenus.includes(key)
        ? openMenus.filter(k => k !== key)
        : [...openMenus, key]
    );
  };

  // Handler for chip selection
  const handleGuidanceSelect = (type: string) => {
    if (setSelectedGuidance) setSelectedGuidance(type);
    else internalSetSelectedGuidance(type);
  };

  // Handler for info category chip selection
  const handleInfoCategorySelect = (cat: string) => {
    if (onInfoCategorySelect) {
      onInfoCategorySelect(cat);
    }
    setSelectedDataSubjectType(null); // reset data subject type selection when info category changes
  };

  // Handler for data subject type chip selection
  const handleDataSubjectTypeSelect = (type: string) => {
    setSelectedDataSubjectType(type);
  };

  const handleRecipientTypesSelect = (type: string) => {
    if (setSelectedRecipientTypes) setSelectedRecipientTypes(type);
    else internalSetSelectedRecipientTypes(type);
  }

  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
  }

  const handleScopeSelect = (scope: string) => {
    setSelectedScope(scope);
  }

  const handleTransferLocationSelect = (loc: string) => {
    setSelectedTransferLocation(loc);
  }

  const handleBusinessDivisionSelect = (division: string) => {
    if (onBusinessDivisionSelect) {
      onBusinessDivisionSelect(division);
    }
  };

  // Type guard for categorized dataSubjectType
  function isCategorizedDataSubjectType(val: any): val is { CID: string[]; ED: string[] } {
    return val && typeof val === 'object' && 'CID' in val && 'ED' in val;
  }

  // Determine what to show under Information Category
  let infoCategoryChips: string[] = [];
  if (selectedGuidance === 'Business Guidance') {
    infoCategoryChips = ['CID'];
  } else {
    infoCategoryChips = informationCategory;
  }

  // Determine what to show under Data Subject Type
  let dataSubjectTypeChips: string[] = [];
  if (
    selectedInfoCategory &&
    isCategorizedDataSubjectType(dataSubjectType) &&
    (selectedInfoCategory === 'CID' || selectedInfoCategory === 'ED')
  ) {
    dataSubjectTypeChips = dataSubjectType[selectedInfoCategory];
  }

  // Determine what to show under Recipient Types
  let recipientTypeChips: string[] = Array.isArray(recipientType) ? recipientType : [];

  // Determine what to show under Purpose
  let purposeChips: string[] = [];
  if (
    selectedInfoCategory &&
    selectedDataSubjectType &&
    reviewDataTransferPurpose &&
    selectedRecipientTypes &&
    reviewDataTransferPurpose[selectedInfoCategory] &&
    reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType] &&
    reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType][selectedRecipientTypes]
  ) {
    purposeChips = reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType][selectedRecipientTypes];
  }

  // Use prop or internal state for selectedGuidance/selectedRecipientTypes
  const effectiveSelectedGuidance = selectedGuidance !== undefined ? selectedGuidance : internalSelectedGuidance;
  const effectiveSelectedRecipientTypes = selectedRecipientTypes !== undefined ? selectedRecipientTypes : internalSelectedRecipientTypes;

  return (
    <Sidebar>
      {categories.map(cat => (
        // Hide Scope of Data menu if selectedInfoCategory is CID
        (cat.key !== 'scope' || selectedInfoCategory === 'ED' || (Array.isArray(selectedInfoCategory) && selectedInfoCategory.includes('ED'))) ? (
          <div key={cat.key}>
            <MenuHeader onClick={() => toggleMenu(cat.key)}>
              {cat.label}
            </MenuHeader>
            {openMenus.includes(cat.key) && (
              <MenuContent>
                {cat.key === 'guidanceType' ? (
                  <>
                    {showLegal && (
                      <Chip
                        selected={effectiveSelectedGuidance === 'Legal Guidance'}
                        onClick={() => handleGuidanceSelect('Legal Guidance')}
                      >
                        Legal Guidance
                      </Chip>
                    )}
                    {showBusiness && (
                      <Chip
                        selected={effectiveSelectedGuidance === 'Business Guidance'}
                        onClick={() => handleGuidanceSelect('Business Guidance')}
                      >
                        Business Guidance
                      </Chip>
                    )}
                    {!showLegal && !showBusiness && <span style={{ color: '#aaa' }}>None selected</span>}
                  </>
                ) : cat.key === 'informationCategory' ? (
                  <>
                    {infoCategoryChips.length > 0 ? (
                      <ChipContainer>
                        {infoCategoryChips.map((catVal: string) => (
                          <Chip
                            key={catVal}
                            selected={selectedInfoCategory === catVal}
                            onClick={() => handleInfoCategorySelect(catVal)}
                          >
                            {catVal}
                          </Chip>
                        ))}
                      </ChipContainer>
                    ) : (
                      <span style={{ color: '#aaa' }}>None selected</span>
                    )}
                  </>
                ) : cat.key === 'subjectType' ? (
                  <>
                    {selectedInfoCategory && dataSubjectTypeChips.length > 0 ? (
                      <ChipContainer>
                        {dataSubjectTypeChips.map((type: string) => (
                          <Chip
                            key={type}
                            selected={selectedDataSubjectType === type}
                            onClick={() => handleDataSubjectTypeSelect(type)}
                          >
                            {type}
                          </Chip>
                        ))}
                      </ChipContainer>
                    ) : (
                      <span style={{ color: '#aaa' }}>Select an Information Category</span>
                    )}
                  </>
                )
                : cat.key === 'businessDivision' && selectedInfoCategory === 'CID' ? (
                  selectedInfoCategory === 'CID' && !Array.isArray(selectedInfoCategory) ? (
                    <>
                      {Object.keys(entities)
                        .filter((div: string) => div !== 'Employee')
                        .map((division: string) => (
                          <Chip
                            key={division}
                            selected={selectedBusinessDivision === division}
                            onClick={() => handleBusinessDivisionSelect(division)}
                          >
                            {getCategoryDisplayName(division)}
                          </Chip> 
                        ))}
                    </>
                  ) : null
                )
                 : cat.key === 'transferLocation' ? (
                  <>
                    {Array.isArray(transferLocation) && transferLocation.length > 0 ? (
                      <ChipContainer>
                        {transferLocation.map((loc: string) => (
                          <Chip
                            key={loc}
                            selected={selectedTransferLocation === loc}
                            onClick={() => handleTransferLocationSelect(loc)}
                          >
                            {loc}
                          </Chip>
                        ))}
                      </ChipContainer>
                    ) : (
                      <span style={{ color: '#aaa' }}>None selected</span>
                    )}
                  </>
                ) : cat.key === 'recipientType' ? (
                  <>
                    {recipientTypeChips.length > 0 ? (
                      <ChipContainer>
                        {recipientTypeChips.map((type: string) => (
                          <Chip
                           key={type}
                           selected={effectiveSelectedRecipientTypes === type}
                           onClick={() => handleRecipientTypesSelect(type)}
                          >
                            {type}
                          </Chip>
                        ))}
                      </ChipContainer>
                    ) : (
                      <span style={{ color: '#aaa' }}>None selected</span>
                    )}
                  </>
                ) : cat.key === 'purpose' ? (
                  <>
                    {purposeChips.length > 0 ? (
                      <ChipContainer>
                        {purposeChips.map((purpose: string) => (
                          <Chip key={purpose}
                            selected={selectedPurpose === purpose}
                            onClick={() => handlePurposeSelect(purpose)}
                          >
                            {purpose}
                          </Chip>
                        ))}
                      </ChipContainer>
                    ) : (
                      <span style={{ color: '#aaa' }}>Select Information Category and Data Subject Type</span>
                    )}
                  </>
                ) : cat.key === 'scope' ? (
                  <>
                    {selectedInfoCategory === 'ED' && selectedDataSubjectType &&
                      reviewDataTransferPurpose &&
                      reviewDataTransferPurpose[selectedInfoCategory] &&
                      reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType] &&
                      reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType]['Scope'] &&
                      reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType]['Scope'].length > 0 ? (
                        <ChipContainer>
                          {reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType]['Scope'].map((scope: string) => (
                            <Chip key={scope}
                              selected={selectedScope === scope}
                              onClick={() => handleScopeSelect(scope)}
                            >{scope}</Chip>
                          ))}
                        </ChipContainer>
                      ) : (
                        <span style={{ color: '#aaa' }}>None selected</span>
                      )
                    }
                  </>
                ) : null}
              </MenuContent>
            )}
          </div>
        ) : null
      ))}
    </Sidebar>
  );
};

export default CombinationsSidebar; 