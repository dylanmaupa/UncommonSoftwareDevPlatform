import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { LuFlame } from 'react-icons/lu';

interface StreakWidgetProps {
    streak: number;
    userId: string;
    lastActivityDate?: string;
}

const buildStreakWeek = (streak: number, lastActivityDate?: string) => {
    const days = [false, false, false, false, false, false, false];
    if (!lastActivityDate || streak <= 0) return days;

    // Use UTC dates for consistent math
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];

        const dTime = new Date(dateStr + 'T00:00:00Z').getTime();
        const lastTime = new Date(lastActivityDate + 'T00:00:00Z').getTime();
        const firstActiveTime = lastTime - ((streak - 1) * 86400000);

        if (dTime <= lastTime && dTime >= firstActiveTime) {
            days[i] = true;
        }
    }

    return days;
};

export default function StreakWidget({ streak, userId, lastActivityDate }: StreakWidgetProps) {
    const [activityDays, setActivityDays] = useState<boolean[]>(buildStreakWeek(streak, lastActivityDate));
    const [isActiveToday, setIsActiveToday] = useState(false);

    useEffect(() => {
        const days = buildStreakWeek(streak, lastActivityDate);
        setActivityDays(days);
        setIsActiveToday(days[6]);
    }, [streak, lastActivityDate]);

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
                            <h3 className="text-xl font-bold heading-font lowercase text-foreground flex items-center gap-2">
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
