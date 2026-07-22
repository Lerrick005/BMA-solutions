import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  DollarSign,
  Calendar,
  Clock,
  MoreVertical,
  UserPlus,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { recentLeads } from '../../data/mockData';
import { formatCurrency, convertCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

const Kanban = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedColumns, setExpandedColumns] = useState({
    'New': true,
    'Contacted': true,
    'Qualified': true,
    'Proposal': true,
    'Closed Won': true,
    'Closed Lost': true
  });

  const columns = {
    'New': {
      id: 'New',
      title: '🟢 New',
      items: [],
      color: 'blue'
    },
    'Contacted': {
      id: 'Contacted',
      title: '📞 Contacted',
      items: [],
      color: 'yellow'
    },
    'Qualified': {
      id: 'Qualified',
      title: '⭐ Qualified',
      items: [],
      color: 'purple'
    },
    'Proposal': {
      id: 'Proposal',
      title: '📄 Proposal',
      items: [],
      color: 'orange'
    },
    'Closed Won': {
      id: 'Closed Won',
      title: '🏆 Closed Won',
      items: [],
      color: 'green'
    },
    'Closed Lost': {
      id: 'Closed Lost',
      title: '❌ Closed Lost',
      items: [],
      color: 'red'
    },
  };

  const [boardColumns, setBoardColumns] = useState(columns);

  // Load leads and organize by status
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    setLoading(true);
    const allLeads = recentLeads || [];
    setLeads(allLeads);
    
    const newColumns = { ...columns };
    Object.keys(newColumns).forEach(key => {
      newColumns[key].items = allLeads.filter(lead => lead.status === key);
    });
    setBoardColumns(newColumns);
    setLoading(false);
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = boardColumns[source.droppableId];
    const destColumn = boardColumns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];

    const [removed] = sourceItems.splice(source.index, 1);
    const updatedLead = { ...removed, status: destination.droppableId };
    
    destItems.splice(destination.index, 0, updatedLead);

    const newColumns = {
      ...boardColumns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    };

    setBoardColumns(newColumns);
    
    // Update the lead status in the actual data
    const leadToUpdate = leads.find(l => l.id === removed.id);
    if (leadToUpdate) {
      leadToUpdate.status = destination.droppableId;
      toast.success(`✅ ${leadToUpdate.name} moved to ${destination.droppableId}!`);
    }
  };

  // Add new lead
  const handleAddLead = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const company = form.company.value;
    const email = form.email.value;
    
    if (!name || !company || !email) {
      toast.error('❌ Please fill in all required fields');
      return;
    }

    const newLead = {
      id: leads.length + 1,
      name: name,
      company: company,
      email: email,
      status: 'New',
      value: parseFloat(form.value.value) || 0,
      currency: form.currency.value || 'USD',
      date: new Date().toISOString(),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    
    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    
    const newColumns = { ...boardColumns };
    newColumns['New'].items = [newLead, ...newColumns['New'].items];
    setBoardColumns(newColumns);
    
    toast.success(`✅ Lead ${newLead.name} added successfully!`);
    setShowAddModal(false);
    form.reset();
  };

  // Delete lead
  const handleDeleteLead = (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    const updatedLeads = leads.filter(l => l.id !== leadId);
    setLeads(updatedLeads);
    
    const newColumns = { ...boardColumns };
    Object.keys(newColumns).forEach(key => {
      newColumns[key].items = newColumns[key].items.filter(item => item.id !== leadId);
    });
    setBoardColumns(newColumns);
    
    toast.success('🗑️ Lead deleted successfully!');
  };

  // Toggle column expansion
  const toggleColumn = (columnId) => {
    setExpandedColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  // Filter leads by search term
  const getFilteredItems = (items) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get column count
  const getColumnCount = (columnId) => {
    return boardColumns[columnId]?.items.length || 0;
  };

  // Get total leads
  const totalLeads = leads.length;

  // Get column color classes
  const getColumnColorClasses = (color) => {
    const colors = {
      'blue': 'bg-blue-50 border-blue-200',
      'yellow': 'bg-yellow-50 border-yellow-200',
      'purple': 'bg-purple-50 border-purple-200',
      'orange': 'bg-orange-50 border-orange-200',
      'green': 'bg-green-50 border-green-200',
      'red': 'bg-red-50 border-red-200',
    };
    return colors[color] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading Kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📊</span> Kanban Board
          </h1>
          <p className="text-gray-500 mt-1">Drag and drop leads across stages</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-48"
            />
          </div>
          <button
            onClick={loadLeads}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            ➕ Add Lead
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.keys(boardColumns).map(key => (
          <div key={key} className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 text-center">
            <p className="text-xs text-gray-500">{boardColumns[key].title}</p>
            <p className="text-lg font-bold text-gray-800">{getColumnCount(key)}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(boardColumns).map(([columnId, column]) => {
            const items = getFilteredItems(column.items);
            const isExpanded = expandedColumns[columnId];
            const count = items.length;
            const colorClasses = getColumnColorClasses(column.color);

            return (
              <div key={columnId} className={`bg-white rounded-xl border ${colorClasses} shadow-soft overflow-hidden`}>
                {/* Column Header */}
                <div 
                  onClick={() => toggleColumn(columnId)}
                  className="p-3 border-b border-gray-200 cursor-pointer hover:bg-white/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">
                      {column.title}
                      <span className="ml-1 text-xs text-gray-400">({count})</span>
                    </h3>
                  </div>
                  <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>

                {/* Column Body */}
                {isExpanded && (
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2 min-h-[200px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-100/50' : ''
                        }`}
                      >
                        {count === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <span className="text-2xl block mb-1">📭</span>
                            Empty
                          </div>
                        ) : (
                          items.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={String(lead.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg shadow-soft border border-gray-100 p-3 mb-2 transition-all ${
                                    snapshot.isDragging ? 'shadow-soft-lg border-primary scale-105' : 'hover:shadow-soft-lg'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                                        {lead.avatar}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{lead.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          setSelectedLead(lead);
                                          setShowDetails(true);
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLead(lead.id)}
                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">
                                      {formatCurrency(lead.value, lead.currency)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(lead.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {lead.currency !== 'USD' && lead.value > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      ≈ {formatCurrency(convertCurrency(lead.value, lead.currency, 'USD'), 'USD')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                ➕ Add New Lead
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🏢 Company *</label>
                <input
                  type="text"
                  name="company"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📧 Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="john@acme.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">💰 Value</label>
                  <input
                    type="number"
                    name="value"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">💱 Currency</label>
                  <select
                    name="currency"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="USD">💵 USD</option>
                    <option value="EUR">💶 EUR</option>
                    <option value="GBP">💷 GBP</option>
                    <option value="NGN">₦ NGN</option>
                    <option value="KES">🇰🇪 KES</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Add Lead
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showDetails && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                👤 Lead Details
              </h2>
              <button onClick={() => setShowDetails(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                <div>
                  <p className="text-sm text-gray-500">📧 Email</p>
                  <p className="text-gray-800 text-sm">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">📌 Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    selectedLead.status === 'Closed Won' ? 'bg-green-100 text-green-700' :
                    selectedLead.status === 'Closed Lost' ? 'bg-red-100 text-red-700' :
                    selectedLead.status === 'Qualified' ? 'bg-purple-100 text-purple-700' :
                    selectedLead.status === 'Proposal' ? 'bg-orange-100 text-orange-700' :
                    selectedLead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">💰 Value</p>
                  <p className="text-gray-800 text-sm">{formatCurrency(selectedLead.value, selectedLead.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">💵 In USD</p>
                  <p className="text-gray-800 text-sm">{formatCurrency(convertCurrency(selectedLead.value, selectedLead.currency, 'USD'), 'USD')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">📅 Added On</p>
                  <p className="text-gray-800 text-sm">{new Date(selectedLead.date).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;