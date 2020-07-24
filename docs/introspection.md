
# Overview

When an OAuth 2.0 client makes a request to the resource server, the resource server needs 
some way to verify the access token. The OAuth 2.0 core spec doesn’t define a specific 
method of how the resource server should verify access tokens, just mentions that it requires 
coordination between the resource and authorization servers. In some cases, especially with 
small services, both endpoints are part of the same system, and can share token information 
internally such as in a database. In larger systems where the two endpoints are on different 
servers, this has led to proprietary and non-standard protocols for communicating between the 
two servers.

The OAuth 2.0 Token Introspection extension defines a protocol that returns information about an 
access token, intended to be used by resource servers or other internal servers.

# Token introspection endpoint

The token introspection endpoint needs to be able to return information about a token, so you will 
most likely build it in the same place that the token endpoint lives. The two endpoints need to 
either share a database, or if you have implemented self-encoded tokens, they will need to share 
the secret.

# Token introspection request

The request will be a POST request containing just a parameter named “token”. It is expected that 
this endpoint is not made publicly available to developers. End-user clients should not be allowed 
to use this endpoint since the response may contain privileged information that developers should 
not have access to. One way to protect the endpoint is to put it on an internal server that is not 
accessible from the outside world, or it could be protected with HTTP basic auth.

# Security consideration

Using a token introspection endpoint means that any resource server will be relying on the endpoint 
to determine whether an access token is currently active or not. This means the introspection endpoint 
is solely responsible for deciding whether API requests will succeed. As such, the endpoint must 
perform all applicable checks against a token’s state, such as checking whether the token has expired, 
verifying signatures, etc.

# Token fishing

If the introspection endpoint is left open and un-throttled, it presents a means for an attacker to 
poll the endpoint fishing for a valid token. To prevent this, the server must either require authentication 
of the clients using the endpoint, or only make the endpoint available to internal servers through 
other means such as a firewall.

Note that the resources servers are also a potential target of a fishing attack, and should take 
countermeasures such as rate limiting to prevent this.

