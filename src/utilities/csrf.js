import fetch from 'isomorphic-fetch'
import { wwwURL } from './json-api-url'

// We'll need to stub out our full url when existing outside of a browser (ie during our node / jest
// tests).
const REL_PATH = '/REST/auth/CSRFTicket'
export const CSRF_PATH = wwwURL(REL_PATH)

export const createHeaders = (uri, time, signature) => ({
    'X-CSRF-URI': uri,
    'X-CSRF-TIME': time,
    'X-CSRF-Signature': signature,
})

export const fetchCsrfTicket = uri => {
    if (typeof uri === 'undefined') {
        throw 'Must provide a uri path for CSRF Ticket request.'
    }

    return fetch(wwwURL(REL_PATH, { uri }), { credentials: 'include' })
        .then(res => res.json())
        .catch(err => {
            throw err
        })
}

// tokens expire after 2 hours, but we refresh every 1.5 just to be on the safe side
export const ONE_AND_HALF_HOUR = 5400000
export const ticketTimeExpired = (now, ticketTime) => {
    return now - ticketTime > ONE_AND_HALF_HOUR
}

let _csrfHeaders
let _lastTicketTime

export const csrfTicketIsValid = (headers, lastTicketTime) =>
    headers && !ticketTimeExpired(Date.now(), lastTicketTime)
// We have all CSRF tickets granted for /, so we don't check for exact path matching
// && headers['X-CSRF-URI'] === window.location.pathname

export const getCsrfHeaders = (force = false) => {
    if (csrfTicketIsValid(_csrfHeaders, _lastTicketTime) && !force) {
        return Promise.resolve(_csrfHeaders)
    }

    /*
     * We want all CSRF tickets to be granted for site-wide usage.
     * We used to use window.location.pathname here, but we got into the following situation:
     *   1. GET ticket api call for path X
     *   2. navigation changes URL path to Y without reload
     *   3. GET call comes back with ticket granted for X
     *   4. POST is made with ticket for X but referer is Y
     *   5. CSRF invalid error :(
     *
     * We are not particularly worried about ticket re-use,
     * because tickets expire after two hours,
     * and can only be stolen via MITM anyway, which is a far more serious vulnerability
     */
    return fetchCsrfTicket('/').then(ticket => {
        _lastTicketTime = parseInt(ticket.time, 10)
        _csrfHeaders = createHeaders(ticket.URI, ticket.time, ticket.token)

        return _csrfHeaders
    })
}
