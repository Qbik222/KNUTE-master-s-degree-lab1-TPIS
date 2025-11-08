import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { Separator } from "@/components/ui/separator";

import { Checkbox } from "@/components/ui/checkbox";

import { Download, Filter, ListChecks, Plus, Search, Upload, X, Bell, CalendarDays, CheckCircle2, ClipboardList, FileText, GraduationCap, Network } from "lucide-react";
import IDEF0Editor from "@/components/IDEF0Editor";
import IDEF0Viewer from "@/components/IDEF0Viewer";

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function useLocal(key, initial) {

  const [val, setVal] = useState(() => {

    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }

  });

  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {}

  }, [key, val]);

  return [val, setVal];

}

const nowISO = () => new Date().toISOString();

const todayDateInput = () => new Date().toISOString().slice(0,10);

const defaultStudents = [

  { id: uid(), name: "Іван Петренко", group: "ФІТ-1-2м" },

  { id: uid(), name: "Марія Коваль", group: "ФІТ-1-2м" },

  { id: uid(), name: "Олег Савчук", group: "ФІТ-1-2м" },

];

const defaultTasks = [

  { id: "lr1", title: "ЛР1: Вступ та вимоги", discipline: "Інф. системи", max: 100, deadline: todayDateInput() },

  { id: "lr2", title: "ЛР2: Модель IDEF0", discipline: "Інф. системи", max: 100, deadline: todayDateInput() },

  { id: "pr1", title: "ПР1: Прототип", discipline: "Інф. системи", max: 100, deadline: todayDateInput() },

];

const rubricDefault = [

  { id: "crit1", title: "Повнота виконання", weight: 0.4 },

  { id: "crit2", title: "Дотримання вимог", weight: 0.3 },

  { id: "crit3", title: "Академічна доброчесність", weight: 0.2 },

  { id: "crit4", title: "Оформлення", weight: 0.1 },

];

const statusMap = {

  queued: { label: "В черзі", tone: "secondary" },

  graded: { label: "Зараховано", tone: "default" },

  revision: { label: "На доопрацювання", tone: "destructive" },

};

export default function App() {

  const [students, setStudents] = useLocal("vA_students", defaultStudents);

  const [tasks, setTasks] = useLocal("vA_tasks", defaultTasks);

  const [submissions, setSubmissions] = useLocal("vA_submissions", []);
  const [idef0Models, setIdef0Models] = useLocal("vA_idef0_models", []);

  const [rubric, setRubric] = useLocal("vA_rubric", rubricDefault);

  const [notifications, setNotifications] = useLocal("vA_notifications", []);

  const [activeTab, setActiveTab] = useLocal("vA_tab", "dashboard");

  const [query, setQuery] = useState("");

  const [filters, setFilters] = useState({ status: "all", task: "all", group: "all" });

  const groups = useMemo(() => Array.from(new Set(students.map(s => s.group))), [students]);

  useEffect(() => {

    const t = setInterval(() => {

      const today = new Date();

      const newN = [];

      tasks.forEach(tk => {

        const d = new Date(tk.deadline + "T23:59:59");

        const left = Math.ceil((d - today) / (1000*60*60*24));

        if (left === 3 || left === 1 || left === 0) {

          newN.push({ id: uid(), time: nowISO(), type: "deadline", title: `Наближається дедлайн: ${tk.title}`, message: `Залишилось днів: ${Math.max(left,0)}` });

        }

      });

      const queuedTooLong = submissions.filter(s => s.status === "queued").filter(s => {

        const age = (Date.now() - new Date(s.createdAt).getTime())/(1000*60*60*24);

        return age > 7;

      }).map(s => ({ id: uid(), time: nowISO(), type: "queue", title: "Довго в черзі", message: `${s.studentName}: ${s.taskTitle}` }));

      if (newN.length || queuedTooLong.length) setNotifications(prev => [...newN, ...queuedTooLong, ...prev].slice(0,200));

    }, 60000);

    return () => clearInterval(t);

  }, [tasks, submissions]);

  const filtered = useMemo(() => {

    return submissions.filter(s => {

      if (filters.status !== "all" && s.status !== filters.status) return false;

      if (filters.task !== "all" && s.taskId !== filters.task) return false;

      if (filters.group !== "all" && s.group !== filters.group) return false;

      if (!query) return true;

      const q = query.toLowerCase();

      return [s.studentName, s.group, s.taskTitle, s.discipline, s.url, s.notes, s.feedback].some(x => (x||"").toLowerCase().includes(q));

    }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  }, [submissions, filters, query]);

  function addSubmission(payload) {

    setSubmissions(prev => [{ id: uid(), createdAt: nowISO(), status: "queued", grade: null, ...payload }, ...prev]);

  }

  function upsertStudentByName(name, group) {

    const exist = students.find(s => s.name === name && s.group === group);

    if (!exist) setStudents(prev => [{ id: uid(), name, group }, ...prev]);

  }

  function reviewSubmission(id, next) {

    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...next } : s));

  }

  function addTask(t) { setTasks(prev => [{ ...t, id: uid() }, ...prev]); }

  function removeSubmission(id) { setSubmissions(prev => prev.filter(s => s.id !== id)); }

  return (

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 p-6">

      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">

          <GraduationCap />

          <h1 className="text-2xl font-bold">Облік робіт і оцінювання студентів</h1>

          <Badge variant="outline">Variant A • Prototype</Badge>

        </div>

        <div className="flex items-center gap-2">

          <NotificationCenter notifications={notifications} setNotifications={setNotifications} />

          <ExportCSV submissions={filtered} />

        </div>

      </header>

      <main className="max-w-7xl mx-auto">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="grid grid-cols-6 gap-2 w-full">

            <TabsTrigger value="dashboard">Панель</TabsTrigger>

            <TabsTrigger value="submit">Здати роботу</TabsTrigger>

            <TabsTrigger value="queue">Перевірка</TabsTrigger>

            <TabsTrigger value="reports">Звіти</TabsTrigger>

            <TabsTrigger value="idef0">IDEF0 Редактор</TabsTrigger>

            <TabsTrigger value="admin">Налаштування</TabsTrigger>

          </TabsList>

          <TabsContent value="dashboard"><Dashboard tasks={tasks} submissions={submissions} /></TabsContent>

          <TabsContent value="submit"><SubmitForm students={students} tasks={tasks} idef0Models={idef0Models} onSubmit={(p)=>{ addSubmission(p); upsertStudentByName(p.studentName, p.group); setActiveTab("queue"); }} /></TabsContent>

          <TabsContent value="queue">

            <FilterBar query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} tasks={tasks} groups={groups} />

            <SubmissionList items={filtered} onReview={reviewSubmission} onRemove={removeSubmission} rubric={rubric} tasks={tasks} />

          </TabsContent>

          <TabsContent value="reports"><Reports submissions={submissions} tasks={tasks} /></TabsContent>

          <TabsContent value="idef0" className="min-h-[calc(100vh-250px)]">
            <div className="h-[calc(100vh-250px)]">
              <IDEF0Editor 
                idef0Models={idef0Models}
                onSave={(model) => {
                  const modelId = uid();
                  setIdef0Models(prev => [...prev, { id: modelId, ...model, createdAt: nowISO() }]);
                  alert("Модель збережено!");
                }}
                onLoad={(model) => {
                  return model;
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="admin"><AdminStudents students={students} setStudents={setStudents} /><Separator className="my-6" /><AdminTasks tasks={tasks} setTasks={setTasks} /><Separator className="my-6" /><AdminRubric rubric={rubric} setRubric={setRubric} /></TabsContent>

        </Tabs>

      </main>

    </div>

  );

}

function Dashboard({ tasks, submissions }) {

  const total = submissions.length;

  const graded = submissions.filter(s=>s.status==='graded').length;

  const revision = submissions.filter(s=>s.status==='revision').length;

  const queued = submissions.filter(s=>s.status==='queued').length;

  const byTask = useMemo(()=>{

    const m = {};

    tasks.forEach(t=>m[t.id]={ title:t.title, total:0, graded:0 });

    submissions.forEach(s=>{ if(!m[s.taskId]) m[s.taskId]={ title:s.taskTitle, total:0, graded:0 }; m[s.taskId].total++; if(s.status==='graded') m[s.taskId].graded++;});

    return Object.entries(m).map(([id,v])=>({id,...v}));

  },[tasks, submissions]);

  return (

    <div className="grid md:grid-cols-4 gap-4">

      <Stat title="Всього подань" value={total} icon={<ClipboardList />} />

      <Stat title="Зараховано" value={graded} icon={<CheckCircle2 />} />

      <Stat title="На доопрацюванні" value={revision} icon={<ListChecks />} />

      <Stat title="В черзі" value={queued} icon={<Upload />} />

      <Card className="md:col-span-4">

        <CardContent className="p-4">

          <h3 className="font-semibold mb-3">Статистика по завданнях</h3>

          <div className="grid md:grid-cols-3 gap-3">

            {byTask.map(t=> (

              <div key={t.id} className="border rounded-2xl p-4 flex items-center justify-between">

                <div>

                  <div className="font-medium">{t.title}</div>

                  <div className="text-sm text-slate-500">Подань: {t.total}</div>

                </div>

                <Badge>{t.graded} зарах.</Badge>

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

      <Card className="md:col-span-4">

        <CardContent className="p-4 flex items-center gap-2 text-sm text-slate-600">

          <CalendarDays className="w-4 h-4" /> Для демо всі дедлайни встановлені на сьогоднішню дату. Їх можна змінити у вкладці Налаштування.

        </CardContent>

      </Card>

    </div>

  );

}

function Stat({ title, value, icon }) {

  return (

    <Card>

      <CardContent className="p-4">

        <div className="flex items-center gap-3">

          {icon}

          <div>

            <div className="text-sm text-slate-500">{title}</div>

            <div className="text-2xl font-bold">{value}</div>

          </div>

        </div>

      </CardContent>

    </Card>

  );

}

function SubmitForm({ students, tasks, onSubmit, idef0Models }) {

  const [studentName, setStudentName] = useState(students[0]?.name || "");

  const [group, setGroup] = useState(students[0]?.group || "ФІТ-1-2м");

  const [taskId, setTaskId] = useState(tasks[0]?.id || "");

  const [url, setUrl] = useState("");

  const [notes, setNotes] = useState("");

  const [idef0ModelId, setIdef0ModelId] = useState("");

  const [idef0File, setIdef0File] = useState(null);

  const currentTask = tasks.find(t=>t.id===taskId);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const modelData = JSON.parse(event.target.result);
          setIdef0File(modelData);
          setIdef0ModelId("");
        } catch (error) {
          alert("Помилка при завантаженні IDEF0 файлу");
        }
      };
      reader.readAsText(file);
    }
  };

  return (

    <div className="grid md:grid-cols-2 gap-6">

      <Card>

        <CardContent className="p-6 grid gap-4">

          <div className="grid gap-2">

            <Label>Студент</Label>

            <Input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="ПІБ" />

          </div>

          <div className="grid gap-2">

            <Label>Група</Label>

            <Input value={group} onChange={e=>setGroup(e.target.value)} />

          </div>

          <div className="grid gap-2">

            <Label>Завдання</Label>

            <Select value={taskId} onValueChange={setTaskId}>

              <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>

              <SelectContent>

                {tasks.map(t=> <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}

              </SelectContent>

            </Select>

          </div>

          <div className="grid gap-2">

            <Label>Посилання/файл</Label>

            <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL на файл або репозиторій" />

          </div>

          <div className="grid gap-2">

            <Label>Нотатка</Label>

            <Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Додаткова інформація" />

          </div>

          <div className="grid gap-2">

            <Label>IDEF0 Модель (опціонально)</Label>

            <Select value={idef0ModelId} onValueChange={setIdef0ModelId}>

              <SelectTrigger><SelectValue placeholder="Оберіть збережену модель або завантажте файл" /></SelectTrigger>

              <SelectContent>

                <SelectItem value="">Немає моделі</SelectItem>

                {idef0Models?.map(m=> <SelectItem key={m.id} value={m.id}>{`Модель від ${new Date(m.createdAt).toLocaleDateString()}`}</SelectItem>)}

              </SelectContent>

            </Select>

            <div className="text-xs text-slate-500">Або</div>

            <input type="file" accept=".json" onChange={handleFileUpload} className="text-sm" />

            {idef0File && <Badge variant="outline">Файл завантажено</Badge>}

          </div>

          <Button onClick={()=>{

            if(!studentName || !group || !taskId || !url) return;

            const modelData = idef0ModelId 
              ? idef0Models.find(m => m.id === idef0ModelId)
              : idef0File;

            onSubmit({ 
              studentName, 
              group, 
              taskId, 
              taskTitle: currentTask?.title || "", 
              discipline: currentTask?.discipline || "", 
              url, 
              notes,
              idef0Model: modelData ? JSON.stringify(modelData) : null
            });

            setUrl(""); setNotes(""); setIdef0ModelId(""); setIdef0File(null);

          }} className="w-full">

            <Upload className="w-4 h-4 mr-2"/> Здати роботу

          </Button>

        </CardContent>

      </Card>

      <Card>

        <CardContent className="p-6 grid gap-3 text-sm text-slate-600">

          <div className="font-semibold">Інформація про завдання</div>

          <div>Дисципліна: {currentTask?.discipline}</div>

          <div>Макс. бал: {currentTask?.max}</div>

          <div>Дедлайн: {currentTask?.deadline}</div>

          <div className="text-slate-500">Подання після дедлайну можуть бути позначені як прострочені при оцінюванні.</div>

        </CardContent>

      </Card>

    </div>

  );

}

function FilterBar({ query, setQuery, filters, setFilters, tasks, groups }) {

  const [sheetOpen, setSheetOpen] = useState(false);

  return (

    <div className="flex flex-wrap items-center gap-2 mb-4">

      <div className="relative">

        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />

        <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Пошук" className="pl-9 w-72" />

      </div>

      <Select value={filters.status} onValueChange={v=>setFilters(s=>({...s,status:v}))}>

        <SelectTrigger className="w-40"><SelectValue placeholder="Статус" /></SelectTrigger>

        <SelectContent>

          <SelectItem value="all">Всі статуси</SelectItem>

          <SelectItem value="queued">В черзі</SelectItem>

          <SelectItem value="graded">Зараховано</SelectItem>

          <SelectItem value="revision">На доопрацюванні</SelectItem>

        </SelectContent>

      </Select>

      <Select value={filters.task} onValueChange={v=>setFilters(s=>({...s,task:v}))}>

        <SelectTrigger className="w-52"><SelectValue placeholder="Завдання" /></SelectTrigger>

        <SelectContent>

          <SelectItem value="all">Всі завдання</SelectItem>

          {tasks.map(t=> <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}

        </SelectContent>

      </Select>

      <Select value={filters.group} onValueChange={v=>setFilters(s=>({...s,group:v}))}>

        <SelectTrigger className="w-48"><SelectValue placeholder="Група" /></SelectTrigger>

        <SelectContent>

          <SelectItem value="all">Всі групи</SelectItem>

          {groups.map(g=> <SelectItem key={g} value={g}>{g}</SelectItem>)}

        </SelectContent>

      </Select>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>

        <SheetTrigger asChild>

          <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>Додатково</Button>

        </SheetTrigger>

        <SheetContent>

          <SheetHeader><SheetTitle>Швидкі фільтри</SheetTitle></SheetHeader>

          <div className="mt-4 grid gap-3 text-sm">

            <div className="flex items-center gap-2"><Checkbox id="overdue" /><Label htmlFor="overdue">Показати прострочені</Label></div>

            <div className="flex items-center gap-2"><Checkbox id="nograde" /><Label htmlFor="nograde">Без оцінки</Label></div>

          </div>

        </SheetContent>

      </Sheet>

    </div>

  );

}

function SubmissionList({ items, onReview, onRemove, rubric, tasks }) {

  const [openId, setOpenId] = useState(null);
  const [viewModelId, setViewModelId] = useState(null);

  const current = items.find(i=>i.id===openId) || null;
  const viewModel = items.find(i=>i.id===viewModelId) || null;

  return (

    <div className="grid gap-3">

      {items.map(s => (

        <Card key={s.id} className="rounded-2xl">

          <CardContent className="p-4 flex items-center gap-4 justify-between">

            <div className="flex-1">

              <div className="font-medium">{s.studentName} • {s.group}</div>

              <div className="text-sm text-slate-600">{s.taskTitle} • {s.discipline}</div>

              <div className="text-xs text-slate-500">
                Подано: {new Date(s.createdAt).toLocaleString()} • <a href={s.url} target="_blank" className="underline">Матеріали</a>
                {s.idef0Model && <Badge variant="outline" className="ml-2"><Network className="w-3 h-3 mr-1"/>IDEF0</Badge>}
              </div>

            </div>

            <div className="flex items-center gap-3">

              <Badge variant={statusMap[s.status]?.tone}>{statusMap[s.status]?.label}</Badge>

              {s.grade!=null && <Badge>{s.grade} б.</Badge>}

              {s.idef0Model && (
                <Dialog open={viewModelId===s.id} onOpenChange={(o)=> setViewModelId(o? s.id : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Network className="w-4 h-4 mr-2"/>Переглянути IDEF0</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader><DialogTitle>IDEF0 Модель: {s.studentName}</DialogTitle></DialogHeader>
                    <IDEF0Viewer modelData={s.idef0Model} />
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={openId===s.id} onOpenChange={(o)=> setOpenId(o? s.id : null)}>

                <DialogTrigger asChild>

                  <Button size="sm" variant="secondary">Оцінити</Button>

                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">

                  <DialogHeader><DialogTitle>Оцінювання: {s.studentName}</DialogTitle></DialogHeader>

                  <ReviewForm item={s} rubric={rubric} task={tasks.find(t=>t.id===s.taskId)} onSubmit={(res)=>{ onReview(s.id, res); setOpenId(null); }} />

                </DialogContent>

              </Dialog>

              <Button size="icon" variant="ghost" onClick={()=>onRemove(s.id)}><X className="w-4 h-4"/></Button>

            </div>

          </CardContent>

        </Card>

      ))}

      {!items.length && <div className="text-slate-500 text-sm">Немає записів за вибраними фільтрами.</div>}

    </div>

  );

}

function ReviewForm({ item, rubric, task, onSubmit }) {

  const [scores, setScores] = useState(() => Object.fromEntries(rubric.map(r => [r.id, 0])));

  const [feedback, setFeedback] = useState(item.feedback || "");

  const [status, setStatus] = useState(item.status || "queued");
  const [showModel, setShowModel] = useState(false);

  const max = task?.max || 100;

  const total = Math.round(rubric.reduce((acc, r) => acc + (Number(scores[r.id]||0) * r.weight * max), 0));

  const late = useMemo(() => {

    if (!task?.deadline) return false;

    const d = new Date(task.deadline + "T23:59:59");

    return new Date(item.createdAt) > d;

  }, [task, item.createdAt]);

  return (

    <div className="grid gap-4">

      <div className="grid gap-3">

        {rubric.map(r => (

          <div key={r.id} className="grid grid-cols-2 md:grid-cols-6 items-center gap-3">

            <div className="md:col-span-3 font-medium">{r.title}</div>

            <div className="md:col-span-2 text-sm text-slate-500">Вага {Math.round(r.weight*100)}%</div>

            <Input type="number" value={scores[r.id]} onChange={e=>setScores(s=>({...s, [r.id]: Number(e.target.value)}))} />

          </div>

        ))}

      </div>

      <div className="flex items-center gap-2 text-sm">

        <Badge variant={late?"destructive":"secondary"}>{late?"Після дедлайну":"Вчасно"}</Badge>

        <Badge>Сума: {total} б.</Badge>

      </div>

      <div className="grid gap-2">

        <Label>Фідбек</Label>

        <Textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Коротко по зауваженнях" />

      </div>

      <div className="grid gap-2">

        <Label>Статус</Label>

        <Select value={status} onValueChange={setStatus}>

          <SelectTrigger><SelectValue /></SelectTrigger>

          <SelectContent>

            <SelectItem value="graded">Зараховано</SelectItem>

            <SelectItem value="revision">На доопрацювання</SelectItem>

            <SelectItem value="queued">В черзі</SelectItem>

          </SelectContent>

        </Select>

      </div>

      {item.idef0Model && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>IDEF0 Модель</Label>
            <Button variant="outline" size="sm" onClick={() => setShowModel(!showModel)}>
              {showModel ? "Приховати" : "Показати"} модель
            </Button>
          </div>
          {showModel && (
            <div className="border rounded-lg p-2">
              <IDEF0Viewer modelData={item.idef0Model} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">

        <a href={item.url} target="_blank" className="underline text-sm">Відкрити матеріали</a>

        <Button onClick={()=> onSubmit({ grade: total, feedback, status })}>Зберегти оцінку</Button>

      </div>

    </div>

  );

}

function Reports({ submissions, tasks }) {

  const byStudent = useMemo(() => {

    const m = {};

    submissions.forEach(s => {

      const key = s.studentName + "|" + s.group;

      if (!m[key]) m[key] = { studentName: s.studentName, group: s.group, total: 0, graded: 0, sum: 0 };

      m[key].total++;

      if (s.status === "graded") { m[key].graded++; m[key].sum += s.grade || 0; }

    });

    return Object.values(m).sort((a,b)=> b.sum - a.sum);

  }, [submissions]);

  const byTask = useMemo(() => {

    const meta = Object.fromEntries(tasks.map(t=>[t.id,t]));

    const m = {};

    submissions.forEach(s => {

      if (!m[s.taskId]) m[s.taskId] = { taskTitle: s.taskTitle, discipline: s.discipline, cnt:0, graded:0, avg:0 };

      const r = m[s.taskId];

      r.cnt++;

      if (s.status === "graded") { r.graded++; r.avg += s.grade || 0; }

    });

    return Object.entries(m).map(([id,v])=> ({ id, ...v, avg: v.graded? Math.round(v.avg/v.graded):0, max: meta[id]?.max || 100 })).sort((a,b)=> a.taskTitle.localeCompare(b.taskTitle));

  }, [submissions, tasks]);

  return (

    <div className="grid md:grid-cols-2 gap-6">

      <Card>

        <CardContent className="p-6">

          <div className="font-semibold mb-3">Рейтинг студентів</div>

          <div className="grid gap-2">

            {byStudent.map((r,idx)=> (

              <div key={idx} className="flex items-center justify-between border rounded-xl p-3">

                <div>

                  <div className="font-medium">{r.studentName}</div>

                  <div className="text-xs text-slate-500">{r.group} • Зараховано: {r.graded}/{r.total}</div>

                </div>

                <Badge>{r.sum} б.</Badge>

              </div>

            ))}

            {!byStudent.length && <div className="text-sm text-slate-500">Немає даних.</div>}

          </div>

        </CardContent>

      </Card>

      <Card>

        <CardContent className="p-6">

          <div className="font-semibold mb-3">Зріз по завданнях</div>

          <div className="grid gap-2">

            {byTask.map(r=> (

              <div key={r.id} className="flex items-center justify-between border rounded-xl p-3">

                <div>

                  <div className="font-medium">{r.taskTitle}</div>

                  <div className="text-xs text-slate-500">{r.discipline} • Подань: {r.cnt}, Зараховано: {r.graded}</div>

                </div>

                <Badge>{r.avg}/{r.max} середнє</Badge>

              </div>

            ))}

            {!byTask.length && <div className="text-sm text-slate-500">Немає даних.</div>}

          </div>

        </CardContent>

      </Card>

    </div>

  );

}

function AdminStudents({ students, setStudents }) {

  const [name, setName] = useState("");

  const [group, setGroup] = useState("ФІТ-1-2м");

  return (

    <Card>

      <CardContent className="p-6 grid gap-4">

        <div className="flex items-center justify-between"><div className="font-semibold">Студенти</div></div>

        <div className="grid md:grid-cols-3 gap-3 items-end">

          <div className="grid gap-2"><Label>ПІБ</Label><Input value={name} onChange={e=>setName(e.target.value)} /></div>

          <div className="grid gap-2"><Label>Група</Label><Input value={group} onChange={e=>setGroup(e.target.value)} /></div>

          <Button onClick={()=>{ if(!name) return; setStudents(prev=>[{ id: uid(), name, group }, ...prev]); setName(""); }}>Додати</Button>

        </div>

        <div className="grid md:grid-cols-2 gap-2">

          {students.map(s=> (

            <div key={s.id} className="border rounded-xl p-3 flex items-center justify-between">

              <div>

                <div className="font-medium">{s.name}</div>

                <div className="text-xs text-slate-500">{s.group}</div>

              </div>

              <Button variant="ghost" size="icon" onClick={()=> setStudents(prev=> prev.filter(x=>x.id!==s.id))}><X className="w-4 h-4"/></Button>

            </div>

          ))}

        </div>

      </CardContent>

    </Card>

  );

}

function AdminTasks({ tasks, setTasks }) {

  const [title, setTitle] = useState("");

  const [discipline, setDiscipline] = useState("Інф. системи");

  const [max, setMax] = useState(100);

  const [deadline, setDeadline] = useState(todayDateInput());

  return (

    <Card>

      <CardContent className="p-6 grid gap-4">

        <div className="font-semibold">Завдання</div>

        <div className="grid md:grid-cols-4 gap-3 items-end">

          <div className="grid gap-2"><Label>Назва</Label><Input value={title} onChange={e=>setTitle(e.target.value)} /></div>

          <div className="grid gap-2"><Label>Дисципліна</Label><Input value={discipline} onChange={e=>setDiscipline(e.target.value)} /></div>

          <div className="grid gap-2"><Label>Макс. бал</Label><Input type="number" value={max} onChange={e=>setMax(Number(e.target.value))} /></div>

          <div className="grid gap-2"><Label>Дедлайн</Label><Input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} /></div>

        </div>

        <div className="flex items-center gap-2">

          <Button onClick={()=>{ if(!title) return; setTasks(prev=>[{ id: uid(), title, discipline, max, deadline }, ...prev]); setTitle(""); }}>Додати завдання</Button>

        </div>

        <div className="grid md:grid-cols-2 gap-2">

          {tasks.map(t=> (

            <div key={t.id} className="border rounded-xl p-3 flex items-center justify-between">

              <div>

                <div className="font-medium">{t.title}</div>

                <div className="text-xs text-slate-500">{t.discipline} • Макс: {t.max} • Дедлайн: {t.deadline}</div>

              </div>

              <Button variant="ghost" size="icon" onClick={()=> setTasks(prev=> prev.filter(x=>x.id!==t.id))}><X className="w-4 h-4"/></Button>

            </div>

          ))}

        </div>

      </CardContent>

    </Card>

  );

}

function AdminRubric({ rubric, setRubric }) {

  const [title, setTitle] = useState("");

  const [weight, setWeight] = useState(0.1);

  const totalWeight = rubric.reduce((a,b)=>a + Number(b.weight), 0);

  return (

    <Card>

      <CardContent className="p-6 grid gap-4">

        <div className="font-semibold">Критерії оцінювання</div>

        <div className="text-sm text-slate-500">Сума ваг: {Math.round(totalWeight*100)}%</div>

        <div className="grid md:grid-cols-3 gap-3 items-end">

          <div className="grid gap-2"><Label>Назва критерію</Label><Input value={title} onChange={e=>setTitle(e.target.value)} /></div>

          <div className="grid gap-2"><Label>Вага (0..1)</Label><Input type="number" step="0.05" value={weight} onChange={e=>setWeight(Number(e.target.value))} /></div>

          <Button onClick={()=>{ if(!title) return; setRubric(prev=>[...prev, { id: uid(), title, weight }]); setTitle(""); }}>Додати критерій</Button>

        </div>

        <div className="grid gap-2">

          {rubric.map(r=> (

            <div key={r.id} className="border rounded-xl p-3 flex items-center justify-between">

              <div>

                <div className="font-medium">{r.title}</div>

                <div className="text-xs text-slate-500">Вага: {Math.round(r.weight*100)}%</div>

              </div>

              <Button variant="ghost" size="icon" onClick={()=> setRubric(prev=> prev.filter(x=>x.id!==r.id))}><X className="w-4 h-4"/></Button>

            </div>

          ))}

        </div>

      </CardContent>

    </Card>

  );

}

function ExportCSV({ submissions }) {

  function toCSV() {

    const columns = ["createdAt","studentName","group","discipline","taskTitle","status","grade","url","notes","feedback"]; 

    const rows = submissions.map(s => columns.map(c => JSON.stringify(s[c] ?? ""))); 

    const csv = [columns.join(","), ...rows.map(r=> r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `submissions_${new Date().toISOString().slice(0,10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }

  return <Button variant="outline" onClick={toCSV}><Download className="w-4 h-4 mr-2"/>Експорт CSV</Button>;

}

function NotificationCenter({ notifications, setNotifications }) {

  const [open, setOpen] = useState(false);

  return (

    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>

        <Button variant="outline"><Bell className="w-4 h-4 mr-2"/>Нагадування ({notifications.length})</Button>

      </DialogTrigger>

      <DialogContent className="max-w-xl">

        <DialogHeader><DialogTitle>Оповіщення</DialogTitle></DialogHeader>

        <div className="grid gap-2 max-h-[60vh] overflow-auto">

          {notifications.map(n => (

            <div key={n.id} className="border rounded-xl p-3">

              <div className="text-xs text-slate-500">{new Date(n.time).toLocaleString()}</div>

              <div className="font-medium">{n.title}</div>

              <div className="text-sm text-slate-600">{n.message}</div>

            </div>

          ))}

          {!notifications.length && <div className="text-sm text-slate-500">Немає нових оповіщень.</div>}

        </div>

        {notifications.length>0 && <Button variant="secondary" onClick={()=> setNotifications([])}>Очистити</Button>}

      </DialogContent>

    </Dialog>

  );

}

