import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, Calendar } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

const RESULTS = ['Selected','Rejected','On Hold',''];
const STATUSES = ['Scheduled','Completed','Cancelled'];
const resultBadge = { Selected:'badge-green', Rejected:'badge-red', 'On Hold':'badge-yellow', '':'badge-gray' };
const statusBadge = { Scheduled:'badge-blue', Completed:'badge-green', Cancelled:'badge-red' };

function Modal({ record, onClose, onSave }) {
  const vacancies = getCollection('vacancies');
  const employees = getCollection('employees');
  const [form, setForm] = useState(record || {
    candidate:'', vacancy:'', date:'', time:'', interviewer:'',
    status:'Scheduled', result:'', reason:''
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Edit Interview':'Schedule Interview'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Candidate Name</label>
            <input className="form-input" value={form.candidate} onChange={e=>set('candidate',e.target.value)} placeholder="Candidate Full Name"/>
          </div>
          <div className="form-group">
            <label className="form-label">Applied Vacancy</label>
            <select className="form-select" value={form.vacancy} onChange={e=>set('vacancy',e.target.value)}>
              <option value="">Select Vacancy...</option>
              {vacancies.map(v=><option key={v.id}>{v.title}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Interview Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Interview Time</label>
            <input className="form-input" type="time" value={form.time} onChange={e=>set('time',e.target.value)}/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Interviewer</label>
            <select className="form-select" value={form.interviewer} onChange={e=>set('interviewer',e.target.value)}>
              <option value="">Select Interviewer...</option>
              {employees.filter(e=>e.status==='Active').map(e=><option key={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {form.status==='Completed' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Result</label>
                <select className="form-select" value={form.result} onChange={e=>set('result',e.target.value)}>
                  {['Selected','Rejected','On Hold'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rejection Reason (if any)</label>
                <input className="form-input" value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="e.g. Insufficient experience"/>
              </div>
            </div>
          </>
        )}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.candidate) return alert('Candidate name required'); onSave(form); }}><Check size={14}/> Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Interviews() {
  const [interviews, setInterviews] = useState(() => getCollection('interviews'));
  const [modal, setModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const refresh = () => setInterviews(getCollection('interviews'));

  const handleSave = (form) => {
    if(modal==='add') addItem('interviews', {...form, id:generateId('i')});
    else updateItem('interviews', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('interviews',id); refresh(); }};

  const filtered = filterStatus==='All' ? interviews : interviews.filter(i=>i.status===filterStatus);

  const completed = interviews.filter(i=>i.status==='Completed');
  const selected = completed.filter(i=>i.result==='Selected').length;
  const rejected = completed.filter(i=>i.result==='Rejected').length;
  const onHold = completed.filter(i=>i.result==='On Hold').length;
  const selectionRate = completed.length ? ((selected/completed.length)*100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Interview Management"
        subtitle={`${interviews.length} interviews · ${selectionRate}% selection rate`}
        icon={<Calendar size={22} />}
        breadcrumbs={[{ path: '/recruitment', label: 'Recruitment' }, { label: 'Interviews' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {[
          {label:'Total Interviews', val:interviews.length, color:'blue'},
          {label:'Scheduled', val:interviews.filter(i=>i.status==='Scheduled').length, color:'cyan'},
          {label:'Completed', val:completed.length, color:'green'},
          {label:'Selected', val:selected, color:'purple'},
          {label:'Rejected', val:rejected, color:'orange'},
        ].map(s=>(
          <div className={`stat-card ${s.color}`} key={s.label}><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>

      <div className="card mb-6">
        <div className="insight-card">
          <div className="insight-tag">📊 MIS Insight - Interview Efficiency</div>
          <p><strong>Selection Rate: {selectionRate}%</strong> - Out of {completed.length} completed interviews, {selected} candidates were selected. A rate below 20% may indicate poor screening. {onHold} candidates are on hold awaiting final decision.</p>
        </div>
        <div style={{display:'flex',gap:20,marginTop:16}}>
          {[{label:'Selected',val:selected,color:'var(--success)'},{label:'On Hold',val:onHold,color:'var(--warning)'},{label:'Rejected',val:rejected,color:'var(--danger)'}].map(s=>(
            <div key={s.label} style={{flex:1,textAlign:'center',padding:'14px',background:'rgba(255,255,255,0.4)',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Interview Schedule</div><div className="card-subtitle">{filtered.length} records</div></div>
          <div style={{display:'flex',gap:10}}>
            <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:140}}>
              <option value="All">All Status</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Schedule</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Candidate</th><th>Vacancy</th><th>Date & Time</th><th>Interviewer</th><th>Status</th><th>Result</th><th>Reason</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(i=>(
                <tr key={i.id}>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{i.candidate}</td>
                  <td style={{fontSize:12,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.vacancy}</td>
                  <td style={{fontSize:12}}><Calendar size={12} style={{marginRight:4,verticalAlign:'middle'}}/>{i.date} {i.time}</td>
                  <td style={{fontSize:12}}>{i.interviewer}</td>
                  <td><span className={`badge ${statusBadge[i.status]}`}>{i.status}</span></td>
                  <td>{i.result ? <span className={`badge ${resultBadge[i.result]}`}>{i.result}</span> : <span style={{color:'var(--text-muted)',fontSize:12}}>-</span>}</td>
                  <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.reason||'-'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(i)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(i.id)}><Trash2 size={12}/></button>
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
