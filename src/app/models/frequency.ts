export const frequencies = ['day', 'week', '2 weeks', '4 weeks', 'month', 'quarter', '6 months', 'year'] as const;
export type Frequency = typeof frequencies[number];