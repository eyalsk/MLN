import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../features/categories/categoriesSlice';
import { fetchProducts } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { addProduct } from '../features/products/productsSlice';
import { addCategory } from '../features/categories/categoriesSlice';
import AutocompleteInput from './AutocompleteInput/AutocompleteInput';
import './ShoppingList.css';

// Add a custom comparison function to React.memo
export default React.memo(function ShoppingList() {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.items);
  const products = useSelector(state => state.products.items);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const categoriesFetched = useSelector(state => state.categories.fetched);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      if (!categoriesFetched) {
        dispatch(fetchCategories());
      }
    }
  }, [dispatch, categoriesFetched]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchProducts(`/api/categories/${selectedCategory}/products`));
    }
  }, [dispatch, selectedCategory]);

  const handleAddCategory = async (categoryName) => {
    try {
      const response = await dispatch(addCategory(categoryName)).unwrap();
      setSelectedCategory(response.id);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddProduct = async (productName) => {
    try {
      const response = await dispatch(addProduct({ categoryId: selectedCategory, productName })).unwrap();
      setSelectedProduct(response.id); // Automatically select the newly added product without opening the dropdown
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleAddToCart = () => {
    const category = categories.find(c => c.id === selectedCategory);
    const product = products.find(p => p.id === selectedProduct);

    if (category && product) {
      dispatch(addToCart({
        productId: product.id,
        name: product.name,
        quantity,
        category: category.name
      }));
    } else {
      console.error('Invalid category or product selection. Ensure both are properly selected.');
    }
  };

  return (
    <div className="shopping-list">
      <div className="shopping-list-controls">
        <div>
          <AutocompleteInput
            options={categories.map(c => ({ key: c.id, value: c.name }))}
            value={selectedCategory}
            onChange={(selected) => {
              if (selected) {
                setSelectedCategory(selected.key);
                setSelectedProduct('');
              }
            }}
            onNew={(newCategory) => handleAddCategory(newCategory)}
            placeholder="בחר קטגוריה"
          />
        </div>
        <div>
          <AutocompleteInput
            options={products.map(p => ({ key: p.id, value: p.name }))}
            value={selectedProduct}
            onChange={(selected) => {
              if (selected) {
                setSelectedProduct(selected.key);
              }
            }}
            onNew={(newProduct) => handleAddProduct(newProduct)}
            placeholder="בחר מוצר"
          />
        </div>
        <div>
          <input
            type="number"
            className="quantity-input"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
          />
        </div>
      </div>
      <button
        className={`add-to-cart-button ${!selectedCategory || !selectedProduct || quantity < 1 ? 'disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={!selectedCategory || !selectedProduct || quantity < 1}
      >
        הוסף לעגלה
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Always return true to prevent re-renders
  return true;
});
