import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import DashboardLayout from '../layout/DashboardLayout';
import { projectsData, progressService } from '../../services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  LuArrowLeft,
  LuCircleCheck,
  LuExternalLink,
  LuGithub,
  LuRocket,
  LuUpload,
  LuZap,
} from 'react-icons/lu';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = projectsData.find(p => p.id === projectId);
  const isCompleted = project ? progressService.isProjectCompleted(project.id) : false;

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-[#6B7280]">Project not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const difficultyColor = {
    Beginner: 'bg-[#10B981] text-white',
    Intermediate: 'bg-[#F59E0B] text-white',
    Advanced: 'bg-[#EF4444] text-white',
  }[project.difficulty];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!githubUrl) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      progressService.completeProject(project.id, project.xpReward);
      toast.success(
        <div>
          <p className="font-semibold">Project Submitted!</p>
          <p className="text-sm">+{project.xpReward} XP earned</p>
        </div>
      );
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-6 -ml-4">
          <LuArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <LuRocket className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl heading-font">{project.title}</h1>
                {isCompleted && (
                  <Badge className="bg-[#10B981] text-white">
                    <LuCircleCheck className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-white/90 text-lg mb-4">{project.description}</p>
              <div className="flex items-center gap-4">
                <Badge className={difficultyColor}>{project.difficulty}</Badge>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                  <LuZap className="w-4 h-4" />
                  <span className="font-semibold">+{project.xpReward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="heading-font">Project Brief</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0747a1] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-[#1a1a2e] flex-1 pt-0.5">{instruction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="heading-font">Submit Your Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">GitHub Repository URL</Label>
                    <div className="relative">
                      <LuGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <Input
                        id="github-url"
                        type="url"
                        placeholder="https://github.com/username/project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        required
                        disabled={isCompleted}
                        className="pl-10 h-12 rounded-xl bg-[#F5F5FA] border-0"
                      />
                    </div>
                    <p className="text-sm text-[#6B7280]">Share your project repository so others can learn from it</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isCompleted}
                    className="w-full h-12 rounded-xl"
                    style={{ backgroundColor: '#0747a1' }}
                  >
                    {isCompleted ? (
                      <>
                        <LuCircleCheck className="w-4 h-4 mr-2" />
                        Project Completed
                      </>
                    ) : (
                      <>
                        <LuUpload className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Project'}
                      </>
                    )}
                  </Button>
                </form>

                {isCompleted && githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-3 text-sm text-[#0747a1] hover:underline"
                  >
                    View your submission
                    <LuExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[rgba(0,0,0,0.08)]">
              <CardHeader>
                <CardTitle className="heading-font text-lg">Skills You'll Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} className="bg-[#0747a1]/10 text-[#0747a1] border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#0747a1]/5 to-[#8B5CF6]/5">
              <CardHeader>
                <CardTitle className="heading-font text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#6B7280]">
                <p>Break the project into smaller tasks</p>
                <p>Test your code frequently</p>
                <p>Write clean, readable code</p>
                <p>Add comments to explain your logic</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
