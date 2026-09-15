import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackImage?: string
  alt?: string
  className?: string
}

interface State {
  hasError: boolean
}

export default class SafeCanvas extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Gracefully catch WebGL / R3F render runtime errors
  }

  public componentDidMount() {
    window.addEventListener('webglcontextlost', this.handleContextLost, true)
  }

  public componentWillUnmount() {
    window.removeEventListener('webglcontextlost', this.handleContextLost, true)
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault()
    this.setState({ hasError: true })
  }

  public render() {
    if (this.state.hasError) {
      const fallbackSrc = this.props.fallbackImage || '/compass-fallback.webp'
      return (
        <div
          className={`safe-canvas-fallback ${this.props.className || ''}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #202038 0%, #1a1a2e 100%)',
            overflow: 'hidden'
          }}
        >
          <img
            src={fallbackSrc}
            alt={this.props.alt || 'Trạm Ghé Tâm Hồn — La bàn sách'}
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              opacity: 0.85
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}
