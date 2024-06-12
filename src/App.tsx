import './App.css'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'
import LogInPage from './LogInPage'
import useRoute from './useRoute'
import { useEffect } from 'react'
// import useRoute from './useRoute'

function App() {
  return (
    <BrowserRouter>
      <MainWindow />
    </BrowserRouter>
  )
}

function MainWindow() {
  const { route } = useRoute()
  console.log('---- x', route)
  if (route.page === 'home') {
    return <HomePage />
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
    console.log('---- setting route to home')
    setRoute({
      page: 'home'
    })
  }, [route.accessToken, setRoute])
  return <div>Logging in...</div>
}

export default App
