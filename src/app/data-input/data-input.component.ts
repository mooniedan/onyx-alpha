import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { Subject, debounceTime, map, startWith } from 'rxjs'; import { FinanceItem } from 'src/app/models/finance-item.model';
import { WritableSignal, Signal, signal, computed } from "@angular/core";
import { frequencyList } from 'src/app/models/frequency';
import { IncomeExpenditureItem } from 'src/app/models/income-expenditure-item.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoogleAnalyticsService } from '../google-analytics.service';
import { ItemType } from '../models/item-type';
import { DebtItem } from '../models/debt-item.model';
import { SavingsItem } from '../models/savings-item.model';
import { GoalItem } from '../models/goal-item.model';
import { HouseItem } from '../models/house-item.model';

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss']
})
export class DataInputComponent implements OnInit {
  @Input() dataItem!: FinanceItem;
  @Output() dataChangedEmitter = new EventEmitter<FinanceItem>();
  http = inject(HttpClient);
  breadcrumbs: FinanceItem[] = [];
  formChanged = new Subject();
  frequencies = frequencyList;
  newItemName = signal('');
  suggestions: { [key: string]: string[] } = {};
  filteredSuggestions!: Observable<string[]>;
  filterSuggestions = new Subject<string>();

  invalidItemName = computed<boolean>(() => {
    return (this.newItemName().length === 0);
  });

  duplicateName = computed<boolean>(() => {
    const newItemName = this.newItemName().toLowerCase();
    const listItem = this.dataItem.subItems?.find(item => item.name.toLowerCase() === newItemName);
    return (listItem !== undefined)
  });

  duplicateItem = computed<FinanceItem | undefined>(() => {
    const newItemName = this.newItemName().toLowerCase();
    return this.dataItem.subItems?.find(item => item.name.toLowerCase() === newItemName);
  });

  get endDateGetterSetter(): Date {
    return this.endDate()
  }
  set endDateGetterSetter(value: Date) {
    console.warn(value);
    this.endDate.set(value);
  }
  endDate = signal(new Date(2030, 0, 1));
  // valueOnDate = computed<number>(() => {
  //   const value = this.dataItem?.valueOnDate?.(this.endDate());
  //   console.warn('valueOnDate', this.endDate());
  //   return value || 0;
  // });

  constructor(private analyticsService: GoogleAnalyticsService) {
    this.formChanged.pipe(
      debounceTime(1000)
      //do what you want
    ).subscribe((event: any) => {
      console.log(event)
      this.dataChangedEmitter.emit(this.dataItem);
    });
  }

  ngOnInit(): void {
    this.http.get('assets/test-data/suggestions.json').subscribe((suggestions: any) => {
      this.suggestions = suggestions;
    });
    this.filteredSuggestions = this.filterSuggestions.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    let suggestions = this.suggestions[this.dataItem.name];
    // console.log(this.dataItem.name, this.suggestions)
    // console.log(suggestions);
    if (suggestions === undefined) {
      suggestions = [];
    }

    return suggestions.filter(option => option.toLowerCase().includes(filterValue));
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
    this._filter('');
    this.filterSuggestions.next('')
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

  signalChanged($event: any, signal: WritableSignal<any>, udpateGraph: boolean = true) {
    signal.set($event);
    if (udpateGraph)
      this.updateGraph($event);
  }

  updateGraph($event: any) {
    this.formChanged.next($event);
  }

  addItem(parent: FinanceItem) {
    this.analyticsService.emitEvent('page_view', 'Data', 'Add Finance Item');
    let item: FinanceItem = new IncomeExpenditureItem(this.newItemName(), new Date(), 0);
    switch (parent.type) {
      case 'Income': item = new IncomeExpenditureItem(this.newItemName(), new Date(), 0); item.type = 'Income'; break;
      case 'Expenditure': item = new IncomeExpenditureItem(this.newItemName(), new Date(), 0); item.type = 'Expenditure'; break;
      case 'Debt': item = new DebtItem(this.newItemName(), new Date(), 0); break;
      case 'Savings': item = new SavingsItem(this.newItemName(), new Date(), 0); break;
      case 'Goal': item = new GoalItem(this.newItemName(), new Date(), 0); break;
      case 'House': item = new HouseItem(this.newItemName(), new Date(), 0); break;
    }
    this.newItemName.set('');
    item.type = parent.type;
    this.dataItem.subItems?.push(item);
    this.dataItem.startValueSignal.set(0);
    this.dataItem.subItemTrackerSignal.set(this.dataItem.subItems?.length || 0);
    this._filter('');
    this.filterSuggestions.next('')
  }
}
