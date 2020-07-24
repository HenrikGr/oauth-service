# Overview


# Background
In the traditional client-server authentication model, the client
requests an access-restricted resource (protected resource) on the
server by authenticating with the server using the resource owner's
credentials.  In order to provide third-party applications access to
restricted resources, the resource owner shares its credentials with
the third party.  This creates several problems and limitations:
- Third-party applications are required to store the resource
owner's credentials for future use, typically a password in
clear-text.

- Servers are required to support password authentication, despite
the security weaknesses inherent in passwords.

- Third-party applications gain overly broad access to the resource
owner's protected resources, leaving resource owners without any
ability to restrict duration or access to a limited subset of
resources.

- Resource owners cannot revoke access to an individual third party
without revoking access to all third parties, and must do so by
changing the third party's password.

- Compromise of any third-party application results in compromise of
the end-user's password and all of the data protected by that
password.

OAuth addresses these issues by introducing an authorization layer
and separating the role of the client from that of the resource
owner.  In OAuth, the client requests access to resources controlled
by the resource owner and hosted by the resource server, and is
issued a different set of credentials than those of the resource
owner.

Instead of using the resource owner's credentials to access protected
resources, the client obtains an access token -- a string denoting a
specific scope, lifetime, and other access attributes.  Access tokens
are issued to third-party clients by an authorization server with the
approval of the resource owner.  The client uses the access token to
access the protected resources hosted by the resource server.

For example, an end-user (resource owner) can grant a printing
service (client) access to her protected photos stored at a photo-
sharing service (resource server), without sharing her username and
password with the printing service.  Instead, she authenticates
directly with a server trusted by the photo-sharing service
(authorization server), which issues the printing service delegation-
specific credentials (access token).

More information: [The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)

# Roles
OAuth defines four roles:

## Resource owner

An entity capable of granting access to a protected resource.
When the resource owner is a person, it is referred to as an
end user.

## Resource server

The server hosting the protected resources, capable of accepting
and responding to protected resource requests using access tokens.

## client

An application making protected resource requests on behalf of the
resource owner and with its authorization.  The term "client" does
not imply any particular implementation characteristics (e.g.,
whether the application executes on a server, a desktop, or other
devices).

## Authorization server

The server issuing access tokens to the client after successfully
authenticating the resource owner and obtaining authorization.

The interaction between the authorization server and resource server
is beyond the scope of this specification.  The authorization server
may be the same server as the resource server or a separate entity.
A single authorization server may issue access tokens accepted by
multiple resource servers.

# @hgc-ab/oauth-service features
The server has implemented the following standard 
- [The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [The OAuth 2.0 Authorization Framework: Bearer Token Usage specification](https://tools.ietf.org/html/rfc6750)
- [OAuth 2.0 Token Introspection](https://tools.ietf.org/html/rfc7662)
