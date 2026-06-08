import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, UserMinus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';

const EXIT_REASONS = ['Better opportunity elsewhere','Personal reasons / relocation','Work environment issues','Salary dissatisfaction','Career growth limitation','Health reasons','Family obligations','Other'];
const STATUSES = ['In Progress','Completed'];
const statusBadge = { 'In Progress':'badge-yellow', Completed:'badge-green' };
const COLORS = ['#0084ff','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4','#f97316'];

function Modal({ record, onClose, onSave }) {
  const employees = getCollection('employees');
  const [form, setForm] = useState(record || {
    employeeId:'', resignationDate:'', lastWorkingDay:'',
    reason:'Better opportunity elsewhere', assetReturn:'Pending',
    expLetter:'Pending', status:'In Progress'
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Edit Exit Record':'Record Exit'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-group">
          <label className="form-label">Employee</label>
          <select className="form-select" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)}>
            <option value="">Select Employee...</option>
            {employees.map(e=><option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Resignation Date</label>
            <input className="form-input" type="date" value={form.resignationDate} onChange={e=>set('resignationDate',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Last Working Day</label>
            <input className="form-input" type="date" value={form.lastWorkingDay} onChange={e=>set('lastWorkingDay',e.target.value)}/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Exit Interview Reason</label>
          <select className="form-select" value={form.reason} onChange={e=>set('reason',e.target.value)}>
            {EXIT_REASONS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Asset Return</label>
            <select className="form-select" value={form.assetReturn} onChange={e=>set('assetReturn',e.target.value)}>
              <option>Pending</option><option>Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience Letter</label>
            <select className="form-select" value={form.expLetter} onChange={e=>set('expLetter',e.target.value)}>
              <option>Pending</option><option>Issued</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Exit Status</label>
            <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.employeeId) return alert('Select employee'); onSave(form); }}><Check size={14}/> Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Exits() {
  const [exits, setExits] = useState(() => getCollection('exits'));
  const [modal, setModal] = useState(null);
  const employees = getCollection('employees');
  const refresh = () => setExits(getCollection('exits'));

  const handleSave = (form) => {
    if(modal==='add') addItem('exits', {...form, id:generateId('ex')});
    else updateItem('exits', modal.id, form);
    // Also update employee status
    if(form.employeeId) updateItem('employees', form.employeeId, { status:'Resigned' });
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('exits',id); refresh(); }};

  const getName = (id) => employees.find(e=>e.id===id)?.name || id;
  const getDept = (id) => employees.find(e=>e.id===id)?.department || '';

  // Exit reason analysis
  const reasonMap = {};
  exits.forEach(e=>{ reasonMap[e.reason]=(reasonMap[e.reason]||0)+1; });
  const reasonData = Object.entries(reasonMap).map(([name,value])=>({name,value}));

  // Dept attrition
  const deptMap = {};
  exits.forEach(e=>{ const d=getDept(e.employeeId); deptMap[d]=(deptMap[d]||0)+1; });

  const completed = exits.filter(e=>e.status==='Completed').length;
  const pending = exits.filter(e=>e.status==='In Progress').length;

  return (
    <div>
      <PageHeader
        title="Exit Management"
        subtitle={`${exits.length} exits recorded · ${exits.length?Math.round((exits.length/employees.length)*100):0}% attrition rate`}
        icon={<UserMinus size={22} />}
        breadcrumbs={[{ path: '/exits', label: 'HR Ops' }, { label: 'Exits' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        <div className="stat-card orange"><div className="stat-value">{exits.length}</div><div className="stat-label">Total Exits This Year</div></div>
        <div className="stat-card green"><div className="stat-value">{completed}</div><div className="stat-label">Exit Process Completed</div></div>
        <div className="stat-card cyan"><div className="stat-value">{pending}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card purple"><div className="stat-value">{exits.length?Math.round((exits.length/employees.length)*100):0}%</div><div className="stat-label">Attrition Rate</div></div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Exit Reason Analysis</div><div className="card-subtitle">Why employees are leaving</div></div></div>
          {exits.length === 0 ? <p className="text-muted text-sm text-center" style={{padding:'30px'}}>No exit records</p> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={reasonData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({name,percent})=>`${(percent*100).toFixed(0)}%`} fontSize={10}>
                    {reasonData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'rgba(255,255,255,0.85)',border:'1px solid var(--border)',borderRadius:8}}/>
                </PieChart>
              </ResponsiveContainer>
              {reasonData.map((r,i)=>(
                <div key={r.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:12}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                  <span style={{color:'var(--text-secondary)',flex:1}}>{r.name}</span>
                  <span style={{fontWeight:700}}>{r.value}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title mb-3">Department Attrition</div>
          <div className="insight-card mb-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>High attrition in specific departments signals systemic issues. Cross-reference with performance data and grievances to identify root causes and plan retention strategies.</p>
          </div>
          {Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).map(([dept,c])=>(
            <div key={dept} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{dept||'Unknown'}</span>
                <span style={{fontWeight:700,color:'var(--orange)'}}>{c} exit{c>1?'s':''}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill orange" style={{width:`${(c/exits.length)*100}%`}}/>
              </div>
            </div>
          ))}
          {Object.keys(deptMap).length===0 && <p className="text-muted text-sm">No exits recorded</p>}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Exit Records</div><div className="card-subtitle">{exits.length} records</div></div>
          <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Record Exit</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Resignation Date</th><th>Last Working Day</th><th>Exit Reason</th><th>Asset Return</th><th>Exp. Letter</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {exits.length===0 && <tr><td colSpan={9} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No exit records</td></tr>}
              {exits.map(e=>(
                <tr key={e.id}>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{getName(e.employeeId)}</td>
                  <td><span className="chip">{getDept(e.employeeId)}</span></td>
                  <td style={{fontSize:12}}>{e.resignationDate}</td>
                  <td style={{fontSize:12}}>{e.lastWorkingDay}</td>
                  <td style={{fontSize:12,color:'var(--text-secondary)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.reason}</td>
                  <td><span className={`badge ${e.assetReturn==='Completed'?'badge-green':'badge-yellow'}`}>{e.assetReturn}</span></td>
                  <td><span className={`badge ${e.expLetter==='Issued'?'badge-green':'badge-yellow'}`}>{e.expLetter}</span></td>
                  <td><span className={`badge ${statusBadge[e.status]}`}>{e.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(e)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(e.id)}><Trash2 size={12}/></button>
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
