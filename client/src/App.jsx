import React from 'react';
import ShoppingList from './components/ShoppingList';
import OrderSummary from './components/OrderSummary';

function App() {
  return (
    <div style={{ direction: 'rtl' }}>
      <ShoppingList />
      <OrderSummary />
    </div>
  );
}

export default App;
