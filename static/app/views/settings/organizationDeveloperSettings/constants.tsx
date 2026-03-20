export const EVENT_CHOICES = [
  'issue',
  'error',
  'comment',
  'seer',
  'build_upload',
] as const;

export const PERMISSIONS_MAP = {
  issue: 'Event',
  error: 'Event',
  comment: 'Event',
  seer: 'Event',
  build_upload: 'Project',
} as const;
