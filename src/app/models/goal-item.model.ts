import { FinanceItem } from "./finance-item.model";

export class GoalItem extends FinanceItem{
    override type = 'Goal';
    
    constructor() {
        super('Goal', new Date(), 0);
    }


}
