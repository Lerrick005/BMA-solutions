import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import leadService from '../../services/leadService';
import { supportedCurrencies, formatCurrency, convertCurrency } from '../../utils/currency';

const Leads = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    status: 'New',
    value: '',
    currency: 'USD',
  });

  const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];

  const loadLeads = () => {
    setLoading(true);
    const filters = {
      search: searchTerm,
      status: statusFilter,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    const filteredLeads = leadService.getAll(filters);
    setAllLeads(filteredLeads);
    setTotalItems(filteredLeads.length);
    setCurrentPage(1);
    updatePageData(filteredLeads, 1);
    setLoading(false);
  };

  const updatePageData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    setLeads(paginatedData);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updatePageData(allLeads, page);
    document.getElementById('leads-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    updatePageData(allLeads, 1);
  };

  useEffect(() => {
    loadLeads();
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (allLeads.length > 0) {
      updatePageData(allLeads, currentPage);
    }
  }, [itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      status: lead.status,
      value: lead.value.toString(),
      currency: lead.currency,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAddLead = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      status: 'New',
      value: '',
      currency: 'USD',
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      leadService.delete(leadToDelete.id);
      loadLeads();
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      leadService.create({
        name: formData.name,
        company: formData.company,
        email: formData.email,
        status: formData.status,
        value: parseFloat(formData.value),
        currency: formData.currency,
      });
    } else if (modalMode === 'edit' && selectedLead) {
      leadService.update(selectedLead.id, {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        status: formData.status,
        value: parseFloat(formData.value),
        currency: formData.currency,
      });
    }
    
    loadLeads();
    setShowModal(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Status', 'Value', 'Currency'];
    const rows = allLeads.map(lead => [
      lead.name,
      lead.company,
      lead.email,
      lead.status,
      lead.value,
      lead.currency
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCount = (status) => {
    if (status === 'All') return allLeads.length;
    return allLeads.filter(l => l.status === status).length;
  };

  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline" /> : 
      <ChevronDown className="w-4 h-4 inline" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📋</span> Leads Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and track all your leads</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            📥 Export CSV
          </button>
          <button
            onClick={handleAddLead}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ➕ Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`bg-white rounded-lg shadow-soft border p-3 text-center transition-all hover:shadow-soft-lg ${
              statusFilter === status 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-gray-100 hover:border-primary/30'
            }`}
          >
            <p className="text-xs text-gray-500">
              {status === 'All' ? '📊' : ''} {status}
            </p>
            <p className={`text-lg font-bold ${
              statusFilter === status ? 'text-primary' : 'text-gray-800'
            }`}>
              {getStatusCount(status)}
            </p>
            {statusFilter === status && (
              <span className="text-xs text-primary">✓ Active</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4" id="leads-table">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none pr-10"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={loadLeads}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading leads...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                      👤 Lead <SortIndicator column="name" />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-gray-700 hidden sm:table-cell" onClick={() => handleSort('company')}>
                      🏢 Company <SortIndicator column="company" />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-gray-700 hidden md:table-cell" onClick={() => handleSort('email')}>
                      📧 Email <SortIndicator column="email" />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-gray-700 hidden lg:table-cell" onClick={() => handleSort('value')}>
                      💰 Value <SortIndicator column="value" />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('status')}>
                      📌 Status <SortIndicator column="status" />
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                      ⚡ Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <span className="text-4xl block mb-2">📭</span>
                        No leads found. Add a new lead to get started!
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const usdValue = convertCurrency(lead.value, lead.currency, 'USD');
                      return (
                        <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                {lead.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                                <p className="text-xs text-gray-500 sm:hidden">{lead.company}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <p className="text-sm text-gray-600">{lead.company}</p>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <p className="text-sm text-gray-600">{lead.email}</p>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {formatCurrency(lead.value, lead.currency)}
                              </p>
                              {lead.currency !== 'USD' && (
                                <p className="text-xs text-gray-400">
                                  ≈ {formatCurrency(usdValue, 'USD')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleViewLead(lead)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="View">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button onClick={() => handleEditLead(lead)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Edit">
                                <Edit className="w-4 h-4 text-blue-500" />
                              </button>
                              <button onClick={() => handleDeleteLead(lead)} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {allLeads.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    📊 Showing {leads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} leads
                  </p>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white font-medium'
                          : 'border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'view' ? '👤 Lead Details' : 
                 modalMode === 'edit' ? '✏️ Edit Lead' : '➕ Add New Lead'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {modalMode === 'view' && selectedLead ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-medium">
                      {selectedLead.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedLead.name}</h3>
                      <p className="text-gray-500">{selectedLead.company}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">📧 Email</p><p className="text-gray-800">{selectedLead.email}</p></div>
                    <div><p className="text-sm text-gray-500">📌 Status</p><StatusBadge status={selectedLead.status} /></div>
                    <div><p className="text-sm text-gray-500">💰 Value</p><p className="text-gray-800">{formatCurrency(selectedLead.value, selectedLead.currency)}</p></div>
                    <div><p className="text-sm text-gray-500">💵 In USD</p><p className="text-gray-800">{formatCurrency(convertCurrency(selectedLead.value, selectedLead.currency, 'USD'), 'USD')}</p></div>
                    <div className="col-span-2"><p className="text-sm text-gray-500">📅 Added On</p><p className="text-gray-800">{new Date(selectedLead.date).toLocaleString()}</p></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">👤 Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">🏢 Company *</label>
                    <input type="text" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">📧 Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">💰 Value *</label>
                      <input type="number" required min="0" step="0.01" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">💱 Currency</label>
                      <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                        {supportedCurrencies.map(curr => <option key={curr.code} value={curr.code}>{curr.code}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'].map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      {modalMode === 'edit' ? '✅ Update Lead' : '✅ Add Lead'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && leadToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🗑️ Delete Lead</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{leadToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;