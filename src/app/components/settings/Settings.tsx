import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import DashboardLayout from '../layout/DashboardLayout';
import { fetchProfileForAuthUser, updateProfileForAuthUser } from '../../lib/profileAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
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
import {
  LuBell,
  LuCircleAlert,
  LuKey,
  LuLogOut,
  LuSave,
  LuShield,
  LuUser,
  LuWandSparkles,
} from 'react-icons/lu';

type PreferenceSettings = {
  emailLessonReminders: boolean;
  emailAchievementUpdates: boolean;
  streakReminders: boolean;
  weeklyDigest: boolean;
  publicProfile: boolean;
  showLearningActivity: boolean;
  compactLessonLayout: boolean;
  autoRunCode: boolean;
};

const PREFERENCES_KEY = 'platform_settings';

const DEFAULT_PREFERENCES: PreferenceSettings = {
  emailLessonReminders: true,
  emailAchievementUpdates: true,
  streakReminders: true,
  weeklyDigest: false,
  publicProfile: true,
  showLearningActivity: true,
  compactLessonLayout: false,
  autoRunCode: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const readBoolean = (value: unknown, fallback: boolean) => {
  return typeof value === 'boolean' ? value : fallback;
};

const parsePreferences = (value: unknown): PreferenceSettings => {
  const raw = isRecord(value) ? value : {};

  return {
    emailLessonReminders: readBoolean(raw.emailLessonReminders, DEFAULT_PREFERENCES.emailLessonReminders),
    emailAchievementUpdates: readBoolean(raw.emailAchievementUpdates, DEFAULT_PREFERENCES.emailAchievementUpdates),
    streakReminders: readBoolean(raw.streakReminders, DEFAULT_PREFERENCES.streakReminders),
    weeklyDigest: readBoolean(raw.weeklyDigest, DEFAULT_PREFERENCES.weeklyDigest),
    publicProfile: readBoolean(raw.publicProfile, DEFAULT_PREFERENCES.publicProfile),
    showLearningActivity: readBoolean(raw.showLearningActivity, DEFAULT_PREFERENCES.showLearningActivity),
    compactLessonLayout: readBoolean(raw.compactLessonLayout, DEFAULT_PREFERENCES.compactLessonLayout),
    autoRunCode: readBoolean(raw.autoRunCode, DEFAULT_PREFERENCES.autoRunCode),
  };
};

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ title, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-sidebar/80 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState<any>(null);
  const [profileRow, setProfileRow] = useState<Record<string, unknown> | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [preferences, setPreferences] = useState<PreferenceSettings>(DEFAULT_PREFERENCES);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          navigate('/');
          return;
        }

        if (ignore) {
          return;
        }

        setAuthUser(user);

        const profile = await fetchProfileForAuthUser(user as any);
        if (!ignore) {
          setProfileRow(profile);
        }

        const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? {};
        const fallbackName = readString(user.email).split('@')[0] || 'Learner';
        const resolvedName = readString(profile?.['full_name'] ?? metadata.full_name) || fallbackName;

        if (!ignore) {
          setDisplayName(resolvedName);
          setPreferences(parsePreferences(metadata[PREFERENCES_KEY]));
        }
      } catch (error) {
        console.error('Failed to load settings', error);
        toast.error('Failed to load settings');
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
      </DashboardLayout>
    );
  }

  if (!authUser) {
    return null;
  }

  const metadata = (authUser.user_metadata as Record<string, unknown> | undefined) ?? {};
  const accountEmail = readString(profileRow?.['email'] ?? authUser.email);
  const accountRole =
    readString(
      profileRow?.['role'] ?? profileRow?.['user_role'] ?? metadata.role ?? metadata.user_role
    ).toLowerCase() || 'student';
  const createdAt = authUser.created_at
    ? new Date(authUser.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  const togglePreference = (key: keyof PreferenceSettings, checked: boolean) => {
    setPreferences((current) => ({ ...current, [key]: checked }));
  };

  const refreshAuthUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setAuthUser(user);
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSavingProfile(true);

    try {
      const profileUpdate = await updateProfileForAuthUser(authUser as any, { full_name: trimmedName });
      if (profileUpdate.data) {
        setProfileRow(profileUpdate.data);
      }

      const {
        error,
      } = await supabase.auth.updateUser({
        data: { ...metadata, full_name: trimmedName },
      });

      if (error) {
        throw error;
      }

      await refreshAuthUser();
      toast.success('Account details updated');
    } catch (error: any) {
      toast.error(error?.message || 'Could not update account details');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);

    try {
      const {
        error,
      } = await supabase.auth.updateUser({
        data: { ...metadata, [PREFERENCES_KEY]: preferences },
      });

      if (error) {
        throw error;
      }

      await refreshAuthUser();
      toast.success('Preferences saved');
    } catch (error: any) {
      toast.error(error?.message || 'Could not save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }

      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (error: any) {
      toast.error(error?.message || 'Could not update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.message || 'Could not sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteRequest = async () => {
    await supabase.auth.signOut();
    toast.info('Account deletion is managed by support. You have been signed out.');
    navigate('/');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="heading-font mb-2 text-3xl text-foreground lg:text-4xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and security controls</p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-2xl bg-sidebar p-1.5">
            <TabsTrigger value="account" className="rounded-xl px-4 py-2 text-sm">Account</TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl px-4 py-2 text-sm">Preferences</TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-4 py-2 text-sm">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuUser className="h-5 w-5 text-primary" />
                  <CardTitle className="heading-font">Account Information</CardTitle>
                </div>
                <CardDescription>Basic details linked to your login</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={accountEmail} disabled className="h-11 rounded-xl border-0 bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex h-11 items-center rounded-xl bg-secondary px-3">
                      <Badge className="border border-primary/20 bg-primary/10 capitalize text-primary">{accountRole}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input value={createdAt} disabled className="h-11 rounded-xl border-0 bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <Input value={authUser.id} disabled className="h-11 rounded-xl border-0 bg-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuWandSparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="heading-font">Profile Details</CardTitle>
                </div>
                <CardDescription>Update the display name shown in your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Enter your display name"
                      className="h-11 rounded-xl bg-secondary"
                    />
                  </div>
                  <Button type="submit" disabled={isSavingProfile} className="rounded-xl">
                    <LuSave className="mr-2 h-4 w-4" />
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuBell className="h-5 w-5 text-primary" />
                  <CardTitle className="heading-font">Notifications</CardTitle>
                </div>
                <CardDescription>Control what updates you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  title="Lesson reminder emails"
                  description="Get nudges when you have unfinished lessons."
                  checked={preferences.emailLessonReminders}
                  onCheckedChange={(checked) => togglePreference('emailLessonReminders', checked)}
                />
                <ToggleRow
                  title="Achievement updates"
                  description="Receive emails when you unlock achievements."
                  checked={preferences.emailAchievementUpdates}
                  onCheckedChange={(checked) => togglePreference('emailAchievementUpdates', checked)}
                />
                <ToggleRow
                  title="Streak reminders"
                  description="Get a reminder before your streak expires."
                  checked={preferences.streakReminders}
                  onCheckedChange={(checked) => togglePreference('streakReminders', checked)}
                />
                <ToggleRow
                  title="Weekly digest"
                  description="Receive one weekly summary of your learning progress."
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => togglePreference('weeklyDigest', checked)}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuShield className="h-5 w-5 text-primary" />
                  <CardTitle className="heading-font">Privacy and Learning</CardTitle>
                </div>
                <CardDescription>Choose how your profile and lessons behave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleRow
                  title="Public profile in your hub"
                  description="Allow instructors and peers to discover your profile in your hub."
                  checked={preferences.publicProfile}
                  onCheckedChange={(checked) => togglePreference('publicProfile', checked)}
                />
                <ToggleRow
                  title="Share learning activity"
                  description="Show lesson and project completion activity in dashboard summaries."
                  checked={preferences.showLearningActivity}
                  onCheckedChange={(checked) => togglePreference('showLearningActivity', checked)}
                />
                <ToggleRow
                  title="Compact lesson layout"
                  description="Use a tighter layout for coding lessons."
                  checked={preferences.compactLessonLayout}
                  onCheckedChange={(checked) => togglePreference('compactLessonLayout', checked)}
                />
                <ToggleRow
                  title="Auto-run starter code"
                  description="Run starter code automatically when opening a lesson sandbox."
                  checked={preferences.autoRunCode}
                  onCheckedChange={(checked) => togglePreference('autoRunCode', checked)}
                />
                <Button onClick={handleSavePreferences} disabled={isSavingPreferences} className="mt-1 rounded-xl">
                  <LuSave className="mr-2 h-4 w-4" />
                  {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuKey className="h-5 w-5 text-primary" />
                  <CardTitle className="heading-font">Password</CardTitle>
                </div>
                <CardDescription>Use a strong password with at least 8 characters</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength={8}
                      required
                      className="h-11 rounded-xl bg-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={8}
                      required
                      className="h-11 rounded-xl bg-secondary"
                    />
                  </div>

                  <Button type="submit" disabled={isUpdatingPassword} className="rounded-xl">
                    <LuSave className="mr-2 h-4 w-4" />
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-destructive bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LuCircleAlert className="h-5 w-5 text-destructive" />
                  <CardTitle className="heading-font text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription>Account actions that affect your current session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign out</p>
                    <p className="text-xs text-muted-foreground">End your session on this device.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="rounded-xl"
                  >
                    <LuLogOut className="mr-2 h-4 w-4" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Delete account</p>
                    <p className="text-xs text-muted-foreground">
                      This workspace uses managed auth. Deletion requests are handled by support.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="rounded-xl">
                        Request Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Request account deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your account cannot be deleted directly from this screen yet. Continue to sign out and submit your
                          deletion request to support.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteRequest}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sign Out and Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
