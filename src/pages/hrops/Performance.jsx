import { useState } from 'react';
import { getCollection, addItem, updateItem, deleteItem, generateId } from '@/store';
import { Plus, Edit2, Trash2, X, Check, Star, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';

const PERIODS = ['Q1 2026','Q2 2026','Q3 2025','Q4 2025'];
const RESULTS = ['Excellent','Good','Average','Poor'];
const RECOMMENDATIONS = ['Promotion','Hike','None','PIP'];
const resultBadge = { Excellent:'badge-green', Good:'badge-blue', Average:'badge-yellow', Poor:'badge-red' };
const recColors = { Promotion:'var(--success)', Hike:'var(--cyan)', None:'var(--text-muted)', PIP:'var(--danger)' };

function Modal({ record, onClose, onSave }) {
  const employees = getCollection('employees');
  const [form, setForm] = useState(record || {
    employeeId:'', period:'Q1 2026', score:70, feedback:'', improvement:'', result:'Good', recommendation:'None'
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const autoResult = form.score >= 85 ? 'Excellent' : form.score >= 70 ? 'Good' : form.score >= 50 ? 'Average' : 'Poor';

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{record?'Edit Assessment':'Add Assessment'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
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
            <label className="form-label">Assessment Period</label>
            <select className="form-select" value={form.period} onChange={e=>set('period',e.target.value)}>
              {PERIODS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Score: <strong style={{color:'var(--accent-solid)'}}>{form.score}/100</strong> → <span className={`badge ${resultBadge[autoResult]}`}>{autoResult}</span></label>
          <input type="range" min={0} max={100} value={form.score} onChange={e=>set('score',+e.target.value)} style={{width:'100%',accentColor:'var(--accent)'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-muted)',marginTop:2}}>
            <span>Poor (&lt;50)</span><span>Average (50-69)</span><span>Good (70-84)</span><span>Excellent (85+)</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Manager Feedback</label>
          <textarea className="form-textarea" value={form.feedback} onChange={e=>set('feedback',e.target.value)} placeholder="Overall performance summary..." style={{minHeight:70}}/>
        </div>
        <div className="form-group">
          <label className="form-label">Improvement Area</label>
          <input className="form-input" value={form.improvement} onChange={e=>set('improvement',e.target.value)} placeholder="e.g. Communication, Technical skills"/>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Assessment Result</label>
            <select className="form-select" value={form.result} onChange={e=>set('result',e.target.value)}>
              {RESULTS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Recommendation</label>
            <select className="form-select" value={form.recommendation} onChange={e=>set('recommendation',e.target.value)}>
              {RECOMMENDATIONS.map(r=><option key={r}>{r}</option>)}
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

export default function Performance() {
  const { user } = useAuth();
  const [records, setRecords] = useState(() => getCollection('performance'));
  const [modal, setModal] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('All');
  const employees = getCollection('employees');
  const refresh = () => setRecords(getCollection('performance'));

  const handleSave = (form) => {
    if(modal==='add') addItem('performance', {...form, id:generateId('p')});
    else updateItem('performance', modal.id, form);
    refresh(); setModal(null);
  };
  const handleDelete = (id) => { if(confirm('Delete?')) { deleteItem('performance',id); refresh(); }};

  const getName = (id) => employees.find(e=>e.id===id)?.name || id;
  const getDept = (id) => employees.find(e=>e.id===id)?.department || '';

  const filtered = filterPeriod==='All' ? records : records.filter(r=>r.period===filterPeriod);
  const q1 = records.filter(r=>r.period==='Q1 2026');
  const avgScore = q1.length ? Math.round(q1.reduce((a,r)=>a+r.score,0)/q1.length) : 0;
  const promotions = records.filter(r=>r.recommendation==='Promotion').length;
  const pips = records.filter(r=>r.recommendation==='PIP').length;
  const hikes = records.filter(r=>r.recommendation==='Hike').length;

  const topPerformers = [...q1].sort((a,b)=>b.score-a.score).slice(0,3);
  const underperformers = [...q1].sort((a,b)=>a.score-b.score).slice(0,3);

  const isEmployee = user?.role === 'employee';

  return (
    <div>
      <PageHeader
        title="Performance Assessment"
        subtitle={`${records.length} assessments · Average score: ${avgScore}/100`}
        icon={<Award size={22} />}
        breadcrumbs={[{ path: '/performance', label: 'HR Ops' }, { label: 'Performance' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        <div className="stat-card blue"><div className="stat-value">{avgScore}</div><div className="stat-label">Avg Score Q1 2026</div></div>
        <div className="stat-card green"><div className="stat-value">{promotions}</div><div className="stat-label">Promotion Recommended</div></div>
        <div className="stat-card cyan"><div className="stat-value">{hikes}</div><div className="stat-label">Hike Recommended</div></div>
        <div className="stat-card orange"><div className="stat-value">{pips}</div><div className="stat-label">PIPs Initiated</div></div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-title mb-3">🏆 Top Performers - Q1 2026</div>
          {topPerformers.map((r,i)=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:['#f59e0b','#94a3b8','#b45309'][i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{getName(r.employeeId)}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{getDept(r.employeeId)} · {r.period}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18,fontWeight:800,color:'var(--success)'}}>{r.score}</div>
                <span className={`badge ${resultBadge[r.result]}`}>{r.result}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title mb-3">⚠️ Needs Attention - Q1 2026</div>
          {underperformers.map((r,i)=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{getName(r.employeeId)}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{getDept(r.employeeId)}</div>
                <div style={{fontSize:11,color:'var(--warning)',marginTop:2}}>Improve: {r.improvement}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18,fontWeight:800,color:r.score<50?'var(--danger)':'var(--warning)'}}>{r.score}</div>
                <span style={{fontSize:11,fontWeight:700,color:recColors[r.recommendation]}}>{r.recommendation}</span>
              </div>
            </div>
          ))}
          <div className="insight-card mt-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>Employees with scores below 50 are on Performance Improvement Plans. HR should schedule monthly check-ins to track progress and provide coaching resources.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div><div className="card-title">Performance Records</div><div className="card-subtitle">{filtered.length} assessments</div></div>
          <div style={{display:'flex',gap:10}}>
            <select className="form-select" value={filterPeriod} onChange={e=>setFilterPeriod(e.target.value)} style={{width:140}}>
              <option value="All">All Periods</option>
              {PERIODS.map(p=><option key={p}>{p}</option>)}
            </select>
            {!isEmployee && <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={14}/> Add Assessment</button>}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Period</th><th>Score</th><th>Result</th><th>Recommendation</th><th>Improvement Area</th>{!isEmployee&&<th>Actions</th>}</tr>
            </thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{getName(r.employeeId)}</td>
                  <td><span className="chip">{getDept(r.employeeId)}</span></td>
                  <td style={{fontSize:12}}>{r.period}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:`conic-gradient(${r.score>=85?'#10b981':r.score>=70?'#0084ff':r.score>=50?'#f59e0b':'#ef4444'} ${r.score*3.6}deg,rgba(255,255,255,0.4) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{r.score}</div>
                    </div>
                  </td>
                  <td><span className={`badge ${resultBadge[r.result]}`}>{r.result}</span></td>
                  <td><span style={{fontWeight:700,color:recColors[r.recommendation]}}>{r.recommendation}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{r.improvement}</td>
                  {!isEmployee && <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>setModal(r)}><Edit2 size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}><Trash2 size={12}/></button>
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
