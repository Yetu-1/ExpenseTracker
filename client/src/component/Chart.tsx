import './Chart.css'
import { Bar } from './Bar'
import { useState } from 'react'

const colors = {
    cyan: "#76b5bc",
    orange: "#ec775f",
}
const days = ["mon", "tue", "wed", "thurs", "fri", "sat", "sun"]

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
      "amount": 93.39
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


export function Chart() {
    return (
        <div className="chart">
            {data.map((day) => {
                return <Bar key={day.day} day={day.day} height={day.amount} amount='11,543,234' />
            })}
        </div>
    )
}