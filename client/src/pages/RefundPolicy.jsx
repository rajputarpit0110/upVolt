import React from 'react';
import './PolicyPages.css';

export const RefundPolicy = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-header">
        <h1>Return & Refund Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="policy-content">
        <section>
          <h2>1. Returns</h2>
          <p>You have 7 calendar days to return an item from the date you received it.</p>
          <p>To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging and needs to have the receipt or proof of purchase.</p>
        </section>

        <section>
          <h2>2. Refunds</h2>
          <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
          <p>If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>
        </section>

        <section>
          <h2>3. Shipping for Returns</h2>
          <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
        </section>

        <section>
          <h2>4. Contact Us</h2>
          <p>If you have any questions on how to return your item to us, contact us via our Contact Page or official support channels.</p>
        </section>
      </div>
    </div>
  );
};
