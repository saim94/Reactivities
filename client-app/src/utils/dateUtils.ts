import { format, isToday, isYesterday, parse, subDays } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const DateUtils = (dateString: string): string => {
    const date = parse(dateString, 'dd MMM yyyy', new Date());
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(date, userTimeZone);
    const today = new Date(); // Get the current date

    // Calculate the date 7 days ago from today
    const sevenDaysAgo = subDays(today, 7);

    if (isToday(zonedDate)) {
        return 'Today';
    } else if (isYesterday(zonedDate)) {
        return 'Yesterday';
    } else if (zonedDate >= sevenDaysAgo && zonedDate < today) {
        // If the date is within the last 7 days, get the day name
        const dayOfWeek = zonedDate.getDay();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames[dayOfWeek];
    } else {
        return format(zonedDate, 'PP'); // Display full date for older dates
    }
};
