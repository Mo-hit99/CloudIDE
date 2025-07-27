import { useState, useEffect } from 'react';
import { dockerAPI, handleAPIError } from '../services/api';

const ContainerSelector = ({ selectedContainer, onContainerSelect, onError }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const response = await dockerAPI.getContainers();
      setContainers(response.data);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
      console.error('Failed to load containers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContainerSelect = (container) => {
    onContainerSelect?.(container);
    setShowDropdown(false);
  };

  const startContainer = async (containerId, e) => {
    e.stopPropagation();
    try {
      await dockerAPI.startContainer(containerId);
      await loadContainers(); // Refresh the list
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const stopContainer = async (containerId, e) => {
    e.stopPropagation();
    try {
      await dockerAPI.stopContainer(containerId);
      await loadContainers(); // Refresh the list
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case 'running':
        return 'bg-green-500';
      case 'exited':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (state) => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <div className="relative">
      {/* Container selector button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedContainer ? selectedContainer.name : 'Select Container'}
          </span>
          {selectedContainer && (
            <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedContainer.state)}`} />
          )}
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-auto">
          {/* Refresh button */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={loadContainers}
              disabled={loading}
              className="flex items-center space-x-2 w-full px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Containers</span>
            </button>
          </div>

          {/* Container list */}
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : containers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No containers found
            </div>
          ) : (
            containers.map((container) => (
              <div
                key={container.id}
                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => handleContainerSelect(container)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(container.state)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {container.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {container.image} • {getStatusText(container.state)}
                    </div>
                  </div>
                </div>
                
                {/* Container actions */}
                <div className="flex items-center space-x-1">
                  {container.state === 'running' ? (
                    <button
                      onClick={(e) => stopContainer(container.id, e)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      title="Stop container"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => startContainer(container.id, e)}
                      className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                      title="Start container"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ContainerSelector;
