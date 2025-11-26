export type ControlType = 'MER' | 'EUC' | 'Third Party Controls';

export interface ControlMetadata {
  controlId: string;
  controlType: ControlType;
  applicationId: string;
  applicationName: string;
  applicationManager: string;
}

export const MOCK_CONTROLS: ControlMetadata[] = [
  {
    controlId: 'MER-001',
    controlType: 'MER',
    applicationId: 'APP-MER-001',
    applicationName: 'Master Entity Registry System',
    applicationManager: 'John Smith'
  },
  {
    controlId: 'MER-002',
    controlType: 'MER',
    applicationId: 'APP-MER-002',
    applicationName: 'Entity Management Platform',
    applicationManager: 'Sarah Johnson'
  },
  {
    controlId: 'EUC-001',
    controlType: 'EUC',
    applicationId: 'APP-EUC-001',
    applicationName: 'End User Computing Suite',
    applicationManager: 'Michael Chen'
  },
  {
    controlId: 'EUC-002',
    controlType: 'EUC',
    applicationId: 'APP-EUC-002',
    applicationName: 'User Data Processing System',
    applicationManager: 'Emily Davis'
  },
  {
    controlId: 'TPC-001',
    controlType: 'Third Party Controls',
    applicationId: 'APP-TPC-001',
    applicationName: 'Third Party Data Exchange',
    applicationManager: 'Robert Wilson'
  },
  {
    controlId: 'TPC-002',
    controlType: 'Third Party Controls',
    applicationId: 'APP-TPC-002',
    applicationName: 'External Partner Integration',
    applicationManager: 'Lisa Anderson'
  }
];

export const getControlsByType = (type: ControlType): ControlMetadata[] => {
  return MOCK_CONTROLS.filter(control => control.controlType === type);
};

export const getControlById = (controlId: string): ControlMetadata | undefined => {
  return MOCK_CONTROLS.find(control => control.controlId === controlId);
};

export const getAllControls = (): ControlMetadata[] => {
  return MOCK_CONTROLS;
};



