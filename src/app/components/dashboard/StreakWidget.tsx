import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { LuFlame } from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';

interface StreakWidgetProps {
    streak: number;
    userId: string;
}

const buildFallbackWeek = (streak: number) => {
    const capped = Math.max(0, Math.min(streak, 7));
    return Array.from({ length: 7 }, (_, index) => index >= 7 - capped);
};

export default function StreakWidget({ streak, userId }: StreakWidgetProps) {
    const [activityDays, setActivityDays] = useState<boolean[]>(buildFallbackWeek(streak));
    const [isActiveToday, setIsActiveToday] = useState(streak > 0);

    useEffect(() => {
        const fetchActivity = async () => {
            if (!userId) return;

            const useActivityLogs = import.meta.env.VITE_ENABLE_ACTIVITY_LOGS === 'true';
            if (!useActivityLogs) {
                const fallback = buildFallbackWeek(streak);
                setActivityDays(fallback);
                setIsActiveToday(fallback[6]);
                return;
            }

            // Fetch activity logs for the last 7 days
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('user_activity_logs')
                .select('active_date')
                .eq('user_id', userId)
                .gte('active_date', sevenDaysAgo.toISOString().split('T')[0])
                .lte('active_date', today.toISOString().split('T')[0]);

            if (error) {
                const fallback = buildFallbackWeek(streak);
                setActivityDays(fallback);
                setIsActiveToday(fallback[6]);
                return;
            }

            if (data) {
                const activeDates = new Set(data.map(log => log.active_date));
                const days: boolean[] = [];
                let activeToday = false;

                // Map the last 7 days to boolean
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateString = d.toISOString().split('T')[0];
                    const isActive = activeDates.has(dateString);
                    days.push(isActive);

                    if (i === 0 && isActive) {
                        activeToday = true;
                    }
                }

                setActivityDays(days);
                setIsActiveToday(activeToday);
            }
        };

        fetchActivity();
    }, [userId, streak]);

    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    // Adjust weekDays based on current day so 'Today' is always the right-most bubble
    const rotatedDays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        rotatedDays.push(weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1]);
    }

    return (
        <Card className="rounded-2xl border-border bg-sidebar overflow-hidden">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isActiveToday ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                            <LuFlame className={`h-6 w-6 ${isActiveToday ? 'fill-blue-500 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold heading-font text-foreground flex items-center gap-2">
                                {streak} {streak === 1 ? 'Day' : 'Days'}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Current Streak</p>
                        </div>
                    </div>
                    {isActiveToday ? (
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                            Active
                        </div>
                    ) : (
                        <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-widest">
                            Pending
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end mt-2 pt-4 border-t border-border/50 gap-1">
                    {rotatedDays.map((label, index) => {
                        const isToday = index === 6;
                        const isActive = activityDays[index];

                        return (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                <div
                                    className={`w-full max-w-[28px] aspect-square rounded-full flex items-center justify-center transition-all duration-300
                                        ${isActive
                                            ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)] scale-100'
                                            : 'bg-secondary/50 border border-border/50 text-transparent scale-90'
                                        }
                                        ${isToday && !isActive ? 'border-blue-500/50 border-2' : ''}
                                    `}
                                >
                                    {isActive && <LuFlame className="w-3.5 h-3.5 fill-current" />}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isToday ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
