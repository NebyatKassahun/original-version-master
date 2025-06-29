// Import necessary React hooks
import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the application
const initialState = {
  sidebarCollapsed: false,  // Sidebar starts expanded (false means not collapsed)
  notifications: [],       // Empty array for notifications
  products: [              // Sample product data
    { id: '1', name: 'Product A', sku: '001', category: 'Category 1', price: 12, stock: 50 },
    { id: '2', name: 'Product B', sku: '002', category: 'Category 2', price: 12, stock: 50 },
    { id: '3', name: 'Product C', sku: '003', category: 'Category 3', price: 12, stock: 5 },
    { id: '4', name: 'Product D', sku: '004', category: 'Category 4', price: 12, stock: 50 }
  ],
  loading: false           // Loading state starts as false
};

// Reducer function to handle state updates
const appReducer = (state, action) => {
  switch (action.type) {
    // Toggle sidebar collapsed state
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    // Add new notification to array
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    // Remove notification by ID
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    // Replace entire products array
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    // Add new product to array
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    // Update existing product by ID
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };

    // Delete product by ID
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };

    // Set loading state
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    // Default case returns current state
    default:
      return state;
  }
};

// Create context with undefined default value
const AppContext = createContext(undefined);

// Custom hook to access context
export const useApp = () => {
  // Get context value
  const context = useContext(AppContext);

  // Throw error if used outside provider
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  // Return context value (state and dispatch)
  return context;
};

// Context provider component
export const AppProvider = ({ children }) => {
  // Initialize reducer with initialState
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Provide context value to children
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};