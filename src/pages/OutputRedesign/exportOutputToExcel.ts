import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface OutputDataRow {
  [key: string]: any;
}
export interface AzureCloudHostingRow {
  region: string;
  approvalStatus: string;
  conditions?: string;
}
export interface AccessLocationRow {
  country: string;
  countryCode: string;
  businessDivision: string;
  entity: string;
  exposureAllowedTo: string[];
}
export interface ApprovedChannelRow {
  [key: string]: any;
}

/**
 * Exports Output page data to Excel with 4 sheets.
 * @param outputData Array of output data rows
 * @param azureCloudHosting Array of Azure Cloud Hosting rows
 * @param accessLocations Array of Access Location rows
 * @param approvedChannels Array of Approved Channel rows
 * @param fileName Name of the file to download (without extension)
 */
export function exportOutputToExcel(
  outputData: OutputDataRow[],
  azureCloudHosting: AzureCloudHostingRow[],
  accessLocations: AccessLocationRow[],
  approvedChannels: ApprovedChannelRow[],
  fileName: string = 'output'
) {
  const wb = XLSX.utils.book_new();
  // Output Data sheet
  const wsOutput = XLSX.utils.json_to_sheet(outputData);
  XLSX.utils.book_append_sheet(wb, wsOutput, 'Output Data');
  // Azure Cloud Hosting Locations sheet
  const wsAzure = XLSX.utils.json_to_sheet(azureCloudHosting);
  XLSX.utils.book_append_sheet(wb, wsAzure, 'Azure Cloud Hosting');
  // Access Locations sheet
  // Convert exposureAllowedTo array to comma-separated string for Excel
  const accessLocationsProcessed = accessLocations.map(row => ({
    ...row,
    exposureAllowedTo: Array.isArray(row.exposureAllowedTo) ? row.exposureAllowedTo.join(', ') : row.exposureAllowedTo
  }));
  const wsAccess = XLSX.utils.json_to_sheet(accessLocationsProcessed);
  XLSX.utils.book_append_sheet(wb, wsAccess, 'Access Locations');
  // Approved Channels sheet
  const wsChannels = XLSX.utils.json_to_sheet(approvedChannels);
  XLSX.utils.book_append_sheet(wb, wsChannels, 'Approved Channels');
  // Export
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${fileName}.xlsx`);
} 