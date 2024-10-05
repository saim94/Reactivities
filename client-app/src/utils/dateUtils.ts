import { format, isToday, isYesterday, parse, subDays, formatDistanceToNow } from 'date-fns';
/*import { utcToZonedTime } from 'date-fns-tz';*/

export const DateUtils = (dateString: string): string => {
    const date = parse(dateString, 'dd MMM yyyy', new Date());

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert the parsed date to the user's time zone
    const zonedDate = new Date(date.toLocaleString('en-US', { timeZone: userTimeZone }));

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

export const timeAgo = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
};


export const DateUtils1 = (date: Date): string => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert the UTC date to the user's time zone
    const zonedDate = new Date(date.toLocaleString('en-US', { timeZone: userTimeZone }));

    // Calculate the time difference in terms of seconds
    const seconds = Math.floor((new Date().getTime() - zonedDate.getTime()) / 1000);


    if (seconds < 60) {
        return 'Just now';
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // If more than a day, use the formatDistanceToNow function
    return formatDistanceToNow(zonedDate, { addSuffix: true });
};



