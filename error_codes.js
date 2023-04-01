/*------------------------------------------------------------------------------------------------ 
            mysql 8.0  error codes ranges
--------------------------------------------------------------------------------------------------
1       to   999    : Global error codes
1,000   to  1,999   : Server error codes reserved for messages sent to clients
2,000   to  2,999   : Client error codes reserved for use by the client library
3,000   to  4,999   : Server error codes reserved for messages sent to clients
5,000   to  5,999   : Error codes reserved for use by X Plugin for messages sent to clients.
10,000  to  49,999  : Server error codes reserved for messages to be written to the error log (not sent to clients)
50,000  to  51,999  : Error codes reserved for use by third parties.
--------------------------------------------------------------------------------------------------*/

export const INVALID_OP_VERSION                = "invalid opcode version"
export const INVALID_FM                        = "invalid facility module"
export const INVALID_OP                        = "invalid opcode"
export const INVALID_LATEST_OP_VERSION         = "only latest version of the opcode can be updated"
export const INVALID_OP_OR_VERSION             = "there is no opcode present in with that name & version"
export const EMPTY_EMAIL                       = "empty value provided for email address"
export const EMPTY_USER_ID                     = "empty value provided for user_id"
export const EMPTY_PASSWORD                    = "empty value provided for password"
export const EMPTY_ROLE                        = "empty value provided for user role"
export const IN_USE_EMAIL                      = "email address is already in use"
export const IN_USE_USER_ID                    = "user_id already taken"
export const NO_PROJECTS_PROVIDED              = "no projects provided"
export const INVALID_USER_ID                   = "invalid user_id"
export const INVALID_PASSWORD                  = "invalid password"
export const AUTH_TOKEN_EXPIRED                = "authentication token expired"
export const AUTH_TOKEN_INVALID                = "invalid authentication token"

export const error_codes_map = new Map(
    [
        [INVALID_OP_VERSION,        60000],
        [INVALID_FM,                60001],
        [INVALID_OP,                60002],
        [INVALID_LATEST_OP_VERSION, 60003],
        [INVALID_OP_OR_VERSION,     60004],
        [EMPTY_EMAIL,               60005],
        [EMPTY_USER_ID,             60006],
        [EMPTY_PASSWORD,            60007],
        [EMPTY_ROLE,                60008],
        [IN_USE_EMAIL,              60009],
        [IN_USE_USER_ID,            60010],
        [NO_PROJECTS_PROVIDED,      60011],
        [INVALID_USER_ID,           60012],
        [INVALID_PASSWORD,          60013],

        // special error codes 
        [AUTH_TOKEN_EXPIRED,        -1   ],
        [AUTH_TOKEN_INVALID,        -2   ]
    ]
)