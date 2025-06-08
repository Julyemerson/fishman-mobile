function addLeadingZero(value: number): string {
  return String(value).padStart(2, '0');
}

export default function formatTime(dateTime: string) {
  const dataObject: Date = new Date(dateTime);

  const hours = dataObject.getUTCHours();
  const minutes = dataObject.getUTCMinutes();

  const formattedHours = addLeadingZero(hours);
  const formattedMinutes = addLeadingZero(minutes);

  return `${formattedHours}:${formattedMinutes}`;
}
