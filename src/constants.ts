// Information Categories
export const INFO_CATEGORY_CID = 'CID';
export const INFO_CATEGORY_ED = 'ED';
export const INFO_CATEGORIES = [INFO_CATEGORY_CID, INFO_CATEGORY_ED];

// Data Subject Types
export const DATA_SUBJECT_TYPE_CLIENT = 'Client';
export const DATA_SUBJECT_TYPE_PROSPECT = 'Prospect';
export const DATA_SUBJECT_TYPE_CS_CLIENT = 'CS Client';
export const DATA_SUBJECT_TYPE_U_CLIENT = 'Client';
export const DATA_SUBJECT_TYPE_EMPLOYEE = 'Employee';
export const DATA_SUBJECT_TYPE_U_EMPLOYEE = 'Employee';
export const DATA_SUBJECT_TYPE_CANDIDATE = 'Candidate';
export const DATA_SUBJECT_TYPE_U_CANDIDATE = 'Candidate';
export const DATA_SUBJECT_TYPE_CS_EMPLOYEE = 'CS Employee';
export const DATA_SUBJECT_TYPES_CLIENT = [DATA_SUBJECT_TYPE_CLIENT, DATA_SUBJECT_TYPE_PROSPECT, DATA_SUBJECT_TYPE_CS_CLIENT, DATA_SUBJECT_TYPE_U_CLIENT];
export const DATA_SUBJECT_TYPES_EMPLOYEE = [DATA_SUBJECT_TYPE_EMPLOYEE, DATA_SUBJECT_TYPE_CANDIDATE, DATA_SUBJECT_TYPE_CS_EMPLOYEE, DATA_SUBJECT_TYPE_U_EMPLOYEE, DATA_SUBJECT_TYPE_U_CANDIDATE];

// Recipient Types
export const RECIPIENT_TYPE_ENTITY = 'Entity';
export const RECIPIENT_TYPE_SERVICE_PROVIDER = 'Service Provider';
export const RECIPIENT_TYPE_THIRD_PARTY = 'Third Party';
export const RECIPIENT_TYPE_EXTERNAL_AUTHORITIES = 'External Authorities';
export const RECIPIENT_TYPES = [RECIPIENT_TYPE_ENTITY, RECIPIENT_TYPE_SERVICE_PROVIDER, RECIPIENT_TYPE_THIRD_PARTY, RECIPIENT_TYPE_EXTERNAL_AUTHORITIES];

// Guidance Types
export const GUIDANCE_TYPE_LEGAL = 'Legal Guidance';
export const GUIDANCE_TYPE_BUSINESS = 'Business Guidance';
export const GUIDANCE_TYPES = [GUIDANCE_TYPE_LEGAL, GUIDANCE_TYPE_BUSINESS];

// Purpose (example, add all used in your project)
export const PURPOSE_FACILITATION_OUTSOURCING = 'Facilitation of Outsourcing/Nearshoring/Offshoring';
export const PURPOSE_ADMIN_EMPLOYMENT_CONTRACT = 'Administration of Employment Contract';
export const PURPOSE_MONITORING = 'Monitoring';
export const PURPOSE_CLIENT_RELATIONSHIP_MANAGEMENT = 'Client Relationship Management';
export const PURPOSE_KYC_AML = 'KYC/AML';
export const PURPOSE_AD_HOC_PROVISION = 'Ad-Hoc Provision of Services';
export const PURPOSE_COMPLIANCE_LEGAL = 'Compliance with Legal or Regulatory Obligations';
export const PURPOSE_OTHER = 'Other Purposes';
export const PURPOSE_COMPLIANCE_VOLUNTARY = 'Compliance with Voluntary Disclosure';
export const PURPOSES = [
  PURPOSE_FACILITATION_OUTSOURCING,
  PURPOSE_ADMIN_EMPLOYMENT_CONTRACT,
  PURPOSE_MONITORING,
  PURPOSE_CLIENT_RELATIONSHIP_MANAGEMENT,
  PURPOSE_KYC_AML,
  PURPOSE_AD_HOC_PROVISION,
  PURPOSE_COMPLIANCE_LEGAL,
  PURPOSE_OTHER,
  PURPOSE_COMPLIANCE_VOLUNTARY
];

// Scope of Data
export const SCOPE_PERSONAL_DATA = 'Personal Data';
export const SCOPE_SENSITIVE_PERSONAL_DATA = 'Sensitive Personal Data';
export const SCOPE_CRIMINAL_DATA = 'Criminal Data';
export const SCOPES = [SCOPE_PERSONAL_DATA, SCOPE_SENSITIVE_PERSONAL_DATA, SCOPE_CRIMINAL_DATA];
