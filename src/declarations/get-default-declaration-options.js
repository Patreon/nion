import ApiManager from '../api'

const getDefaultDeclarationOptions = () => ({
    // Component / API Lifecycle methods
    fetchOnInit: false, // Should the component load the data when a new dataKey is created?
    fetchOnce: true, // Should the component only load the data once when dataKey is created?

    // Manual ref initialization, for parent/child data management relationships
    initialRef: null,

    // Specify the endpoint used to fetch API data
    endpoint: undefined,

    // Compose basic actions and add handy custom meta values
    extensions: {},

    // Specify the API used to request and parse API data
    apiType: ApiManager.getDefaultApi(),

    // Set custom request parameters
    requestParams: {},
})

export default getDefaultDeclarationOptions
