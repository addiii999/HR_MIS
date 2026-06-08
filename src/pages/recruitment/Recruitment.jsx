import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';

const PLATFORMS = ['LinkedIn', 'Naukri', 'Instagram', 'Indeed', 'Company Website', 'Referral', 'Other'];

function Modal({ record, onClose, onSave }) {
  const vacancies = getCollection('vacancies');
  const [form, setForm] = useState(record || {
    vacancyId:'', platform:'LinkedIn', applications:0, shortlisted:0,
    interviewed:0, selected:0, rejected:0, joined:0
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const convRate = form.applications ? ((form.joined/form.applications)*100).toFixed(1) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record ? 'Edit Record' : 'Add Recruitment Record'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Linked Vacancy</label>
            <select className="form-select" value={form.vacancyId} onChange={e=>set('vacancyId',e.target.value)}>
              <option value="">Select Vacancy...</option>
              {vacancies.map(v=><option key={v.id} value={v.id}>{v.title} - {v.department}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Platform</label>
            <select className="form-select" value={form.platform} onChange={e=>set('platform',e.target.value)}>
              {PLATFORMS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row-3">
          {['applications','shortlisted','interviewed','selected','rejected','joined'].map(field => (
            <div className="form-group" key={field}>
              <label className="form-label">{field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input className="form-input" type="number" min={0} value={form[field]} onChange={e=>set(field,+e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{ background:'rgba(255,255,255,0.4)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
          <span className="text-sm text-muted">Conversion Rate: </span>
          <span style={{ fontWeight:800, color:'var(--accent-solid)', fontSize:16 }}>{convRate}%</span>
          <span className="text-xs text-muted ml-2">(Joined / Applications �- 100)</span>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave({...form, conversionRate:+convRate})}><Check size={14}/> Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Recruitment() {
  const [records, setRecords] = useState(() => getCollection('recruitment'));
  const [modal, setModal] = useState(null);
  const vacancies = getCollection('vacancies');
  const refresh = () => setRecords(getCollection('recruitment'));

  const handleSave = (form) => {
    if (modal === 'add') addItem('recruitment', { ...form, id: generateId('r') });
    else updateItem('recruitment', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('recruitment',id); refresh(); }};

  const getVacancyTitle = (id) => vacancies.find(v=>v.id===id)?.title || id;

  // Platform analytics
  const platMap = {};
  records.forEach(r => {
    platMap[r.platform] = platMap[r.platform] || { applications:0, shortlisted:0, interviewed:0, selected:0, joined:0 };
    ['applications','shortlisted','interviewed','selected','joined'].forEach(k => platMap[r.platform][k] += r[k]);
  });
  const platformData = Object.entries(platMap).map(([platform, d]) => ({
    platform, ...d, rate: d.applications ? +((d.joined/d.applications)*100).toFixed(1) : 0
  }));

  const totals = { apps: records.reduce((a,r)=>a+r.applications,0), shortlisted:records.reduce((a,r)=>a+r.shortlisted,0), interviewed:records.reduce((a,r)=>a+r.interviewed,0), selected:records.reduce((a,r)=>a+r.selected,0), joined:records.reduce((a,r)=>a+r.joined,0) };
  const overallConv = totals.apps ? ((totals.joined/totals.apps)*100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Recruitment Tracker"
        subtitle={`${totals.apps} applications processed · ${overallConv}% overall conversion rate`}
        icon={<Target size={22} />}
        breadcrumbs={[{ path: '/recruitment', label: 'Recruitment' }, { label: 'Applications' }]}
      />

      {/* KPIs */}
      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {[
          { label:'Total Applications', val:totals.apps, color:'blue' },
          { label:'Shortlisted', val:totals.shortlisted, color:'cyan' },
          { label:'Interviewed', val:totals.interviewed, color:'orange' },
          { label:'Selected', val:totals.selected, color:'purple' },
          { label:'Joined', val:totals.joined, color:'green' },
        ].map(s=>(
          <div className={`stat-card ${s.color}`} key={s.label}>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Platform Performance Chart */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Platform-wise Applications</div><div className="card-subtitle">Which platform brings most candidates</div></div></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="platform" tick={{fontSize:11}}/>
              <YAxis/>
              <Tooltip contentStyle={{background:'rgba(255,255,255,0.85)',border:'1px solid var(--border)',borderRadius:8}}/>
              <Bar dataKey="applications" name="Applications" radius={[6,6,0,0]}>
                {platformData.map((_,i)=><Cell key={i} fill={['#0084ff','#8b5cf6','#ec4899','#06b6d4'][i%4]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Hiring Conversion by Platform</div><div className="card-subtitle">Joined ÷ Applications</div></div></div>
          <div style={{marginBottom:12}}>
            <div className="insight-card">
              <div className="insight-tag">📊 MIS Insight</div>
              <p><strong>Overall conversion rate: {overallConv}%</strong> - Out of {totals.apps} applications, {totals.joined} candidates actually joined. High platform conversion = better talent quality. Low conversion = screening inefficiency.</p>
            </div>
          </div>
          {platformData.map((p,i)=>(
            <div key={p.platform} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{p.platform}</span>
                <span style={{fontWeight:700,color:p.rate>3?'var(--success)':p.rate>2?'var(--warning)':'var(--danger)'}}>{p.rate}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${Math.min(p.rate*15,100)}%`, background:['#0084ff','#8b5cf6','#ec4899','#06b6d4'][i%4]}}/>
              </div>
              <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{p.applications} apps → {p.joined} joined</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Recruitment Records</div><div className="card-subtitle">Vacancy-wise hiring data</div></div>
          <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Record</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Vacancy</th><th>Platform</th><th>Apps</th><th>Shortlisted</th><th>Interviewed</th><th>Selected</th><th>Joined</th><th>Conv. Rate</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.map(r=>(
                <tr key={r.id}>
                  <td style={{color:'var(--text-primary)',fontWeight:600,maxWidth:200}}>{getVacancyTitle(r.vacancyId)}</td>
                  <td><span className="chip">{r.platform}</span></td>
                  <td style={{fontWeight:700}}>{r.applications}</td>
                  <td>{r.shortlisted}</td>
                  <td>{r.interviewed}</td>
                  <td style={{color:'var(--success)',fontWeight:600}}>{r.selected}</td>
                  <td style={{color:'var(--accent-solid)',fontWeight:700}}>{r.joined}</td>
                  <td>
                    <span style={{fontWeight:800, color:r.conversionRate>3?'var(--success)':r.conversionRate>1.5?'var(--warning)':'var(--danger)'}}>{r.conversionRate}%</span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(r)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}><Trash2 size={12}/></button>
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

