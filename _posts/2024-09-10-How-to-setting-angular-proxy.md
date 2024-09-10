# How to setting angular proxy 

## Build a local server 

repo : https://github.com/santoshyadavdev/hotelapi

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

Use curl request /api/Rooms

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






