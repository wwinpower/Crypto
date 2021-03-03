import { observable, computed, action } from "mobx";
import { OrderSide } from "../model";

export interface ProfitBox {
  id: number;
  profitSize: number;
  amountProfit: number;
  percent: number;
}

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable profitPercent: number = 0;
  @observable profitPart: number = 100;
  @observable profits: ProfitBox[] = [];

  @computed get total(): number {
    return this.price * this.amount;
  }

  @computed get totalProfit(): number {
    return this.profits.length > 0 ? this.totalAllProfit() : 0;
  }

  @computed get profitSizeIncrement(): number {
    this.profitPercent = this.profits[this.profits.length - 1].profitSize + 2;
    return this.profitPercent;
  }

  @computed get profitSizeDecrement(): number {
    return (this.profitPercent -= 2);
  }

  @computed get maxPercentProfitIndex(): number {
    return this.profits.reduce(
      (acc, curr, i) => (this.profits[acc].percent > curr.percent ? acc : i),
      0
    );
  }

  @action totalAllProfit = () => {
    return this.profits
      .map((profit: { percent: number; amountProfit: number }): number => {
        return (
          this.amount *
          (profit.amountProfit - this.price) *
          (profit.percent / 100)
        );
      })
      .reduce((a, b) => a + b);
  };

  @action addProfite = (value: string) => {
    this.profits.push({
      id: Math.random(),
      profitSize: this.profits[this.profits.length - 1]
        ? this.profitSizeIncrement
        : (this.profitPercent += 2),
      amountProfit:
        value === "buy"
          ? this.profitAmountBuy(this.profitPercent)
          : this.profitAmountSell(this.profitPercent),
      percent:
        this.profits.length > 0 ? this.profitPartDecrement(20) : this.profitPart
    });
  };

  @action removeProfite = (id: number) => {
    this.profitPercent = this.profitSizeDecrement;
    this.profits = this.profits.filter(
      (profit: { id: number }): boolean => profit.id !== id
    );
  };

  @action profitPartDecrement = (value: number) => {
    let max = this.profits[this.maxPercentProfitIndex];
    if (max.percent > value) {
      max.percent -= value;
    }
    return value;
  };

  @action profitAmountBuy = (value: number) => {
    return this.price + this.price * (value / 100);
  };

  @action profitAmountSell = (value: number) => {
    return this.price - this.price * (value / 100);
  };

  @action.bound
  public setOrderSide(side: OrderSide) {
    this.activeOrderSide = side;
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public setProfitSize(profitProps: number, id: number, side: OrderSide): void {
    this.profits = this.profits.map(
      (profit: {
        id: number;
        profitSize: number;
        amountProfit: number;
      }): object => {
        return profit.id === id
          ? {
              ...profit,
              profitSize: profitProps || this.profitSizeIncrement,
              amountProfit:
                side === "buy"
                  ? this.profitAmountBuy(profitProps)
                  : this.profitAmountSell(profitProps)
            }
          : profit;
      }
    );
  }

  @action.bound
  public setProfitPercent(profitProps: number, id: number): void {
    this.profits = this.profits.map(
      (profit: { id: number; percent: number }): object => {
        return profit.id === id
          ? {
              ...profit,
              percent: profitProps
            }
          : profit;
      }
    );
  }

  @action.bound
  public resetProfits() {
    this.profits.length = 0;
    this.profitPercent = 0;
  }
}
