import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../../lib/supabase';
import {
  LuMegaphone,
  LuPin,
  LuClock,
  LuUser,
  LuUsers,
  LuBell,
} from 'react-icons/lu';

interface Announcement {
  id: string;
  instructor_id: string;
  hub_location: string;
  student_id: string | null;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  instructor_name?: string;
}

export default function StudentAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      // Fetch announcements visible to this student:
      // - hub-wide (student_id is null and hub_location matches)
      // - directly addressed (student_id = user.id)
      // RLS on the table handles the filtering server-side.
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Resolve instructor names
      const instructorIds = [...new Set((data || []).map((a: any) => a.instructor_id as string))];
      const nameMap = new Map<string, string>();

      if (instructorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', instructorIds);

        (profiles || []).forEach((p: any) => {
          nameMap.set(p.id, p.full_name || p.email || 'Instructor');
        });
      }

      setAnnouncements(
        (data || []).map((a: any) => ({
          ...a,
          instructor_name: nameMap.get(a.instructor_id) || 'Instructor',
        }))
      );
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

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

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
            <LuMegaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 heading-font lowercase">Announcements</h1>
            <p className="text-sm text-slate-500">Messages from your instructors</p>
          </div>
          {!isLoading && (
            <Badge variant="outline" className="ml-auto text-xs">
              {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
            Loading announcements…
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <LuBell className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No announcements yet</p>
              <p className="text-slate-400 text-sm mt-1">Your instructor hasn't posted anything yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <Card
                key={ann.id}
                className={`rounded-2xl ${ann.pinned ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {ann.pinned && (
                      <Badge className="bg-blue-100 text-blue-700 rounded-full text-[10px]">
                        <LuPin className="h-3 w-3 mr-1" /> Pinned
                      </Badge>
                    )}
                    {ann.student_id ? (
                      <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">
                        <LuUser className="h-3 w-3 mr-1" /> Just for you
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 rounded-full text-xs">
                        <LuUsers className="h-3 w-3 mr-1" /> Hub announcement
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                      <LuClock className="h-3 w-3" /> {formatDate(ann.created_at)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-base">{ann.title}</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed text-sm">{ann.content}</p>
                  <p className="text-xs text-slate-400 mt-3">From {ann.instructor_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
