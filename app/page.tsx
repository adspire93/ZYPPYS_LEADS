'use client'

import { useState, useEffect, useMemo } from 'react'
import { Lead, LeadData, Comment } from '@/types'
import leadsData from '@/event_companies_hyderabad.json'
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Plus,
  Download,
  BarChart3
} from 'lucide-react'

type StatusType = 'new' | 'contacted' | 'in_progress' | 'won' | 'lost'
type PriorityType = 'high' | 'medium' | 'low'

export default function Dashboard() {
  const [leads, setLeads] = useState<LeadData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityType | 'all'>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [sortBy, setSortBy] = useState<'value' | 'date' | 'name'>('value')

  // Initialize leads from JSON with default status
  useEffect(() => {
    const savedData = localStorage.getItem('leadsData')
    if (savedData) {
      setLeads(JSON.parse(savedData))
    } else {
      const initialLeads: LeadData[] = (leadsData as Lead[]).map(lead => ({
        ...lead,
        status: 'new' as StatusType,
        comments: []
      }))
      setLeads(initialLeads)
      localStorage.setItem('leadsData', JSON.stringify(initialLeads))
    }
  }, [])

  // Save to localStorage whenever leads change
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('leadsData', JSON.stringify(leads))
    }
  }, [leads])

  // Update lead status
  const updateStatus = (leadId: string, newStatus: StatusType) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    )
  }

  // Add comment to lead
  const addComment = (leadId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `c${Date.now()}`,
      leadId,
      text: commentText,
      timestamp: Date.now(),
      author: 'Sales Team'
    }

    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, comments: [...lead.comments, newComment] }
          : lead
      )
    )
    setCommentText('')
  }

  // Delete comment
  const deleteComment = (leadId: string, commentId: string) => {
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, comments: lead.comments.filter(c => c.id !== commentId) }
          : lead
      )
    )
  }

  // Get unique industries
  const industries = useMemo(() => {
    const unique = new Set(leadsData.map((lead: Lead) => lead.industry))
    return Array.from(unique).sort()
  }, [])

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch =
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter
      const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesIndustry
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'value') return b.estimatedValue - a.estimatedValue
      if (sortBy === 'name') return a.companyName.localeCompare(b.companyName)
      return 0
    })

    return filtered
  }, [leads, searchTerm, statusFilter, priorityFilter, industryFilter, sortBy])

  // Analytics
  const analytics = useMemo(() => {
    const total = leads.length
    const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
    const wonValue = leads
      .filter(lead => lead.status === 'won')
      .reduce((sum, lead) => sum + lead.estimatedValue, 0)
    const statusCounts = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      in_progress: leads.filter(l => l.status === 'in_progress').length,
      won: leads.filter(l => l.status === 'won').length,
      lost: leads.filter(l => l.status === 'lost').length,
    }
    const conversionRate = total > 0 ? ((statusCounts.won / total) * 100).toFixed(1) : '0'

    return { total, totalValue, wonValue, statusCounts, conversionRate }
  }, [leads])

  // Export data
  const exportData = () => {
    const dataStr = JSON.stringify(leads, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-export-${new Date().toISOString()}.json`
    link.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />
      case 'contacted': return <Phone className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'won': return <CheckCircle2 className="w-4 h-4" />
      case 'lost': return <XCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'new': return 'status-new'
      case 'contacted': return 'status-contacted'
      case 'in_progress': return 'status-in_progress'
      case 'won': return 'status-won'
      case 'lost': return 'status-lost'
    }
  }

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'high': return 'badge-high'
      case 'medium': return 'badge-medium'
      case 'low': return 'badge-low'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Zyppys Lead Tracker</h1>
                <p className="text-sm text-gray-500">World's Best Lead Management Dashboard</p>
              </div>
            </div>
            <button
              onClick={exportData}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
            <p className="text-xs text-gray-500 mt-1">Active in pipeline</p>
          </div>

          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</p>
            <p className="text-xs text-gray-500 mt-1">Pipeline value</p>
          </div>

          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Won Value</h3>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.wonValue)}</p>
            <p className="text-xs text-gray-500 mt-1">Closed deals</p>
          </div>

          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Win rate</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card p-6 mb-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`badge ${getStatusColor(status as StatusType)} inline-flex items-center space-x-2 px-4 py-2`}>
                  {getStatusIcon(status as StatusType)}
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Leads
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, contact, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusType | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityType | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('value')}
                className={`btn btn-secondary text-sm ${sortBy === 'value' ? 'bg-primary-600 text-white' : ''}`}
              >
                Value
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`btn btn-secondary text-sm ${sortBy === 'name' ? 'bg-primary-600 text-white' : ''}`}
              >
                Name
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredLeads.length}</span> of{' '}
            <span className="font-semibold">{leads.length}</span> leads
          </p>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredLeads.map((lead, index) => (
            <div
              key={lead.id}
              className="card p-6 animate-slide-up hover:scale-[1.01] transition-transform"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Lead Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{lead.companyName}</h3>
                      <p className="text-sm text-gray-600">{lead.contactPerson} • {lead.designation}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`badge ${getPriorityColor(lead.priority)}`}>
                          {lead.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="badge bg-gray-100 text-gray-800">
                          {lead.industry}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="mt-4 lg:mt-0">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as StatusType)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusColor(lead.status)}`}
                  >
                    <option value="new">🔵 New</option>
                    <option value="contacted">🟣 Contacted</option>
                    <option value="in_progress">🟠 In Progress</option>
                    <option value="won">🟢 Won</option>
                    <option value="lost">🔴 Lost</option>
                  </select>
                </div>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm text-primary-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-gray-900">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{lead.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Company Size</p>
                    <p className="text-sm text-gray-900">{lead.companySize} employees</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Globe className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                      {lead.website}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-sm text-gray-900">{lead.source}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 lg:col-span-2">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Estimated Value</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(lead.estimatedValue)}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{lead.requirements}</p>
              </div>

              {/* Comments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Communication Log ({lead.comments.length})
                  </h4>
                  <button
                    onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {selectedLead === lead.id ? 'Hide' : 'Show'} Comments
                  </button>
                </div>

                {selectedLead === lead.id && (
                  <div className="space-y-3 animate-fade-in">
                    {/* Add Comment Form */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment about this lead..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComment(lead.id)
                          }
                        }}
                      />
                      <button
                        onClick={() => addComment(lead.id)}
                        className="btn btn-primary flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Comments List */}
                    {lead.comments.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                        {lead.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{comment.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {comment.author} • {formatDate(comment.timestamp)}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteComment(lead.id, comment.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                                title="Delete comment"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        No comments yet. Add the first comment to track your communication with this lead.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="card p-12 text-center animate-fade-in">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Zyppys Lead Tracker. The World's Best Lead Management Dashboard.
          </p>
        </div>
      </footer>
    </div>
  )
}
