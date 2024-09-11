# How to Set Up Angular Proxy

In this article, I'll demonstrate how to start a mock back-end server called **hotelapi** and run my Angular app named **hotelinventoryapp** to test setting angular proxy.

I'll set up a hotelapi service locally, and then set up another local service that proxy the request to the hotelapi service.

The hotelapi service will be hosted at port 3000, and the proxy service will be hosted at port 4200

Here is the link to the project of [hotelapi service](https://github.com/santoshyadavdev/hotelapi)

Here is the link to the project of [proxy service](https://github.com/xiaolitongxue666/angular_toturial)

## hotelapi

### Starting the Mock Back-End Server

In `main.ts`, we can find that the server is set to run on port 3000:

```ts
import { NestFactory } from '@nestjs/core';  
import { AppModule } from './app.module';  
  
async function bootstrap() {  
  const app = await NestFactory.create(AppModule);  
  await app.listen(3000);  
}  
bootstrap();
```

In `rooms.controller.ts`, you can find the API path:

```ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('api/Rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
```

### Starting the Server

```shell
cd hotelapi
npm start
```

### Testing with curl command `curl http://localhost:3000/api/Rooms`

You can use the following `curl` command to test the `/api/Rooms` endpoint:

```shell
$ curl http://localhost:3000/api/Rooms

[{"roomNumber":"1","roomType":"Deluxe Room","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":500,"photos":"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=cro  p&w=800&q=60","checkinTime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":4.5},{"roomNumber":"2","roomType":"Deluxe Room","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":1000,"photos":"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",":48 checkinTime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":3.45654},{"roomNumber":"3","roomType":"Private Suite","amenities":"Air Conditioner, Free Wi-Fi, TV, Bathroom, Kitchen","price":15000,"photos":"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60","checkinTime":"2021-11-10T16:00:00.000Z","checkoutTime":"2021-11-11T16:00:00.000Z","rating":2.6}]
```

This should return a JSON response with room details, ensuring the server is running properly.

## hotelinventoryapp

### Configuring the Angular Proxy

#### Step 1: Create `proxy.conf.json` in the `/src` directory

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

#### Step 2: Modify `angular.json`

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

#### Step 3: Restart the Angular App

My angular app's address is `Local:   http://localhost:4200/`

```shell
ng serve
```

### Issues Encountered

When I referred to the Angular official documentation, I found the following proxy configuration:

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

The configuration differs slightly from the one that worked for me. In particular:

```json
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
```

Let’s explore what these settings mean:

- **`changeOrigin`**: This determines whether the request's `Origin` header should be modified to the address of the proxy server.
- **`pathRewrite`**: This defines how the request path is rewritten. Here, it removes the `/api` prefix from the request.

With the working configuration, the correct request URL is `http://localhost:3000/api/Rooms`. However, when using the alternative configuration, the request is sent to `http://localhost:3000/Rooms`, which results in a 404 error.

## Sending Requests in Angular using HttpClient

### Step 1: Add `provideHttpClient` to `app.config.ts`

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

### Step 2: Import `appConfig` in `main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### Step 3: Test the HttpClient Module in `app.component.ts`

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
    this.subscription = this.fetchData().subscribe(
      (data) => {
        this.data = data;
        console.log('Data acquired:', this.data); 
      },
      (error) => {
        console.error('Request error:', error);
        // Handle the error and notify the user
      },
      () => {
        console.log('Request completed');
      }
    );
  }

  fetchData(): Observable<any> {
    return this.http.get('/api/Rooms/').pipe(timeout(8000));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

This is the code that will call the `hotelapi` and return the response acting as a proxy.

```ts
this.http.get('/api/Rooms/').pipe(timeout(8000));
```


### Step 4: Refresh the Web Page and Check the Response

The data returned should be the same as the result from the  command.

## Checking the Effect of the `changeOrigin` Option

Let’s compare requests when `changeOrigin` is set to `true` and `false`:

With **`changeOrigin: true`**:

```http
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
```

With **`changeOrigin: false`**:

```http
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

As you can see, after the `changeOrigin` option is set to `true`, 
then the response header now contains the item `Access-Control-Allow-Origin: *` .

```http
Access-Control-Allow-Origin: *
```

From these requests, it seems like there’s no noticeable difference in behavior between `true` and `false` in this case.

