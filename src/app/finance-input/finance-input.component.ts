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

@Component({
  selector: 'app-finance-input',
  templateUrl: './finance-input.component.html',
  styleUrls: ['./finance-input.component.scss']
})
export class FinanceInputComponent implements OnInit {
  loading = false
  data!: FinanceData

  @Input()
  session!: AuthSession

  http = inject(HttpClient);
  title = 'onyx-alpha';
  overview: FinanceItem;
  user: any;
  xAxisData = [2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2075];
  yAxisData = [0, 0, 0, 0, 0, 0, 0];
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

  constructor(private readonly supabase: SupabaseService) {
    // console.log(allData);
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
    await this.getFinanceData()
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
        // this.http.get('assets/test-data/template.json').subscribe((templateData: any) => {
        // this.http.get('assets/test-data/testdata.json').subscribe((templateData: any) => {
        this.http.get('assets/test-data/dbdata.json').subscribe((templateData: any) => {
          this.data = {
            id: 0,
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
    try {
      this.loading = true
      const { user } = this.session

      const { error } = await this.supabase.updateFinanceData({
        id: this.data.id,
        user_id: user.id,
        data: this.overview.toJson()
      })
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
      case 'Interest': item = new InterestItem(dataItem.name, dataItem.startDate, dataItem.startValue); break;
      case 'House': item = new HouseItem(); break;
      case 'Goal': item = new GoalItem(); break;
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
    item.inputs = dataItem.inputs || [];

    item.subItems = [];
    if (dataItem.subItems) {
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
        return item.name === 'Savings & Assets';
      });

      const goalsItem = this.overview.subItems?.find((item) => {
        return item.name === 'Goals/Milestones';
      });

      for (let i = 0; i < this.xAxisData.length; i++) {
        const year = this.xAxisData[i];
        const date = new Date(year, 1, 1);
        // console.warn(date);
        const incomeOnDate = totalIncomeItem?.valueOnDate(date) || 0;
        const expenditureOnDate = totalExpenditureItem?.valueOnDate(date) || 0;

        const savingsOnDate = totalSavingsItem?.valueOnDate(date) || 0;

        const goalsOnDate = goalsItem?.valueOnDate(date) || 0;

        totalIncomeArr[i] = savingsOnDate + incomeOnDate - expenditureOnDate - goalsOnDate;
      }



      for (let i = 0; i < this.xAxisData.length; i++) {

        this.yAxisData[i] = Number(totalIncomeArr[i]);
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
    const data = this.overview.toJson()
    console.log(JSON.stringify(data));
  }
}


