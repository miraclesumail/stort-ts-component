import React, { Component, forwardRef } from 'react'
import ListScroll from './listScroll'

const Container: React.FC<any> = forwardRef((props, ref) => <ul className="scroll-container" ref={ref as any}>
    {props.children}
</ul>)

const renderItem = (item, isFirstOrLast) => <li className="item-li" id={isFirstOrLast === 1 ? 'item-first' : isFirstOrLast === 2 ? 'item-last' : ''} 
key={item.name}>
    {item.name} -- {item.age}
</li>

class ScrollContainer extends Component<any, any> {
  public state = {
      firstIndex: 0      
  }

  public ref = React.createRef<any>();
  public listScroll;

  public static defaultProps = {
      renderItem,
      showNum: 20,
      dataSource: Array.from({length: 88}, (_, index) => ({name: `haha${index+1}`, age: index + 1}))
  }

  public componentDidMount() {
      const { showNum, dataSource } = this.props;
      this.listScroll = new ListScroll(
          {
            firstItemId: 'item-first',
            lastItemId: 'item-last',
            container: this.ref,
            size: dataSource.length,
            showNum,
            changeIndex: firstIndex => this.setState({firstIndex})
          }
      )
  }

  public render() {
    const {showNum, size, renderItem, dataSource} = this.props;  
    const {firstIndex} = this.state;
    const data = dataSource.slice(firstIndex,  firstIndex + showNum);
    return (
      <Container ref={this.ref}>
         {
             data.map((item, index) => {
                  return renderItem(item, index === 0 ? 1 : index === data.length - 1 ? 2 : '')
             })
         }
      </Container>
    )
  }
}

export default ScrollContainer
