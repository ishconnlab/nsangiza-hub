import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="container-hub grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="text-6xl font-black text-hub-primary/20">404</p>
        <h1 className="mt-3 text-2xl font-bold text-hub-text">This page wandered off</h1>
        <p className="mt-2 text-hub-muted">The page you're looking for doesn't exist or has moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/"><Button>Back to home</Button></Link>
          <Link to="/help/emergency"><Button variant="outline">Emergency contacts</Button></Link>
        </div>
      </div>
    </div>
  )
}