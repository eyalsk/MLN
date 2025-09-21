import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitOrder } from '../features/order/orderSlice';
import { updateCartItem, clearCart } from '../features/cart/cartSlice';
import { fetchProducts } from '../features/products/productsSlice';
import './ShoppingList.css';
import CustomInput from './CustomInput/CustomInput';

export default function OrderSummary() {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const products = useSelector(state => state.products.items);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', address: '', email: '' });

  const groupedCart = cart.reduce((acc, item) => {
    const category = item.category || 'שונות';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const handleFetchProducts = (categoryId) => {
    dispatch(fetchProducts(`/api/categories/${categoryId}/products`));
  };

  const handleSubmit = () => {
    const orderDetails = {
      user: {
        fullName: 'John Doe',
        address: '123 Main St',
        email: 'john.doe@example.com',
      },
      products: cart,
    };
    dispatch(submitOrder(orderDetails));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAddress = (address) => {
    return address.length > 5;
  };

  const validateFullName = (fullName) => {
    return fullName.trim().split(' ').length >= 2;
  };

  const isFormValid =
    validateFullName(formData.fullName) &&
    validateAddress(formData.address) &&
    validateEmail(formData.email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConfirm = async () => {
    if (isFormValid) {
      const orderDetails = {
        user: formData,
        products: cart,
      };

      try {
        const response = await dispatch(submitOrder(orderDetails)).unwrap();
        if (response.order) {
          alert(`הזמנה בוצעה בהצלחה! מספר הזמנה: ${response.order.order_id}`);
          dispatch(clearCart()); // Clear the cart on success
          setShowPopup(false);
        } else {
          alert('שגיאה בביצוע ההזמנה. נסה שוב.');
        }
      } catch (error) {
        console.error("Error submitting order:", error.message || error, error.stack || "No stack trace available");
        alert('שגיאה בביצוע ההזמנה. נסה שוב.');
      }
    }
  };

  return (
    <div className="order-summary">
      <header className="order-summary-header">
        <h1 className="order-summary-title">עגלה</h1>
      </header>
      <div className="order-summary-categories">
        {Object.keys(groupedCart).map((category, index) => (
          <div key={index} className="category-card">
            <span className="category-title">{category}</span>
            <ul className="category-items">
              {groupedCart[category].map((item, idx) => (
                <li key={idx} className="category-item">
                  {item.name} – {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        className="confirm-order-button"
        onClick={() => setShowPopup(true)}
      >
        אישור הזמנה
      </button>

      {showPopup && (
        <>
          <div className="overlay"></div>
          <div className="modal-popup">
            <h2 className="modal-title">אישור הזמנה</h2>
            <div className="modal-content">
              <h3 className="summary-title">סיכום מוצרים:</h3>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>קטגוריה</th>
                    <th>מוצר</th>
                    <th>כמות</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.category || 'שונות'}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form className="modal-form">
              <div className="form-group">
                <CustomInput
                  placeholder="שם מלא"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="quantity-input"
                />
                {!validateFullName(formData.fullName) && (
                  <span className="error-message">יש להזין שם מלא תקין</span>
                )}
              </div>
              <div className="form-group">
                <CustomInput
                  placeholder='כתובת'
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="quantity-input"
                />
                {!validateAddress(formData.address) && (
                  <span className="error-message">יש להזין כתובת תקינה</span>
                )}
              </div>
              <div className="form-group">
                <CustomInput
                  placeholder='מייל'
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="quantity-input"
                />
                {!validateEmail(formData.email) && (
                  <span className="error-message">יש להזין כתובת מייל תקינה</span>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleConfirm}
                  className={`confirm-button ${isFormValid ? '' : 'disabled'}`}
                >
                  אשר הזמנה
                </button>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="cancel-button"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
