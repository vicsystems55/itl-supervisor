import * as XLSX from 'xlsx'

class FrontendExportService {
  /**
   * Export installations list - handles both frontend and backend data structures
   * @param {Array} installations - Array of installation objects
   * @param {string} filename - Optional custom filename
   * @returns {number} - Number of records exported
   */
  exportInstallations(installations, filename = null) {
    if (!installations || installations.length === 0) {
      throw new Error('No installations data to export')
    }

    // Transform data for export - handles both data structures
    const exportData = installations.map((installation, index) => {
      // Check if this is backend export data (already formatted) or frontend installation objects
      const isBackendExportData = installation.hasOwnProperty('Facility Name') || 
                                 installation.hasOwnProperty('State')
      
      const baseData = {
        'S/N': index + 1, // Add serial number starting from 1
        'Facility Name': isBackendExportData ? installation['Facility Name'] : installation.facility?.name || 'N/A',
        'State': isBackendExportData ? installation['State'] : installation.facility?.state?.name || 'N/A',
        'LGA': isBackendExportData ? installation['LGA'] : installation.facility?.lga?.name || 'N/A',
        'Country': isBackendExportData ? installation['Country'] : installation.country || 'N/A',
        'Delivery Status': isBackendExportData ? installation['Delivery Status'] : installation.delivery_status || 'N/A',
        'Installation Status': isBackendExportData ? installation['Installation Status'] : installation.installation_status || 'N/A',
        'Health Officer': isBackendExportData ? installation['Health Officer'] : installation.health_officer?.name || installation.healthOfficer?.name || 'N/A',
        'Last Updated': isBackendExportData ? installation['Last Updated'] : (installation.updated_at ? new Date(installation.updated_at).toLocaleDateString() : 'N/A')
      }

      return baseData
    })

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Apply auto-fit column formatting
    this.autoFitColumns(ws, exportData)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Installations')
    
    // Generate filename
    const exportFilename = filename || `installations_export_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Download file
    XLSX.writeFile(wb, exportFilename)
    
    return exportData.length
  }

  /**
   * Export single installation with S/N and proper formatting
   */
  exportSingleInstallation(installation, filename = null) {
    if (!installation) {
      throw new Error('No installation data to export')
    }

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Check if this is backend export data or frontend installation object
    const isBackendExportData = installation.hasOwnProperty('Facility Name')

    const installationData = [
      ['INSTALLATION SUMMARY'],
      ['', ''], // Empty row for spacing
      ['S/N', 'Field', 'Value'],
      [1, 'Facility Name', isBackendExportData ? installation['Facility Name'] : installation.facility?.name || 'N/A'],
      [2, 'State', isBackendExportData ? installation['State'] : installation.facility?.state?.name || 'N/A'],
      [3, 'LGA', isBackendExportData ? installation['LGA'] : installation.facility?.lga?.name || 'N/A'],
      [4, 'Country', isBackendExportData ? installation['Country'] : installation.country || 'N/A'],
      [5, 'Delivery Status', isBackendExportData ? installation['Delivery Status'] : installation.delivery_status || 'N/A'],
      [6, 'Installation Status', isBackendExportData ? installation['Installation Status'] : installation.installation_status || 'N/A'],
      [7, 'Health Officer', isBackendExportData ? installation['Health Officer'] : installation.health_officer?.name || installation.healthOfficer?.name || 'N/A'],
      [8, 'Last Updated', isBackendExportData ? installation['Last Updated'] : (installation.updated_at ? new Date(installation.updated_at).toLocaleString() : 'N/A')]
    ]

    const installationSheet = XLSX.utils.aoa_to_sheet(installationData)
    
    // Apply styling for single installation
    this.formatSingleInstallationSheet(installationSheet, installationData)
    
    XLSX.utils.book_append_sheet(wb, installationSheet, 'Installation Details')

    // Generate filename
    const exportFilename = filename || `installation_${isBackendExportData ? 'export' : installation.id}_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Download file
    XLSX.writeFile(wb, exportFilename)
  }

  /**
   * Export to CSV with S/N numbering
   */
  exportToCSV(installations, filename = null) {
    if (!installations || installations.length === 0) {
      throw new Error('No data to export')
    }

    // Transform data for export - handles both data structures
    const exportData = installations.map((installation, index) => {
      const isBackendExportData = installation.hasOwnProperty('Facility Name') || 
                                 installation.hasOwnProperty('State')
      
      return {
        'S/N': index + 1,
        'Facility Name': isBackendExportData ? installation['Facility Name'] : installation.facility?.name || 'N/A',
        'State': isBackendExportData ? installation['State'] : installation.facility?.state?.name || 'N/A',
        'LGA': isBackendExportData ? installation['LGA'] : installation.facility?.lga?.name || 'N/A',
        'Country': isBackendExportData ? installation['Country'] : installation.country || 'N/A',
        'Delivery Status': isBackendExportData ? installation['Delivery Status'] : installation.delivery_status || 'N/A',
        'Installation Status': isBackendExportData ? installation['Installation Status'] : installation.installation_status || 'N/A',
        'Health Officer': isBackendExportData ? installation['Health Officer'] : installation.health_officer?.name || installation.healthOfficer?.name || 'N/A',
        'Last Updated': isBackendExportData ? installation['Last Updated'] : (installation.updated_at ? new Date(installation.updated_at).toLocaleDateString() : 'N/A')
      }
    })

    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','), // Header row
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `installations_${new Date().toISOString().split('T')[0]}.csv`)
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return exportData.length
  }

  /**
   * Advanced auto-fit columns with proper Excel formatting
   */
  autoFitColumns(ws, jsonData) {
    if (!jsonData || jsonData.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet([])
    const maxWidths = {}

    // Calculate maximum width for each column
    jsonData.forEach(row => {
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '')
        const currentMax = maxWidths[key] || 10 // Minimum width
        const valueLength = value.length
        
        // Different width calculations based on content type
        let calculatedWidth = valueLength
        
        // Adjust for numeric values (S/N column)
        if (key === 'S/N') {
          calculatedWidth = Math.max(5, String(jsonData.length).length + 2)
        }
        // Adjust for status fields
        else if (key.includes('Status')) {
          calculatedWidth = Math.max(12, valueLength)
        }
        // Adjust for date fields
        else if (key.includes('Updated')) {
          calculatedWidth = Math.max(15, valueLength)
        }
        // Adjust for names and other text
        else {
          calculatedWidth = Math.max(valueLength, key.length) + 2 // Add padding
        }
        
        maxWidths[key] = Math.max(currentMax, calculatedWidth)
      })
    })

    // Set column widths with reasonable limits
    if (!ws['!cols']) ws['!cols'] = []
    Object.keys(maxWidths).forEach((key, index) => {
      // Cap maximum width at 50 characters for readability
      const finalWidth = Math.min(maxWidths[key], 50)
      ws['!cols'][index] = { width: finalWidth }
    })

    // Add basic styling for header row
    if (!ws['!rows']) ws['!rows'] = []
    ws['!rows'][0] = { hpt: 20 } // Header row height

    // Add filter and freeze pane for better UX
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ 
      s: { r: 0, c: 0 }, 
      e: { r: 0, c: Object.keys(maxWidths).length - 1 } 
    })}
    
    ws['!freeze'] = { xSplit: 1, ySplit: 1, topLeftCell: 'B2', activePane: 'bottomRight' }
  }

  /**
   * Format single installation sheet with better styling
   */
  formatSingleInstallationSheet(ws, data) {
    if (!ws['!cols']) ws['!cols'] = []
    
    // Set column widths for single installation view
    ws['!cols'][0] = { width: 8 }  // S/N column
    ws['!cols'][1] = { width: 20 } // Field column
    ws['!cols'][2] = { width: 30 } // Value column

    // Set row heights
    if (!ws['!rows']) ws['!rows'] = []
    ws['!rows'][0] = { hpt: 25 } // Title row
    ws['!rows'][2] = { hpt: 20 } // Header row
    
    // Make title row bold and centered (basic styling)
    const titleCell = 'A1'
    if (!ws['!merges']) ws['!merges'] = []
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } })
  }

  /**
   * Universal export method that detects data type and chooses appropriate format
   */
  universalExport(data, format = 'excel', filename = null) {
    if (!data) {
      throw new Error('No data provided for export')
    }

    if (Array.isArray(data)) {
      if (format === 'excel') {
        return this.exportInstallations(data, filename)
      } else {
        return this.exportToCSV(data, filename)
      }
    } else {
      return this.exportSingleInstallation(data, filename)
    }
  }

  /**
   * Enhanced export with custom styling options
   */
  exportWithStyling(installations, options = {}) {
    const {
      filename = null,
      format = 'excel',
      includeSN = true,
      customHeaders = null,
      additionalFields = []
    } = options

    if (!installations || installations.length === 0) {
      throw new Error('No installations data to export')
    }

    // Transform data with custom options
    const exportData = installations.map((installation, index) => {
      const isBackendExportData = installation.hasOwnProperty('Facility Name')
      
      const baseData = {}
      
      // Add S/N if requested
      if (includeSN) {
        baseData['S/N'] = index + 1
      }

      // Use custom headers or default ones
      const headers = customHeaders || {
        'Facility Name': isBackendExportData ? installation['Facility Name'] : installation.facility?.name || 'N/A',
        'State': isBackendExportData ? installation['State'] : installation.facility?.state?.name || 'N/A',
        'LGA': isBackendExportData ? installation['LGA'] : installation.facility?.lga?.name || 'N/A',
        'Country': isBackendExportData ? installation['Country'] : installation.country || 'N/A',
        'Delivery Status': isBackendExportData ? installation['Delivery Status'] : installation.delivery_status || 'N/A',
        'Installation Status': isBackendExportData ? installation['Installation Status'] : installation.installation_status || 'N/A',
        'Health Officer': isBackendExportData ? installation['Health Officer'] : installation.health_officer?.name || installation.healthOfficer?.name || 'N/A',
        'Last Updated': isBackendExportData ? installation['Last Updated'] : (installation.updated_at ? new Date(installation.updated_at).toLocaleDateString() : 'N/A')
      }

      // Merge base data with headers and additional fields
      return { ...baseData, ...headers }
    })

    if (format === 'excel') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      this.autoFitColumns(ws, exportData)
      XLSX.utils.book_append_sheet(wb, ws, 'Installations')
      
      const exportFilename = filename || `installations_export_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, exportFilename)
    } else {
      this.exportToCSV(exportData, filename)
    }

    return exportData.length
  }

  /**
   * Export LCCO details with contact and bank/account fields
   * @param {Array} lccos - Array of LCCO records
   * @param {Object} installationMap - Map of installation_id => installation object (optional)
   * @param {string} filename
   */
  exportLccoDetails(lccos, installationMap = {}, filename = null) {
    if (!lccos || lccos.length === 0) {
      throw new Error('No LCCO records to export')
    }

    const exportData = lccos.map((r, index) => {
      const inst = installationMap && installationMap[r.installation_id] ? installationMap[r.installation_id] : null
      return {
        'S/N': index + 1,
        'Installation ID': r.installation_id || (r.installation ? r.installation.id : 'N/A'),
        'Facility Name': inst?.facility?.name || (r.installation?.facility?.name) || 'N/A',
        'LCCO Name': r.lcco_name || r.name || 'N/A',
        'LCCO Phone': r.lcco_phone || r.phone || 'N/A',
        'Bank Name': r.lcco_bank_name || r.bank_name || 'N/A',
        'Account Number': r.lcco_account_number || r.account_number || 'N/A',
        'Account Name': r.lcco_account_name || r.account_name || 'N/A',
        'Device Serial': r.device_serial_number || r.serial_number || 'N/A',
        'Device Tag': r.device_tag_code || r.tag_code || 'N/A',
        'Created At': r.created_at ? new Date(r.created_at).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A')
      }
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    this.autoFitColumns(ws, exportData)
    XLSX.utils.book_append_sheet(wb, ws, 'LCCO Details')

    const exportFilename = filename || `lcco_details_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, exportFilename)

    return exportData.length
  }
}

export default new FrontendExportService()
