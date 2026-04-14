import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import {
  LuMegaphone,
  LuPlus,
  LuSend,
  LuClock,
  LuPin,
  LuTrash2,
  LuEye,
  LuUser,
  LuUsers,
  LuBell,
} from 'react-icons/lu';

interface Announcement {
  id: string;
  instructor_id: string;
  hub_location: string;
  student_id: string | null;
  student_name?: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructorHub, setInstructorHub] = useState('');
  const [instructorName, setInstructorName] = useState('Instructor');
  const [instructorId, setInstructorId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'all' | 'specific'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // ── Load instructor profile + students + announcements ──────────────────
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setInstructorId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('hub_location, full_name')
        .eq('id', user.id)
        .single();

      const hub = profile?.hub_location || '';
      setInstructorHub(hub);
      setInstructorName(profile?.full_name || 'Instructor');

      if (!hub) {
        toast.error('Your account has no hub set. Please update your profile.');
        return;
      }

      // Students in the same hub (for "Specific Student" dropdown)
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .eq('hub_location', hub)
        .order('full_name');

      setStudents(studentsData || []);

      // Build student name map for display
      const nameMap = new Map<string, string>();
      (studentsData || []).forEach((s: any) => nameMap.set(s.id, s.full_name || s.email));

      // Fetch this instructor's announcements
      const { data: anns, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('instructor_id', user.id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(
        (anns || []).map((a: any) => ({
          ...a,
          student_name: a.student_id ? (nameMap.get(a.student_id) || 'Unknown Student') : null,
        }))
      );
    } catch (err) {
      console.error('Failed to load announcements:', err);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Post announcement ───────────────────────────────────────────────────
  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    if (audience === 'specific' && !selectedStudentId) {
      toast.error('Please select a student.');
      return;
    }

    setIsSending(true);
    try {
      const payload: any = {
        instructor_id: instructorId,
        hub_location: instructorHub,
        title: title.trim(),
        content: content.trim(),
        pinned: false,
        student_id: audience === 'specific' ? selectedStudentId : null,
      };

      const { data, error } = await supabase
        .from('announcements')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const studentName = audience === 'specific'
        ? students.find(s => s.id === selectedStudentId)?.full_name || 'Student'
        : null;

      setAnnouncements(prev => [{
        ...data,
        student_name: studentName,
      }, ...prev]);

      toast.success('Announcement posted!');
      setTitle('');
      setContent('');
      setAudience('all');
      setSelectedStudentId('');
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to post announcement:', err);
      toast.error(err.message || 'Failed to post announcement');
    } finally {
      setIsSending(false);
    }
  };

  // ── Pin / Unpin ─────────────────────────────────────────────────────────
  const handleTogglePin = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ pinned: !current })
      .eq('id', id);

    if (error) { toast.error('Failed to update pin'); return; }

    setAnnouncements(prev =>
      [...prev.map(a => a.id === id ? { ...a, pinned: !current } : a)]
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
    );
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) { toast.error('Failed to delete announcement'); return; }
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const pinnedCount = announcements.filter(a => a.pinned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-1">Send updates to your whole hub or to individual students</p>
        </div>
        <Button
          className="rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <><LuEye className="mr-2 h-4 w-4" />Cancel</>
          ) : (
            <><LuPlus className="mr-2 h-4 w-4" />New Announcement</>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{announcements.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <LuMegaphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider">Pinned</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{pinnedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <LuPin className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-600/70 uppercase tracking-wider">Students</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <LuUsers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="rounded-2xl border-blue-200/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">New Announcement</CardTitle>
            <CardDescription>Post to your whole hub or target a specific student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audience toggle */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Send to</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAudience('all'); setSelectedStudentId(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    audience === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <LuUsers className="h-4 w-4" /> All Students
                </button>
                <button
                  type="button"
                  onClick={() => setAudience('specific')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    audience === 'specific'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <LuUser className="h-4 w-4" /> Specific Student
                </button>
              </div>
            </div>

            {/* Student selector */}
            {audience === 'specific' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Select Student</label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder={students.length === 0 ? 'No students in hub' : 'Choose a student…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
              <Input
                placeholder="Announcement title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Message</label>
              <Textarea
                placeholder="Write your announcement here…"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="min-h-[120px] rounded-xl border-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={handlePost}
                disabled={isSending || !title.trim() || !content.trim() || (audience === 'specific' && !selectedStudentId)}
              >
                <LuSend className="mr-2 h-4 w-4" />
                {isSending ? 'Posting…' : 'Post Announcement'}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-slate-200"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
          Loading…
        </div>
      ) : announcements.length === 0 ? (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-12 text-center">
            <LuBell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">No announcements yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card
              key={ann.id}
              className={`rounded-2xl ${ann.pinned ? 'ring-2 ring-blue-200' : ''}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                      {instructorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Row: badges + actions */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ann.pinned && (
                          <Badge className="bg-blue-100 text-blue-700 rounded-full text-[10px]">
                            <LuPin className="h-3 w-3 mr-1" /> Pinned
                          </Badge>
                        )}
                        {ann.student_id ? (
                          <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">
                            <LuUser className="h-3 w-3 mr-1" /> {ann.student_name}
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 rounded-full text-xs">
                            <LuUsers className="h-3 w-3 mr-1" /> All Students
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <LuClock className="h-3 w-3" /> {formatDate(ann.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${ann.pinned ? 'text-blue-600 bg-blue-50' : ''}`}
                          onClick={() => handleTogglePin(ann.id, ann.pinned)}
                          title={ann.pinned ? 'Unpin' : 'Pin'}
                        >
                          <LuPin className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600"
                          onClick={() => handleDelete(ann.id)}
                          title="Delete"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 mt-2">{ann.title}</h3>
                    <p className="text-slate-600 mt-2 leading-relaxed text-sm">{ann.content}</p>

                    <p className="text-xs text-slate-400 mt-3">By {instructorName} · {instructorHub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
