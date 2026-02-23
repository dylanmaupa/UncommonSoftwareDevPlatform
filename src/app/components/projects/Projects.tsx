import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { projectsData, progressService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { LuArrowRight, LuCircleCheck, LuRocket, LuZap } from 'react-icons/lu';

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
          <h1 className="text-3xl lg:text-4xl heading-font mb-2 text-foreground">
            Projects
          </h1>
          <p className="text-muted-foreground">
            Apply your skills by building real-world projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsData.map((project) => {
            const isCompleted = progressService.isProjectCompleted(project.id);

            const difficultyColor = {
              Beginner: 'bg-success/10 text-success border-success/20',
              Intermediate: 'bg-accent/10 text-accent border-accent/20',
              Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
            }[project.difficulty];

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full rounded-2xl border-border hover:border-primary hover:shadow-md transition-all group">
                  <CardContent className="space-y-3 p-3">
                    <div className="relative">
                      <img
                        src={getProjectImage(project.title)}
                        alt={project.title}
                        className="h-32 w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                      {isCompleted && (
                        <Badge className="absolute right-2 top-2 bg-success text-success-foreground">
                          <LuCircleCheck className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-2 text-base text-foreground">{project.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                        <LuRocket className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 2).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-primary/20 text-primary bg-primary/5"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs border-muted-foreground/20 text-muted-foreground">
                          +{project.skills.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${difficultyColor} border`}>{project.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <LuZap className="w-4 h-4" />
                          <span className="font-semibold">+{project.xpReward}</span>
                        </div>
                      </div>
                      <LuArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
