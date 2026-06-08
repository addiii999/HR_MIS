import { getCollection } from '@/store';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, Briefcase, UserCheck, TrendingUp, Star, AlertTriangle, DoorOpen, Clock, Target, LayoutDashboard } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/ui/StatCard';
import InsightCard from '@/components/shared/ui/InsightCard';
import { CHART_COLORS } from '@/constants';


export default function Dashboard() {
  const employees = getCollection('employees');
  const vacancies = getCollection('vacancies');
  const recruitment = getCollection('recruitment');
  const interviews = getCollection('interviews');
  const grievances = getCollection('grievances');
  const performance = getCollection('performance');
  const attendance = getCollection('attendance');
  const exits = getCollection('exits');

  const activeEmp = employees.filter(e => e.status === 'Active').length;
  const newJoins = employees.filter(e => e.doj >= '2026-05-01').length;
  const openVacancies = vacancies.filter(v => v.status === 'Open').length;
  const openGrievances = grievances.filter(g => g.status === 'Open').length;
  const resolvedGrievances = grievances.filter(g => g.status === 'Resolved').length;
  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled').length;
  const avgScore = performance.length ? Math.round(performance.reduce((a, p) => a + p.score, 0) / performance.length) : 0;
  const totalApps = recruitment.reduce((a, r) => a + r.applications, 0);
  const totalJoined = recruitment.reduce((a, r) => a + r.joined, 0);
  const convRate = totalApps ? ((totalJoined / totalApps) * 100).toFixed(1) : 0;
  const attrition = exits.length;

  const deptMap = {};
  employees.filter(e => e.status === 'Active' || e.status === 'Probation').forEach(e => {
    deptMap[e.department] = (deptMap[e.department] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

  const males = employees.filter(e => e.gender === 'Male').length;
  const females = employees.filter(e => e.gender === 'Female').length;
  const genderData = [{ name: 'Male', value: males }, { name: 'Female', value: females }];

  const hiringTrend = [
    { month: 'Jan', hired: 2, resigned: 0 },
    { month: 'Feb', hired: 1, resigned: 0 },
    { month: 'Mar', hired: 0, resigned: 1 },
    { month: 'Apr', hired: 3, resigned: 0 },
    { month: 'May', hired: 2, resigned: 1 },
  ];

  const attByDate = {};
  attendance.forEach(a => {
    attByDate[a.date] = attByDate[a.date] || { present: 0, total: 0 };
    attByDate[a.date].total++;
    if (a.status === 'Present') attByDate[a.date].present++;
  });
  const attTrend = Object.entries(attByDate).slice(-7).map(([date, d]) => ({
    date: date.slice(5),
    pct: Math.round((d.present / d.total) * 100),
  }));

  const perfDist = ['Excellent','Good','Average','Poor'].map(r => ({
    name: r, count: performance.filter(p => p.result === r).length
  }));

  const catMap = {};
  employees.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const funnel = [
    { stage: 'Applications', value: totalApps },
    { stage: 'Shortlisted', value: recruitment.reduce((a,r)=>a+r.shortlisted,0) },
    { stage: 'Interviewed', value: recruitment.reduce((a,r)=>a+r.interviewed,0) },
    { stage: 'Selected', value: recruitment.reduce((a,r)=>a+r.selected,0) },
    { stage: 'Joined', value: totalJoined },
  ];

  const recentJoiners = [...employees].sort((a,b) => b.doj.localeCompare(a.doj)).slice(0,5);
  const topPerformers = [...performance].sort((a,b)=>b.score-a.score).slice(0,4).map(p => {
    const emp = employees.find(e=>e.id===p.employeeId);
    return { ...p, name: emp?.name || p.employeeId, dept: emp?.department };
  });

  const statusBadge = { Active: 'badge-green', Probation: 'badge-yellow', Resigned: 'badge-red', 'On Leave': 'badge-blue', Terminated: 'badge-red' };

  const platMap = {};
  recruitment.forEach(r => {
    platMap[r.platform] = platMap[r.platform] || { applications: 0, joined: 0 };
    platMap[r.platform].applications += r.applications;
    platMap[r.platform].joined += r.joined;
  });
  const platformData = Object.entries(platMap).map(([platform, d]) => ({ platform, ...d, rate: d.applications ? +((d.joined/d.applications)*100).toFixed(1) : 0 }));
  const bestPlatform = [...platformData].sort((a,b)=>b.rate-a.rate)[0];
  const highestAttritionDept = (() => {
    const m = {};
    exits.forEach(ex => { const emp = employees.find(e=>e.id===ex.employeeId); if (emp) m[emp.department] = (m[emp.department]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0];
  })();
  const mostGrievanceDept = (() => {
    const m = {};
    grievances.forEach(g => { const emp = employees.find(e=>e.id===g.complaintBy); if (emp) m[emp.department] = (m[emp.department]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0];
  })();

  const tooltipStyle = { background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' };

  return (
    <div>
      <PageHeader
        title="HR Analytics Dashboard"
        subtitle="Real-time workforce intelligence & insights"
        icon={<LayoutDashboard size={22} />}
      />

      <div className="stat-grid mb-6">
        <StatCard icon={Users} value={activeEmp} label="Active Employees" change={8} color="blue" />
        <StatCard icon={UserCheck} value={newJoins} label="Joined This Month" change={12} color="green" />
        <StatCard icon={Briefcase} value={openVacancies} label="Open Vacancies" color="orange" />
        <StatCard icon={Target} value={`${convRate}%`} label="Hiring Conversion" color="cyan" />
        <StatCard icon={Star} value={avgScore} label="Avg Performance" color="purple" />
        <StatCard icon={AlertTriangle} value={openGrievances} label="Open Grievances" color="pink" />
        <StatCard icon={Clock} value={scheduledInterviews} label="Pending Interviews" color="blue" />
        <StatCard icon={DoorOpen} value={attrition} label="Exits This Year" color="orange" />
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Department Headcount</div><div className="card-subtitle">Active + Probation by department</div></div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Monthly Hiring vs Attrition</div><div className="card-subtitle">Workforce net change trend</div></div></div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hiringTrend}>
              <defs>
                <linearGradient id="hired" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0084ff" stopOpacity={0.2}/><stop offset="95%" stopColor="#0084ff" stopOpacity={0}/></linearGradient>
                <linearGradient id="resigned" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{fontSize:11}} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="hired" stroke="#0084ff" fill="url(#hired)" strokeWidth={2} name="Hired" />
              <Area type="monotone" dataKey="resigned" stroke="#ef4444" fill="url(#resigned)" strokeWidth={2} name="Resigned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Attendance Trend</div><div className="card-subtitle">Last 7 working days</div></div></div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={attTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize:10}} />
              <YAxis domain={[70,100]} tick={{fontSize:10}} unit="%" />
              <Tooltip formatter={v=>`${v}%`} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2.5} dot={{ fill:'#10b981', r:3 }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Gender Ratio</div><div className="card-subtitle">Workforce diversity</div></div></div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', height:180 }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {genderData.map((_,i) => <Cell key={i} fill={i===0 ? '#0084ff' : '#ec4899'} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:16, fontSize:12 }}>
              <span style={{color:'#0084ff'}}>�-� Male: {males}</span>
              <span style={{color:'#ec4899'}}>�-� Female: {females}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Category Analysis</div><div className="card-subtitle">General / OBC / SC / ST</div></div></div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({name,value})=>`${name}: ${value}`} fontSize={11} labelLine={false}>
                {catData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Recruitment Funnel</div><div className="card-subtitle">Applications → Joinings</div></div></div>
          {funnel.map((f) => (
            <div key={f.stage} style={{ marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span style={{ color:'var(--text-secondary)' }}>{f.stage}</span>
                <span style={{ fontWeight:700 }}>{f.value}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill blue" style={{ width: `${(f.value/funnel[0].value)*100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Platform Performance</div><div className="card-subtitle">Hiring source effectiveness</div></div></div>
          {platformData.map((p, i) => (
            <div key={p.platform} style={{ marginBottom: 12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span style={{ color:'var(--text-secondary)' }}>{p.platform}</span>
                <span style={{ fontWeight:700, color: CHART_COLORS[i%CHART_COLORS.length] }}>{p.rate}% conv.</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${p.rate*10}%`, background: CHART_COLORS[i%CHART_COLORS.length] }} /></div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{p.applications} apps → {p.joined} joined</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Performance Distribution</div><div className="card-subtitle">Q1 2026 ratings</div></div></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perfDist} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize:11}} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                <Cell fill="#10b981" /><Cell fill="#0084ff" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Decision Insights</div><div className="card-subtitle">AI-generated recommendations</div></div></div>
          <InsightCard tag="Best Hiring Platform" text={`${bestPlatform?.platform} has the highest conversion rate at ${bestPlatform?.rate}%. Increase job postings on this platform.`} />
          <InsightCard tag="Attrition Risk" text={`${highestAttritionDept || 'Finance'} department has the highest exits. Conduct stay interviews.`} />
          <InsightCard tag="Grievance Hotspot" text={`${mostGrievanceDept || 'Sales'} has the most grievances. Review team dynamics.`} />
          <InsightCard tag="Performance Gap" text="Manoj Yadav (Sales) scored 55 in Q1 - PIP initiated. Review by Q2." />
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Recent Joiners</div><div className="card-subtitle">Latest employees onboarded</div></div></div>
          {recentJoiners.map(emp => (
            <div key={emp.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
              <div className="avatar sm">{emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{emp.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{emp.department} · {emp.designation}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{emp.doj}</div>
                <span className={`badge ${statusBadge[emp.status]}`}>{emp.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Top Performers</div><div className="card-subtitle">Q1 2026 - highest scores</div></div></div>
          {topPerformers.map((p, i) => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: i===0?'#f59e0b':i===1?'#94a3b8':'#b45309', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.dept}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:16, fontWeight:800, color: p.score>=85?'var(--success)':p.score>=70?'var(--warning)':'var(--danger)' }}>{p.score}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)' }}>/100</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><div><div className="card-title">Recruitment Pipeline</div><div className="card-subtitle">End-to-end hiring visualization</div></div></div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {[
            { num:'1', label:'Vacancy Request', count: vacancies.length, color:'#0084ff' },
            { num:'2', label:'Job Posting', count: vacancies.filter(v=>v.status!=='Pending').length, color:'#319AFF' },
            { num:'3', label:'Resume Screen', count: recruitment.reduce((a,r)=>a+r.shortlisted,0), color:'#60B1FF' },
            { num:'4', label:'Interviews', count: interviews.length, color:'#8b5cf6' },
            { num:'5', label:'Selection', count: recruitment.reduce((a,r)=>a+r.selected,0), color:'#10b981' },
            { num:'6', label:'Offer Made', count: 4, color:'#f97316' },
            { num:'7', label:'Joining', count: totalJoined, color:'#ec4899' },
          ].map((stage, i) => (
            <div key={stage.num} style={{ flex:1, minWidth:110, textAlign:'center', position:'relative' }}>
              <div style={{ background:`${stage.color}10`, border:`1px solid ${stage.color}25`, borderRadius:12, padding:'14px 8px', backdropFilter:'blur(10px)' }}>
                <div style={{ fontSize:22, fontWeight:900, color:stage.color }}>{stage.count}</div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', marginTop:2 }}>{stage.label}</div>
              </div>
              {i < 6 && <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'var(--text-muted)', zIndex:2 }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Grievance Status</div><div className="card-subtitle">Open vs resolved</div></div></div>
          <div style={{ display:'flex', gap:16 }}>
            {[
              { label:'Open', count: openGrievances, color:'var(--danger)' },
              { label:'Under Review', count: grievances.filter(g=>g.status==='Under Review').length, color:'var(--warning)' },
              { label:'Resolved', count: resolvedGrievances, color:'var(--success)' },
            ].map(s => (
              <div key={s.label} style={{ flex:1, textAlign:'center', padding:'16px 12px', background:'var(--glass)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:'var(--font-brand)' }}>{s.count}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Vacancy Overview</div><div className="card-subtitle">Status breakdown</div></div></div>
          <div style={{ display:'flex', gap:16 }}>
            {[
              { label:'Open', count: vacancies.filter(v=>v.status==='Open').length, color:'var(--info)' },
              { label:'Fulfilled', count: vacancies.filter(v=>v.status==='Fulfilled').length, color:'var(--success)' },
              { label:'Pending', count: vacancies.filter(v=>v.status==='Pending').length, color:'var(--warning)' },
              { label:'Closed', count: vacancies.filter(v=>v.status==='Closed').length, color:'var(--text-muted)' },
            ].map(s => (
              <div key={s.label} style={{ flex:1, textAlign:'center', padding:'16px 12px', background:'var(--glass)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:'var(--font-brand)' }}>{s.count}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

