import { Component, Input, OnInit, WritableSignal, effect, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { AuthSession } from '@supabase/supabase-js'
import { SupabaseService, FinanceData } from '../services/supabase.service'

import { EChartsOption } from 'echarts';
import { IncomeExpenditureItem } from '../models/income-expenditure-item.model';
import { InterestItem } from '../models/interest-item.model';
import { GoalItem } from '../models/goal-item.model';
import { HouseItem } from '../models/house-item.model';
import { HttpClient } from '@angular/common/http';
import { FinanceItem } from '../models/finance-item.model';
import { GoogleAnalyticsService } from '../google-analytics.service';
import { DebtItem } from '../models/debt-item.model';
import { SavingsItem } from '../models/savings-item.model';

@Component({
  selector: 'app-finance-input',
  templateUrl: './finance-input.component.html',
  styleUrls: ['./finance-input.component.scss']
})
export class FinanceInputComponent implements OnInit {
  loading = false
  data!: FinanceData

  // @Input()
  // session!: AuthSession
  
  session!: AuthSession;

  http = inject(HttpClient);
  title = 'onyx-alpha';
  overview: FinanceItem;
  user: any;
  xAxisData: number[] = [];
  yAxisData: number[] = [];
  chartOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: this.xAxisData
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: this.yAxisData,
        type: 'line',
      },
    ],
  };

  constructor(private readonly supabase: SupabaseService, private analyticsService: GoogleAnalyticsService) {
    // console.log(allData);
    if (this.supabase.session) {
      this.session = this.supabase.session
    }
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 50; i++) {
      this.xAxisData.push(currentYear + i);
      this.yAxisData.push(0);
    }
    this.generateChart();
    this.overview = new FinanceItem('Overview', new Date(), 0);
  }


  getStartValues(item: FinanceItem): void {
    // console.log(item.name, item.startValueSignal());
    item.subItems.forEach((subItem) => {
      this.getStartValues(subItem);
    });
  }

  async ngOnInit(): Promise<void> {
    this.supabase.authChanges((_, session) => {
      if (session)
      this.session = session
    })
    await this.getFinanceData()
    this.analyticsService.emitEvent('page_view', 'Overview', 'View Overview');
  }

  async getFinanceData() {
    try {
      this.loading = true
    
      const { user } = this.session
      // console.log(user);
      let { data: data, error, status } = await this.supabase.getFinanceData(user.id)
      // console.log(data, error, status);

      if (error && status !== 406) {
        throw error
      }

      // console.log(data);
      if (data) {
        this.data = {
          id: data.id,
          userId: data.user_id,
          data: data.data
        }
        console.log(data.data);
        this.overview = this.createItems(data.data);
        console.log(this.overview);

        this.updateChart();
      } else {
        this.http.get('assets/test-data/template.json').subscribe((templateData: any) => {
          // this.http.get('assets/test-data/testdata.json').subscribe((templateData: any) => {
          // this.http.get('assets/test-data/testdata.json').subscribe((templateData: any) => {
          this.data = {
            id: -1,
            userId: user.id,
            data: templateData
          }
          this.overview = this.createItems(this.data?.data);
          console.warn(this.overview);
          this.updateChart();
        })

      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      this.loading = false
    }
  }


  async updateFinanceData(): Promise<void> {
    this.analyticsService.emitEvent('page_view', 'Overview', 'Save Data');
    try {
      this.loading = true
      const { user } = this.session

      const data: any = {
        user_id: user.id,
        data: this.overview.toJson()
      };

      if (this.data.id !== -1) {
        data.id = this.data.id;
      }

      const { error } = await this.supabase.updateFinanceData(data)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      this.loading = false
    }
  }

  async signOut() {
    await this.supabase.signOut()
  }


  createItems(dataItem: any): FinanceItem {
    let item: FinanceItem = new IncomeExpenditureItem(dataItem.name, dataItem.startDate, dataItem.startValue);
    switch (dataItem.type) {
      case 'Income': item = new IncomeExpenditureItem(dataItem.name, dataItem.startDate, dataItem.startValue); item.type = 'Income'; break;
      case 'Expenditure': item = new IncomeExpenditureItem(dataItem.name, dataItem.startDate, dataItem.startValue); item.type = 'Expenditure'; break;
      case 'Debt': item = new DebtItem(dataItem.name, dataItem.startDate, dataItem.startValue); break;
      case 'Savings': item = new SavingsItem(dataItem.name, dataItem.startDate, dataItem.startValue); break;
      case 'Goal': item = new GoalItem(dataItem.name, dataItem.startDate, dataItem.startValue); break;
      case 'House': item = new HouseItem(dataItem.name, dataItem.startDate, dataItem.startValue); break;
    }
    // console.log(item.name, dataItem.type, item.type);
    item.name = dataItem.name;
    item.frequencySignal.set(dataItem.frequency || 'month');
    let startDate = new Date();
    if (dataItem.startDate) {
      const dataItemDate: any = new Date(dataItem.startDate);
      if (dataItemDate instanceof Date) {
        startDate = dataItemDate;
      }
    }
    item.startDateSignal.set(startDate);
    item.startValueSignal.set(dataItem.startValue || 0);

    if (dataItem.endDate) item.endDateSignal = signal(new Date(dataItem.endDate));
    if (dataItem.inputs) {
      item.inputs = dataItem.inputs;
    }

    if (dataItem.subItems) {
      item.startValueSignal.set(0);
      dataItem.subItems.forEach((subItem: any) => {
        item.subItems?.push(this.createItems(subItem));
      });
    }
    return item;
  }

  generateChart() {
    this.chartOption = {
      xAxis: {
        type: 'category',
        data: this.xAxisData
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: this.yAxisData,
          type: 'line',
        },
      ],
    };
  }

  updateChart() {
    setTimeout(() => {
      let totalIncomeArr: Number[] = [];
      const totalIncomeItem = this.overview.subItems?.find((item) => {
        return item.name === 'Income';
      });

      const totalExpenditureItem = this.overview.subItems?.find((item) => {
        return item.name === 'Expenditure';
      });

      const totalSavingsItem = this.overview.subItems?.find((item) => {
        return item.name === 'Savings & Assets';
      });

      const totalDebtItem = this.overview.subItems?.find((item) => {
        return item.name === 'Debt';
      });

      const goalsItem = this.overview.subItems?.find((item) => {
        return item.name === 'Goals/Milestones';
      });

      const dates: Date[] = [];
      for (let i = 0; i < this.xAxisData.length; i++) {
        const year = this.xAxisData[i];
        const date = new Date(year, 1, 1);
        // console.warn(date);
        dates.push(date);


      }
      const incomeOnDates = totalIncomeItem?.valuesOnDates(dates);
      const expenditureOnDates = totalExpenditureItem?.valuesOnDates(dates);
      const savingsOnDates = totalSavingsItem?.valuesOnDates(dates);
      const debtsOnDates = totalDebtItem?.valuesOnDates(dates);
      const goalsOnDates = goalsItem?.valuesOnDates(dates);

      const overviewDates = this.overview.valuesOnDates(dates);
      console.log(overviewDates?.toCSV())


      for (let i = 0; i < this.xAxisData.length; i++) {
        const incomeOnDate = incomeOnDates?.yAxisTotalValues()[i] || 0;
        const expenditureOnDate = expenditureOnDates?.yAxisTotalValues()[i] || 0;
        const savingsOnDate = savingsOnDates?.yAxisTotalValues()[i] || 0;
        const debtsOnDate = debtsOnDates?.yAxisTotalValues()[i] || 0;
        const goalsOnDate = goalsOnDates?.yAxisTotalValues()[i] || 0;
        this.yAxisData[i] = savingsOnDate + incomeOnDate - expenditureOnDate - goalsOnDate - debtsOnDate;
        // console.log(`${this.xAxisData[i]}: ${this.yAxisData[i]} = ${savingsOnDate} + ${incomeOnDate} - ${expenditureOnDate} - ${goalsOnDate} - ${debtsOnDate}`)
      }

      console.log(this.yAxisData)
      this.chartOption = {
        xAxis: {
          type: 'category',
          data: this.xAxisData
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: this.yAxisData,
            type: 'line',
          },
        ],
      };
    }, 100);
  }

  save() {
    this.analyticsService.emitEvent('page_view', 'Overview', 'Save Data');
    const data = this.overview.toJson()
    console.log(JSON.stringify(data));
  }
}


