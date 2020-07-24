# Terminology
- Access token 
  - A token used to access protected resources.
- Authorization credential (code)
  - An intermediary credential generated when a user authorizes a client to access protected resources 
  on their behalf.
  - The client receives this credential and exchanges it for an access token.
- Authorization server
  - A server which issues access tokens after successfully authenticating a client and resource
 owner, and authorizing the request.
- Client
  - An application which accesses protected resources on behalf of the resource owner (such as a user).
  - The client could be hosted on a server, desktop, mobile or other device.
- Authorization Grant
  - A grant is a method/flow of acquiring an access token.
- Resource server
  - A server which sits in front of protected resources (for example “tweets”, users’ photos, or personal data) 
  and is capable of accepting and responsing to protected resource requests using access tokens.
- Resource owner
  - The user who authorizes an application to access their account.
  - The application’s access to the user’s account is limited to the "scope” of the authorization granted (e.g. read or write access).
- Scope
  - A permission.
- JWT
  - A JSON Web Token is a method for representing claims securely between two parties as defined in RFC 7519.

# Client types

OAuth 2 Authorization Framework defines two client types, based on their ability to authenticate securely with 
the authorization server:

- confidential clients
  - Clients capable of maintaining the confidentiality of their credentials (e.g., client implemented on a secure 
server with restricted access to the client credentials), or capable of secure client authentication using 
other means.
- public
  - Clients incapable of maintaining the confidentiality of their credentials (e.g., clients executing on the 
  device used by the resource owner, such as an installed native application or a web browser-based application), 
  and incapable of secure client authentication via any other means.

# Client profiles

- web application
  - A web application is a confidential client running on a web server.  Resource owners access the client via an 
  HTML user interface rendered in a user-agent on the device used by the resource owner. The client credentials 
  as well as any access token issued to the client are stored on the web server and are not exposed to or 
  accessible by the resource owner.
- user-agent-based application
  - A user-agent-based application is a public client in which the client code is downloaded from a web server 
  and executes within a user-agent (e.g., web browser) on the device used by the resource owner.  Protocol data 
  and credentials are easily accessible (and often visible) to the resource owner. Since such applications reside 
  within the user-agent, they can make seamless use of the user-agent capabilities when requesting authorization.
- native application
  - A native application is a public client installed and executed on the device used by the resource owner.
  Protocol data and credentials are accessible to the resource owner. It is assumed that any client authentication 
  credentials included in the application can be extracted. On the other hand, dynamically issued credentials such 
  as access tokens or refresh tokens can receive an acceptable level of protection. At a minimum, these credentials
  are protected from hostile servers with which the application may interact. On some platforms, these credentials
  might be protected from other applications residing on the same device.



# Which grant should be used?
