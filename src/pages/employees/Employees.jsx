import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, Search, Filter, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

const DEPARTMENTS = ['Engineering','Marketing','Finance','HR','Sales','Design','Operations','Legal'];
const STATUSES = ['Active','Probation','On Leave','Resigned','Terminated'];
const GENDERS = ['Male','Female','Other'];
const CATEGORIES = ['General','OBC','SC','ST'];

const statusBadge = { Active:'badge-green', Probation:'badge-yellow', 'On Leave':'badge-blue', Resigned:'badge-red', Terminated:'badge-red' };

function Modal({ emp, onClose, onSave }) {
  const [form, setForm] = useState(emp || {
    id:'', name:'', department:'', designation:'', profile:'',
    doj: new Date().toISOString().slice(0,10), gender:'Male', category:'General',
    age:'', experience:'', phone:'', email:'', status:'Active'
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{emp?'Edit Employee':'Add Employee'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Employee ID *</label>
            <input className="form-input" value={form.id} onChange={e=>set('id',e.target.value)} placeholder="E015" disabled={!!emp}/>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full Name"/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department} onChange={e=>set('department',e.target.value)}>
              <option value="">Select...</option>
              {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input className="form-input" value={form.designation} onChange={e=>set('designation',e.target.value)} placeholder="e.g. Senior Developer"/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Job Profile</label>
          <input className="form-input" value={form.profile} onChange={e=>set('profile',e.target.value)} placeholder="Full Stack, React, Node.js"/>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Date of Joining</label>
            <input className="form-input" type="date" value={form.doj} onChange={e=>set('doj',e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={e=>set('gender',e.target.value)}>
              {GENDERS.map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e=>set('category',e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" value={form.age} onChange={e=>set('age',+e.target.value)} placeholder="25"/>
          </div>
          <div className="form-group">
            <label className="form-label">Experience (yrs)</label>
            <input className="form-input" type="number" value={form.experience} onChange={e=>set('experience',+e.target.value)} placeholder="3"/>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="9876543210"/>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="emp@company.com"/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{ if(!form.id||!form.name) return alert('ID and Name required'); onSave(form); }}><Check size={14}/> Save Employee</button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState(() => getCollection('employees'));
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal] = useState(null);
  const refresh = () => setEmployees(getCollection('employees'));

  const handleSave = (form) => {
    if (modal==='add') addItem('employees', form);
    else updateItem('employees', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete employee record?')) { deleteItem('employees',id); refresh(); }};

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q))
      && (filterDept==='All' || e.department===filterDept)
      && (filterStatus==='All' || e.status===filterStatus);
  });

  // Analytics
  const deptCount = {};
  employees.filter(e=>e.status!=='Resigned'&&e.status!=='Terminated').forEach(e=>{ deptCount[e.department]=(deptCount[e.department]||0)+1; });
  const ageGroups = { '20-25':0,'26-30':0,'31-35':0,'36+':0 };
  employees.forEach(e=>{
    if(e.age<=25) ageGroups['20-25']++;
    else if(e.age<=30) ageGroups['26-30']++;
    else if(e.age<=35) ageGroups['31-35']++;
    else ageGroups['36+']++;
  });

  const activeCount = employees.filter(e => e.status === 'Active' || e.status === 'Probation').length;

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        subtitle={`${activeCount} active employees across ${Object.keys(deptCount).length} departments`}
        icon={<Users size={22} />}
        breadcrumbs={[{ label: 'Employees' }]}
      />

      {/* Summary Row */}
      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        {STATUSES.map((s,i)=>{
          const cols=['green','yellow','blue','red','red'];
          return <div className={`stat-card ${cols[i]}`} key={s}><div className="stat-value">{employees.filter(e=>e.status===s).length}</div><div className="stat-label">{s}</div></div>;
        })}
      </div>

      {/* Insight row */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-title mb-3">Department Distribution</div>
          {Object.entries(deptCount).sort((a,b)=>b[1]-a[1]).map(([dept,c])=>(
            <div key={dept} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{dept}</span>
                <span style={{fontWeight:700}}>{c} employees</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill blue" style={{width:`${(c/employees.length)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title mb-3">Age Group Analysis</div>
          <div className="insight-card mb-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>Age distribution reveals workforce maturity. A young workforce is agile but higher-risk for attrition. A senior workforce brings stability but may signal succession planning needs.</p>
          </div>
          {Object.entries(ageGroups).map(([grp,c])=>(
            <div key={grp} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{grp} years</span><span style={{fontWeight:700}}>{c}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill purple" style={{width:`${employees.length?((c/employees.length)*100):0}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Employee Records</div><div className="card-subtitle">{filtered.length} records shown</div></div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <div className="search-wrap">
              <Search className="search-icon" size={14}/>
              <input className="form-input" placeholder="Search name / ID..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32,width:200}}/>
            </div>
            <select className="form-select" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{width:140}}>
              <option value="All">All Depts</option>
              {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
            </select>
            <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:130}}>
              <option value="All">All Status</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Employee</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Gender</th><th>Age</th><th>Exp</th><th>DOJ</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td style={{fontFamily:'monospace',color:'var(--accent-solid)',fontWeight:700}}>{e.id}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="avatar sm" style={{background:`linear-gradient(135deg,${['#0084ff','#8b5cf6','#ec4899','#06b6d4','#10b981'][e.id.charCodeAt(1)%5]},#60B1FF)`}}>{e.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{e.name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{e.department}</span></td>
                  <td style={{color:'var(--text-secondary)',fontSize:12}}>{e.designation}</td>
                  <td>{e.gender}</td>
                  <td>{e.age}</td>
                  <td>{e.experience}y</td>
                  <td style={{fontSize:12}}>{e.doj}</td>
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

      {modal && <Modal emp={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
