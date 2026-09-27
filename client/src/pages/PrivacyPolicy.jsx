import React from 'react';
import './PolicyPages.css';

export const PrivacyPolicy = () => {
  return (
    <div className="policy-page-container">
      <div className="policy-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="policy-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information to provide better services to our users. This includes information you provide to us directly (like your name, email, and shipping address when you create an account or make a purchase) and information we get from your use of our services.</p>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect upVolt and our users. We also use this information to offer you tailored content and better product recommendations.</p>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>We do not share personal information with companies, organizations, or individuals outside of upVolt except in the following cases:</p>
          <ul>
            <li>With your consent.</li>
            <li>For external processing by trusted partners (like payment gateways and shipping partners).</li>
            <li>For legal reasons if we have a good-faith belief that access, use, preservation, or disclosure of the information is reasonably necessary to meet any applicable law, regulation, legal process or enforceable governmental request.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We work hard to protect upVolt and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We use secure protocols for communication and encrypt sensitive data.</p>
        </section>
      </div>
    </div>
  );
};
