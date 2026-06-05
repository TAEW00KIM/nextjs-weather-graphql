const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const localDate = (dt, tzOffset) => new Date((dt + tzOffset) * 1000);

export const round = (x, precision) => Math.round(x * 10 ** precision) / 10 ** precision;

const _formatTimeParts = (d) => {
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${String(h % 12 || 12).padStart(2, '0')}:${m}${ampm}`;
};

export const formatTime = (dt, tzOffset) => _formatTimeParts(localDate(dt, tzOffset));

export const formatDate = (dt, tzOffset) => {
  const d = localDate(dt, tzOffset);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

export const formatDatetime = (dt, tzOffset) => {
  const d = localDate(dt, tzOffset);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}. ${_formatTimeParts(d)}`;
};
