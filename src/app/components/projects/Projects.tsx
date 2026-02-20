import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { projectsData, progressService } from '../../services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Rocket, Zap, ArrowRight } from 'lucide-react';

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            Projects
          </h1>
          <p className="text-[#6B7280]">
            Apply your skills by building real-world projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsData.map((project) => {
            const isCompleted = progressService.isProjectCompleted(project.id);
            
            const difficultyColor = {
              Beginner: 'bg-[#10B981] text-white',
              Intermediate: 'bg-[#F59E0B] text-white',
              Advanced: 'bg-[#EF4444] text-white',
            }[project.difficulty];

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full rounded-2xl border-[rgba(0,0,0,0.08)] hover:border-[#0747a1] hover:shadow-md transition-all group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      {isCompleted && (
                        <Badge className="bg-[#10B981] text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="heading-font group-hover:text-[#0747a1] transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-[#0747a1]/20 text-[#0747a1] bg-[#0747a1]/5"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={difficultyColor}>
                          {project.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-[#0747a1]">
                          <Zap className="w-4 h-4" />
                          <span className="font-semibold">+{project.xpReward}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0747a1] group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
