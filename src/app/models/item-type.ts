export const itemTypesList = ['Default', 'Interest', 'Goal','Savings', 'Debt', 'House', 'Income', 'Expenditure'] as const;
export type ItemType = typeof itemTypesList[number];