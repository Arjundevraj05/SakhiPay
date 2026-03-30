import React, { useState, useEffect } from "react";
import { Bell, Calendar, Lightbulb, Mic, Globe, CreditCard } from "lucide-react";
import { loadEmis } from "../utils/emi";
import "../styles/insights.css"; 

const InsightsPanel = () => {
  const [emiReminders, setEmiReminders] = useState([]);

  useEffect(() => {
    const checkEmiReminders = () => {
      const emis = loadEmis();
      const reminders = [];
      const today = new Date();
      
      emis.forEach(emi => {
        emi.schedule.forEach(installment => {
          const dueDate = new Date(installment.dueDate);
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          
          // Check if this installment is within the reminder period
          if (daysUntilDue >= 0 && daysUntilDue <= (emi.reminderDaysBefore || 2)) {
            reminders.push({
              id: `${emi.id}-${installment.installmentNumber}`,
              title: emi.title,
              amount: installment.emiAmount,
              daysUntilDue,
              dueDate: dueDate.toLocaleDateString('en-IN'),
              installmentNumber: installment.installmentNumber,
              totalInstallments: emi.tenureMonths
            });
          }
        });
      });
      
      // Sort by days until due (soonest first)
      reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      setEmiReminders(reminders.slice(0, 3)); // Show max 3 reminders
    };

    checkEmiReminders();
    // Check every hour for new reminders
    const interval = setInterval(checkEmiReminders, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="insights-panel">
      <div className="insights-header">
        <h1>Insights</h1>
      </div>

      {/* EMI Reminders */}
      {emiReminders.length > 0 && (
        <>
          <div className="insights-section-title">EMI Reminders</div>
          {emiReminders.map(reminder => (
            <div key={reminder.id} className="insight-card emi-reminder">
              <CreditCard className="insight-icon emi" />
              <div>
                <p className="insight-title">{reminder.title}</p>
                <p className="insight-text">
                  ₹{reminder.amount.toLocaleString('en-IN')} due in {reminder.daysUntilDue} day{reminder.daysUntilDue !== 1 ? 's' : ''}
                </p>
                <p className="insight-meta">
                  Installment {reminder.installmentNumber}/{reminder.totalInstallments} • {reminder.dueDate}
                </p>
              </div>
            </div>
          ))}
        </>
      )}

      {/* General Insights */}
      <div className="insights-section-title">General</div>
      <div className="insight-card">
        <Calendar className="insight-icon due" />
        <div>
          <p className="insight-title">Bill Due</p>
          <p className="insight-text">₹500 in 2 days</p>
        </div>
      </div>

      <div className="insight-card">
        <Bell className="insight-icon alert" />
        <div>
          <p className="insight-title">Spending Alert</p>
          <p className="insight-text">Save ₹200 more!</p>
        </div>
      </div>

    </aside>
  );
};

export default InsightsPanel;