# @hgc-ab/oauth-service

[![version](https://img.shields.io/npm/v/@hgc-ab/oauth-service.svg?style=flat-square)](http://npm.im/@hgc-ab/oauth-service)
[![downloads](https://img.shields.io/npm/dm/@hgc-ab/oauth-service.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@hgc-ab/oauth-service&from=2020-07-11)
[![MIT License](https://img.shields.io/npm/l/@hgc-ab/oauth-service.svg?style=flat-square)](http://opensource.org/licenses/MIT)

Oauth 2 Library for Node.js

## Usage

Install

```shell script
npm i @hgc-ab/oauth-service
```

## Config

This library used @hgc-ab/debug-service package for debug statements and if you want enabled it
use .env files to set environment variables as below.

```shell script
# Set any value to enforce debugging
DEBUG="@hgc-ab/oauth-service:*"

```
Note: .env files requires that you load them as early in your code as possible, see example below.

```javascript
// Load env variables early
require('dotenv').config()

const Server = require('@hgc-ab/oauth-service')
const { Request, Response } = Server
// Your data model API
const model = {}

// Your new created Oauth 2 Server instance
const oAuth2Server = new Server(model)
```

## Features

The @hgc-ab/oauth-service utilizes authorization server endpoints:

- Authorization endpoint, used by the client to obtain authorization grant from the resource owner.
- Token endpoint, used by the client to exchange an authorization grant for an access token, typically 
together with client authentication.
- Redirection endpoint - used by the authorization server to return responses containing authorization 
grant to the client via the resource owner user-agent.

For more information; 
- [Overview](https://github.com/HenrikGr/oauth-service/blob/master/docs/overview.md)
- [Grant Flows](https://github.com/HenrikGr/oauth-service/blob/master/docs/grant-flows.md)

## License
MIT
