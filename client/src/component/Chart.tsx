import './Chart.css'
import { Bar } from './Bar'
import { useState } from 'react'

const colors = {
    cyan: "#76b5bc",
    orange: "#ec775f",
}
const days = ["sun", "mon", "tue", "wed", "thurs", "fri", "sat"]

const data = [
    {
      "day": "mon",
      "amount": 17.45
    },
    {
      "day": "tue",
      "amount": 34.91
    },
    {
      "day": "wed",
      "amount": 152.36
    },
    {
      "day": "thu",
      "amount": 31.07
    },
    {
      "day": "fri",
      "amount": 180
    },
    {
      "day": "sat",
      "amount": 43.28
    },
    {
      "day": "sun",
      "amount": 25.48
    }
]


export function Chart(props : { expenses: {day : number, amount: number}[] }) {
    // maps amount from one range to another
    let max = 0;
    for(let i = 0; i < props.expenses.length; i++) {
      if (props.expenses[i].amount > max)
        max = props.expenses[i].amount;
    }
    const date = new Date();
    let day_idx = date.getDay();

    function map( x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    return (
        <div className="chart">
            {props.expenses.map((day) => {
                const bar_height = map( day.amount, 0, max, 0, 180)
                if (day_idx == 6)
                  day_idx = 0;
                else 
                  day_idx++
                let day_text = days[day_idx] // 
                return <Bar key={day.day} day={day_text} height={bar_height} amount={day.amount.toLocaleString()} />
            })}
        </div>
    )
}