import { useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { authService } from '../../services/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { LuCircleAlert, LuKey, LuSave, LuTrash2, LuUser } from 'react-icons/lu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export default function Settings() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    toast.success('Password changed successfully');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    authService.deleteAccount();
    toast.success('Account deleted successfully');
    navigate('/');
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            Settings
          </h1>
          <p className="text-[#6B7280]">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LuUser className="w-5 h-5 text-[#0747a1]" />
                <CardTitle className="heading-font">Account Information</CardTitle>
              </div>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="bg-[#F5F5FA] border-0" />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input value={user.nickname} disabled className="bg-[#F5F5FA] border-0" />
                  <p className="text-xs text-[#6B7280]">Edit your nickname from your profile page</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input
                    value={new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    disabled
                    className="bg-[#F5F5FA] border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account ID</Label>
                  <Input value={user.id} disabled className="bg-[#F5F5FA] border-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LuKey className="w-5 h-5 text-[#0747a1]" />
                <CardTitle className="heading-font">Change Password</CardTitle>
              </div>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Current Password</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl bg-[#F5F5FA] border-0"
                  />
                </div>

                <Button type="submit" className="rounded-xl" style={{ backgroundColor: '#0747a1' }}>
                  <LuSave className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#EF4444] bg-[#EF4444]/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LuCircleAlert className="w-5 h-5 text-[#EF4444]" />
                <CardTitle className="heading-font text-[#EF4444]">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-[#1a1a2e] mb-1">Delete Account</h4>
                  <p className="text-sm text-[#6B7280]">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-shrink-0 bg-[#EF4444] hover:bg-[#DC2626]">
                      <LuTrash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Your progress in all courses</li>
                          <li>All completed lessons and projects</li>
                          <li>Your achievements and XP</li>
                          <li>Your profile information</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-[#EF4444] hover:bg-[#DC2626]">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#0747a1]/5 to-[#8B5CF6]/5">
            <CardContent className="p-6">
              <h4 className="font-semibold heading-font text-[#1a1a2e] mb-2">About This Platform</h4>
              <p className="text-sm text-[#6B7280] mb-3">
                A free, open-access coding education platform. All courses and features are completely free with no premium tiers or paywalls.
              </p>
              <p className="text-xs text-[#6B7280]">Version 1.0.0 - Made for learners everywhere</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
