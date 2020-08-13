import React, { Component, useState, useEffect } from 'react'
import 'antd/dist/antd.min.css'
import Button, { ButtonType }  from 'antd/lib/button'
import Input from 'antd/lib/input'

function Count({count}: {count: number}) {
    const [mycount, setCount] = useState(count);

    useEffect(() => {
      setCount(count)
    }, [count])

    return <div style={{color: 'yellow'}}>{mycount}</div>
}

class Test extends Component {
  public state = {
      count: 1
  }

  public aa: string = 'dsfsf'

  componentDidMount() {
     setTimeout(() => {
         this.setState({
             count: this.state.count + 1
         })
     }, 5000);
  }
  

  render() {
    return (
      <div>
          <Input/>
        <Button type={'primary'}>dsfs</Button>
         <Count {...{count: this.state.count}}/>
      </div>
    )
  }
}

export default Test
