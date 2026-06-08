import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';

const typeBadge = { Positive:'badge-green', Negative:'badge-red' };

function Modal({ record, onClose, onSave }) {
  const employees = getCollection('employees');
  const { user } = useAuth();
  const [form, setForm] = useState(record || {
    date: new Date().toISOString().slice(0,10),
    by: user?.name || '', employeeId:'',
    type:'Positive', description:'', action:''
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Edit Feedback':'Record Feedback'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Feedback By</label>
            <input className="form-input" value={form.by} onChange={e=>set('by',e.target.value)} placeholder="Your Name"/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select className="form-select" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)}>
              <option value="">Select Employee...</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Feedback Type</label>
            <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
              <option>Positive</option><option>Negative</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Detailed feedback description..."/>
        </div>
        <div className="form-group">
          <label className="form-label">Action Taken</label>
          <input className="form-input" value={form.action} onChange={e=>set('action',e.target.value)} placeholder="e.g. Warning issued, Appreciation mail sent"/>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.employeeId) return alert('Select employee'); onSave(form); }}><Check size={14}/> Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [records, setRecords] = useState(() => getCollection('feedback'));
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('All');
  const employees = getCollection('employees');
  const refresh = () => setRecords(getCollection('feedback'));

  const handleSave = (form) => {
    if(modal==='add') addItem('feedback', {...form, id:generateId('f')});
    else updateItem('feedback', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('feedback',id); refresh(); }};

  const getName = (id) => employees.find(e=>e.id===id)?.name || id;
  const getDept = (id) => employees.find(e=>e.id===id)?.department || '';

  const filtered = filter==='All' ? records : records.filter(r=>r.type===filter);
  const positives = records.filter(r=>r.type==='Positive').length;
  const negatives = records.filter(r=>r.type==='Negative').length;

  // Employees with most negative feedback
  const negMap = {};
  records.filter(r=>r.type==='Negative').forEach(r=>{ negMap[r.employeeId]=(negMap[r.employeeId]||0)+1; });
  const repeatIssues = Object.entries(negMap).sort((a,b)=>b[1]-a[1]).slice(0,3);

  // Dept patterns
  const deptNeg = {};
  records.filter(r=>r.type==='Negative').forEach(r=>{
    const dept = getDept(r.employeeId);
    deptNeg[dept] = (deptNeg[dept]||0)+1;
  });

  return (
    <div>
      <PageHeader
        title="Feedback & Behavior"
        subtitle={`${positives} positive · ${negatives} negative feedback records`}
        icon={<MessageCircle size={22} />}
        breadcrumbs={[{ path: '/feedback', label: 'HR Ops' }, { label: 'Feedback' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
        <div className="stat-card green"><div className="stat-value">{positives}</div><div className="stat-label">Positive Feedbacks</div></div>
        <div className="stat-card orange"><div className="stat-value">{negatives}</div><div className="stat-label">Negative Feedbacks</div></div>
        <div className="stat-card blue"><div className="stat-value">{records.length}</div><div className="stat-label">Total Records</div></div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-title mb-3">⚠️ Repeat Behavior Issues</div>
          <div className="insight-card mb-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>Employees with multiple negative feedbacks may need counseling or performance intervention. Patterns help HR identify systemic issues vs individual behavior.</p>
          </div>
          {repeatIssues.length === 0 ? <p className="text-muted text-sm">No repeat issues</p> : repeatIssues.map(([id, count])=>(
            <div key={id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div className="avatar sm">{getName(id).slice(0,2)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{getName(id)}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{getDept(id)}</div>
              </div>
              <span className="badge badge-red">{count} negative{count>1?'s':''}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title mb-3">Department Feedback Patterns</div>
          {Object.keys(deptNeg).length === 0 ? <p className="text-muted text-sm">No negative feedback recorded</p> : Object.entries(deptNeg).sort((a,b)=>b[1]-a[1]).map(([dept,c])=>(
            <div key={dept} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{dept}</span>
                <span style={{fontWeight:700,color:'var(--danger)'}}>{c} issues</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill red" style={{width:`${(c/negatives)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Feedback Records</div><div className="card-subtitle">{filtered.length} entries</div></div>
          <div style={{display:'flex',gap:10}}>
            <select className="form-select" value={filter} onChange={e=>setFilter(e.target.value)} style={{width:130}}>
              <option value="All">All Types</option><option>Positive</option><option>Negative</option>
            </select>
            <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Feedback</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>By</th><th>Employee</th><th>Department</th><th>Type</th><th>Description</th><th>Action Taken</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontSize:12}}>{r.date}</td>
                  <td style={{fontWeight:600,fontSize:12}}>{r.by}</td>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{getName(r.employeeId)}</td>
                  <td><span className="chip">{getDept(r.employeeId)}</span></td>
                  <td><span className={`badge ${typeBadge[r.type]}`}>{r.type}</span></td>
                  <td style={{fontSize:12,color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.description}</td>
                  <td style={{fontSize:12,color:'var(--text-muted)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.action||'-'}</td>
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
