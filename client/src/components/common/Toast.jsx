import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2 } from 'lucide-react';
import './Toast.css';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="cc-toast">
      <div className="cc-toast__icon">
        <CheckCircle2 size={18} />
      </div>
      <span className="cc-toast__message">{toastMessage}</span>
    </div>
  );
};
