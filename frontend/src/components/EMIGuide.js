import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LightBulbIcon, CalculatorIcon, ShieldCheckIcon, ExclamationIcon } from "@heroicons/react/outline";
import "../styles/emiGuide.css";

const EMIGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      id: "what-is-emi",
      title: "What is EMI?",
      icon: CalculatorIcon,
      content: (
        <div>
          <p><strong>EMI (Equated Monthly Installment)</strong> is a fixed payment amount you make every month to repay a loan. It includes both the principal amount (the money you borrowed) and the interest (the cost of borrowing).</p>
          
          <div className="guide-example">
            <h4>Example:</h4>
            <p>If you take a ₹50,000 loan for a sewing machine at 12% annual interest for 24 months:</p>
            <ul>
              <li>Your EMI would be approximately ₹2,350 per month</li>
              <li>Total amount paid: ₹56,400</li>
              <li>Total interest: ₹6,400</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "how-emi-works",
      title: "How EMI Works",
      icon: LightBulbIcon,
      content: (
        <div>
          <p>EMI payments are structured so that:</p>
          <ul>
            <li><strong>Early payments:</strong> More goes toward interest, less toward principal</li>
            <li><strong>Later payments:</strong> More goes toward principal, less toward interest</li>
            <li><strong>Total EMI amount:</strong> Stays the same throughout the loan period</li>
          </ul>
          
          <div className="guide-tip">
            <h4>💡 Pro Tip:</h4>
            <p>Making extra payments toward principal can reduce your total interest and loan duration!</p>
          </div>
        </div>
      )
    },
    {
      id: "emi-calculation",
      title: "EMI Calculation Formula",
      icon: CalculatorIcon,
      content: (
        <div>
          <p>The EMI is calculated using this formula:</p>
          <div className="formula-box">
            <p><strong>EMI = P × R × (1+R)^N / ((1+R)^N - 1)</strong></p>
            <p>Where:</p>
            <ul>
              <li><strong>P</strong> = Principal loan amount</li>
              <li><strong>R</strong> = Monthly interest rate (Annual rate ÷ 12 ÷ 100)</li>
              <li><strong>N</strong> = Loan tenure in months</li>
            </ul>
          </div>
          
          <div className="guide-example">
            <h4>Quick Calculation:</h4>
            <p>For ₹1,00,000 at 12% annual interest for 36 months:</p>
            <ul>
              <li>Monthly rate = 12% ÷ 12 = 1%</li>
              <li>EMI ≈ ₹3,321</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "smart-emi-tips",
      title: "Smart EMI Management Tips",
      icon: ShieldCheckIcon,
      content: (
        <div>
          <h4>For Women Entrepreneurs & Home Managers:</h4>
          <ul>
            <li><strong>Budget First:</strong> Ensure EMI doesn't exceed 40% of your monthly income</li>
            <li><strong>Emergency Fund:</strong> Keep 3-6 months of expenses saved before taking loans</li>
            <li><strong>Compare Rates:</strong> Shop around for the best interest rates from different lenders</li>
            <li><strong>Prepayment Benefits:</strong> Use bonuses or extra income to make prepayments</li>
            <li><strong>Auto-pay Setup:</strong> Set up automatic payments to avoid late fees</li>
            <li><strong>Track Payments:</strong> Keep records of all EMI payments for tax benefits</li>
          </ul>
          
          <div className="guide-tip">
            <h4>🎯 Business Loan Tips:</h4>
            <p>For business equipment loans, consider the income-generating potential. If your sewing machine generates ₹5,000/month, a ₹2,500 EMI makes sense!</p>
          </div>
        </div>
      )
    },
    {
      id: "common-mistakes",
      title: "Common EMI Mistakes to Avoid",
      icon: ExclamationIcon,
      content: (
        <div>
          <h4>⚠ Watch Out For:</h4>
          <ul>
            <li><strong>Hidden Charges:</strong> Processing fees, insurance, documentation charges</li>
            <li><strong>Floating Rates:</strong> Interest rates that can change over time</li>
            <li><strong>Prepayment Penalties:</strong> Some banks charge for early loan closure</li>
            <li><strong>Multiple EMIs:</strong> Taking too many loans simultaneously</li>
            <li><strong>Ignoring Credit Score:</strong> Poor credit history leads to higher interest rates</li>
            <li><strong>No Insurance:</strong> Consider loan protection insurance for security</li>
          </ul>
          
          <div className="guide-tip">
            <h4>🛡 Safety First:</h4>
            <p>Always read the loan agreement carefully. Ask questions about any terms you don't understand. Your financial wellbeing is important!</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="emi-guide">
      <button 
        className="emi-guide-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="guide-toggle-content">
          <div>
            <h3>📚 EMI Guide & Tips</h3>
            <p>Learn about EMIs, calculations, and smart management strategies</p>
          </div>
          {isOpen ? <ChevronUpIcon className="guide-icon" /> : <ChevronDownIcon className="guide-icon" />}
        </div>
      </button>

      {isOpen && (
        <div className="emi-guide-content">
          <div className="guide-intro">
            <h2>Understanding EMIs: Your Complete Guide</h2>
            <p>Empowering women with financial knowledge for better loan management and financial freedom.</p>
          </div>

          <div className="guide-sections">
            {sections.map((section) => (
              <div key={section.id} className="guide-section">
                <div className="guide-section-header">
                  <section.icon className="guide-section-icon" />
                  <h3>{section.title}</h3>
                </div>
                <div className="guide-section-content">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="guide-footer">
            <h4>💪 Remember:</h4>
            <p>Knowledge is power! Understanding your EMIs helps you make informed financial decisions and build a secure future for yourself and your family.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMIGuide;