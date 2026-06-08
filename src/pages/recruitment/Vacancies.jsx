import { useState } from 'react';
import { getCollection, saveCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Search, Edit2, Trash2, X, Check, Briefcase } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

const PLATFORMS = ['LinkedIn', 'Naukri', 'Instagram', 'Indeed', 'Company Website', 'Referral', 'Other'];
const STATUSES = ['Open', 'Closed', 'Fulfilled', 'Pending'];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'Design', 'Operations', 'Legal'];

const statusBadge = { Open:'badge-blue', Closed:'badge-gray', Fulfilled:'badge-green', Pending:'badge-yellow' };

function Modal({ vacancy, onClose, onSave }) {
  const [form, setForm] = useState(vacancy || {
    department:'', title:'', profile:'', count:1,
    requestDate: new Date().toISOString().slice(0,10),
    platform:'LinkedIn', postStart:'', postEnd:'', status:'Open'
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.department || !form.title) return alert('Department and Title are required');
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{vacancy ? 'Edit Vacancy' : 'Add New Vacancy'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-select" value={form.department} onChange={e=>set('department',e.target.value)}>
              <option value="">Select...</option>
              {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Vacancy Title *</label>
            <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Senior Developer" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Job Profile / Required Skills</label>
          <textarea className="form-textarea" value={form.profile} onChange={e=>set('profile',e.target.value)} placeholder="React, Node.js, 3+ years..." style={{minHeight:70}} />
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">No. of Vacancies</label>
            <input className="form-input" type="number" min={1} value={form.count} onChange={e=>set('count',+e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Request Date</label>
            <input className="form-input" type="date" value={form.requestDate} onChange={e=>set('requestDate',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Posting Platform</label>
            <select className="form-select" value={form.platform} onChange={e=>set('platform',e.target.value)}>
              {PLATFORMS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Posting Start Date</label>
            <input className="form-input" type="date" value={form.postStart} onChange={e=>set('postStart',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Posting End Date</label>
            <input className="form-input" type="date" value={form.postEnd} onChange={e=>set('postEnd',e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} /> Save Vacancy</button>
        </div>
      </div>
    </div>
  );
}

export default function Vacancies() {
  const [vacancies, setVacancies] = useState(() => getCollection('vacancies'));
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | vacancy-object

  const refresh = () => setVacancies(getCollection('vacancies'));

  const handleSave = (form) => {
    if (modal === 'add') {
      addItem('vacancies', { ...form, id: generateId('v') });
    } else {
      updateItem('vacancies', modal.id, form);
    }
    refresh(); setModal(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this vacancy?')) return;
    deleteItem('vacancies', id); refresh();
  };

  const filtered = vacancies.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) || v.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchDept = filterDept === 'All' || v.department === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  // Analytics
  const deptCounts = {};
  vacancies.forEach(v => { deptCounts[v.department] = (deptCounts[v.department]||0) + 1; });
  const platformCounts = {};
  vacancies.forEach(v => { platformCounts[v.platform] = (platformCounts[v.platform]||0) + 1; });

  return (
    <div>
      <PageHeader
        title="Vacancy Management"
        subtitle="Track open positions, job postings, and hiring demand across departments"
        icon={<Briefcase size={22} />}
        breadcrumbs={[{ path: '/recruitment', label: 'Recruitment' }, { label: 'Vacancies' }]}
      />

      {/* Summary Cards */}
      <div className="stat-grid mb-6" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))' }}>
        {STATUSES.map((s,i) => {
          const colors = ['blue','green','orange','purple'];
          return (
            <div className={`stat-card ${colors[i]}`} key={s}>
              <div className="stat-value">{vacancies.filter(v=>v.status===s).length}</div>
              <div className="stat-label">{s} Vacancies</div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="card mb-6">
        <div className="card-title mb-3">📊 MIS Insight - Vacancy Analytics</div>
        <div className="grid-2">
          <div>
            <p className="text-sm text-secondary mb-2"><strong>Why this report matters:</strong> Tracking open vs fulfilled vacancies reveals recruitment bottlenecks and department-level hiring demand. It guides workforce planning and budget allocation.</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {Object.entries(deptCounts).map(([dept,c]) => (
                <span key={dept} className="chip">{dept}: <strong style={{marginLeft:4}}>{c}</strong></span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted mb-2 font-semibold">Platform Distribution</p>
            {Object.entries(platformCounts).map(([plat,c]) => (
              <div key={plat} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span className="text-sm text-secondary" style={{width:90}}>{plat}</span>
                <div className="progress-bar" style={{flex:1}}>
                  <div className="progress-fill blue" style={{width:`${(c/vacancies.length)*100}%`}} />
                </div>
                <span className="text-xs text-muted">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="card-title">Vacancy Register</div>
            <div className="card-subtitle">{filtered.length} of {vacancies.length} vacancies shown</div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <div className="search-wrap">
              <Search className="search-icon" size={14} />
              <input className="form-input" placeholder="Search vacancies..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32, width:200}} />
            </div>
            <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:120}}>
              <option value="All">All Status</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="form-select" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{width:140}}>
              <option value="All">All Depts</option>
              {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
            </select>
            <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Vacancy</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Department</th><th>Count</th><th>Platform</th>
                <th>Request Date</th><th>Posting Period</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>No vacancies found</td></tr>
              )}
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{color:'var(--text-primary)', fontWeight:600}}>{v.title}</td>
                  <td><span className="chip">{v.department}</span></td>
                  <td style={{textAlign:'center', fontWeight:700}}>{v.count}</td>
                  <td>{v.platform}</td>
                  <td>{v.requestDate}</td>
                  <td style={{fontSize:11}}>{v.postStart} → {v.postEnd || '-'}</td>
                  <td><span className={`badge ${statusBadge[v.status]}`}>{v.status}</span></td>
                  <td>
                    <div style={{display:'flex', gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(v)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(v.id)}><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <Modal vacancy={modal === 'add' ? null : modal} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  );
}
