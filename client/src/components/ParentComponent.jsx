import React, { useState } from 'react';
import ShoppingList from './ShoppingList';

export default function ParentComponent() {
  const [parentState, setParentState] = useState(0);

  return (
    <div>
      <h1>Parent Component</h1>
      <button onClick={() => setParentState(parentState + 1)}>
        Update Parent State
      </button>
      <ShoppingList />
    </div>
  );
}
