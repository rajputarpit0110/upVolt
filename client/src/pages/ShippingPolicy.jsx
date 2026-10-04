import React from 'react';
import SEO from '../components/common/SEO';
import './PolicyPages.css';

export const ShippingPolicy = () => {
  return (
    <div className="policy-page-container">
      <SEO 
        title="Shipping Policy | upVolt" 
        description="Learn about upVolt's shipping policy, delivery times, and rates." 
      />
      <div className="policy-header">
        <h1>Shipping Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="policy-content">
        <section>
          <h2>1. Shipping Processing Time</h2>
          <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
          <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.</p>
        </section>

        <section>
          <h2>2. Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping:</strong> 1-2 business days (Available in select areas)</li>
          </ul>
          <p>Delivery delays can occasionally occur due to unforeseen circumstances such as weather conditions or courier issues.</p>
        </section>

        <section>
          <h2>3. Shipment Confirmation & Order Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
        </section>

        <section>
          <h2>4. Damages</h2>
          <p>upVolt is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
        </section>
      </div>
    </div>
  );
};
