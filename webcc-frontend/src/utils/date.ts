export const toDateInputValue = (iso?: string): string => {
  if (!iso) {
    return new Date().toISOString().split('T')[0];
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return date.toISOString().split('T')[0];
};
