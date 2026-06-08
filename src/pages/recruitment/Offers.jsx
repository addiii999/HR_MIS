import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, Info, Gift } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

function Modal({ record, onClose, onSave }) {
  const employees = getCollection('employees');
  const [form, setForm] = useState(record || {
    employeeId:'', employeeName:'', joiningDate:'',
    basicSalary:'', hra:'', allowances:'', specialConditions:'', ctc:''
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const annualCTC = form.ctc || ((+form.basicSalary + +form.hra + +form.allowances) * 12);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Edit Offer':'Record Offer & Joining'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'var(--warning)',display:'flex',gap:8,alignItems:'center'}}>
          <Info size={14}/> Record-only module. No payroll calculations or salary deductions involved.
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-select" value={form.employeeId} onChange={e=>{
              const emp=employees.find(x=>x.id===e.target.value);
              setForm(f=>({...f,employeeId:e.target.value,employeeName:emp?.name||'',joiningDate:emp?.doj||''}));
            }}>
              <option value="">Select Employee...</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input className="form-input" type="date" value={form.joiningDate} onChange={e=>set('joiningDate',e.target.value)}/>
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Basic Salary (₹/mo)</label>
            <input className="form-input" type="number" value={form.basicSalary} onChange={e=>set('basicSalary',+e.target.value)} placeholder="50000"/>
          </div>
          <div className="form-group">
            <label className="form-label">HRA (₹/mo)</label>
            <input className="form-input" type="number" value={form.hra} onChange={e=>set('hra',+e.target.value)} placeholder="20000"/>
          </div>
          <div className="form-group">
            <label className="form-label">Allowances (₹/mo)</label>
            <input className="form-input" type="number" value={form.allowances} onChange={e=>set('allowances',+e.target.value)} placeholder="8000"/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Special Negotiated Conditions</label>
          <textarea className="form-textarea" value={form.specialConditions} onChange={e=>set('specialConditions',e.target.value)} placeholder="e.g. Remote work 2 days/week, Annual review after 6 months..." style={{minHeight:60}}/>
        </div>
        <div className="form-group">
          <label className="form-label">Final CTC (₹/year)</label>
          <input className="form-input" type="number" value={form.ctc} onChange={e=>set('ctc',+e.target.value)} placeholder={annualCTC}/>
        </div>
        <div style={{background:'rgba(255,255,255,0.4)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--text-secondary)'}}>
          Calculated Annual CTC: <strong style={{color:'var(--accent-solid)',fontSize:14}}>₹{((+form.basicSalary + +form.hra + +form.allowances)*12).toLocaleString('en-IN')}</strong>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.employeeId) return alert('Select an employee'); onSave({...form,id:record?.id||generateId('o')}); }}><Check size={14}/> Save Record</button>
        </div>
      </div>
    </div>
  );
}

export default function Offers() {
  const [offers, setOffers] = useState(() => getCollection('offers'));
  const [modal, setModal] = useState(null);
  const refresh = () => setOffers(getCollection('offers'));

  const handleSave = (form) => {
    if(modal==='add') addItem('offers', form);
    else updateItem('offers', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete offer record?')) { deleteItem('offers',id); refresh(); }};

  const avgCTC = offers.length ? Math.round(offers.reduce((a,o)=>a+(o.ctc||0),0)/offers.length) : 0;

  return (
    <div>
      <PageHeader
        title="Offers & Joining"
        subtitle={`${offers.length} offer records · ₹${(avgCTC/100000).toFixed(1)}L average CTC`}
        icon={<Gift size={22} />}
        breadcrumbs={[{ path: '/recruitment', label: 'Recruitment' }, { label: 'Offers & Joining' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
        <div className="stat-card blue"><div className="stat-value">{offers.length}</div><div className="stat-label">Total Offer Records</div></div>
        <div className="stat-card green"><div className="stat-value">₹{(avgCTC/100000).toFixed(1)}L</div><div className="stat-label">Average CTC</div></div>
        <div className="stat-card purple"><div className="stat-value">₹{((offers.reduce((a,o)=>a+(o.ctc||0),0))/100000).toFixed(0)}L</div><div className="stat-label">Total CTC Commitments</div></div>
      </div>

      <div className="card mb-4">
        <div className="insight-card">
          <div className="insight-tag">📊 MIS Insight</div>
          <p>This module records offer and joining details for management reference only. It helps track negotiated conditions, CTC ranges, and onboarding timelines without any payroll processing.</p>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Offer & Joining Records</div><div className="card-subtitle">Record-only - no payroll calculations</div></div>
          <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Record</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Emp ID</th><th>Employee Name</th><th>Joining Date</th><th>Basic (₹)</th><th>HRA (₹)</th><th>Allowances (₹)</th><th>Annual CTC</th><th>Special Conditions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map(o=>(
                <tr key={o.id}>
                  <td style={{fontFamily:'monospace',color:'var(--accent-solid)',fontWeight:700}}>{o.employeeId}</td>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{o.employeeName}</td>
                  <td style={{fontSize:12}}>{o.joiningDate}</td>
                  <td>₹{(+o.basicSalary).toLocaleString('en-IN')}</td>
                  <td>₹{(+o.hra).toLocaleString('en-IN')}</td>
                  <td>₹{(+o.allowances).toLocaleString('en-IN')}</td>
                  <td style={{fontWeight:700,color:'var(--accent-solid)'}}>₹{(+o.ctc).toLocaleString('en-IN')}</td>
                  <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.specialConditions||'-'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(o)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(o.id)}><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <Modal record={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
