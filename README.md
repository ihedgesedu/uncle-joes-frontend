# Uncle Joe's Coffee Company - Frontend Web App

 This is the frontend repository for the Uncle Joe's Coffee Company project for MGMT 545. The overall goal is to build a modern web application pilot so customers can actually interact with the shop online, rather than just looking at the old static site. 

Right now, this repo is pretty barebones since we are still in active development and figuring out the structure. 

---

## Project Overview

Corporate wants to test this pilot internally before rolling it out to their 500 locations.  The main idea is to let customers browse the full menu, log in to their Coffee Club accounts, review past orders, and check their accumulated points. 

For this project, our primary focus is just information retrieval. That means making sure we can successfully pull and display data about locations, menu items, members, and order history. If we get ahead of schedule, we might try to add a feature to place an order online and pay at the store, but we are absolutely not touching actual payment processing.

## Tech Stack & Requirements

* **Framework:** We are using Vue.JS.  This is a strict requirement for the project, so it is non-negotiable.
* **Backend Connection:** All data will be fetched from our team's deployed FastAPI backend, so no hardcoding data in the frontend.
* **API Configuration:** We don't have the live backend URL prepared just yet.  For now, there is a placeholder variable for the base URL in the code that we will update later.
*  **Deployment:** The final version needs to be deployed to Cloud Run and accessible via a public HTTPS URL.

## Pages to Build

We have two main pages mapped out so far that need to be built:

*  **Locations Page:** This will hit the `GET /locations` endpoint.  It needs to display the city, state, address, and hours for each store, and it has to be filterable or organized so it's actually useful.
*  **Menu Page:** This will hit the `GET /menu` endpoint.  It needs to show the item name, category, size, calories, and price.  We'll need to group the items by category to make browsing easier.

## Design Guidelines

*  **Responsive:** The site has to work on both PC and mobile devices.  For mobile, we need to implement either a hamburger menu or a taskbar at the bottom of the screen.
* **Color Scheme:** Stick to a coffee shop theme.  Main colors should be mocha/latte, white, and black. 
*  **No Gradients:** Keep the design flat; do not use gradients.
