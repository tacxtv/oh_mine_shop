export function generateArtLawNum(type: string, date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2); // '25'
  const week = getWeekNumber(date).toString().padStart(2, '0'); // '05'
  const day = (date.getDay() === 0 ? 7 : date.getDay()); // 1=lundi ... 7=dimanche
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${type}-${year}${week}${day}-T${hours}${minutes}`;
}

// Calcule le numéro de semaine ISO
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
