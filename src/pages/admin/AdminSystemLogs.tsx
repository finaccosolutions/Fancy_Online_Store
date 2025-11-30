import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, AlertTriangle, Trash2, Search, Filter, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  metadata?: any;
  created_at: string;
}

const AdminSystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedLevel, selectedCategory]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setLogs(data || []);

      const uniqueCategories = [...new Set((data || []).map(log => log.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
      showToast('Failed to load system logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    setFilteredLogs(filtered);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      showToast('Logs cleared successfully', 'success');
      fetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
      showToast('Failed to clear logs', 'error');
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      showToast('Failed to delete log', 'error');
    }
  };

  const downloadLogs = () => {
    const csvContent = [
      ['Time', 'Level', 'Category', 'Message'].join(','),
      ...filteredLogs.map(log =>
        [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          log.level,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'error':
        return 'text-red-500 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const stats = {
    critical: logs.filter(l => l.level === 'critical').length,
    error: logs.filter(l => l.level === 'error').length,
    warning: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-admin-text-dark">System Logs</h1>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadLogs}
            className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-primary-dark transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearLogs}
            className="flex items-center space-x-2 bg-admin-danger text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear All</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <p className="text-admin-text-light text-sm mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <p className="text-admin-text-light text-sm mb-1">Errors</p>
          <p className="text-2xl font-bold text-orange-600">{stats.error}</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <p className="text-admin-text-light text-sm mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
        </div>
        <div className="bg-admin-card border border-admin-border rounded-lg p-4">
          <p className="text-admin-text-light text-sm mb-1">Info</p>
          <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as any)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Levels</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="text-admin-text-light text-right py-2">
          {filteredLogs.length} logs
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-admin-card rounded-lg">
          <p className="text-admin-text-light">No logs found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border border-admin-border rounded-lg p-3 hover:shadow-md transition-shadow ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm uppercase">
                          {log.level}
                        </span>
                        <span className="inline-block px-2 py-1 bg-admin-primary/10 text-admin-primary text-xs rounded">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-sm break-words">{log.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                      {log.metadata && (
                        <details className="mt-2 cursor-pointer">
                          <summary className="text-xs opacity-70 hover:opacity-100">
                            View Details
                          </summary>
                          <pre className="text-xs bg-black/10 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
                    title="Delete log"
                  >
                    <Trash2 className="h-4 w-4 opacity-70 hover:opacity-100" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminSystemLogs;
