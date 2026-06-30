export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const getFileName = (fileName = '') =>{
  if (!fileName) return "";
  fileName.split(/[\\/]/).pop() || '—';
};

const ICON_COLORS = [
  { bg: '#e8f1fb', text: '#1d5fa5' },
  { bg: '#eaf3de', text: '#3b6d11' },
  { bg: '#faeeda', text: '#854f0b' },
  { bg: '#faece7', text: '#993c1d' },
  { bg: '#eeedfe', text: '#534ab7' },
];

export const getIconColor = (index) => ICON_COLORS[index % ICON_COLORS.length];