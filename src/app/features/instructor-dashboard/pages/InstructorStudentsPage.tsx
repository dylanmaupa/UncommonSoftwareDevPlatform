import { useState, useMemo } from 'react';
import {
  LuSearch,
  LuFilter,
  LuDownload,
  LuUsers,
} from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorStudentsPage() {
  const { allStudents, allHubs } = useInstructorData();
  const [searchQuery, setSearchQuery] = useState('');
  const [hubFilter, setHubFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHub = hubFilter === 'all' || student.hubId === hubFilter;
      const matchesRisk = riskFilter === 'all' || student.riskLevel === riskFilter;
      return matchesSearch && matchesHub && matchesRisk;
    });
  }, [allStudents, searchQuery, hubFilter, riskFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground heading-font">Global Student Directory</h1>
          <p className="text-muted-foreground">Manage and monitor student progress across the entire platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-border bg-sidebar h-10 px-4">
            <LuDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-none bg-sidebar/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 rounded-xl border-border bg-card h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <LuFilter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[140px]"
                  value={hubFilter}
                  onChange={(e) => setHubFilter(e.target.value)}
                >
                  <option value="all">All Hubs</option>
                  {allHubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>{hub.name}</option>
                  ))}
                </select>
              </div>
              <select
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[140px]"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">Every Risk Level</option>
                <option value="on-track">On Track</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="at-risk">At Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const progress = Math.round((student.progress.completedLessons / student.progress.totalLessons) * 100);
            const hub = allHubs.find(h => h.id === student.hubId);
            return (
              <Card key={student.id} className="group overflow-hidden rounded-2xl border-none bg-sidebar/30 hover:bg-sidebar/50 transition-all">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/10 transition-transform group-hover:scale-105">
                        <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">{student.fullName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{student.fullName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                    <Badge className={`border-none text-[10px] sm:text-xs ${student.riskLevel === 'on-track' ? 'bg-emerald-500/10 text-emerald-500' :
                        student.riskLevel === 'needs-attention' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                      }`}>
                      {student.riskLevel.replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px] sm:text-xs text-muted-foreground bg-card/50 rounded-xl p-3">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 font-medium text-foreground/70 uppercase tracking-tight">
                        <LuUsers className="h-3 w-3" /> Hub Information
                      </p>
                      <p className="font-semibold text-foreground truncate">{hub?.name || 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 font-medium text-foreground/70 uppercase tracking-tight">
                        XP Earnings
                      </p>
                      <p className="font-bold text-primary">{student.progress.xp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Course Completion</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress > 80 ? 'bg-emerald-500' :
                            progress > 50 ? 'bg-blue-500' :
                              'bg-primary'
                          }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <LuUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium text-lg">No students found matching your criteria</p>
            <Button variant="link" onClick={() => { setSearchQuery(''); setHubFilter('all'); setRiskFilter('all'); }}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
