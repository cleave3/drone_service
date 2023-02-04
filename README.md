# Drone Service

## API Docs

 View API documentation here <a href="https://documenter.getpostman.com/view/6495351/2s8YzXuKX1">https://documenter.getpostman.com/view/6495351/2s8YzXuKX1</a>

## Set up Project

1. Install Dependencies
    Run ```npm install``` to install

2. Setup project DB and run migration

    - In project root directory, create a ```.env``` file and add the content below

        ```env
        DATABASE_URL="file:./drones.db"
        ```

3. Running test ```npm run test```
4. Running App

    - For dev mode run ```npm run dev```
    - For prod mode run ```npm run start```
