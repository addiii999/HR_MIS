import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';

const STATUSES = ['Open','Under Review','Resolved'];
const statusBadge = { Open:'badge-red', 'Under Review':'badge-yellow', Resolved:'badge-green' };

function Modal({ record, onClose, onSave }) {
  const employees = getCollection('employees');
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [form, setForm] = useState(record || {
    complaintBy: isEmployee ? user.employeeId || '' : '',
    against:'', date: new Date().toISOString().slice(0,10),
    description:'', status:'Open', remarks:'', resolutionDate:''
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Update Grievance':'File Grievance'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Complaint By (Employee ID)</label>
            <select className="form-select" value={form.complaintBy} onChange={e=>set('complaintBy',e.target.value)} disabled={isEmployee&&!!form.complaintBy}>
              <option value="">Select...</option>
              {employees.map(e=><option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Against</label>
            <input className="form-input" value={form.against} onChange={e=>set('against',e.target.value)} placeholder="Employee ID / Department / Policy"/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Detailed description of the grievance..."/>
        </div>
        {!isEmployee && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Resolution Date</label>
                <input className="form-input" type="date" value={form.resolutionDate} onChange={e=>set('resolutionDate',e.target.value)}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Resolution Remarks</label>
              <textarea className="form-textarea" value={form.remarks} onChange={e=>set('remarks',e.target.value)} placeholder="How was this resolved?" style={{minHeight:60}}/>
            </div>
          </>
        )}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.description) return alert('Description required'); onSave(form); }}><Check size={14}/> {isEmployee?'Submit Grievance':'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Grievances() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState(() => getCollection('grievances'));
  const [modal, setModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const employees = getCollection('employees');
  const refresh = () => setGrievances(getCollection('grievances'));
  const isEmployee = user?.role === 'employee';

  const handleSave = (form) => {
    if(modal==='add') addItem('grievances', {...form, id:`G${String(grievances.length+1).padStart(3,'0')}`});
    else updateItem('grievances', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('grievances',id); refresh(); }};

  const getName = (id) => employees.find(e=>e.id===id)?.name || id;
  const getDept = (id) => employees.find(e=>e.id===id)?.department || '';

  const filtered = filterStatus==='All' ? grievances : grievances.filter(g=>g.status===filterStatus);

  const open = grievances.filter(g=>g.status==='Open').length;
  const review = grievances.filter(g=>g.status==='Under Review').length;
  const resolved = grievances.filter(g=>g.status==='Resolved').length;

  // Dept grievance analysis
  const deptMap = {};
  grievances.forEach(g=>{
    const dept = getDept(g.complaintBy);
    deptMap[dept] = (deptMap[dept]||0)+1;
  });

  return (
    <div>
      <PageHeader
        title="Grievance Management"
        subtitle={`${open} open · ${review} under review · ${resolved} resolved`}
        icon={<AlertTriangle size={22} />}
        breadcrumbs={[{ path: '/grievances', label: 'HR Ops' }, { label: 'Grievances' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
        <div className="stat-card orange"><div className="stat-value">{open}</div><div className="stat-label">Open Grievances</div></div>
        <div className="stat-card cyan"><div className="stat-value">{review}</div><div className="stat-label">Under Review</div></div>
        <div className="stat-card green"><div className="stat-value">{resolved}</div><div className="stat-label">Resolved</div></div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-title mb-3">Department Grievance Analysis</div>
          <div className="insight-card mb-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>Departments with high grievance counts may indicate management style issues, policy gaps, or interpersonal conflicts. Use this data for targeted interventions.</p>
          </div>
          {Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).map(([dept,c])=>(
            <div key={dept} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{dept||'Unknown'}</span>
                <span style={{fontWeight:700,color:'var(--warning)'}}>{c} complaint{c>1?'s':''}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill orange" style={{width:`${(c/grievances.length)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title mb-3">Grievance Resolution Overview</div>
          {[{label:'Open (Unresolved)',val:open,color:'var(--danger)'},{label:'Under Review',val:review,color:'var(--warning)'},{label:'Resolved',val:resolved,color:'var(--success)'}].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:s.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:'var(--text-secondary)'}}>{s.label}</div>
                <div className="progress-bar" style={{marginTop:4}}>
                  <div className="progress-fill" style={{width:`${grievances.length?((s.val/grievances.length)*100):0}%`,background:s.color}}/>
                </div>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:s.color,minWidth:28,textAlign:'right'}}>{s.val}</div>
            </div>
          ))}
          <div style={{marginTop:12,padding:'12px',background:'rgba(255,255,255,0.4)',borderRadius:8,fontSize:12,color:'var(--text-muted)'}}>
            Resolution rate: <strong style={{color:'var(--success)'}}>{grievances.length?Math.round((resolved/grievances.length)*100):0}%</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Grievance Register</div><div className="card-subtitle">{filtered.length} records</div></div>
          <div style={{display:'flex',gap:10}}>
            <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:150}}>
              <option value="All">All Status</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> {isEmployee?'File Grievance':'Add'}</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Complaint By</th><th>Against</th><th>Date</th><th>Status</th><th>Description</th><th>Remarks</th>{!isEmployee&&<th>Actions</th>}</tr>
            </thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.id}>
                  <td style={{fontFamily:'monospace',color:'var(--accent-solid)',fontWeight:700}}>{g.id}</td>
                  <td>
                    <div style={{fontWeight:600,fontSize:13}}>{getName(g.complaintBy)}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{getDept(g.complaintBy)}</div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-secondary)'}}>{g.against}</td>
                  <td style={{fontSize:12}}>{g.date}</td>
                  <td><span className={`badge ${statusBadge[g.status]}`}>{g.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.description}</td>
                  <td style={{fontSize:11,color:'var(--text-muted)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.remarks||'-'}</td>
                  {!isEmployee&&<td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(g)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(g.id)}><Trash2 size={12}/></button>
                    </div>
                  </td>}
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
