# HowRu

Hosted link: HowRu (howru2-fcdff.web.app)

## 1. Project Description
HowRu is a mental health focused social media app. The app provides users with a means of achieving genuine connections with people in their community with features such as localized posting and a built-in messaging feature.

## 2. Contributors
Team members:
* Hi, my name is Raymond. I am excited to learn and build a program from the start!!
* Hi, my name is Bavneet. I am excited to be here.
* Hi, my name is Will. I love Git and Github.
	
## 3. Technologies and Resources Used

* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* MapBox GL

## 4. Complete setup/installion/usage
For those who want to modify the source code:

* Pull the source code.
* Run as with local server.
* Modify code as needed.
* Do not modify the API keys.

For those who simply want to use the app:

* Click on the link at the top of the page.
* Create an account.
* Enjoy.

## 5. Known Bugs and Limitations
Here are some known bugs:
* UI on the phone screen is slightly out of place in some areas.
* Rating is not limited, users are able to submit as many reviews as they want.

## 6. Features for Future
What we'd like to build in the future:
* Privacy on The Space, posting without the need for location.
* Customization of user profiles.
* Change mood selectors and rating slider to icons.
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── index.html               # landing HTML file, this is what users see 
├── login.html               # Users are authenticated here
├── main.html                # Authenticated 'home' page
├── messaging.html           # Chatspace for users
├── resources.html           # A page that lists external health resources
├── space.html               # Post space for users
when you come to url
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /back1.png               # Will Otterbein, photoshop
    /home2.png               # Will Otterbein, photoshop
    /logout1.png             # Will Otterbein, photoshop
    /map1.png                # Will Otterbein, photoshop
    /message1.png            # Will Otterbein, photoshop
    /websiteIconNew.png      # Will Otterbein, photoshop
    /websiteIconNew1.png     # Will Otterbein, photoshop
    /websiteIconNew3.png     # Will Otterbein, photoshop
    /websiteIconNew4.png     # Will Otterbein, photoshop
    /websiteIconNew5.png     # Will Otterbein, photoshop
    /websiteIconNew6..png    # Will Otterbein, photoshop
    /websiteIconVersoin2.png # Will Otterbein, photoshop
    /favicon..ico            # ChatGPT Generated image.
    ├── profiles             # Folder for profile images
        /llama1.jpg          # https://limaspanishhouse.com/the-peruvian-llama/
        /llama2.jpg          # https://www.pinterest.ca/pin/300544975105000154/
        /llama3.jpg          # https://www.pinterest.ca/pin/382031980874530523/
        /llama4jpg           # Jami Tarris / Getty Images
        /llama5.jpg          # http://www.clker.com/clipart-447189.html
        /llama6.jpg          # https://www.reddit.com/r/AnimalsBeingFunny/comments/16exaqc/this_funny_haircut_on_an_alpaca/
        /llama7.jpg          # ChatGPT Generated image.
        /llama8.jpg          # https://avatars.githubusercontent.com/u/8285248?v=4
        /llama9.jpg          # https://www.flickr.com/photos/tambako/8309456247
        /llama10.jpg         # https://www.pinterest.ca/pin/98657048056608216/
        /llama11.jpg         # https://www.pinterest.ca/pin/498281146266062084/
        /llama12.jpg         # https://soundcloud.com/zeke-morrow
        /llama13.jpg         # https://www.facebook.com/photo/?fbid=737537411724839&set=a.737535518391695
        /llama14.jpg         # https://www.pinterest.ca/mrbones1234/
        /llama15.jpg         # https://www.flickr.com/photos/rofanator/1555426740
├── scripts                  # Folder for scripts
    /authentication.js       # Script that authenticates users upon logging in
    /conversations.js        # Script that houses the applicaiton logic associated with displaying conversations
    /firebaseAPI_TEAM25.js   # Script that holds our Firebase API 
    /index.js                # The landing page of HowRu which takes users to the login page
    /loadProfile.js          # Contains two functions for loading profile icons and profile names
    /main.js                 # A home page that links to resources, the space, and messaging pages
    /messaging.js            # Scripts that load messages onsnapshot from the firestore database
    /resources.js            # Scripts that route users to mental health webpages
    /skeleton.js             # Loads reused page html elements
    /space.js                # Scripts that interface with the mapbox api to provide localised posting functionality
    /testmain.js             # Scripts that interface with the mapbox api to provide localised posting functionality
├── styles                   # Folder for styles
    /conversations.css       # Visual styles for conversations page
    /index.css               # Visual styles for index page
    /landing.css             # Visual styles for landing page
    /login.css               # Visual styles for login page
    /main-cover.css          # Visual styles for main-cover page
    /messaging.css           # Visual styles for messaging page
    /resources.css           # Visual styles for resources page
    /space.css               # Visual styles for space page
    /style.css               # Global Visual styles

```
