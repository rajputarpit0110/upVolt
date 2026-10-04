import React from 'react';
import SEO from '../components/common/SEO';
import './PolicyPages.css';

export const Terms = () => {
  return (
    <div className="policy-page-container">
      <SEO 
        title="Terms of Service | upVolt" 
        description="Read upVolt's terms of service and usage conditions." 
      />
      <div className="policy-header">
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="policy-content">
        <section>
          <h2>1. Terms</h2>
          <p>By accessing the website at upVolt, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on upVolt's website for personal, non-commercial transitory viewing only.</p>
        </section>

        <section>
          <h2>3. Disclaimer</h2>
          <p>The materials on upVolt's website are provided on an 'as is' basis. upVolt makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </section>

        <section>
          <h2>4. Limitations</h2>
          <p>In no event shall upVolt or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on upVolt's website, even if upVolt or an upVolt authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section>
          <h2>5. Modifications</h2>
          <p>upVolt may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
        </section>
      </div>
    </div>
  );
};
