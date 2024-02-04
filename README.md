 ![logo](https://github.com/oleklukasiewicz/minerobe/assets/69370471/f9277a21-f817-47bd-b242-0770ed38f14a)

<h1 align=<value>"center">Digital wardrobe for minecraft skins</h1>

Minerobe is a project that allows for the customization of Minecraft skins through an advanced digital wardrobe. Designed with ease of sharing and combining different clothing items in mind, this program opens up new possibilities for the Minecraft community.

## Features:

### 1. Skin Customization: 
Users can tailor their skins by combining various clothing elements into unique combinations.

### 2. Sharing Outfits: 
With the sharing feature, players can share their created outfits with other community members.

### 3. Open Source Code: 
The entire project is available on GitHub, enabling the community to report bugs, propose features, and collaboratively develop Minerobe.

## Join us in contributing to the evolution of this project and creating even more personalized experiences in the world of Minecraft!

## Building project

### 1. Clone the repository
It will create copy of the repository on your local machine.

### 2. Setup firebase

Minerobe uses **Firebase Firestore** as database and **Firebase Authentication**.</br>
To test all features of application you need to setup authentication and firestore with this structure inside:

```
├──collections             // Contains all outfit collections
├──settings                // Contains settings for minerobe users
├──secret                  // Contains secret data of minerobe users
├──public                  // Contains data of landing and explore view
├──query                   // Contains data about outfits for queries
├──user-link               // Link to minerobe users used by authentication
├──users                   // List of users
├──outfits                 // Contains users outfits
├──sets                    // Sets of outfits created by users
└──wardrobes               // Wardrobes of minerobe users
```

### 3. Add environment variables
```
Firebase (client side)
VITE_API_KEY=<value>
VITE_AUTH_DOMAIN=<value>
VITE_PROJECT_ID=<value>
VITE_STORAGE_BUCKET=<value>
VITE_MESSAGING_SENDER_ID=<value>
VITE_APP_ID=<value>
VITE_MEASUREMENT_ID=<value>

Firebase (server side)
VITE_AZURE_APP_ID=<value>
VITE_SERVICE_TYPE=<value>
VITE_PRIVATE_KEY_ID=<value>
VITE_PRIVATE_KEY=<value>
VITE_CLIENT_EMAIL=<value>
VITE_CLIENT_ID=<value>
VITE_AUTH_URI=<value>
VITE_TOKEN_URI=<value>
VITE_AUTH_PROVIDER_X509_CERT_URL=<value>
VITE_CLIENT_X509_CERT_URL=<value>
VITE_UNIVERSE_DOMAIN=<value>

Random values for users secret path
VITE_USERS_SECRET_PATH=<value>
VITE_USERS_SECRET_LOCAL_PATH=<value>
```
---

## Screeenshots

![image](https://github.com/oleklukasiewicz/minerobe/assets/69370471/587a4ac4-a43f-4922-bc48-22ac2ce7a338)
![image](https://github.com/oleklukasiewicz/minerobe/assets/69370471/0609cc4e-5aff-4b81-8943-57d538e6b259)
![image](https://github.com/oleklukasiewicz/minerobe/assets/69370471/496271ca-9a74-4f38-b3ae-1bcdb9ad4c85)


<!--# icons 
https://iconduck.com/search?query=<value>vectorSetIds:140](url)--!>
