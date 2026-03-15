'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState, useRef, createContext, useContext } from 'react';

// Custom hook to use Yjs with our table data
export function useYjsTable(roomName: string) {
  const [yjsInitialized, setYjsInitialized] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to WebSocket server (you'll need to set this up)
    const wsProvider = new WebsocketProvider(
      `ws://localhost:1234/${roomName}`, // WebSocket server URL
      roomName, // Room name
      ydoc
    );
    providerRef.current = wsProvider;

    // Bind Yjs types to our data structures
    const yProperties = ydoc.getArray('properties');
    const yRows = ydoc.getArray('rows');

    // Initialize from Yjs data if exists, otherwise set defaults
    const initData = () => {
      const yPropertiesArray = yProperties.toArray();
      const yRowsArray = yRows.toArray();
      
      if (yPropertiesArray.length === 0 && yRowsArray.length === 0) {
        // Set initial data if empty
        const initialProperties = [
          { id: 'prop1', name: 'Task Name', type: 'text' },
          { id: 'prop2', name: 'Status', type: 'select', options: ['Todo', 'In Progress', 'Done', 'Backlog'] },
          { id: 'prop3', name: 'Due Date', type: 'date' },
          { id: 'prop4', name: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
          { id: 'prop5', name: 'Assignee', type: 'text' }
        ];
        
        const initialRows = [
          { id: '1', values: ['Design System Team Meeting', 'Done', 'Oct 24, 2023', 'High', 'Sarah'] },
          { id: '2', values: ['Wireframe SmartHome App', 'In Progress', 'Oct 25, 2023', 'High', 'Mike'] },
          { id: '3', values: ['3d Design Orzano Cotton', 'Todo', 'Oct 26, 2023', 'Medium', 'Anna'] },
          { id: '4', values: ['Redesign Edu Web', 'Backlog', 'Oct 28, 2023', 'Low', 'Tom'] },
          { id: '5', values: ['Competitor Analysis', 'In Progress', 'Nov 01, 2023', 'Medium', 'Sarah'] },
          { id: '6', values: ['User Testing Session', 'Todo', 'Nov 05, 2023', 'High', 'Mike'] }
        ];
        
        // Add initial data to Yjs
          yProperties.insert(yProperties.length, initialProperties);
          yRows.insert(yRows.length, initialRows);
      }
      
      setProperties(yProperties.toArray());
      setRows(yRows.toArray());
    };

    // Sync local state with Yjs changes
    const updateLocalState = () => {
      setProperties(yProperties.toArray());
      setRows(yRows.toArray());
    };

    // Observe changes in Yjs arrays
    yProperties.observe(updateLocalState);
    yRows.observe(updateLocalState);

    // Initialize data
    initData();

    // Set initialized flag when connected
    const handleStatusChange = (event: { status: string }) => {
      if (event.status === 'connected' || event.status === 'synced') {
        setYjsInitialized(true);
      }
    };

    wsProvider.on('status', handleStatusChange);

    // Cleanup
    return () => {
      yProperties.unobserve(updateLocalState);
      yRows.unobserve(updateLocalState);
      wsProvider.off('status', handleStatusChange);
      wsProvider.disconnect();
    };
  }, [roomName]);

  // Functions to update data through Yjs (for optimistic updates)
  const addProperty = (property: any) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('properties').push([property]);
    }
  };

  const updateProperty = (index: number, property: any) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('properties').delete(index, 1);
      ydocRef.current.getArray('properties').insert(index, [property]);
    }
  };

  const deleteProperty = (index: number) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('properties').delete(index, 1);
    }
  };

  const addRow = (row: any) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('rows').push([row]);
    }
  };

  const updateRow = (index: number, row: any) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('rows').delete(index, 1);
      ydocRef.current.getArray('rows').insert(index, [row]);
    }
  };

  const deleteRow = (index: number) => {
    if (ydocRef.current) {
      ydocRef.current.getArray('rows').delete(index, 1);
    }
  };

  return {
    yjsInitialized,
    properties,
    rows,
    addProperty,
    updateProperty,
    deleteProperty,
    addRow,
    updateRow,
    deleteRow
  };
}

// Provider component for wrapping the app
export function YjsProvider({ children, roomName }: { children: React.ReactNode; roomName: string }) {
  return (
    <YjsProviderContext.Provider value={{ roomName }}>
      {children}
    </YjsProviderContext.Provider>
  );
}

const YjsProviderContext = createContext<{ roomName: string } | undefined>(undefined);

export function useYjsRoom() {
  const context = useContext(YjsProviderContext);
  if (!context) {
    throw new Error('useYjsRoom must be used within a YjsProvider');
  }
  return context;
}