# Project Title
A full stack personal finance management web app target beginner and student who are news to budgeting.

# Tech Stack
ReactJs with Vite, TailwindCSS, Firebase (Auth, Firestore, Functions), Plaid API, Rechart, MUI, React Icons.

# Installation
## 1. Clone the repository:
```bash
git clone https://github.com/ducnguyenNOPRO/ace-it-twice.git
```
## 2. You would need to create:
* Plaid account for PLAID_CLIENT_ID and PLAID_SECRET and put them under functions/.env
* Firebase account. Put these in a .env in the main folder along with (package.json, etc.): VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID and VITE_FIREBASE_APP_ID.

# Usage
## 1. Run the frontend:
```bash
\ace-it-twice>:
  npm run dev
```

I'm using firebase emulators for local development and testing.
## 2. Run the backend:
```bash
\ace-it-twice\functions>:
  npm run serve   ## This will run the emulators
```
**If it fails to load functions, exit (Ctrl C), close the 2 cmds and run it again**

## 3. Set up data
 ### 3.1. Create a user in Authentication tab (just need a name, email and password)
  !<img width="570" height="857" alt="Authentication" src="https://github.com/user-attachments/assets/9cb722c4-7f2c-4fae-92a3-cc084f97cc25" />
 ### 3.2. Add user to Firestore DB. 
   Grab that User UID you just created -> go to Firestore tab -> create collections named "users" -> pasted UID -> created a field "fullName"
 !<img width="552" height="557" alt="add-user" src="https://github.com/user-attachments/assets/b9cf888f-29ea-444f-acb3-89800435173c" />
 ### 3.3. Log In and Connect Bank
   Go to Setting -> Connect Bank -> Follow the steps -> Choose between these 2 banks (whichever give you more transactions data, Tartan bank is more consistent) -> Check your DB
 !<img width="460" height="766" alt="bank-connection" src="https://github.com/user-attachments/assets/5f06723f-35e7-41e0-8cfe-49f125b12d8b" />
 ### 3.4. Enjoy



   

