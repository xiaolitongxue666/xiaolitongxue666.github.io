---
layout: default
title: "Get ffmpeg input bitrate"
date: 2024-08-22 12:00:00 +0800
categories: [FFmpeg]
tags: [ffmpeg, bash, bitrate]
---

#ffmpeg #bash 

monitor_bitrate.sh

```bash
#!/bin/bash  
  
if [ -z "$1" ] || [ -z "$2" ]; then  
  echo "Usage: $0 <port> <source_ip>"  exit 1  
fi  
  
PORT=$1  
SOURCE_IP=$2  
NUM_SAMPLES=5  
INTERVAL=1  
TIMEOUT=10  
  
sudo timeout $TIMEOUT tcpdump -i any udp port "$PORT" and src "$SOURCE_IP" -n -l -q | awk -v num_samples="$NUM_SAMPLES" -v interval="$INTERVAL" '  
/length/ {  
  sum += $NF;}  
{  
  current_time = systime();  if (start_time == 0) {    start_time = current_time;  }  if (current_time - start_time >= interval) {    print (sum * 8 / 1000000) / interval " Mbps";    sum = 0;    start_time = current_time;    count++;    if (count >= num_samples) {      exit;    }  }}  
END {  
  if (sum > 0) {    print (sum * 8 / 1000000) / interval " Mbps (last interval)";  }}' | awk '  
{  
  total += $1;  count++;}  
END {  
  if (count > 0) {    print "Average Bitrate: " total / count " Mbps";  } else {    print "No data collected.";  }}'
```

get_average_bitrate.c
```c
// get_average_bitrate.c  
  
#include "get_average_bitrate.h"  
#include <stdio.h>  
#include <stdlib.h>  
#include <pthread.h>  
#include <string.h>  
  
// Define the global variable  
double global_bitrate = 0.0;  
  
// Function executed by the thread  
void *run_bitrate_script(void *arg) {  
    char *command = (char *)arg;  
    char buffer[128];  
    FILE *pipe;  
  
    // Open the pipe to run the script  
    pipe = popen(command, "r");  
    if (pipe == NULL) {  
        perror("popen failed");  
        return NULL;  
    }  
  
    // Read the output from the script and parse the bitrate  
    while (fgets(buffer, sizeof(buffer), pipe) != NULL) {  
        if (sscanf(buffer, "Average Bitrate: %lf", &global_bitrate) == 1) {  
            // Successfully parsed the bitrate  
            break;  
        }  
    }  
  
    pclose(pipe);  
    return NULL;  
}  
  
// Function to start bitrate calculation asynchronously  
void calculate_bitrate_async(const char *port, const char *source_ip) {  
    pthread_t thread;  
    char command[256];  
  
    // Construct the command string with the port and source IP  
    snprintf(command, sizeof(command),  
             "./monitor_bitrate.sh %s %s", port, source_ip);  
  
    // Create a new thread to run the script  
    if (pthread_create(&thread, NULL, run_bitrate_script, (void *)command) != 0) {  
        perror("pthread_create failed");  
        return;  
    }  
  
    // Detach the thread so that it cleans up automatically  
    pthread_detach(thread);  
}
```

get_average_bitrate.h
```c
// get_average_bitrate.h  
  
#ifndef GET_AVERAGE_BITRATE_H  
#define GET_AVERAGE_BITRATE_H  
  
// Declare the global variable for storing bitrate  
extern double global_bitrate;  
  
// Function to start bitrate calculation asynchronously  
void calculate_bitrate_async(const char *port, const char *source_ip);  
  
#endif // GET_AVERAGE_BITRATE_H
```

main.c
```c
// main.c  
  
#include "get_average_bitrate.h"  
#include <stdio.h>  
#include <stdlib.h>  
#include <unistd.h>  
  
int main(int argc, char *argv[]) {  
    if (argc != 3) {  
        fprintf(stderr, "Usage: %s <port> <source_ip>\n", argv[0]);  
        return 1;  
    }  
  
    const char *port = argv[1];  
    const char *source_ip = argv[2];  
  
    // Start calculating the bitrate in a separate thread  
    calculate_bitrate_async(port, source_ip);  
  
    // Continue doing other work here...  
    // The global_bitrate will be updated once the script finishes  
    // For demonstration purposes, let's wait a bit to check the result    sleep(5); // Adjust this if needed  
  
    // Print the result    printf("Average Bitrate: %.2f Mbps\n", global_bitrate);  
  
    return 0;  
}
```

```shell
CC = gcc  
CFLAGS = -Wall -pthread  
  
all: main  
  
main: main.o get_average_bitrate.o  
    $(CC) $(CFLAGS) -o main main.o get_average_bitrate.o  
  
main.o: main.c get_average_bitrate.h  
    $(CC) $(CFLAGS) -c main.c  
  
get_average_bitrate.o: get_average_bitrate.c get_average_bitrate.h  
    $(CC) $(CFLAGS) -c get_average_bitrate.c  
  
clean:  
    rm -f *.o main
```

how to use it 
```shell
// Compiler  
make  
  
// Change permission to execute the script  
chmod +x monitor_bitrate.sh  
  
// Run the script to monitor the bitrate of a specific source IP address  
./main 7000 192.168.10.214
```
