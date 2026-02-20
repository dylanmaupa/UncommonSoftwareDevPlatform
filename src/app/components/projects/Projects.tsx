import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { projectsData, progressService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { LuArrowRight, LuCheckCircle2, LuRocket, LuZap } from 'react-icons/lu';

export default function Projects() {
  const getProjectImage = (title: string) => {
    const normalized = title.toLowerCase();
    if (normalized.includes('portfolio')) {
      return 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('dashboard')) {
      return 'https://images.unsplash.com/photo-1551281044-8b4f3f3a31d2?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('api') || normalized.includes('backend')) {
      return 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&q=80';
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80';
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            Projects
          </h1>
          <p className="text-[#6B7280]">
            Apply your skills by building real-world projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsData.map((project) => {
            const isCompleted = progressService.isProjectCompleted(project.id);

            const difficultyColor = {
              Beginner: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
              Intermediate: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
              Advanced: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
            }[project.difficulty];

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full rounded-2xl border-[rgba(0,0,0,0.08)] hover:border-[#0747a1] hover:shadow-md transition-all group">
                  <CardContent className="space-y-3 p-3">
                    <div className="relative">
                      <img
                        src={getProjectImage(project.title)}
                        alt={project.title}
                        className="h-32 w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                      {isCompleted && (
                        <Badge className="absolute right-2 top-2 bg-[#10B981] text-white">
                          <LuCheckCircle2 className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-2 text-base text-[#1a1a2e]">{project.title}</p>
                        <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{project.description}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
                        <LuRocket className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 2).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-[#0747a1]/20 text-[#0747a1] bg-[#0747a1]/5"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs border-[#6B7280]/20 text-[#6B7280]">
                          +{project.skills.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${difficultyColor} border`}>{project.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-xs text-[#0747a1]">
                          <LuZap className="w-4 h-4" />
                          <span className="font-semibold">+{project.xpReward}</span>
                        </div>
                      </div>
                      <LuArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#0747a1] group-hover:translate-x-1 transition-all" />
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
