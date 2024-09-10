# How to setting angular proxy 

In the article i will star a mock back-end server name as hotelapi,
then i run my own angular app name as hotelinventoryapp.

Github Repo : https://github.com/xiaolitongxue666/angular_toturial

# hotelapi

## Star the mock back0-end server

From main.ts find server port is 3000
```ts
import { NestFactory } from '@nestjs/core';  
import { AppModule } from './app.module';  
  
async function bootstrap() {  
  const app = await NestFactory.create(AppModule);  
  await app.listen(3000);  
}  
bootstrap();
```

From rooms.controller.ts find path

```ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('api/Rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
```

Star the server

```shell
cd hotelapi
npm start
```

Use curl request /api/Rooms for test

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

# hotelinventoryapp

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

### Modify angular.json

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

**let us explpore the meaning of it** 

- **`changeOrigin`**: Whether to modify the request's `Origin` header information to the address of the proxy server. 
- **`pathRewrite`**: Path rewriting rules. Here, the `/api` prefix is ​​removed from the request path. 

The right request url is `http://localhost:3000/api/Rooms`
when i use the last config file , the real url is `http://localhost:3000/Rooms`

That's why when i use the 'wrong' proxy config response is 404

## Angular use http clinet send request

### app.config.ts add `provideHttpClient`

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};

```

### Import `appConfig` in `main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### Test http clinet module in `app.componet.ts`

```ts
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

export class AppComponent implements AfterViewInit, OnInit {
  data: any; 
  subscription: Subscription;

  constructor(private http: HttpClient) {
    this.subscription = Subscription.EMPTY;
  }

  ngOnInit(): void {
    // 在 ngOnInit 中订阅 fetchData()
    this.subscription = this.fetchData().subscribe(
      (data) => {
        this.data = data;
        console.log('Data acquired：', this.data); 
      },
      (error) => {
        console.error('Request error：', error);
        // Provide feedback to the user
      },
      () => {
        console.log('Request finish');
      }
    );
  }

  fetchData(): Observable<any> {
    // return this.http.get('https://jsonplaceholder.typicode.com/todos/1').pipe(timeout(8000));
    // return this.http.get('http://localhost:3000/api/Rooms/').pipe(timeout(8000));
    return this.http.get('/api/Rooms/').pipe(timeout(8000));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
```

### Refresh web and check the response

```json
[
    {
        "roomNumber": "1",
        "roomType": "Deluxe Room",
        "amenities": "Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen",
        "price": 500,
        "photos": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "checkinTime": "2021-11-10T16:00:00.000Z",
        "checkoutTime": "2021-11-11T16:00:00.000Z",
        "rating": 4.5
    },
    {
        "roomNumber": "2",
        "roomType": "Deluxe Room",
        "amenities": "Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen",
        "price": 1000,
        "photos": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "checkinTime": "2021-11-10T16:00:00.000Z",
        "checkoutTime": "2021-11-11T16:00:00.000Z",
        "rating": 3.45654
    },
    {
        "roomNumber": "3",
        "roomType": "Private Suite",
        "amenities": "Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen",
        "price": 15000,
        "photos": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "checkinTime": "2021-11-10T16:00:00.000Z",
        "checkoutTime": "2021-11-11T16:00:00.000Z",
        "rating": 2.6
    }
]
```

Same with curl command show 

## Check the `changeOrigin` option true/off diff

```
changeOrigin": true

Request:

GET /api/Rooms/ HTTP/1.1
Accept: application/json, text/plain, */*
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6
Connection: keep-alive
Cookie: Webstorm-f4a2e6a2=cf65e7fa-9dd7-4865-9caa-386479425f76; Webstorm-f4a2e6a3=ee523027-a855-4c05-87d8-f089113f2165; Webstorm-f4a2ea62=db0ee3b0-fe32-4d16-9649-a9054ad94bd1
Host: localhost:4200
If-None-Match: W/"448-8jQzp84V7yAC14xZPDuGE0UOZdU"
Referer: http://localhost:4200/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36
sec-ch-ua: "Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"


Response:

HTTP/1.1 304 Not Modified
Access-Control-Allow-Origin: *
x-powered-by: Express
etag: W/"448-8jQzp84V7yAC14xZPDuGE0UOZdU"
date: Tue, 10 Sep 2024 13:59:26 GMT
connection: close

changeOrigin": false

Request:

GET /api/Rooms/ HTTP/1.1
Accept: application/json, text/plain, */*
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6
Connection: keep-alive
Cookie: Webstorm-f4a2e6a2=cf65e7fa-9dd7-4865-9caa-386479425f76; Webstorm-f4a2e6a3=ee523027-a855-4c05-87d8-f089113f2165; Webstorm-f4a2ea62=db0ee3b0-fe32-4d16-9649-a9054ad94bd1
Host: localhost:4200
If-None-Match: W/"448-8jQzp84V7yAC14xZPDuGE0UOZdU"
Referer: http://localhost:4200/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36
sec-ch-ua: "Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"

Response: 

HTTP/1.1 304 Not Modified
Access-Control-Allow-Origin: *
x-powered-by: Express
etag: W/"448-8jQzp84V7yAC14xZPDuGE0UOZdU"
date: Tue, 10 Sep 2024 14:01:20 GMT
connection: close

```

Seems no difference





