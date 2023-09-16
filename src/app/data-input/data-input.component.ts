import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subject, debounceTime } from 'rxjs'; import { FinanceItem } from 'src/app/models/finance-item.model';
import { WritableSignal, Signal, signal, computed } from "@angular/core";
import { frequencies } from 'src/app/models/frequency';
import { IncomeExpenditureItem } from 'src/app/models/income-expenditure-item.model';

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss']
})
export class DataInputComponent {
  @Input() dataItem!: FinanceItem;
  @Output() dataChangedEmitter = new EventEmitter<FinanceItem>();
  breadcrumbs: FinanceItem[] = [];
  formChanged = new Subject();
  frequencies = frequencies;

  get endDateGetterSetter(): Date {
    return this.endDate()
  }
  set endDateGetterSetter(value: Date) {
    console.warn(value);
    this.endDate.set(value);
  }
  endDate = signal(new Date(2030, 0, 1));
  valueOnDate = computed<number>(() => {
    const value = this.dataItem?.valueOnDate?.(this.endDate());
    console.warn('valueOnDate', this.endDate());
    return value || 0;
  });

  constructor() {
    this.formChanged.pipe(
      debounceTime(1000)
      //do what you want
    ).subscribe((event: any) => {
      console.log(event)
      this.dataChangedEmitter.emit(this.dataItem);
    });
  }

  editDetails(dataItem: FinanceItem, breadcrumbs: FinanceItem[]) {
    this.breadcrumbs = breadcrumbs;
    // console.log(dataItem, this.breadcrumbs);
    if (this.breadcrumbs.indexOf(dataItem) > -1) {
      this.pruneBreadcrumbs(dataItem);
    } else {
      this.breadcrumbs.push(this.dataItem);
    }
    this.dataItem = dataItem;
  }

  pruneBreadcrumbs(dataItem: FinanceItem) {
    const index = this.breadcrumbs.indexOf(dataItem);
    if (index > -1) {
      this.breadcrumbs.splice(index, this.breadcrumbs.length);
    }
  }

  updateItem() {
    // console.log(`Updating ${this.dataItem.name}`);
    const parentItem = this.breadcrumbs[this.breadcrumbs.length - 1];
    this.editDetails(parentItem, this.breadcrumbs)
    // this.dataItem?.updateSubItemsStartTotal?.();
  }

  signalChanged($event: any, signal: WritableSignal<any>) {
    console.log($event);
    signal.set($event);
    this.updateGraph($event);
  }

  updateGraph($event: any) {
    this.formChanged.next($event);
  }

  addItem(parent: FinanceItem) {
    const item = new IncomeExpenditureItem('', new Date(), 0);
    item.type = parent.type;
    this.dataItem.subItems?.push(item);
    console.log(item);
  }

}
