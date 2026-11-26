// Validate calendar dates and work history; preserve old date text.

export function isIsoDate(value) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  return y>=1900 && y<=2100 && dt.getUTCFullYear()===y && dt.getUTCMonth()+1===m && dt.getUTCDate()===d;
}
export function displayDate(value) {
 if(!isIsoDate(value))return value || ''; // Preserve legacy month/year text without inventing a day.
 const [y,m,d]=value.split('-'); return `${d}/${m}/${y}`;
}
export function validateExperience(entries){
 for(const [i,entry] of entries.entries()) {
   if(!entry.role?.trim() && !entry.organization?.trim() && !entry.start && !entry.end)continue;
   if(!isIsoDate(entry.start))return `Work experience ${i+1}: choose an exact start date (day/month/year).`;
   if(entry.end!== 'Present' && !isIsoDate(entry.end))return `Work experience ${i+1}: choose an exact end date or mark Currently working here.`;
   if(entry.end!== 'Present' && entry.end<entry.start)return `Work experience ${i+1}: end date cannot be before start date.`;
 }
 return '';
}
