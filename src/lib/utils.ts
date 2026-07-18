export function normalizeIdentifier(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function getRegistrationDeadline(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let deadline = new Date(year, 6, 22, 23, 59, 59); // Month is 0-indexed (6 = July)
  
  if (now > deadline) {
    deadline = new Date(year + 1, 6, 22, 23, 59, 59);
  }
  return deadline;
}

export function isRegistrationClosed(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  // We strictly check against the current year's deadline
  const currentYearDeadline = new Date(year, 6, 22, 23, 59, 59); 
  return now > currentYearDeadline;
}
