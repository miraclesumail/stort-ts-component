import React from "react"
import './App.scss'

export interface IProps {
    color: string
    onClick?: (color: string) => void
}
export default (props: IProps) => {
    const {color, onClick} = props;
    return <div>
        <button style={{color}} onClick={() => onClick && onClick(color)}>Color Button</button>
        <div>www</div>
        </div>
}