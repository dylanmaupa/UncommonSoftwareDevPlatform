import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { 
  LuMegaphone, 
  LuPlus,
  LuSend,
  LuClock,
  LuUsers,
  LuPin,
  LuTrash2,
  LuPencil,
  LuEye,
  LuMessageSquare,
  LuBell
} from 'react-icons/lu';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned: boolean;
  views: number;
  comments: number;
  audience: 'all' | 'cohort' | 'specific';
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New React Advanced Module Released',
    content: 'The long-awaited React Advanced module is now live! This module covers hooks, context API, performance optimization, and testing. Complete all exercises to earn the React Master badge.',
    author: 'Instructor Team',
    createdAt: '2 hours ago',
    pinned: true,
    views: 89,
    comments: 12,
    audience: 'all'
  },
  {
    id: '2',
    title: 'Deadline Extension: JavaScript Basics Quiz',
    content: 'Due to popular demand, we have extended the deadline for the JavaScript Basics Quiz to Friday, March 15th. Use this extra time to review the materials and practice.',
    author: 'Sarah Mitchell',
    createdAt: '5 hours ago',
    pinned: false,
    views: 45,
    comments: 3,
    audience: 'cohort'
  },
  {
    id: '3',
    title: 'Office Hours This Week',
    content: 'Join us for office hours on Thursday from 2-4 PM. We will be discussing common challenges with the API Integration exercise and answering your questions.',
    author: 'Instructor Team',
    createdAt: '1 day ago',
    pinned: false,
    views: 67,
    comments: 8,
    audience: 'all'
  },
  {
    id: '4',
    title: 'Congratulations to Top Performers!',
    content: 'Congratulations to Jessica Wang, Robert Taylor, and Lisa Anderson for completing all exercises in the React Fundamentals module with perfect scores! Keep up the excellent work.',
    author: 'Instructor Team',
    createdAt: '2 days ago',
    pinned: true,
    views: 156,
    comments: 24,
    audience: 'all'
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState<'all' | 'cohort' | 'specific'>('all');

  const handleCreateAnnouncement = () => {
    if (newTitle.trim() && newContent.trim()) {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: newTitle,
        content: newContent,
        author: 'Instructor',
        createdAt: 'Just now',
        pinned: false,
        views: 0,
        comments: 0,
        audience: newAudience
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setNewTitle('');
      setNewContent('');
      setShowCreateForm(false);
    }
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, pinned: !a.pinned } : a
    ));
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'all':
        return <Badge className="bg-blue-100 text-blue-700 rounded-full text-xs">All Students</Badge>;
      case 'cohort':
        return <Badge className="bg-emerald-100 text-emerald-700 rounded-full text-xs">My Cohort</Badge>;
      case 'specific':
        return <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">Specific Students</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full text-xs">{audience}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-1">Communicate with your students and share updates</p>
        </div>
        <Button 
          className="rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            <>
              <LuEye className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <LuPlus className="mr-2 h-4 w-4" />
              New Announcement
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Total Announcements</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{announcements.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuMegaphone className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider">Pinned</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{announcements.filter(a => a.pinned).length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <LuPin className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600/70 uppercase tracking-wider">Total Views</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {announcements.reduce((acc, a) => acc + a.views, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <LuEye className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Announcement Form */}
      {showCreateForm && (
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Create New Announcement</CardTitle>
            <CardDescription>Share important updates with your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
              <Input 
                placeholder="Enter announcement title..."
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Message</label>
              <Textarea 
                placeholder="Write your announcement here..."
                value={newContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                className="min-h-[120px] rounded-xl border-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Audience</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewAudience('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    newAudience === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setNewAudience('cohort')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    newAudience === 'cohort' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  My Cohort
                </button>
                <button
                  onClick={() => setNewAudience('specific')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    newAudience === 'specific' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Specific Students
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateAnnouncement}
                disabled={!newTitle.trim() || !newContent.trim()}
              >
                <LuSend className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full border-slate-200"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`rounded-2xl border-blue-200/60 bg-white ${announcement.pinned ? 'ring-2 ring-blue-100' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {announcement.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {announcement.pinned && (
                          <Badge className="bg-blue-100 text-blue-700 rounded-full">
                            <LuPin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {getAudienceBadge(announcement.audience)}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <LuClock className="h-3 w-3" />
                          {announcement.createdAt}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mt-2">{announcement.title}</h3>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-full ${announcement.pinned ? 'text-blue-600 bg-blue-50' : ''}`}
                        onClick={() => handleTogglePin(announcement.id)}
                      >
                        <LuPin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <LuPencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <LuTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-slate-600 mt-3">{announcement.content}</p>

                  {/* Footer Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <LuEye className="h-4 w-4" />
                      {announcement.views} views
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <LuMessageSquare className="h-4 w-4" />
                      {announcement.comments} comments
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500 ml-auto">
                      <LuUsers className="h-4 w-4" />
                      By {announcement.author}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedAnnouncements.length === 0 && (
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardContent className="p-12 text-center">
            <LuMegaphone className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No announcements yet. Create your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
