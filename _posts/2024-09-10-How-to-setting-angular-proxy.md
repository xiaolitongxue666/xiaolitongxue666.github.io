# How to setting angular proxy 

## Build a local server 

```shell
$ curl http://localhost:3000/api/Rooms                                                                    
[{"roomNumber":"1","roomType":"Deluxe Room","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":500,"phot

os":"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=cro

p&w=800&q=60","checkinTime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":4.5},{"roomNumber":"

2","roomType":"Deluxe Room","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":1000,"photos":"https://im

ages.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60","

checkinTime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":3.45654},{"roomNumber":"3","roomTyp

e":"Private Suite","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":15000,"photos":"https://images.uns

plash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60","checkinT

ime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":2.6}]
```

Make sure my server works fine.

## Config angular proxy

### Create a new file `proxy.conf.json` at /src path

proxy.conf.json
```json
{  
  "/api": {  
    "target": "http://localhost:3000",  
    "secure": false,  
    "changeOrigin": true,  
    "pathRewrite": {  
      "^/api": "/api"  
    }  
  }  
}
```

### Modify angullar.json

```json
"serve": {  
  "builder": "@angular-devkit/build-angular:dev-server",  
  "configurations": {  
    "production": {  
      "buildTarget": "hotelinventoryapp:build:production"  
    },  
    "development": {  
      "buildTarget": "hotelinventoryapp:build:development",  
      "proxyConfig": "src/proxy.conf.json"  
    }  
  },  
  "defaultConfiguration": "development"  
},
```

### Restart angular app

```shell
ng serve
```

## Problems encountered during the process

When i read angular official document i see those config 

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

there are two line different with uppon config that can work 

```json
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
```

let us explpore the meaning of it 

- **`changeOrigin`**: Whether to modify the request's `Origin` header information to the address of the proxy server. 
- **`pathRewrite`**: Path rewriting rules. Here, the `/api` prefix is ​​removed from the request path. 

The right request url is `http://localhost:3000/api/Rooms`
when i use the last config file , the real url is `http://localhost:3000/Rooms`

That's why when i use the 'wrong' proxy config response is 404











