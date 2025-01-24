export function generateICS({
    eventName,
    eventDescription,
    location,
    startDate,
    endDate,
  }: {
    eventName: string;
    eventDescription: string;
    location: string;
    startDate: Date;
    endDate: Date;
  }): string {
    const pad = (num: number) => String(num).padStart(2, '0');
  
    const formatDate = (date: Date) => {
      return (
        date.getUTCFullYear().toString() +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        'T' +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes()) +
        pad(date.getUTCSeconds()) +
        'Z'
      );
    };
  
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Your Company//Your Product//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@yourdomain.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
  