import { useState } from 'react';
import { Upload, X, FileText, Check } from 'lucide-react';

const CSVImporter = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.split(','));
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setImported(true);
      setTimeout(() => {
        onImport();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-green" />
            Import Leads
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-green transition-colors">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
              <p className="text-xs text-gray-400">Supported format: .csv</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-4 py-2 mt-4 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-green" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {preview.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Preview (first 5 rows):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 text-gray-600">
                                {cell.trim()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {imported ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg text-green-700">
                  <Check className="w-5 h-5" />
                  <span>Import successful! {preview.length} leads added.</span>
                </div>
              ) : (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {preview.length} Leads
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;