import { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Download,
  RefreshCw,
  Table,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  FileUp,
  Database,
  Filter,
  Search
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { recentLeads } from '../../data/mockData';
import toast from 'react-hot-toast';

const Import = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep] = useState(1);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [rowCount, setRowCount] = useState(0);

  const requiredFields = ['name', 'company', 'email', 'value', 'currency'];
  const optionalFields = ['status', 'phone', 'source'];

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize((selectedFile.size / 1024).toFixed(2) + ' KB');
    
    const reader = new FileReader();

    if (selectedFile.name.endsWith('.csv')) {
      reader.onload = (event) => {
        const csvData = event.target.result;
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processFileData(results.data, results.meta.fields);
          },
          error: (error) => {
            toast.error('❌ Error parsing CSV file');
            console.error(error);
          }
        });
      };
      reader.readAsText(selectedFile);
    } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const headers = Object.keys(jsonData[0] || {});
        processFileData(jsonData, headers);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      toast.error('❌ Please upload a CSV or Excel file');
    }
  };

  const processFileData = (data, fileHeaders) => {
    if (data.length === 0) {
      toast.error('❌ File is empty');
      return;
    }

    setHeaders(fileHeaders);
    setFullData(data);
    setPreviewData(data.slice(0, 10));
    setRowCount(data.length);
    setStep(2);
    toast.success(`✅ Loaded ${data.length} records`);
  };

  const handleMappingChange = (field, mappedTo) => {
    setMapping({ ...mapping, [field]: mappedTo });
  };

  const handleImport = () => {
    // Validate mapping
    const missingFields = requiredFields.filter(f => !mapping[f] || mapping[f] === '');
    if (missingFields.length > 0) {
      toast.error(`❌ Please map all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setImporting(true);
    setStep(3);

    setTimeout(() => {
      let successCount = 0;
      let failCount = 0;
      const errorList = [];

      fullData.forEach((row, index) => {
        try {
          const name = row[mapping.name] || '';
          const company = row[mapping.company] || '';
          const email = row[mapping.email] || '';
          
          if (!name || !company || !email) {
            failCount++;
            errorList.push(`Row ${index + 1}: Missing required fields (name, company, or email)`);
            return;
          }

          const newLead = {
            id: recentLeads.length + successCount + 1,
            name: name.trim(),
            company: company.trim(),
            email: email.trim(),
            value: parseFloat(row[mapping.value]) || 0,
            currency: row[mapping.currency]?.trim() || 'USD',
            status: row[mapping.status]?.trim() || 'New',
            phone: row[mapping.phone]?.trim() || '',
            source: row[mapping.source]?.trim() || 'Other',
            date: new Date().toISOString(),
            avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          };

          recentLeads.push(newLead);
          successCount++;
        } catch (error) {
          failCount++;
          errorList.push(`Row ${index + 1}: ${error.message}`);
        }
      });

      setImportedCount(successCount);
      setErrorCount(failCount);
      setErrors(errorList);
      setStep(4);
      setImporting(false);

      if (successCount > 0) {
        toast.success(`✅ Successfully imported ${successCount} leads!`);
      }
      if (failCount > 0) {
        toast.error(`⚠️ ${failCount} records failed to import`);
      }
    }, 2000);
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setFullData([]);
    setHeaders([]);
    setMapping({});
    setStep(1);
    setImportedCount(0);
    setErrorCount(0);
    setErrors([]);
    setFileName('');
    setFileSize('');
    setRowCount(0);
  };

  const downloadTemplate = () => {
    const template = [
      ['name', 'company', 'email', 'value', 'currency', 'status', 'phone', 'source'],
      ['John Doe', 'Acme Inc', 'john@acme.com', '10000', 'USD', 'New', '+1 555-1234', 'Website'],
      ['Jane Smith', 'TechCorp', 'jane@techcorp.com', '25000', 'EUR', 'Contacted', '+1 555-5678', 'Referral'],
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📥 Template downloaded!');
  };

  const getFieldLabel = (field) => {
    const labels = {
      'name': '👤 Full Name',
      'company': '🏢 Company',
      'email': '📧 Email',
      'value': '💰 Value',
      'currency': '💱 Currency',
      'status': '📌 Status',
      'phone': '📞 Phone',
      'source': '📡 Source',
    };
    return labels[field] || field;
  };

  const getFieldIcon = (field) => {
    const icons = {
      'name': '👤',
      'company': '🏢',
      'email': '📧',
      'value': '💰',
      'currency': '💱',
      'status': '📌',
      'phone': '📞',
      'source': '📡',
    };
    return icons[field] || '📋';
  };

  const isFieldMapped = (field) => {
    return mapping[field] && mapping[field] !== '';
  };

  const getMappingStatus = () => {
    const mapped = requiredFields.filter(f => isFieldMapped(f)).length;
    const total = requiredFields.length;
    return `${mapped}/${total}`;
  };

  // Step indicator component
  const StepIndicator = ({ number, title, active, completed, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${active || completed ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        completed ? 'bg-green-500 text-white' :
        active ? 'bg-primary text-white ring-4 ring-primary/20' :
        'bg-gray-200 text-gray-500'
      }`}>
        {completed ? <Check className="w-4 h-4" /> : number}
      </div>
      <span className={`text-sm ${active ? 'text-primary font-medium' : completed ? 'text-green-600' : 'text-gray-400'}`}>
        {title}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📤</span> Bulk Import
          </h1>
          <p className="text-gray-500 mt-1">Import leads from CSV or Excel files</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            📄 Download Template
          </button>
          {step > 1 && (
            <button
              onClick={resetImport}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              🔄 Start Over
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <StepIndicator 
            number={1} 
            title="Upload" 
            active={step === 1} 
            completed={step > 1}
            onClick={() => step > 1 && setStep(1)}
          />
          <div className="flex-1 h-0.5 mx-2 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
          </div>
          <StepIndicator 
            number={2} 
            title="Map Fields" 
            active={step === 2} 
            completed={step > 2}
            onClick={() => step > 2 && setStep(2)}
          />
          <div className="flex-1 h-0.5 mx-2 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <StepIndicator 
            number={3} 
            title="Preview" 
            active={step === 3} 
            completed={step > 3}
            onClick={() => step > 3 && setStep(3)}
          />
          <div className="flex-1 h-0.5 mx-2 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step > 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <StepIndicator 
            number={4} 
            title="Complete" 
            active={step === 4} 
            completed={step > 4}
            onClick={() => step > 4 && setStep(4)}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {step === 1 && '📁 Upload your CSV or Excel file'}
            {step === 2 && '🗺️ Map your file columns to the required fields'}
            {step === 3 && '⏳ Importing your data...'}
            {step === 4 && '✅ Import complete!'}
          </p>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition-all hover:bg-primary/5">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileUp className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Upload your file</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                Drag and drop your CSV or Excel file here, or click to browse
              </p>
              <div className="flex gap-4 mt-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">📄 CSV</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">📊 XLSX</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">📊 XLS</span>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="mt-6 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer transition-colors flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Choose File
              </label>
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">{fileName}</p>
                  <p className="text-xs text-gray-500">{fileSize} • {rowCount} records</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setFileName('');
                  setFileSize('');
                  setRowCount(0);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Map Fields */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">🗺️ Map Fields</h2>
              <p className="text-sm text-gray-500">Map your file columns to the required fields</p>
            </div>
            <div className="text-sm text-gray-500">
              Progress: <span className="font-medium text-primary">{getMappingStatus()}</span> mapped
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredFields.map((field) => (
              <div key={field} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-lg mr-1">{getFieldIcon(field)}</span>
                  {getFieldLabel(field)}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    isFieldMapped(field) ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select column...</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                {isFieldMapped(field) && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mapped to "{mapping[field]}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Optional Fields */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Optional Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optionalFields.map((field) => (
                <div key={field} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg mr-1">{getFieldIcon(field)}</span>
                    {getFieldLabel(field)}
                  </label>
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Skip column...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Required fields: Name, Company, Email, Value, Currency
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="mt-6 w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Start Import ({rowCount} records)
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-primary border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">⏳ Importing...</h2>
              <p className="text-sm text-gray-500">Please wait while we process your data</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{rowCount}</p>
              <p className="text-xs text-gray-500">📊 Total Records</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{Object.keys(mapping).filter(k => mapping[k]).length}</p>
              <p className="text-xs text-gray-500">🗺️ Fields Mapped</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">⏳</p>
              <p className="text-xs text-gray-500">📥 Importing...</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {requiredFields.map((field) => (
                    <th key={field} className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                      {getFieldLabel(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    {requiredFields.map((field) => (
                      <td key={field} className="py-2 px-3 text-gray-700">
                        {mapping[field] ? row[mapping[field]] || '-' : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Showing first 5 rows</p>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="text-center py-8">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">🎉 Import Complete!</h2>
            <p className="text-gray-500 mt-2">Your leads have been successfully imported</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <p className="text-3xl font-bold text-green-600">{importedCount}</p>
                <p className="text-sm text-gray-600">✅ Successfully Imported</p>
              </div>
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <p className="text-3xl font-bold text-red-600">{errorCount}</p>
                <p className="text-sm text-gray-600">❌ Failed</p>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-6 text-left">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Error Details:
                </h4>
                <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto border border-red-200">
                  {errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm text-red-600">• {error}</p>
                  ))}
                  {errors.length > 5 && (
                    <p className="text-sm text-gray-500">... and {errors.length - 5} more</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={resetImport}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                🔄 Import More
              </button>
              <button
                onClick={() => window.location.href = '/leads'}
                className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                👥 View Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Data Format */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          📋 Sample Data Format
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500">name</th>
                <th className="text-left py-2 px-3 text-gray-500">company</th>
                <th className="text-left py-2 px-3 text-gray-500">email</th>
                <th className="text-left py-2 px-3 text-gray-500">value</th>
                <th className="text-left py-2 px-3 text-gray-500">currency</th>
                <th className="text-left py-2 px-3 text-gray-500">status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3">John Doe</td>
                <td className="py-2 px-3">Acme Inc</td>
                <td className="py-2 px-3">john@acme.com</td>
                <td className="py-2 px-3">10000</td>
                <td className="py-2 px-3">USD</td>
                <td className="py-2 px-3">New</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3">Jane Smith</td>
                <td className="py-2 px-3">TechCorp</td>
                <td className="py-2 px-3">jane@techcorp.com</td>
                <td className="py-2 px-3">25000</td>
                <td className="py-2 px-3">EUR</td>
                <td className="py-2 px-3">Contacted</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          📥 Download Full Template
        </button>
      </div>
    </div>
  );
};

export default Import;