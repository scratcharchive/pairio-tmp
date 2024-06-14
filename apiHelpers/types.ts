/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArrayOf, isBoolean, isEqualTo, isNull, isNumber, isOneOf, isString, optional, validateObject } from "@fi-sci/misc";

// PairioService
export type PairioService = {
  serviceName: string
  userId: string
}

export const isPairioService = (x: any): x is PairioService => {
  return validateObject(x, {
    serviceName: isString,
    userId: isString
  })
}

// PairioServiceUser
export type PairioServiceUser = {
  serviceName: string
  userId: string
  admin: boolean
  createJobs: boolean
  processJobs: boolean
}

export const isPairioServiceUser = (x: any): x is PairioServiceUser => {
  return validateObject(x, {
    serviceName: isString,
    userId: isString,
    admin: isBoolean,
    createJobs: isBoolean,
    processJobs: isBoolean
  })
}

// PairioServiceApp
export type PairioServiceApp = {
  serviceName: string
  appName: string
  appSpecificationUri: string
  appSpecificationCommit: string
  appSpecification: PairioAppSpecification
}

export const isPairioServiceApp = (x: any): x is PairioServiceApp => {
  return validateObject(x, {
    serviceName: isString,
    appName: isString,
    appSpecificationUri: isString,
    appSpecificationCommit: isString,
    appSpecification: isPairioAppSpecification
  })
}

// PairioServiceComputeClient
export type PairioServiceComputeClient = {
  serviceName: string
  computeClientId: string
  computeClientPrivateKey: string | null
  userId: string
  label: string
  description: string
  computeSlots: ServiceComputeClientComputeSlot[]
}

export const isPairioServiceComputeClient = (x: any): x is PairioServiceComputeClient => {
  return validateObject(x, {
    serviceName: isString,
    computeClientId: isString,
    computeClientPrivateKey: isOneOf([isString, isNull]),
    userId: isString,
    label: isString,
    description: isString,
    computeSlots: isArrayOf(isServiceComputeClientComputeSlot)
  })
}

// PairioAppProcessor
export type PairioAppProcessor = {
  name: string
  description: string
  label: string
  image: string
  executable: string
  inputs: PairioAppProcessorInputFile[]
  outputs: PairioAppProcessorOutputFile[]
  parameters: PairioAppProcessorParameter[]
}

export const isPairioAppProcessor = (x: any): x is PairioAppProcessor => {
  return validateObject(x, {
    name: isString,
    description: isString,
    label: isString,
    image: isString,
    executable: isString,
    inputs: isArrayOf(isPairioAppProcessorInputFile),
    outputs: isArrayOf(isPairioAppProcessorOutputFile),
    parameters: isArrayOf(isPairioAppProcessorParameter)
  })
}

// PairioAppSpecification
export type PairioAppSpecification = {
  name: string
  description: string
  processors: PairioAppProcessor[]
}

export const isPairioAppSpecification = (x: any): x is PairioAppSpecification => {
  return validateObject(x, {
    name: isString,
    description: isString,
    processors: isArrayOf(isPairioAppProcessor)
  })
}

// PairioJobInputFile
export type PairioJobInputFile = {
  name: string
  fileBaseName: string
  url: string
}

export const isPairioJobInputFile = (x: any): x is PairioJobInputFile => {
  return validateObject(x, {
    name: isString,
    fileBaseName: isString,
    url: isString
  })
}

// PairioJobOutputFile
export type PairioJobOutputFile = {
  name: string
  fileBaseName: string
  url: string
}

export const isPairioJobOutputFile = (x: any): x is PairioJobOutputFile => {
  return validateObject(x, {
    name: isString,
    fileBaseName: isString,
    url: isString
  })
}

// PairioJobParameter
export type PairioJobParameter = {
  name: string
  value: string | number | boolean | string[] | number[] | boolean[] | null // null means undefined
}

export const isPairioJobParameter = (x: any): x is PairioJobParameter => {
  return validateObject(x, {
    name: isString,
    value: isOneOf([isString, isNumber, isBoolean, isArrayOf(isString), isArrayOf(isNumber), isArrayOf(isBoolean), isNull])
  })
}

// PairioJobRequiredResources
export type PairioJobRequiredResources = {
  numCpus: number
  numGpus: number
  memoryGb: number
  timeSec: number
}

export const isPairioJobRequiredResources = (x: any): x is PairioJobRequiredResources => {
  return validateObject(x, {
    numCpus: isNumber,
    numGpus: isNumber,
    memoryGb: isNumber,
    timeSec: isNumber
  })
}

// PairioJobSecret
export type PairioJobSecret = {
  name: string
  value: string
}

export const isPairioJobSecret = (x: any): x is PairioJobSecret => {
  return validateObject(x, {
    name: isString,
    value: isString
  })
}

// PairioJobStatus
export type PairioJobStatus = 'pending' | 'starting' | 'running' | 'completed' | 'failed'

export const isPairioJobStatus = (x: any): x is PairioJobStatus => {
  return validateObject(x, {
    status: isOneOf(['pending', 'starting', 'running', 'completed', 'failed'].map(isEqualTo))
  })
}

// PairioJobDefinition
export type PairioJobDefinition = {
  appName: string
  processorName: string
  inputFiles: PairioJobInputFile[]
  outputFiles: PairioJobOutputFile[]
  parameters: PairioJobParameter[]
}

export const isPairioJobDefinition = (x: any): x is PairioJobDefinition => {
  return validateObject(x, {
    appName: isString,
    processorName: isString,
    inputFiles: isArrayOf(isPairioJobInputFile),
    outputFiles: isArrayOf(isPairioJobOutputFile),
    parameters: isArrayOf(isPairioJobParameter)
  })
}

// PairioJob
export type PairioJob = {
  jobId: string
  jobPrivateKey: string | null
  serviceName: string
  userId: string
  batchId: string
  projectName: string
  jobDefinition: PairioJobDefinition
  jobDefinitionHash: string
  requiredResources: PairioJobRequiredResources
  secrets: PairioJobSecret[] | null
  inputFileUrls: string[]
  outputFileUrls: string[]
  consoleOutputUrl: string
  resourceUtilizationLogUrl: string
  timestampCreatedSec: number
  timestampStartedSec: number | null
  timestampFinishedSec: number | null
  canceled: boolean
  status: PairioJobStatus
  error: string | null
  computeClientId: string | null
  computeSlot: ServiceComputeClientComputeSlot | null
  imageUri: string | null
}

export const isPairioJob = (x: any): x is PairioJob => {
  return validateObject(x, {
    jobId: isString,
    jobPrivateKey: isOneOf([isString, isNull]),
    serviceName: isString,
    userId: isString,
    batchId: isString,
    projectName: isString,
    jobDefinition: isPairioJobDefinition,
    jobDefinitionHash: isString,
    requiredResources: isPairioJobRequiredResources,
    secrets: isOneOf([isArrayOf(isPairioJobSecret), isNull]),
    inputFileUrls: isArrayOf(isString),
    outputFileUrls: isArrayOf(isString),
    consoleOutputUrl: isString,
    resourceUtilizationLogUrl: isString,
    timestampCreatedSec: isNumber,
    timestampStartedSec: isOneOf([isNumber, isNull]),
    timestampFinishedSec: isOneOf([isNumber, isNull]),
    canceled: isBoolean,
    status: isPairioJobStatus,
    error: isOneOf([isString, isNull]),
    computeClientId: isOneOf([isString, isNull]),
    computeSlot: isOneOf([isServiceComputeClientComputeSlot, isNull]),
    imageUri: isOneOf([isString, isNull])
  })
}

// PairioAppProcessorInputFile
export type PairioAppProcessorInputFile = {
  name: string
  description: string
}

export const isPairioAppProcessorInputFile = (x: any): x is PairioAppProcessorInputFile => {
  return validateObject(x, {
    name: isString,
    description: isString
  })
}

// PairioAppProcessorOutputFile
export type PairioAppProcessorOutputFile = {
  name: string
  description: string
}

export const isPairioAppProcessorOutputFile = (x: any): x is PairioAppProcessorOutputFile => {
  return validateObject(x, {
    name: isString,
    description: isString
  })
}

// PairioAppProcessorParameterTypes
export type PairioAppProcessorParameterTypes = 'str' | 'int' | 'float' | 'bool' | 'List[str]' | 'List[int]' | 'List[float]' | 'Optional[str]' | 'Optional[int]' | 'Optional[float]' | 'Optional[bool]'

export const isPairioAppProcessorParameterTypes = (x: any): x is PairioAppProcessorParameterTypes => {
  return validateObject(x, {
    type: isOneOf(['str', 'int', 'float', 'bool', 'List[str]', 'List[int]', 'List[float]', 'Optional[str]', 'Optional[int]', 'Optional[float]', 'Optional[bool]'].map(isEqualTo))
  })
}

// PairioAppProcessorParameter
export type PairioAppProcessorParameter = {
  name: string
  type: PairioAppProcessorParameterTypes
  description: string
  defaultValue: string | number | boolean | string[] | number[] | undefined
}

export const isPairioAppProcessorParameter = (x: any): x is PairioAppProcessorParameter => {
  return validateObject(x, {
    name: isString,
    type: isPairioAppProcessorParameterTypes,
    description: isString,
    defaultValue: isOneOf([isString, isNumber, isBoolean, isArrayOf(isString), isArrayOf(isNumber), isNull])
  })
}

// ServiceComputeClientComputeSlot
export type ServiceComputeClientComputeSlot = {
  computeSlotId: string
  numCpus: number
  numGpus: number
  memoryGb: number
  timeSec: number
  minNumCpus: number
  minNumGpus: number
  minMemoryGb: number
  minTimeSec: number
  multiplicity: number | null
}

export const isServiceComputeClientComputeSlot = (x: any): x is ServiceComputeClientComputeSlot => {
  return validateObject(x, {
    computeSlotId: isString,
    numCpus: isNumber,
    numGpus: isNumber,
    memoryGb: isNumber,
    timeSec: isNumber,
    minNumCpus: isNumber,
    minNumGpus: isNumber,
    minMemoryGb: isNumber,
    minTimeSec: isNumber,
    multiplicity: isOneOf([isNumber, isNull])
  })
}

// PairioUser
export type PairioUser = {
  userId: string
  name: string
  email: string
  apiKey: string | null
}

export const isPairioUser = (x: any): x is PairioUser => {
  return validateObject(x, {
    userId: isString,
    name: isString,
    email: isString,
    apiKey: isOneOf([isString, isNull])
  })
}

// addUser
export type AddUserRequest = {
  type: 'addUserRequest'
  user: PairioUser
}

export const isAddUserRequest = (x: any): x is AddUserRequest => {
  return validateObject(x, {
    type: isEqualTo('addUserRequest'),
    user: isPairioUser
  })
}

export type AddUserResponse = {
  type: 'addUserResponse'
}

export const isAddUserResponse = (x: any): x is AddUserResponse => {
  return validateObject(x, {
    type: isEqualTo('addUserResponse')
  })
}

// resetUserApiKey
export type ResetUserApiKeyRequest = {
  type: 'resetUserApiKeyRequest'
  userId: string
}

export const isResetUserApiKeyRequest = (x: any): x is ResetUserApiKeyRequest => {
  return validateObject(x, {
    type: isEqualTo('resetUserApiKeyRequest'),
    userId: isString
  })
}

export type ResetUserApiKeyResponse = {
  type: 'resetUserApiKeyResponse'
  apiKey: string
}

export const isResetUserApiKeyResponse = (x: any): x is ResetUserApiKeyResponse => {
  return validateObject(x, {
    type: isEqualTo('resetUserApiKeyResponse'),
    apiKey: isString
  })
}

// setUserInfo
export type SetUserInfoRequest = {
  type: 'setUserInfoRequest'
  userId: string
  name?: string
  email?: string
}

export const isSetUserInfoRequest = (x: any): x is SetUserInfoRequest => {
  return validateObject(x, {
    type: isEqualTo('setUserInfoRequest'),
    userId: isString,
    name: optional(isString),
    email: optional(isString)
  })
}

export type SetUserInfoResponse = {
  type: 'setUserInfoResponse'
}

export const isSetUserInfoResponse = (x: any): x is SetUserInfoResponse => {
  return validateObject(x, {
    type: isEqualTo('setUserInfoResponse')
  })
}

// createJob
export type CreateJobRequest = {
  type: 'createJobRequest'
  serviceName: string
  userId: string
  batchId: string
  projectName: string
  jobDefinition: PairioJobDefinition
  requiredResources: PairioJobRequiredResources
  secrets: PairioJobSecret[]
}

export const isCreateJobRequest = (x: any): x is CreateJobRequest => {
  return validateObject(x, {
    type: isEqualTo('createJobRequest'),
    serviceName: isString,
    userId: isString,
    batchId: isString,
    projectName: isString,
    jobDefinition: isPairioJobDefinition,
    requiredResources: isPairioJobRequiredResources,
    secrets: isArrayOf(isPairioJobSecret)
  })
}

export type CreateJobResponse = {
  type: 'createJobResponse'
  jobId: string
}

export const isCreateJobResponse = (x: any): x is CreateJobResponse => {
  return validateObject(x, {
    type: isEqualTo('createJobResponse'),
    jobId: isString
  })
}

// getJobs
export type GetJobsRequest = {
  type: 'getJobsRequest'
  userId?: string
  jobId?: string
  processorName?: string
  computeClientId?: string
  batchId?: string
  projectName?: string
  serviceName?: string
  appName?: string
  inputFileUrl?: string
  outputFileUrl?: string
  status?: PairioJobStatus | PairioJobStatus[]
}

export const isGetJobsRequest = (x: any): x is GetJobsRequest => {
  return validateObject(x, {
    type: isEqualTo('getJobsRequest'),
    userId: optional(isString),
    jobId: optional(isString),
    processorName: optional(isString),
    computeClientId: optional(isString),
    batchId: optional(isString),
    projectName: optional(isString),
    serviceName: optional(isString),
    appName: optional(isString),
    inputFileUrl: optional(isString),
    outputFileUrl: optional(isString),
    status: optional(isOneOf([isPairioJobStatus, isArrayOf(isPairioJobStatus)])),
  })
}

export type GetJobsResponse = {
  type: 'getJobsResponse'
  jobs: PairioJob[]
}

export const isGetJobsResponse = (x: any): x is GetJobsResponse => {
  return validateObject(x, {
    type: isEqualTo('getJobsResponse'),
    jobs: isArrayOf(isPairioJob)
  })
}

// getJob
export type GetJobRequest = {
  type: 'getJobRequest'
  jobId: string
  includePrivateKey: boolean
  computeClientId?: string
}

export const isGetJobRequest = (x: any): x is GetJobRequest => {
  return validateObject(x, {
    type: isEqualTo('getJobRequest'),
    jobId: isString,
    includePrivateKey: isBoolean,
    computeClientId: optional(isString)
  })
}

export type GetJobResponse = {
  type: 'getJobResponse'
  job: PairioJob
}

export const isGetJobResponse = (x: any): x is GetJobResponse => {
  return validateObject(x, {
    type: isEqualTo('getJobResponse'),
    job: isPairioJob
  })
}

// cancelJob
export type CancelJobRequest = {
  type: 'cancelJobRequest'
  jobId: string
}

export const isCancelJobRequest = (x: any): x is CancelJobRequest => {
  return validateObject(x, {
    type: isEqualTo('cancelJobRequest'),
    jobId: isString
  })
}

export type CancelJobResponse = {
  type: 'cancelJobResponse'
}

export const isCancelJobResponse = (x: any): x is CancelJobResponse => {
  return validateObject(x, {
    type: isEqualTo('cancelJobResponse')
  })
}

// setJobStatus
export type SetJobStatusRequest = {
  type: 'setJobStatusRequest'
  jobId: string
  computeClientId: string
  status: PairioJobStatus
  error?: string
}

export const isSetJobStatusRequest = (x: any): x is SetJobStatusRequest => {
  return validateObject(x, {
    type: isEqualTo('setJobStatusRequest'),
    jobId: isString,
    computeClientId: isString,
    status: isPairioJobStatus,
    error: optional(isString)
  })
}

export type SetJobStatusResponse = {
  type: 'setJobStatusResponse'
}

export const isSetJobStatusResponse = (x: any): x is SetJobStatusResponse => {
  return validateObject(x, {
    type: isEqualTo('setJobStatusResponse')
  })
}

// getSignedUploadUrl
export type GetSignedUploadUrlRequest = {
  type: 'getSignedUploadUrlRequest'
  jobId: string
  url: string
  size: number
}

export const isGetSignedUploadUrlRequest = (x: any): x is GetSignedUploadUrlRequest => {
  return validateObject(x, {
    type: isEqualTo('getSignedUploadUrlRequest'),
    jobId: isString,
    url: isString,
    size: isNumber
  })
}

export type GetSignedUploadUrlResponse = {
  type: 'getSignedUploadUrlResponse'
  signedUrl: string
}

export const isGetSignedUploadUrlResponse = (x: any): x is GetSignedUploadUrlResponse => {
  return validateObject(x, {
    type: isEqualTo('getSignedUploadUrlResponse'),
    signedUrl: isString
  })
}

// createServiceComputeClient
export type CreateServiceComputeClientRequest = {
  type: 'createServiceComputeClientRequest'
  serviceName: string
  userId: string
}

export const isCreateServiceComputeClientRequest = (x: any): x is CreateServiceComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('createServiceComputeClientRequest'),
    serviceName: isString,
    userId: isString
  })
}

export type CreateServiceComputeClientResponse = {
  type: 'createServiceComputeClientResponse'
  computeClientId: string
  computeClientPrivateKey: string
}

export const isCreateServiceComputeClientResponse = (x: any): x is CreateServiceComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('createServiceComputeClientResponse'),
    computeClientId: isString,
    computeClientPrivateKey: isString
  })
}

// deleteServiceComputeClient
export type DeleteServiceComputeClientRequest = {
  type: 'deleteServiceComputeClientRequest'
  computeClientId: string
}

export const isDeleteServiceComputeClientRequest = (x: any): x is DeleteServiceComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('deleteServiceComputeClientRequest'),
    computeClientId: isString
  })
}

export type DeleteServiceComputeClientResponse = {
  type: 'deleteServiceComputeClientResponse'
}

export const isDeleteComputeClientResponse = (x: any): x is DeleteServiceComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('deleteServiceComputeClientResponse')
  })
}

// getServiceComputeClient
export type GetServiceComputeClientRequest = {
  type: 'getServiceComputeClientRequest'
  computeClientId: string
}

export const isGetServiceComputeClientRequest = (x: any): x is GetServiceComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('getServiceComputeClientRequest'),
    computeClientId: isString
  })
}

export type GetServiceComputeClientResponse = {
  type: 'getServiceComputeClientResponse'
  computeClient: PairioServiceComputeClient
}

export const isGetServiceComputeClientResponse = (x: any): x is GetServiceComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('getServiceComputeClientResponse'),
    computeClient: isPairioServiceComputeClient
  })
}

// getServiceComputeClients
export type GetServiceComputeClientsRequest = {
  type: 'getServiceComputeClientsRequest'
  userId?: string
  serviceName?: string
}

export const isGetServiceComputeClientsRequest = (x: any): x is GetServiceComputeClientsRequest => {
  return validateObject(x, {
    type: isEqualTo('getServiceComputeClientsRequest'),
    userId: optional(isString),
    serviceName: optional(isString)
  })
}

export type GetServiceComputeClientsResponse = {
  type: 'getServiceComputeClientsResponse'
  computeClients: PairioServiceComputeClient[]
}

export const isGetServiceComputeClientsResponse = (x: any): x is GetServiceComputeClientsResponse => {
  return validateObject(x, {
    type: isEqualTo('getServiceComputeClientsResponse'),
    computeClients: isArrayOf(isPairioServiceComputeClient)
  })
}

// addServiceApp
export type AddServiceAppRequest = {
  type: 'addServiceAppRequest'
  app: PairioServiceApp
}

export const isAddServiceAppRequest = (x: any): x is AddServiceAppRequest => {
  return validateObject(x, {
    type: isEqualTo('addServiceAppRequest'),
    app: isPairioServiceApp
  })
}

export type AddServiceAppResponse = {
  type: 'addServiceAppResponse'
}

export const isAddServiceAppResponse = (x: any): x is AddServiceAppResponse => {
  return validateObject(x, {
    type: isEqualTo('addServiceAppResponse')
  })
}

// setServiceAppInfo
export type SetServiceAppInfoRequest = {
  type: 'setServiceAppInfoRequest'
  serviceName: string
  appName: string
  description?: string
  appSpecificationUri?: string
  appSpecificationCommit?: string
  processors?: PairioAppProcessor[]
}

export const isSetServiceAppInfoRequest = (x: any): x is SetServiceAppInfoRequest => {
  return validateObject(x, {
    type: isEqualTo('setServiceAppInfoRequest'),
    serviceName: isString,
    appName: isString,
    description: optional(isString),
    appSpecificationUri: optional(isString),
    appSpecificationCommit: optional(isString),
    processors: optional(isArrayOf(isPairioAppProcessor))
  })
}

export type SetServiceAppInfoResponse = {
  type: 'setServiceAppInfoResponse'
}

export const isSetAppInfoResponse = (x: any): x is SetServiceAppInfoResponse => {
  return validateObject(x, {
    type: isEqualTo('setServiceAppInfoResponse')
  })
}

// getServiceApp
export type GetServiceAppRequest = {
  type: 'getServiceAppRequest'
  serviceName: string
  appName: string
}

export const isGetServiceAppRequest = (x: any): x is GetServiceAppRequest => {
  return validateObject(x, {
    type: isEqualTo('getServiceAppRequest'),
    serviceName: isString,
    appName: isString
  })
}

export type GetServiceAppResponse = {
  type: 'getServiceAppResponse'
  app: PairioServiceApp
}

export const isGetServiceAppResponse = (x: any): x is GetServiceAppResponse => {
  return validateObject(x, {
    type: isEqualTo('getServiceAppResponse'),
    app: isPairioServiceApp
  })
}

// deleteApp
export type DeleteServiceAppRequest = {
  type: 'deleteServiceAppRequest'
  serviceName: string
  appName: string
}

export const isDeleteServiceAppRequest = (x: any): x is DeleteServiceAppRequest => {
  return validateObject(x, {
    type: isEqualTo('deleteServiceAppRequest'),
    serviceName: isString,
    appName: isString
  })
}

export type DeleteServiceAppResponse = {
  type: 'deleteServiceAppResponse'
}

export const isDeleteServiceAppResponse = (x: any): x is DeleteServiceAppResponse => {
  return validateObject(x, {
    type: isEqualTo('deleteServiceAppResponse')
  })
}

// getServiceApps
export type GetServiceAppsRequest = {
  type: 'getServiceAppsRequest'
  appName?: string
  serviceName?: string
}

export const isGetServiceAppsRequest = (x: any): x is GetServiceAppsRequest => {
  return validateObject(x, {
    type: isEqualTo('getServiceAppsRequest'),
    appName: optional(isString),
    serviceName: optional(isString)
  })
}

export type GetServiceAppsResponse = {
  type: 'getServiceAppsResponse'
  apps: PairioServiceApp[]
}

export const isGetServiceAppsResponse = (x: any): x is GetServiceAppsResponse => {
  return validateObject(x, {
    type: isEqualTo('getAppsResponse'),
    apps: isArrayOf(isPairioServiceApp)
  })
}