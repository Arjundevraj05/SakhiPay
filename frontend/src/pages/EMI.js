import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { calculateMonthlyEmi, buildAmortizationSchedule, loadEmis, saveEmis, deleteEmiById } from "../utils/emi";
import EMIGuide from "../components/EMIGuide";
import "../styles/emi.css";

const initialForm = {
  title: "",
  principal: "",
  annualRatePercent: "",
  tenureMonths: "",
  startDate: new Date().toISOString().slice(0, 10),
  autoPayDay: 5,
  reminderDaysBefore: 2,
};

const EMI = () => {
  const [emis, setEmis] = useState(loadEmis());
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => emis.find((e) => e.id === selectedId) || null, [emis, selectedId]);

  const monthlyEmi = useMemo(() => calculateMonthlyEmi({
    principal: form.principal,
    annualRatePercent: form.annualRatePercent,
    tenureMonths: form.tenureMonths,
  }), [form]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
  }

  function handleAddEmi(e) {
    e.preventDefault();
    if (!form.title || !form.principal || !form.tenureMonths) return;

    const id = uuidv4();
    const schedule = buildAmortizationSchedule({
      principal: Number(form.principal),
      annualRatePercent: Number(form.annualRatePercent || 0),
      tenureMonths: Number(form.tenureMonths),
      startDate: form.startDate,
    });

    const record = {
      id,
      ...form,
      principal: Number(form.principal),
      annualRatePercent: Number(form.annualRatePercent || 0),
      tenureMonths: Number(form.tenureMonths),
      monthlyEmi,
      schedule,
      createdAt: new Date().toISOString(),
    };

    const next = [record, ...emis];
    setEmis(next);
    saveEmis(next);
    setSelectedId(id);
    resetForm();
  }

  function handleDelete(id) {
    const next = emis.filter((e) => e.id !== id);
    setEmis(next);
    deleteEmiById(id);
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="emi-container">
      <div className="emi-header">
        <h1 className="emi-title">EMI Manager</h1>
        <p className="emi-subtitle">Plan, track, and pay on time. Designed for women's financial wellbeing.</p>
      </div>

      <EMIGuide />

      <div className="emi-grid">
        <section className="emi-card">
          <h2 className="emi-card-title">Add an EMI</h2>
          <form onSubmit={handleAddEmi} className="emi-form">
            <label>
              <span>Title</span>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Sewing Machine Loan" />
            </label>
            <label>
              <span>Principal (₹)</span>
              <input name="principal" type="number" min="0" value={form.principal} onChange={handleChange} />
            </label>
            <label>
              <span>Annual Interest (%)</span>
              <input name="annualRatePercent" type="number" min="0" step="0.01" value={form.annualRatePercent} onChange={handleChange} />
            </label>
            <label>
              <span>Tenure (months)</span>
              <input name="tenureMonths" type="number" min="1" value={form.tenureMonths} onChange={handleChange} />
            </label>
            <label>
              <span>Start Date</span>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            </label>
            <div className="emi-form-row">
              <label>
                <span>Auto-pay day</span>
                <input name="autoPayDay" type="number" min="1" max="28" value={form.autoPayDay} onChange={handleChange} />
              </label>
              <label>
                <span>Remind before (days)</span>
                <input name="reminderDaysBefore" type="number" min="0" max="10" value={form.reminderDaysBefore} onChange={handleChange} />
              </label>
            </div>
            <div className="emi-preview">
              <span>Estimated monthly EMI</span>
              <strong>₹ {monthlyEmi.toLocaleString("en-IN")}</strong>
            </div>
            <button type="submit" className="emi-primary-btn">Add EMI</button>
          </form>
        </section>

        <section className="emi-card">
          <h2 className="emi-card-title">Your EMIs</h2>
          {emis.length === 0 ? (
            <p className="emi-empty">No EMIs yet. Add your first one to get reminders and a clear schedule.</p>
          ) : (
            <ul className="emi-list">
              {emis.map((item) => (
                <li key={item.id} className={`emi-list-item ${selectedId === item.id ? "active" : ""}`}>
                  <button className="emi-list-button" onClick={() => setSelectedId(item.id)}>
                    <div>
                      <p className="emi-list-title">{item.title}</p>
                      <p className="emi-list-meta">₹ {item.principal.toLocaleString("en-IN")} • {item.tenureMonths} months • ₹ {item.monthlyEmi.toLocaleString("en-IN")}/mo</p>
                    </div>
                  </button>
                  <button className="emi-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selected && (
        <section className="emi-card">
          <div className="emi-detail-header">
            <div>
              <h2 className="emi-card-title">{selected.title}</h2>
              <p className="emi-detail-sub">₹ {selected.principal.toLocaleString("en-IN")} • {selected.tenureMonths} months • ₹ {selected.monthlyEmi.toLocaleString("en-IN")}/mo</p>
            </div>
            <div className="emi-detail-actions">
              <button className="emi-secondary-btn" onClick={() => setSelectedId(null)}>Close</button>
            </div>
          </div>
          <div className="emi-schedule table-scroll">
            <div className="emi-schedule-head">
              <span>#</span>
              <span>Due</span>
              <span>EMI</span>
              <span>Principal</span>
              <span>Interest</span>
              <span>Balance</span>
              <span>Status</span>
            </div>
            <div className="emi-schedule-body">
              {selected.schedule.map((row) => (
                <div key={row.installmentNumber} className="emi-schedule-row">
                  <span>{row.installmentNumber}</span>
                  <span>{new Date(row.dueDate).toLocaleDateString("en-IN")}</span>
                  <span>₹ {row.emiAmount.toLocaleString("en-IN")}</span>
                  <span>₹ {row.principalComponent.toLocaleString("en-IN")}</span>
                  <span>₹ {row.interestComponent.toLocaleString("en-IN")}</span>
                  <span>₹ {row.outstandingAfterPayment.toLocaleString("en-IN")}</span>
                  <span>
                    <span className={`emi-status ${row.status.toLowerCase()}`}>{row.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EMI;