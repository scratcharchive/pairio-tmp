import { useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export type Route = {
    page: 'home'
} | {
    page: 'services'
} | {
    page: 'service'
    serviceName: string
} | {
    page: 'compute_clients'
} | {
    page: 'compute_client'
    computeClientId: string
} | {
    page: 'set_access_token'
    accessToken: string
} | {
    page: 'logIn'
}

const useRoute = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const p = location.pathname
    console.log('--- p', p)
    const search = location.search
    const searchParams = useMemo(() => new URLSearchParams(search), [search])
    const route: Route = useMemo(() => {
        if (p === '/services') {
            return {
                page: 'services'
            }
        }
        else if (p.startsWith('/service/')) {
            const serviceName = p.slice('/service/'.length)
            return {
                page: 'service',
                serviceName
            }
        }
        else if (p === '/compute_clients') {
            return {
                page: 'compute_clients'
            }
        }
        else if (p.startsWith('/compute_client/')) {
            const computeClientId = p.slice('/compute_client/'.length)
            return {
                page: 'compute_client',
                computeClientId
            }
        }
        else if (p === '/set_access_token') {
            const accessToken = searchParams.get('access_token')
            if (!accessToken) {
                throw new Error('Missing access token')
            }
            return {
                page: 'set_access_token',
                accessToken
            }
        }
        else if (p === '/logIn') {
            return {
                page: 'logIn'
            }
        }
        else {
            return {
                page: 'home'
            }
        }
    }, [p, searchParams])

    const setRoute = useCallback((r: Route) => {
        if (r.page === 'home') {
            navigate('/')
        }
        else if (r.page === 'services') {
            navigate('/services')
        }
        else if (r.page === 'service') {
            navigate(`/service/${r.serviceName}`)
        }
        else if (r.page === 'compute_clients') {
            navigate('/compute_clients')
        }
        else if (r.page === 'compute_client') {
            navigate(`/compute_client/${r.computeClientId}`)
        }
        else if (r.page === 'set_access_token') {
            navigate(`/set_access_token?access_token=${r.accessToken}`)
        }
        else if (r.page === 'logIn') {
            navigate('/logIn')
        }
        else {
            navigate('/')
        }
    }, [navigate])

    return {
        route,
        setRoute
    }
}

export default useRoute