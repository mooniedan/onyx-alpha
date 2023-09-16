import { InterestItem } from './interest-item.model';

describe('InterestItem', () => {
  it('should create an instance', () => {
    expect(new InterestItem('',new Date(), 0)).toBeTruthy();
  });
});
