To organize your code into separate files, you can follow these steps:

1. **Create Header File (`bitrate.h`):**
   - Declare the functions and constants used in `bitrate.c`.

2. **Create Source File (`bitrate.c`):**
   - Implement the functions defined in `bitrate.h`.

3. **Modify `main.c`:**
   - Include the header file and call the functions as needed.

### 1. `bitrate.h`

```c
#ifndef BITRATE_H
#define BITRATE_H

#define MAX_TRANSCODE_ENTRY_COUNT 10  // Adjust this value as needed

// Function declarations
char *strrstr(const char *haystack, const char *needle);
double extract_bitrate(const char *line);
double process_bitrate(int param);

#endif // BITRATE_H
```

### 2. `bitrate.c`

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "bitrate.h"

// Custom function to find the last occurrence of a substring
char *strrstr(const char *haystack, const char *needle) {
    char *result = NULL;
    char *p = strstr(haystack, needle);
    while (p != NULL) {
        result = p;
        p = strstr(p + 1, needle);
    }
    return result;
}

// Function to extract the last occurrence of bitrate from a line
double extract_bitrate(const char *line) {
    const char *bitrate_str = "bitrate=";
    char *pos = strrstr(line, bitrate_str); // Find the last occurrence of "bitrate="
    if (pos != NULL) {
        pos += strlen(bitrate_str);
        char *end;
        double bitrate = strtod(pos, &end);
        return bitrate;
    }
    return 0.0;
}

// Static array for frame numbers
static int last_frame[MAX_TRANSCODE_ENTRY_COUNT] = {0};  

double process_bitrate(int param) {
    double last_bitrate = 0.0;

    // Construct command to execute the shell script with the given parameter
    char command[100];
    sprintf(command, "/tmp/get_ffmpeg_module_output_bitrate.sh %d", param);

    int result = system(command);

    if (result == 0) {
        // Construct the output file name based on the input parameter
        char output_file[20];
        sprintf(output_file, "/tmp/output_%03d.txt", param);

        // Open the output file
        FILE *fp = fopen(output_file, "r");
        if (fp == NULL) {
            perror("fopen");
            return 0.0;  // Return 0.0 in case of failure to open file
        }

        // Get the file size
        fseek(fp, 0L, SEEK_END);
        long file_size = ftell(fp);
        rewind(fp);

        // Allocate memory to read the file contents
        char *buffer = malloc(file_size + 1);
        if (buffer == NULL) {
            perror("malloc");
            fclose(fp);
            return 0.0;  // Return 0.0 in case of memory allocation failure
        }

        // Read the file contents into the buffer
        size_t bytes_read = fread(buffer, 1, file_size, fp);

        // Null-terminate the buffer
        buffer[file_size] = '\0';

        // Extract and print the last line's bitrate value
        if (bytes_read == file_size) {
            // Find the last non-empty line
            char *last_line = strrchr(buffer, '\n');
            while (last_line != NULL && *(last_line + 1) == '\0') {
                *last_line = '\0'; // Temporarily null-terminate here to find the previous newline
                last_line = strrchr(buffer, '\n');
            }
            if (last_line != NULL) {
                last_line++; // Move past the newline character
            } else {
                last_line = buffer; // Only one line in the file
            }

            // Check if frame number has changed
            int current_frame = extract_bitrate(last_line); // Assuming the frame number is part of the extracted bitrate
            if (current_frame != last_frame[param]) {
                last_bitrate = extract_bitrate(last_line);
                last_frame[param] = current_frame; // Update the frame number
                printf("Index=%d Frame=%d Bitrate=%.1f kbits/s\n", param, current_frame, last_bitrate);
            } else {
                last_bitrate = 0.0;
                printf("Index %d, Frame %d: Bitrate is 0.0 as frame number has not changed\n", param, current_frame);
            }
        } else {
            fprintf(stderr, "Error reading file. Expected %ld bytes but got %zu bytes.\n", file_size, bytes_read);
        }

        // Free allocated memory
        free(buffer);
        // Close the file
        fclose(fp);
    } else {
        printf("Script execution failed\n");
    }

    return last_bitrate;
}
```

### 3. `main.c`

```c
#include <stdio.h>
#include "bitrate.h"

int main() {
    int param = 1;  // Example parameter
    double bitrate = process_bitrate(param);
    printf("Bitrate for parameter %d: %.1f kbits/s\n", param, bitrate);
    return 0;
}
```

### 4. `Makefile`

Here’s a simple `Makefile` to build your project:

```Makefile
CC = gcc
CFLAGS = -Wall -g
OBJ = main.o bitrate.o
TARGET = bitrate_app

all: $(TARGET)

$(TARGET): $(OBJ)
    $(CC) $(CFLAGS) -o $(TARGET) $(OBJ)

main.o: main.c bitrate.h
    $(CC) $(CFLAGS) -c main.c

bitrate.o: bitrate.c bitrate.h
    $(CC) $(CFLAGS) -c bitrate.c

clean:
    rm -f $(TARGET) $(OBJ)
```

### Summary:
- **Header File (`bitrate.h`):** Declares functions and constants.
- **Source File (`bitrate.c`):** Implements the functions.
- **Main File (`main.c`):** Uses the functions from `bitrate.c`.
- **Makefile:** Builds the project.

This structure helps in managing and organizing the code effectively.
