/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddServiceRequest, CreateServiceComputeClientRequest, DeleteServiceComputeClientRequest, DeleteServiceRequest, GetServiceComputeClientRequest, GetServiceComputeClientsRequest, GetServiceRequest, GetServicesRequest, PairioService, PairioServiceComputeClient, PairioServiceUser, SetServiceInfoRequest, isAddServiceResponse, isCreateServiceComputeClientResponse, isGetServiceComputeClientResponse, isGetServiceComputeClientsResponse, isGetServiceResponse, isGetServicesResponse, isSetServiceInfoResponse } from "./types";
import useGitHubAccessToken from "./useGitHubAccessToken";

const apiUrl = 'https://pairio.vercel.app'
// const apiUrl = 'http://localhost:3000'

export const useServices = () => {
    const { userId, accessToken } = useGitHubAccessToken();
    const [services, setServices] = useState<PairioService[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshServices = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false;
        setServices(undefined);
        if (!userId) return;
        (async () => {
            const req: GetServicesRequest = {
                type: 'getServicesRequest',
                userId
            }
            const resp = await apiPostRequest('getServices', req, undefined)
            if (canceled) return
            if (!isGetServicesResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setServices(resp.services)
        })()
        return () => { canceled = true }
    }, [userId, refreshCode])

    const addService = useCallback(async (serviceName: string) => {
        if (!accessToken) return;
        if (!userId) return;
        const req: AddServiceRequest = {
            type: 'addServiceRequest',
            userId,
            serviceName
        }
        const resp = await apiPostRequest('addService', req, accessToken)
        if (!isAddServiceResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshServices()
    }, [refreshServices, accessToken, userId])

    return {
        services,
        refreshServices,
        addService
    }
}

export const useService = (serviceName: string) => {
    const { accessToken } = useGitHubAccessToken()
    const [service, setService] = useState<PairioService | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshService = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setService(undefined)
        if (!accessToken) return
        (async () => {
            const req: GetServiceRequest = {
                type: 'getServiceRequest',
                serviceName
            }
            const resp = await apiPostRequest('getService', req, accessToken)
            if (canceled) return
            if (!isGetServiceResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setService(resp.service)
        })()
        return () => { canceled = true }
    }, [serviceName, accessToken, refreshCode])

    const deleteService = useCallback(async () => {
        if (!accessToken) return
        const req: DeleteServiceRequest = {
            type: 'deleteServiceRequest',
            serviceName
        }
        const resp = await apiPostRequest('deleteService', req, accessToken)
        if (!isGetServiceResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        setService(undefined)
    }, [serviceName, accessToken])

    const setServiceInfo = useMemo(() => (async (o: { users: PairioServiceUser[] }) => {
        const { users } = o
        const req: SetServiceInfoRequest = {
            type: 'setServiceInfoRequest',
            serviceName,
            users
        }
        const resp = await apiPostRequest('setServiceInfo', req, accessToken)
        if (!isSetServiceInfoResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshService()
    }), [serviceName, accessToken, refreshService])

    return { service, deleteService, setServiceInfo, refreshService }
}

export const useServiceComputeClients = () => {
    const { accessToken, userId } = useGitHubAccessToken()
    const [computeClients, setServiceComputeClients] = useState<PairioServiceComputeClient[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshServiceComputeClients = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setServiceComputeClients(undefined);
        (async () => {
            const req: GetServiceComputeClientsRequest = {
                type: 'getServiceComputeClientsRequest',
                userId
            }
            const resp = await apiPostRequest('getServiceComputeClients', req, accessToken)
            if (canceled) return
            if (!isGetServiceComputeClientsResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setServiceComputeClients(resp.computeClients)
        })()
        return () => { canceled = true }
    }, [accessToken, refreshCode, userId])

    const createServiceComputeClient = useMemo(() => (async (serviceName: string) => {
        if (!userId) return
        // const computeSlot: ServiceComputeClientComputeSlot = {
        //     computeSlotId: '', // will be generated
        //     numCpus: 4,
        //     numGpus: 0,
        //     memoryGb: 8,
        //     timeSec: 3600,
        //     minNumCpus: 0,
        //     minNumGpus: 0,
        //     minMemoryGb: 0,
        //     minTimeSec: 0,
        //     multiplicity: 1
        // }
        const req: CreateServiceComputeClientRequest = {
            type: 'createServiceComputeClientRequest',
            serviceName,
            userId
        }
        const resp = await apiPostRequest('createServiceComputeClient', req, accessToken)
        if (!isCreateServiceComputeClientResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        refreshServiceComputeClients()
        return { computeClientId: resp.computeClientId, computeClientPrivateKey: resp.computeClientPrivateKey }
    }), [userId, accessToken, refreshServiceComputeClients])

    return {
        computeClients,
        createServiceComputeClient,
        refreshServiceComputeClients
    }
}

export const useServiceComputeClient = (computeClientId: string) => {
    const { accessToken } = useGitHubAccessToken()
    const [computeClient, setServiceComputeClient] = useState<PairioServiceComputeClient | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    const refreshServiceComputeClient = useCallback(() => {
        setRefreshCode(c => c + 1)
    }, [])
    useEffect(() => {
        let canceled = false
        setServiceComputeClient(undefined)
        if (!accessToken) return
        (async () => {
            const req: GetServiceComputeClientRequest = {
                type: 'getServiceComputeClientRequest',
                computeClientId
            }
            const resp = await apiPostRequest('getServiceComputeClient', req, accessToken)
            if (canceled) return
            if (!isGetServiceComputeClientResponse(resp)) {
                console.error('Invalid response', resp)
                return
            }
            setServiceComputeClient(resp.computeClient)
        })()
        return () => { canceled = true }
    }, [computeClientId, accessToken, refreshCode])

    const deleteServiceComputeClient = useCallback(async () => {
        if (!accessToken) return
        const req: DeleteServiceComputeClientRequest = {
            type: 'deleteServiceComputeClientRequest',
            computeClientId
        }
        const resp = await apiPostRequest('deleteServiceComputeClient', req, accessToken)
        if (!isGetServiceComputeClientResponse(resp)) {
            console.error('Invalid response', resp)
            return
        }
        setServiceComputeClient(undefined)
    }, [computeClientId, accessToken])

    return { computeClient, deleteServiceComputeClient, refreshServiceComputeClient }
}

const apiPostRequest = async (path: string, req: any, accessToken?: string) => {
    const url = `${apiUrl}/api/${path}`
    const headers: { [key: string]: string } = {}
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }
    headers['Content-Type'] = 'application/json'
    console.log('---- headers', headers)
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
    })
    if (!response.ok) {
        const responseText = await response.text()
        throw Error(`Error fetching ${path}: ${response.status} ${responseText}`)
    }
    const resp = await response.json()
    return resp
}