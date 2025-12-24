/**
 * Application Data Service
 * Simulates fetching and normalizing application data from multiple sources
 * In a real implementation, this would call actual APIs (CMDB, IAM, Data Catalog, etc.)
 */

export interface ApplicationData {
    // Core Application Identifiers
    applicationName: string;
    applicationId: string;

    // SWC (Software Component) Specific Fields - for MER templates
    swcId: string;              // Software Component ID
    swcName: string;            // Software Component Name
    swcManager: string;         // SWC Manager name
    swcManagerEmail: string;    // SWC Manager email

    // Ownership and Organization
    owner: string;
    ownerEmail: string;
    businessDivision: string;
    costCenter: string;

    // Data Classification
    dataClassification: string;
    cidDataType: string;        // Natural CID / Corporate CID
    dataCategorization: string; // A / B / C

    // Infrastructure
    locations: string[];
    hostingProvider: string;
    deploymentModel: string;

    // Compliance
    lastAuditDate: string;
    complianceFlags: string[];
    handlesCid: boolean;        // Does app handle CID?

    // Access Control
    allowsCidAccess: boolean;   // Does app allow CID access?
    laacSolution: string;       // LAAC solution implemented

    // Purpose
    applicationPurpose: string; // Purpose of the application
}

interface RawDataSource {
    source: string;
    data: Partial<ApplicationData>;
}

/**
 * Mock CMDB (Configuration Management Database) API call
 * Returns: SWC identifiers, deployment info, audit data
 */
const fetchFromCMDB = async (appId: string): Promise<Partial<ApplicationData>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        applicationId: appId,
        swcId: appId,
        swcName: `SWC-${appId}`,
        owner: 'John Doe',
        ownerEmail: 'john.doe@company.com',
        businessDivision: 'Technology & Operations',
        costCenter: 'CC-12345',
        deploymentModel: 'Public Cloud',
        hostingProvider: 'AWS US-East-1',
        lastAuditDate: '2024-12-01'
    };
};

/**
 * Mock IAM (Identity & Access Management) API call
 * Returns: Manager info, access flags
 */
const fetchFromIAM = async (appName: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
        applicationName: appName,
        swcManager: 'Jane Smith',
        swcManagerEmail: 'jane.smith@company.com',
        owner: 'Jane Smith',
        complianceFlags: ['SOC2', 'ISO27001'],
        allowsCidAccess: true,
        handlesCid: true
    };
};

/**
 * Mock Data Catalog API call
 * Returns: Data classification, CID info, locations
 */
const fetchFromDataCatalog = async (appId: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
        applicationId: appId,
        dataClassification: 'Confidential',
        cidDataType: 'Natural CID',
        dataCategorization: 'A',
        locations: ['US-East-1', 'EU-West-1'],
        complianceFlags: ['GDPR', 'CCPA']
    };
};

/**
 * Mock Compliance Registry API call
 * Returns: Compliance flags, LAAC solution, app purpose
 */
const fetchFromComplianceRegistry = async (appName: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
        applicationName: appName,
        applicationPurpose: 'Customer data management and analytics platform for business intelligence',
        laacSolution: 'Azure AD',
        hostingProvider: 'AWS US-East-1, Azure West Europe',
        lastAuditDate: '2024-11-15',
        complianceFlags: ['SOC2', 'HIPAA']
    };
};

/**
 * Normalize and consolidate data from multiple sources
 * Priority: CMDB > IAM > Data Catalog > Compliance Registry
 */
const normalizeData = (rawSources: RawDataSource[]): ApplicationData => {
    const merged: Partial<ApplicationData> = {};

    // Merge data (later sources overwrite earlier ones for conflicting fields)
    rawSources.forEach(source => {
        Object.assign(merged, source.data);
    });

    // Deduplicate compliance flags
    if (merged.complianceFlags) {
        merged.complianceFlags = [...new Set(merged.complianceFlags)];
    }

    // Deduplicate locations
    if (merged.locations) {
        merged.locations = [...new Set(merged.locations)];
    }

    // Provide defaults for missing fields
    const normalized: ApplicationData = {
        // Core identifiers
        applicationName: merged.applicationName || 'Unknown Application',
        applicationId: merged.applicationId || 'APP-UNKNOWN',

        // SWC fields
        swcId: merged.swcId || merged.applicationId || 'SWC-UNKNOWN',
        swcName: merged.swcName || merged.applicationName || 'Unknown SWC',
        swcManager: merged.swcManager || merged.owner || 'Unassigned',
        swcManagerEmail: merged.swcManagerEmail || '',

        // Ownership
        owner: merged.owner || 'Unassigned',
        ownerEmail: merged.ownerEmail || '',
        businessDivision: merged.businessDivision || 'Unknown Division',
        costCenter: merged.costCenter || 'Unknown',

        // Data classification
        dataClassification: merged.dataClassification || 'Internal',
        cidDataType: merged.cidDataType || '',
        dataCategorization: merged.dataCategorization || '',

        // Infrastructure
        locations: merged.locations || ['Unknown'],
        hostingProvider: merged.hostingProvider || 'Unknown',
        deploymentModel: merged.deploymentModel || 'Unknown',

        // Compliance
        lastAuditDate: merged.lastAuditDate || 'N/A',
        complianceFlags: merged.complianceFlags || [],
        handlesCid: merged.handlesCid ?? false,

        // Access control
        allowsCidAccess: merged.allowsCidAccess ?? false,
        laacSolution: merged.laacSolution || '',

        // Purpose
        applicationPurpose: merged.applicationPurpose || ''
    };

    return normalized;
};

/**
 * Fetch application data from multiple sources and consolidate
 * @param appName - Application name
 * @param appId - Application ID
 * @returns Consolidated application data
 */
export const fetchApplicationData = async (
    appName: string,
    appId: string
): Promise<ApplicationData> => {
    try {
        // Fetch from all sources in parallel
        const [cmdbData, iamData, catalogData, complianceData] = await Promise.all([
            fetchFromCMDB(appId),
            fetchFromIAM(appName),
            fetchFromDataCatalog(appId),
            fetchFromComplianceRegistry(appName)
        ]);

        // Prepare raw data sources with priority order
        const rawSources: RawDataSource[] = [
            { source: 'Compliance Registry', data: complianceData },
            { source: 'Data Catalog', data: catalogData },
            { source: 'IAM', data: iamData },
            { source: 'CMDB', data: cmdbData } // Highest priority
        ];

        // Normalize and return
        const normalizedData = normalizeData(rawSources);

        console.log('[ApplicationDataService] Data fetched and normalized:', {
            sources: rawSources.map(s => s.source),
            result: normalizedData
        });

        return normalizedData;

    } catch (error) {
        console.error('[ApplicationDataService] Failed to fetch application data:', error);

        // Return fallback data with all required fields
        return {
            applicationName: appName,
            applicationId: appId,
            swcId: appId,
            swcName: appName,
            swcManager: 'Error - Unable to fetch',
            swcManagerEmail: '',
            owner: 'Error - Unable to fetch',
            ownerEmail: '',
            businessDivision: 'Unknown',
            costCenter: 'Unknown',
            dataClassification: 'Unknown',
            cidDataType: '',
            dataCategorization: '',
            locations: ['Unknown'],
            hostingProvider: 'Unknown',
            deploymentModel: 'Unknown',
            lastAuditDate: 'N/A',
            complianceFlags: [],
            handlesCid: false,
            allowsCidAccess: false,
            laacSolution: '',
            applicationPurpose: ''
        };
    }
};

/**
 * Check if application exists in data sources
 * @param appId - Application ID
 * @returns True if application found
 */
export const validateApplicationId = async (appId: string): Promise<boolean> => {
    try {
        const data = await fetchFromCMDB(appId);
        return !!data.applicationId;
    } catch {
        return false;
    }
};
