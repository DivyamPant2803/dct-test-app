/**
 * Application Data Service
 * Simulates fetching and normalizing application data from multiple sources
 * In a real implementation, this would call actual APIs (CMDB, IAM, Data Catalog, etc.)
 */

export interface ApplicationData {
    applicationName: string;
    applicationId: string;
    owner: string;
    dataClassification: string;
    locations: string[];
    hostingProvider: string;
    deploymentModel: string;
    lastAuditDate: string;
    complianceFlags: string[];
}

interface RawDataSource {
    source: string;
    data: Partial<ApplicationData>;
}

/**
 * Mock CMDB (Configuration Management Database) API call
 */
const fetchFromCMDB = async (appId: string): Promise<Partial<ApplicationData>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        applicationId: appId,
        owner: 'John Doe (CMDB)',
        deploymentModel: 'Public Cloud',
        lastAuditDate: '2024-12-01'
    };
};

/**
 * Mock IAM (Identity & Access Management) API call
 */
const fetchFromIAM = async (appName: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
        applicationName: appName,
        owner: 'Jane Smith (IAM)',
        complianceFlags: ['SOC2', 'ISO27001']
    };
};

/**
 * Mock Data Catalog API call
 */
const fetchFromDataCatalog = async (appId: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
        applicationId: appId,
        dataClassification: 'Confidential',
        locations: ['US-East-1', 'EU-West-1'],
        complianceFlags: ['GDPR', 'CCPA']
    };
};

/**
 * Mock Compliance Registry API call
 */
const fetchFromComplianceRegistry = async (appName: string): Promise<Partial<ApplicationData>> => {
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
        applicationName: appName,
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
        applicationName: merged.applicationName || 'Unknown Application',
        applicationId: merged.applicationId || 'APP-UNKNOWN',
        owner: merged.owner || 'Unassigned',
        dataClassification: merged.dataClassification || 'Internal',
        locations: merged.locations || ['Unknown'],
        hostingProvider: merged.hostingProvider || 'Unknown',
        deploymentModel: merged.deploymentModel || 'Unknown',
        lastAuditDate: merged.lastAuditDate || 'N/A',
        complianceFlags: merged.complianceFlags || []
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

        // Return fallback data
        return {
            applicationName: appName,
            applicationId: appId,
            owner: 'Error - Unable to fetch',
            dataClassification: 'Unknown',
            locations: ['Unknown'],
            hostingProvider: 'Unknown',
            deploymentModel: 'Unknown',
            lastAuditDate: 'N/A',
            complianceFlags: []
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
