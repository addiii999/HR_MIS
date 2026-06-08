import { useState, useMemo } from 'react';
import { getCollection, saveCollection } from '@/store';
import { Check, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';

const WORKING_DAYS = ['2026-05-01','2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08',
  '2026-05-11','2026-05-12','2026-05-13'];

export default function Attendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(() => getCollection('attendance'));
  const employees = getCollection('employees').filter(e => e.status === 'Active' || e.status === 'Probation');
  const [selectedDate, setSelectedDate] = useState('2026-05-13');

  const refresh = () => setAttendance(getCollection('attendance'));

  const toggleAttendance = (empId, date, current) => {
    if(user.role === 'employee') return; // employees can't edit
    const updated = attendance.map(a =>
      a.date === date && a.employeeId === empId ? { ...a, status: current === 'Present' ? 'Absent' : 'Present' } : a
    );
    // add new record if not exists
    if (!updated.find(a => a.date === date && a.employeeId === empId)) {
      updated.push({ id: `att_${date}_${empId}`, date, employeeId: empId, status: 'Present' });
    }
    saveCollection('attendance', updated);
    setAttendance(updated);
  };

  // Today's attendance for selected date
  const dayRecords = attendance.filter(a => a.date === selectedDate);
  const presentToday = dayRecords.filter(a => a.status === 'Present').length;
  const absentToday = employees.length - presentToday;
  const attPct = employees.length ? Math.round((presentToday / employees.length) * 100) : 0;

  // Trend data - last 7 days
  const trendData = WORKING_DAYS.map(date => {
    const recs = attendance.filter(a => a.date === date);
    const present = recs.filter(a => a.status === 'Present').length;
    return { date: date.slice(5), present, pct: employees.length ? Math.round((present/employees.length)*100) : 0 };
  });

  // Dept-wise attendance for selected date
  const deptAtt = {};
  employees.forEach(e => {
    const rec = attendance.find(a => a.date === selectedDate && a.employeeId === e.id);
    deptAtt[e.department] = deptAtt[e.department] || { present: 0, total: 0 };
    deptAtt[e.department].total++;
    if (rec?.status === 'Present') deptAtt[e.department].present++;
  });

  // Top attendance employees (out of all recorded days)
  const empAtt = {};
  WORKING_DAYS.forEach(date => {
    employees.forEach(e => {
      empAtt[e.id] = empAtt[e.id] || { name: e.name, dept: e.department, present: 0, total: 0 };
      const rec = attendance.find(a => a.date === date && a.employeeId === e.id);
      empAtt[e.id].total++;
      if (rec?.status === 'Present') empAtt[e.id].present++;
    });
  });
  const topEmp = Object.values(empAtt).sort((a,b) => (b.present/b.total) - (a.present/a.total)).slice(0, 5);

  const getStatus = (empId) => {
    const r = attendance.find(a => a.date === selectedDate && a.employeeId === empId);
    return r?.status || 'Absent';
  };

  const isEmployee = user?.role === 'employee';

  return (
    <div>
      <PageHeader
        title="Attendance Monitoring"
        subtitle={`${attPct}% attendance rate · ${presentToday} present, ${absentToday} absent on ${selectedDate}`}
        icon={<Clock size={22} />}
        breadcrumbs={[{ label: 'Attendance' }]}
      />

      <div className="stat-grid mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        <div className="stat-card green"><div className="stat-value">{presentToday}</div><div className="stat-label">Present Today</div></div>
        <div className="stat-card orange"><div className="stat-value">{absentToday}</div><div className="stat-label">Absent Today</div></div>
        <div className="stat-card blue"><div className="stat-value">{attPct}%</div><div className="stat-label">Attendance Rate</div></div>
        <div className="stat-card purple"><div className="stat-value">{employees.length}</div><div className="stat-label">Total Employees</div></div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Attendance Trend</div><div className="card-subtitle">% present - May 2026</div></div></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="date" tick={{fontSize:10}}/>
              <YAxis domain={[60,100]} unit="%"/>
              <Tooltip formatter={v=>`${v}%`} contentStyle={{background:'rgba(255,255,255,0.85)',border:'1px solid var(--border)',borderRadius:8}}/>
              <Line type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2.5} dot={{fill:'#10b981',r:4}} name="Attendance %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Department Attendance</div><div className="card-subtitle">Date: {selectedDate}</div></div></div>
          <div className="insight-card mb-3">
            <div className="insight-tag">📊 MIS Insight</div>
            <p>Low department attendance may indicate team engagement issues, seasonal leave patterns, or management problems. Use this to plan workload distribution.</p>
          </div>
          {Object.entries(deptAtt).map(([dept, d]) => (
            <div key={dept} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}>
                <span style={{color:'var(--text-secondary)'}}>{dept}</span>
                <span style={{fontWeight:700,color:d.present===d.total?'var(--success)':'var(--warning)'}}>{d.present}/{d.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill green" style={{width:`${(d.present/d.total)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Daily register */}
        <div className="card">
          <div className="section-header">
            <div><div className="card-title">Daily Register</div><div className="card-subtitle">Click to toggle attendance</div></div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="date" className="form-input" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{width:140}}/>
            </div>
          </div>
          <div style={{maxHeight:400,overflowY:'auto'}}>
            {employees.map(emp => {
              const status = getStatus(emp.id);
              return (
                <div key={emp.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
                  <div className="avatar sm">{emp.name.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{emp.name}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{emp.department}</div>
                  </div>
                  <button
                    className={`badge ${status==='Present'?'badge-green':'badge-red'}`}
                    style={{cursor:isEmployee?'default':'pointer',border:'none',fontFamily:'inherit'}}
                    onClick={()=>toggleAttendance(emp.id, selectedDate, status)}
                    title={isEmployee?'':'Click to toggle'}
                  >
                    {status==='Present' ? <><Check size={10}/> Present</> : <><X size={10}/> Absent</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top attendance */}
        <div className="card">
          <div className="card-header"><div><div className="card-title">Top Attendance Employees</div><div className="card-subtitle">Based on May 2026 records</div></div></div>
          {topEmp.map((e, i) => (
            <div key={e.name} style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:i===0?'#f59e0b':i===1?'#94a3b8':'#b45309',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{e.name}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{e.dept}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:15,fontWeight:800,color:'var(--success)'}}>{Math.round((e.present/e.total)*100)}%</div>
                <div style={{fontSize:10,color:'var(--text-muted)'}}>{e.present}/{e.total} days</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
