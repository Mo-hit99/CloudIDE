# Simple test container for the Cloud IDE
FROM ubuntu:22.04

# Install basic tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    nano \
    git \
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-11-jdk \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Create some sample files
RUN echo 'print("Hello from Python!")' > hello.py
RUN echo 'console.log("Hello from Node.js!");' > hello.js
RUN echo 'public class Hello { public static void main(String[] args) { System.out.println("Hello from Java!"); } }' > Hello.java

# Create a sample project structure
RUN mkdir -p src/main/java src/test/java
RUN echo 'public class Main { public static void main(String[] args) { System.out.println("Welcome to Cloud IDE!"); } }' > src/main/java/Main.java

# Keep container running
CMD ["tail", "-f", "/dev/null"]
