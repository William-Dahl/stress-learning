# Elearning Platform for HCI Experimentation

This repo contains the elearning platform built for Wiliam Dahl's thesis. It was used by Maliha Mian to conduct a masters study of stress on learning.

**The following tech stack is used:**

-   **Backend + CMS** - TypeScript Payload, see documentation for payload [here](https://payloadcms.com/docs/getting-started/what-is-payload), creates an Express.js API with a CMS accessable at the /admin route
-   **Frontend** - Next.js with some pages using Typescript , see documentation for Next.js [here](https://nextjs.org/docs)
-   **Database** - MongoDB, see documentation for MondoDB [here](https://www.mongodb.com/docs/)

## What is each file for?

The backend and frontend have been compiled into one directory. An overview of what each file/folder does is as follows:

-   `/collections` - The data model of the API / CMS / Database. With Payload you declare each database table (collection) with a Typescript object. It's super easy to get the hang of.
-   `/components` - The React components used in the frontend.
-   `/DatabaseSetup` - Contains the data and script you use to setup your copy of the MongoDB database in the setup guide (see below)
-   `/pages` - The pages of the frontend. Next.js defines the page urls based on the folder and file names. The pages on the appliation are:
    -   The landing page - allows a user to start an experiment with additional links to the CMS and the analytics section
    -   /analytics - Includes a landing page for the analytics section with a page for individual user analysis and another for group comparison. The `processGroupData` page is used to process the data, storing the outcome in the database, which is then used by the group-comparison page.
    -   /module - The module pages are the pages of the eLearning platform used during an experiment. These are dynamically created dependant on the ID of the page, which corresponds to a specific question ID in the database.
    -   endScreen - This is the page shown to the participant when the experiment is completed
-   `/PhysiologicalData` - This folder contains the CSV's of Physiological data (ECG and GSR) used in analysis. These files are very large and are therefore not stored by Git
-   `/public` - contains images used on the frontend
-   `/styles` - some global styles for the frontend
-   `/utils` - utility functions, within this file the `serverUtils.ts` file includes functions that can only be used during server side calculation i.e run by Node.js. If you try to run these functions in the brower it will error.
-   `payloag.config.ts` - This file is where the collections are all added to be used by payload.
-   `server.ts` - This file is executed to run the backend and frontend at the same time. If you want to change this in the future to only run the backend, then you will need to remove all Next.js related functions.

The rest of the files are config files for things like Git, prettier (formatting), typescirpt, next.js, tailwind, ESLint (linting) and package management. I have used Yarn for this project.

## Setup guide

Here is a step-by-step guide for how to use this repo:

All of this is convered in [this walkthrough video](), with an application walkthrough. I would highly recommend watching it as it covers each step in detail.

1. Clone the repo using `git clone https://github.com/William-Dahl/stress-learning.git <YOUR_PROJECT_NAME>` (If you want all of my commits to be compiled into one commit in your new repository add the `--depth=1` flag to the command)
1. Run `cp .env.example .env` to create an `.env` file
1. Fill out your `.env` file with values that describe your environment
1. Run `yarn` or `npm install`
1. Create a mongoDB database and add your database access string (URI) to the env file. [Here is the link to creating a MongoDB database](https://www.mongodb.com/basics/create-database).
1. Run `yarn dev` to open a development environment - this will initialise the database.
1. Download the MongoDB database tools from [this link](https://www.mongodb.com/try/download/database-tools). This will allow you to execute the mongoimport command which is used in the script in the following step to fill the database with data. You will need to be able to run `mongoimport` in the terminal for this to work which requires adding the MongoDB install binaries to the path (see video for details)
1. Run `cd DatabaseSetup` to navigate into the database setup folder and then run `./import_data.sh "<YOUR DATABASE CONNECTION STRING>"` to import the data into your database - **Note** if you are on a mac then you must first run `chmod +x import_data.sh` to allow the script to be executable.
1. Download the Physiological data from [this OneDrive Link](https://1drv.ms/f/s!ArOMikbw7oa1hg6iCBCtiHFF2I4X?e=u7NMm6) and move the contents into the PhysiologicalData folder - this will allow you to see the analysis working on previous experiments.
1. Go to [http://localhost:3000](http://localhost:3000), you will need to set up an admin account at the [http://localhost:3000/admin](http://localhost:3000/admin) link before you can use the content management system.
