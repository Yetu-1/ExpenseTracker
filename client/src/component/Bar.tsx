import "./Chart.css"

export function Bar(props: {day: string, height: number, amount: string}) {
    return (
        <div className="day-info">
            <div className="amount">
                <p>₦{props.amount}</p>
            </div>
            <div className="bar" style={{height: `${props.height}px`}} />
            <p>{props.day}</p>
        </div>
    )
}