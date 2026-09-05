import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-screen" role="alert">
          <h1>No se pudo cargar la escena</h1>
          <p>Recarga la página. Si sigue fallando, revisa que los modelos GLB estén en public/models.</p>
        </div>
      )
    }
    return this.props.children
  }
}
