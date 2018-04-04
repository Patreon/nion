'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDefaultDeclarationOptions = function getDefaultDeclarationOptions() {
    return {
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
        apiType: _api2.default.getDefaultApi(),

        // Set custom request parameters
        requestParams: {}
    };
};

exports.default = getDefaultDeclarationOptions;
module.exports = exports['default'];