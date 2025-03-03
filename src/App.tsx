import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import LogInPage from './LogInPage'
import HomePage from './pages/HomePage/HomePage'
import ServicePage from './pages/ServicePage/ServicePage'
import ServicesPage from './pages/ServicesPage/ServicesPage'
import useRoute from './useRoute'
import ComputeClientPage from './pages/ComputeClientPage/ComputeClientPage'
import { SetupLogin } from './LoginContext/SetupLogin'
import { useWindowDimensions } from '@fi-sci/misc'
// import useRoute from './useRoute'

function App() {
  return (
    <SetupLogin>
      <BrowserRouter>
        <MainWindow />
      </BrowserRouter>
    </SetupLogin>
  )
}

function MainWindow() {
  const { route } = useRoute()
  const {width, height} = useWindowDimensions()
  if (route.page === 'home') {
    return <HomePage />
  }
  else if (route.page === 'services') {
    return <ServicesPage />
  }
  else if (route.page === 'service') {
    return <ServicePage width={width} height={height} />
  }
  else if (route.page === 'compute_client') {
    return <ComputeClientPage />
  }
  else if (route.page === 'logIn') {
    return <LogInPage />
  }
  else if (route.page === 'set_access_token') {
    return <SetAccessTokenComponent />
  }
  else {
    return <div>Invalid route</div>
  }
}

const SetAccessTokenComponent = () => {
  const {route, setRoute} = useRoute()
  if (route.page !== 'set_access_token') {
    throw new Error('Invalid route')
  }
  useEffect(() => {
    localStorage.setItem('pairio_github_access_token', JSON.stringify({accessToken: route.accessToken}))
    setRoute({
      page: 'home'
    })
  }, [route.accessToken, setRoute])
  return <div>Logging in...</div>
}

export default App
