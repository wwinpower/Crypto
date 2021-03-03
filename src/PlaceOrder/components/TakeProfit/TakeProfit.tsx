/* eslint @typescript-eslint/no-use-before-define: 0 */

import React, { useState, useEffect } from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";
import { observer } from "mobx-react";
import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY, MAXIMUM_PROFIT_ERROR, AMOUNT_PROFIT_ERROR } from "../../constants";
import { OrderSide } from "../../model";
import "./TakeProfit.scss";

type Props = {
  orderSide: OrderSide;
  price: number;
  total: number;
  amount: number;
  profits: {
    id: number;
    profitSize: number;
    amountProfit: number;
    percent: number;
  }[];
  removeProfite?(value: number | null): void;
  addProfite?(value: string | null): void;
  setProfitSize?(value1?: any, value2?: number | null): void;
  setProfitPercent?(value1?: any, value2?: number | null): void;
  totalProfit: number;
  resetProfits: void;
  targetProfitSum: number;
};

const b = block("take-profit");

const TakeProfit = observer(
  ({
    orderSide,
    profits,
    removeProfite,
    addProfite,
    setProfitSize,
    setProfitPercent,
    totalProfit,
    resetProfits
  }: Props) => {
    const [ProfitSwitch, setProfitSwitch] = useState(false);
    const [errorProfit, setErrorPorfit] = useState();

    function changeSwitchHandler() {
      setProfitSwitch(!ProfitSwitch);

      if (!ProfitSwitch) {
        resetProfits();
      }
    }

    useEffect(() => {
      let profit = (profits.length > 0? profits.reduce((sum, { profitSize }: { profitSize: number }) => sum + profitSize, 0): null) > 500  ? MAXIMUM_PROFIT_ERROR : null;
        setErrorPorfit(profit);
    }, [totalProfit]);

    return (
      <div className={b()}>
        <div className={b("switch")}>
          <span>Take profit</span>
          <Switch onChange={changeSwitchHandler} />
        </div>
        {console.log(profits)}
        {ProfitSwitch ? (
          <div className={b("content")}>
            {renderTitles()}
            {profits &&
              profits.map(({ id, profitSize, amountProfit, percent }, key) =>
                renderInputs(id, profitSize, amountProfit, percent, key)
              )}

            {profits.length > 4 ? null : (
              <TextButton
                className={b("add-button")}
                onClick={() => addProfite(orderSide)}
              >
                <AddCircle className={b("add-icon")} />
                <span>Add profit target {profits.length}/5</span>
              </TextButton>
            )}

            <div className={b("projected-profit")}>
              <span className={b("projected-profit-title")}>
                Projected profit
              </span>
              <span className={b("projected-profit-value")}>
                <span>{totalProfit}</span>
                <span className={b("projected-profit-currency")}>
                  {QUOTE_CURRENCY}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>
    );

    function renderInputs(
      id: number,
      profitSize: number,
      amountProfit: number,
      percent: number,
      key: number
    ) {
      return (
        <div className={b("inputs")} key={key}>
          <NumberInput
            value={profitSize}
            decimalScale={2}
            InputProps={{ endAdornment: "%" }}
            variant="underlined"
            onChange={(value) => setProfitSize(Number(value), id, orderSide)}
            error={errorProfit || null}
          />
          <NumberInput
            value={amountProfit}
            decimalScale={2}
            InputProps={{ endAdornment: QUOTE_CURRENCY }}
            variant="underlined"
            error={amountProfit < 0 ? AMOUNT_PROFIT_ERROR : null}
          />
          <NumberInput
            value={percent}
            decimalScale={2}
            InputProps={{ endAdornment: "%" }}
            variant="underlined"
            onChange={(value) => setProfitPercent(Number(value), id, orderSide)}
          />
          <div className={b("cancel-icon")}>
            <Cancel onClick={() => removeProfite(id)} />
          </div>
        </div>
      );
    }

    function renderTitles() {
      return (
        <div className={b("titles")}>
          <span>Profit</span>
          <span>Trade price</span>
          <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
        </div>
      );
    }
  }
);

export { TakeProfit };
