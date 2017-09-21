# Lense

This project is created by a team of four including [Liang-Hsuan](https://github.com/Liang-Hsuan), [David](https://github.com/DavidisMe), [Daniel](https://github.com/danblitzhou) and [Adam](https://github.com/adamyy). It is our submission to Hack the North 2017.

## Inspiration
We all love the brighter side of the internet, but sometimes we see disturbing contents such as violent, horrifying, or NSFW images. These contents do damage to our souls and we hate them with passion, so much so that we made **Lense**, an application that helps you stay away from these content.

## What it does
Lense is an application that classifies and filters images in the web pages that you are browsing. It uses machine learning for image classification. However, instead of collecting a huge training dataset ourselves, we decided to let the users feed themselves: Users can report images as inappropriate content, and Lense learns from their feedback and becomes increasingly accurate. Both the user and Lense benefit from each other in this way. 

## How we built it
Lense consists of three components: A Chrome extension as the user interface and the client; the Watson Visual Recognition tool with the training data; and the Firebase cloud platform with Cloud Functions and Real-time Database.
The Chrome extension communicates with the Watson API and Firebase API to classify images and to report images, respectively. The Firebase platform acts as a mediator who collects and aggregates user feedback. Ideally, it also feeds these aggregated data into Watson for model training. Unfortunately, we were not able to finish this last feature on time.

## Challenges we ran into
- It is difficult to identify every image in a web page
- We lacked the experience and the resources to fully exploit both Firebase and Watson 
- Most of our team are new to the technologies used in this project

## Accomplishments that we're proud of
- MACHINE LEARNING
- LEARNING NEW STUFF
- THIS PROTOTYPE WORKS

## What we learned
- Collaboration 
- Problem Solving 
