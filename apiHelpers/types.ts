/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArrayOf, isBoolean, isEqualTo, isNull, isNumber, isOneOf, isString, optional, validateObject } from "@fi-sci/misc";

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

export type PairioJobStatus = 'pending' | 'running' | 'completed' | 'failed'

export const isPairioJobStatus = (x: any): x is PairioJobStatus => {
  return validateObject(x, {
    status: isOneOf(['pending', 'running', 'completed', 'failed'].map(isEqualTo))
  })
}

export type PairioJob = {
  // creation
  jobId: string
  jobPrivateKey: string | null
  userId: string
  batchId: string
  projectName: string
  appName: string
  processorName: string
  inputFiles: PairioJobInputFile[]
  outputFiles: PairioJobOutputFile[]
  parameters: PairioJobParameter[]
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
  computeSlot: ComputeClientComputeSlot | null
  imageUri: string | null
}

export const isPairioJob = (x: any): x is PairioJob => {
  return validateObject(x, {
    jobId: isString,
    jobPrivateKey: isOneOf([isString, isNull]),
    userId: isString,
    batchId: isString,
    projectName: isString,
    appName: isString,
    processorName: isString,
    inputFiles: isArrayOf(isPairioJobInputFile),
    outputFiles: isArrayOf(isPairioJobOutputFile),
    parameters: isArrayOf(isPairioJobParameter),
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
    computeSlot: isOneOf([isComputeClientComputeSlot, isNull]),
    imageUri: isOneOf([isString, isNull])
  })
}

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

export type PairioAppProcessorParameterTypes = 'str' | 'int' | 'float' | 'bool' | 'List[str]' | 'List[int]' | 'List[float]' | 'Optional[str]' | 'Optional[int]' | 'Optional[float]' | 'Optional[bool]'

export const isPairioAppProcessorParameterTypes = (x: any): x is PairioAppProcessorParameterTypes => {
  return validateObject(x, {
    type: isOneOf(['str', 'int', 'float', 'bool', 'List[str]', 'List[int]', 'List[float]', 'Optional[str]', 'Optional[int]', 'Optional[float]', 'Optional[bool]'].map(isEqualTo))
  })
}

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

export type PairioAppProcessor = {
  processorName: string
  description: string
  image: string
  inputFiles: PairioAppProcessorInputFile[]
  outputFiles: PairioAppProcessorOutputFile[]
  parameters: PairioAppProcessorParameter[]
}

export const isPairioAppProcessor = (x: any): x is PairioAppProcessor => {
  return validateObject(x, {
    processorName: isString,
    description: isString,
    image: isString,
    inputFiles: isArrayOf(isPairioAppProcessorInputFile),
    outputFiles: isArrayOf(isPairioAppProcessorOutputFile),
    parameters: isArrayOf(isPairioAppProcessorParameter)
  })
}

export type PairioApp = {
  userId: string
  appName: string
  description: string
  processors: PairioAppProcessor[]
  jobCreateUsers: string[]
  jobProcessUsers: string[]
}

export const isPairioApp = (x: any): x is PairioApp => {
  return validateObject(x, {
    userId: isString,
    appName: isString,
    description: isString,
    processors: isArrayOf(isPairioAppProcessor),
    jobCreateUsers: isArrayOf(isString),
    jobProcessUsers: isArrayOf(isString)
  })
}

export type ComputeClientComputeSlot = {
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

export const isComputeClientComputeSlot = (x: any): x is ComputeClientComputeSlot => {
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

export type ComputeClient = {
  computeClientId: string
  computeClientPrivateKey: string | null
  userId: string
  name: string
  description: string
  appsToProcess: string[]
  computeSlots: ComputeClientComputeSlot[]
}

export const isComputeClient = (x: any): x is ComputeClient => {
  return validateObject(x, {
    computeClientId: isString,
    computeClientPrivateKey: isOneOf([isString, isNull]),
    userId: isString,
    name: isString,
    description: isString,
    appsToProcess: isArrayOf(isString),
    computeSlots: isArrayOf(isComputeClientComputeSlot)
  })
}

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

// createJob
export type CreateJobRequest = {
  type: 'createJobRequest'
  userId: string
  batchId: string
  projectName: string
  appName: string
  processorName: string
  inputFiles: PairioJobInputFile[]
  outputFiles: PairioJobOutputFile[]
  parameters: PairioJobParameter[]
  requiredResources: PairioJobRequiredResources
  secrets: PairioJobSecret[]
}

export const isCreateJobRequest = (x: any): x is CreateJobRequest => {
  return validateObject(x, {
    type: isEqualTo('createJobRequest'),
    userId: isString,
    batchId: isString,
    projectName: isString,
    appName: isString,
    processorName: isString,
    inputFiles: isArrayOf(isPairioJobInputFile),
    outputFiles: isArrayOf(isPairioJobOutputFile),
    parameters: isArrayOf(isPairioJobParameter),
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

// createComputeClient
export type CreateComputeClientRequest = {
  type: 'createComputeClientRequest'
  computeClient: ComputeClient // computeClientId should be empty string and computeClientPrivateKey should be null
}

export const isCreateComputeClientRequest = (x: any): x is CreateComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('createComputeClientRequest'),
    computeClient: isComputeClient
  })
}

export type CreateComputeClientResponse = {
  type: 'createComputeClientResponse'
  computeClientId: string
  computeClientPrivateKey: string
}

export const isCreateComputeClientResponse = (x: any): x is CreateComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('createComputeClientResponse'),
    computeClientId: isString,
    computeClientPrivateKey: isString
  })
}

// deleteComputeClient
export type DeleteComputeClientRequest = {
  type: 'deleteComputeClientRequest'
  computeClientId: string
}

export const isDeleteComputeClientRequest = (x: any): x is DeleteComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('deleteComputeClientRequest'),
    computeClientId: isString
  })
}

export type DeleteComputeClientResponse = {
  type: 'deleteComputeClientResponse'
}

export const isDeleteComputeClientResponse = (x: any): x is DeleteComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('deleteComputeClientResponse')
  })
}

// getComputeClient
export type GetComputeClientRequest = {
  type: 'getComputeClientRequest'
  computeClientId: string
}

export const isGetComputeClientRequest = (x: any): x is GetComputeClientRequest => {
  return validateObject(x, {
    type: isEqualTo('getComputeClientRequest'),
    computeClientId: isString
  })
}

export type GetComputeClientResponse = {
  type: 'getComputeClientResponse'
  computeClient: ComputeClient
}

export const isGetComputeClientResponse = (x: any): x is GetComputeClientResponse => {
  return validateObject(x, {
    type: isEqualTo('getComputeClientResponse'),
    computeClient: isComputeClient
  })
}

// getComputeClients
export type GetComputeClientsRequest = {
  type: 'getComputeClientsRequest'
  userId?: string
}

export const isGetComputeClientsRequest = (x: any): x is GetComputeClientsRequest => {
  return validateObject(x, {
    type: isEqualTo('getComputeClientsRequest'),
    userId: optional(isString)
  })
}

export type GetComputeClientsResponse = {
  type: 'getComputeClientsResponse'
  computeClients: ComputeClient[]
}

export const isGetComputeClientsResponse = (x: any): x is GetComputeClientsResponse => {
  return validateObject(x, {
    type: isEqualTo('getComputeClientsResponse'),
    computeClients: isArrayOf(isComputeClient)
  })
}

// addApp
export type AddAppRequest = {
  type: 'addAppRequest'
  app: PairioApp
}

export const isAddAppRequest = (x: any): x is AddAppRequest => {
  return validateObject(x, {
    type: isEqualTo('addAppRequest'),
    app: isPairioApp
  })
}

export type AddAppResponse = {
  type: 'addAppResponse'
}

export const isAddAppResponse = (x: any): x is AddAppResponse => {
  return validateObject(x, {
    type: isEqualTo('addAppResponse')
  })
}

// setAppInfo
export type SetAppInfoRequest = {
  type: 'setAppInfoRequest'
  appName: string
  description?: string
  jobCreateUsers?: string[]
  jobProcessUsers?: string[]
}

export const isSetAppInfoRequest = (x: any): x is SetAppInfoRequest => {
  return validateObject(x, {
    type: isEqualTo('setAppInfoRequest'),
    appName: isString,
    description: optional(isString),
    jobCreateUsers: optional(isArrayOf(isString)),
    jobProcessUsers: optional(isArrayOf(isString))
  })
}

export type SetAppInfoResponse = {
  type: 'setAppInfoResponse'
}

export const isSetAppInfoResponse = (x: any): x is SetAppInfoResponse => {
  return validateObject(x, {
    type: isEqualTo('setAppInfoResponse')
  })
}

// getApp
export type GetAppRequest = {
  type: 'getAppRequest'
  appName: string
}

export const isGetAppRequest = (x: any): x is GetAppRequest => {
  return validateObject(x, {
    type: isEqualTo('getAppRequest'),
    appName: isString
  })
}

export type GetAppResponse = {
  type: 'getAppResponse'
  app: PairioApp
}

export const isGetAppResponse = (x: any): x is GetAppResponse => {
  return validateObject(x, {
    type: isEqualTo('getAppResponse'),
    app: isPairioApp
  })
}

// deleteApp
export type DeleteAppRequest = {
  type: 'deleteAppRequest'
  appName: string
}

export const isDeleteAppRequest = (x: any): x is DeleteAppRequest => {
  return validateObject(x, {
    type: isEqualTo('deleteAppRequest'),
    appName: isString
  })
}

export type DeleteAppResponse = {
  type: 'deleteAppResponse'
}

export const isDeleteAppResponse = (x: any): x is DeleteAppResponse => {
  return validateObject(x, {
    type: isEqualTo('deleteAppResponse')
  })
}

// getApps
export type GetAppsRequest = {
  type: 'getAppsRequest'
  userId?: string
}

export const isGetAppsRequest = (x: any): x is GetAppsRequest => {
  return validateObject(x, {
    type: isEqualTo('getAppsRequest'),
    userId: optional(isString)
  })
}

export type GetAppsResponse = {
  type: 'getAppsResponse'
  apps: PairioApp[]
}

export const isGetAppsResponse = (x: any): x is GetAppsResponse => {
  return validateObject(x, {
    type: isEqualTo('getAppsResponse'),
    apps: isArrayOf(isPairioApp)
  })
}