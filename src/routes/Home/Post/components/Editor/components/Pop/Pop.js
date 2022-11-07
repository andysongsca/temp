import React from 'react'
import ReactDOM from 'react-dom'
import Pop from 'components/Pop'
import './Pop.scss'

let idx = 0

class EditorPop extends React.Component {
  render() {
    const { visible, content, style } = this.props

    if (!visible) {
      return null
    }

    return (
      <Pop
        className='Editor-Pop'
        position='top-left'
        style={style}
      >
        {content}
      </Pop>
    )
  }
}

let visible = false

export const pop = opts => {
  const { content, top } = opts
  if (content === null || content === undefined) {
    visible = false
  } else {
    idx += 1
    visible = true
  }

  ReactDOM.render(
    <EditorPop
      key={idx}
      visible={visible}
      content={content}
      style={{
        top: top + 5
      }}
    />,
    document.getElementById('Editor-Pop')
  )
}

pop.hide = () => {
  pop({
    content: null
  })
}

export default EditorPop
