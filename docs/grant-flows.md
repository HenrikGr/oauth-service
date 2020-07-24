# The OAuth 2 Service

The @hgc-ab/oauth-service supports the authorization grants;
- authorization code, 
- implicit grant,
- resource owner password credentials,
- refresh token credentials, and
- client credentials.  

The authorization grant you should use depends on the type of the application you are registering 
which can be one of the following;

- confidential clients
  - Clients capable of maintaining the confidentiality of their credentials (e.g., client implemented 
  on a secure server with restricted access to the client credentials), or capable of secure client 
  authentication using other means.
- public
  - Clients incapable of maintaining the confidentiality of their credentials (e.g., clients executing 
  on the device used by the resource owner, such as an installed native application or a web browser-
  based application), and incapable of secure client authentication via any other means.

See: [Register a client]() for more information.

# The Oauth 2 service endpoints

The @hgc-ab/oauth-service utilizes authorization server endpoints:

- Authorization endpoint, used by the client to obtain authorization grant from the resource owner.
- Token endpoint, used by the client to exchange an authorization grant for an access token, typically 
together with client authentication.
- Redirection endpoint - used by the authorization server to return responses containing authorization 
grant to the client via the resource owner user-agent.

>Not every authorization grant type utilizes both endpoints.
>Extension grant types MAY define additional endpoints as needed.


## Authorization endpoint

The authorization endpoint obtains an authorization grant by interact with the resource owner. 

> An authorization grant is a credential representing the resource
owner's authorization (to access its protected resources) used by the
client to obtain access token.

The authorization server verifies the identity of the resource owner and issue an authorization 
grant to the client. 

The authorization grants the authorization endpoint supports are, authorization code and token 
via an implicit grant and is identified via the response type request parameter as 'code' or 'token'.

After completing its interaction with the resource owner - verification of the resource owner - the 
authorization server directs the resource owner's user-agent back to the client. The authorization 
server redirects the user-agent to the client's redirection endpoint previously established with 
the authorization server during the client registration process or when making the authorization 
request.

The authorization and token endpoints allow the client to specify the scope of the access request 
using the "scope" request parameter. In turn, the authorization server uses the "scope" response 
parameter to inform the client of the scope of the access token issued.
   
To use the authorization endpoint, we need to verify the resource owner, instruct what authorization 
grant we want via the response type, send a client id to let the authorization server validate the 
client registered redirect uri and the scope.  

## Verification of the resource owner

The authorization server supports several methods to perform the verification of the resource owner:

- The OAuth 2.0 Authorization Framework: Bearer Token Usage specification  
[RFC3750](https://tools.ietf.org/html/rfc6750) that describes how to use bearer tokens in HTTP requests 
to access OAuth 2.0 protected resources. This is the built in default options.
- Custom authentication handler implementation. TODO: Describe custom authentication separately.

The Oauth2 2.0 Authorization Framework, supports three different methods of verification, 
1. the Authorization request header, is the recommended method, 
2. the form embedded body parameters, and, 
3. the uri query param method, is by default disabled by the authorization server. 

Example of verification of the resource owner using Authorization request header with Bearer token:

    GET /resource HTTP/1.1
    Host: server.example.com
    Authorization: Bearer mF_9.B5f-4.1JqM

Example of verification of the resource owner using form encoded body parameters.

    POST /resource HTTP/1.1
    Host: server.example.com
    Content-Type: application/x-www-form-urlencoded
 
    access_token=mF_9.B5f-4.1JqM

The "application/x-www-form-urlencoded" method SHOULD NOT be used except in application contexts 
where participating browsers do not have access to the "Authorization" request header field.

Example of verification of the resource owner using URI Query parameter:

    GET /resource?access_token=mF_9.B5f-4.1JqM HTTP/1.1
    Host: server.example.com

Because of the security weaknesses associated with the URI method, including the high likelihood that 
the URL containing the access token will be logged, it SHOULD NOT be used unless it is impossible to 
transport the access token in the "Authorization" request header, or the HTTP request entity-body.

## Token endpoint

To request an access token from the token endpoint, the client obtains authorization from the resource owner. 
The authorization from the resource owner is expressed as grants as described xxxx. 

It also provides an extension mechanism for defining additional grant types.

The token endpoints allow the client to specify the scope of the access request using the "scope" 
request parameter. In turn, the authorization server uses the "scope" response parameter to inform 
the client of the scope of the access token issued.



# Oauth 2 data access model
Each grant flow invoke different functions in the model.

## Request password grant
- getClient,
- getUser,
- validate scope
- saveToken

## Request refresh_token grant
- getClient
- getRefreshToken
- revokeToken
- saveToken

## Request client_credentials grant
- getClient,
- getUserFromClient,
- validateScope,
- saveToken

## Request authorization_code grant with code response
- authenticate user
  - getAccessToken
- validate client
  - getClient
  - validateScope
  
- getClient,
- getUserFromClient,
- validateScope,
- saveToken
