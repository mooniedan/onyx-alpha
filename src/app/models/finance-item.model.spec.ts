import { FinanceItem } from './finance-item.model';

describe('FinanceItem', () => {
  it('should create an instance', () => {
    expect(new FinanceItem('', new Date(), 0)).toBeTruthy();
  });
});
