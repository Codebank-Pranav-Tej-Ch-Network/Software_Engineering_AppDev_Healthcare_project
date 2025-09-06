# MyHealth 🌿💚

MyHealth is a cutting-edge mobile application dedicated to advancing Good Health and Well-being aligned with the United Nations Sustainable Development Goal 3 (SDG 3). By integrating holistic health management with innovative technology, MyHealth empowers individuals and communities to foster healthier, sustainable lifestyles.  
Our platform offers comprehensive tools for personal health tracking, community engagement, and sustainable medical resource management, making health care accessible and impactful for all.  
MyHealth is a comprehensive mobile solution designed to address key challenges in personal health management, community well-being, and medical resource sustainability. By leveraging modern technology, our app provides a suite of tools that empower users to take control of their health, connect with their community, and contribute to a more sustainable healthcare ecosystem.

# Table of Contents  
- About The Project  
- Key Features  
- Tech Stack  
- Screenshots (Placeholder)  
- Getting Started  
- Prerequisites  
- Installation  
- Usage  
- Contributing  
- License  
- Contact  
- Contributors

## About The Project  
In line with the United Nations' Sustainable Development Goal 3 (SDG 3): Good Health and Well-being, MyHealth aims to provide an accessible, all-in-one platform for health management. Our project addresses this goal through several key pillars:  
- **Personal Health Management:** Empowering individuals with tools to track their health records, medications, and fitness goals.  
- **Community Health:** Fostering a community of support through features like blood donation and resource sharing.  
- **Medical Sustainability:** Reducing medical waste by creating a platform for recycling near-expiry medicines.  
- **AI-Driven Insights:** Providing accessible health analysis through cutting-edge AI to guide users toward appropriate medical care.  

## Key Features  
MyHealth comes packed with a range of features designed to cater to all aspects of a user's health journey:  
- **Seamless Authentication**  
  Secure and easy-to-use login and sign-up flow powered by Firebase Authentication.  
- **Personalized User Profiles**  
  A dedicated space for users to manage their personal information and preferences.  
- **Healthset Wallet**  
  A safe digital wallet to upload, store, and manage images of medical documents like lab reports, test results, and prescriptions. Never lose a report again!  
- **Blood Donation Platform**  
  A community-driven feature where users can register as willing blood donors. Those in need can easily view a list of potential donors nearby, bridging critical gaps in emergencies.  
- **Intelligent Medication Reminders**  
  A simple yet powerful reminder system to help users manage their medication schedules effectively with timely notifications.  
- **Guided Diet & Exercise Plans**  
  An engaging list of animated cards showcasing various yoga poses and exercises with links to trusted external resources for detailed guidance.  
- **Hyperlocal Medical Waste Reduction**  
  A peer-to-peer platform where users can list and sell medicines nearing expiry at custom prices, promoting the recycling of safe, unused medication and reducing waste.  
- **AI-Powered Health Analysis**  
  Utilizing Google’s Gemini API, users upload test report images which are analyzed by AI/ML to provide simplified summaries, highlight potential symptoms, and suggest specialist consultations (e.g., Cardiologist, Endocrinologist).  

## Tech Stack  
This project is built using a modern, scalable, and cross-platform technology stack:  

| Component          | Technology                              |  
|--------------------|---------------------------------------|  
| Frontend           | React Native                          |  
| Backend & Database  | Firebase (Firestore, Authentication, Storage) |  
| AI/ML              | Google Gemini API                     |  
| State Management   | React Context API / Redux             |  
| UI/UX              | React Native Paper / Custom Components|  

## Screenshots  
(Add your app screenshots here to give users a visual feel of the application.)  
-Signup Screen 
![IMG-20250907-WA0008](https://github.com/user-attachments/assets/d6860fd8-acc4-4f42-ac73-779cdeaeff06)

- Login Screen
![IMG-20250907-WA0002](https://github.com/user-attachments/assets/f7161b70-aa8c-47fc-a28f-a386bd4d61e9)

- Dashboard
![IMG-20250907-WA0005](https://github.com/user-attachments/assets/89247c97-992b-4083-a8cf-ffadedce6f63)

- Profile
![IMG-20250907-WA0004](https://github.com/user-attachments/assets/f6c1f660-3163-40ae-b2a8-0f3565d4b790)

- Blood Donation
![IMG-20250907-WA0006](https://github.com/user-attachments/assets/32a6b943-dc49-412a-a47a-0ec56ad7af72)

- Medication Reminders
![IMG-20250907-WA0007](https://github.com/user-attachments/assets/8a0dcbfb-397e-4845-994b-1e04507d7db5)

- Healthset Wallet
![IMG-20250907-WA0009](https://github.com/user-attachments/assets/3921e4b0-1de9-4938-ad25-9c34b2566aa5)

- Exercise & Yoga plans
![IMG-20250907-WA0010](https://github.com/user-attachments/assets/57219a3f-cc83-49ee-92a5-0d079f7abedb)

![IMG-20250907-WA0017](https://github.com/user-attachments/assets/16033d70-2a21-457d-b5ed-375fc45d3035)

- Hyperlocal Medical Waste Reduction Platform
![IMG-20250907-WA0011](https://github.com/user-attachments/assets/35235d17-3ff8-4de9-8427-8161b4097d4e)

![IMG-20250907-WA0015](https://github.com/user-attachments/assets/c58d2b93-858b-411d-b091-b21394a6e81e)

![IMG-20250907-WA0018](https://github.com/user-attachments/assets/759b3715-0504-4a7e-b830-a77463a65024)

- AIML Test Report Analyzer
![IMG-20250907-WA0014](https://github.com/user-attachments/assets/7b4b1045-8ffd-4fd5-a92a-6d314a954078)
  
![IMG-20250907-WA0016](https://github.com/user-attachments/assets/c8fa3e85-4e3d-4b04-8bf5-a0789824c52f)

![IMG-20250907-WA0012](https://github.com/user-attachments/assets/aa079cf5-0dcd-4a59-a374-1256cd8961a8)

![IMG-20250907-WA0013](https://github.com/user-attachments/assets/52b50c9e-49b8-4b51-a080-4a26b79e5064)

## Getting Started  
To get a local copy up and running, follow these steps.

### Prerequisites  
- Node.js (LTS version recommended)  
- Yarn or npm  
- Expo Go app on your mobile device or an Android/iOS emulator  
- A Firebase project  
- A Google Cloud project with Gemini API enabled  

### Installation  
Clone the repository:  
git clone https://github.com/your-username/MyHealth.git

Navigate to the project directory:  
cd MyHealth

Install dependencies:  
npm install

or 
yarn install

Set up environment variables:  
Create a `.env` file in the root and add your Firebase and Gemini API credentials.  

Firebase Configuration
FIREBASE_API_KEY="your_firebase_api_key"
FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
FIREBASE_APP_ID="your_firebase_app_id"

Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"

Start the development server:  
npm start

or
npx expo start

Scan the QR code with Expo Go on your phone.

## Usage  
1. **Sign Up/Login:** Create a new account or log in with your existing credentials.  
2. **Healthset Wallet:** Upload images of your medical reports securely via the wallet.  
3. **Blood Donation:** Browse registered donors or register yourself to help in emergencies.  
4. **Medication Reminders:** Add medications and set schedules for timely alerts.  
5. **AI Analysis:** Upload lab report images for AI-generated health insights.  

## Contributing  
Contributions make the open-source community amazing. Any contributions are appreciated.  
- Fork the project  
- Create your feature branch (`git checkout -b feature/AmazingFeature`)  
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)  
- Push to the branch (`git push origin feature/AmazingFeature`)  
- Open a pull request  
You can also open issues with the tag "enhancement."

## License  
Distributed under the MIT License. See LICENSE for more information.

## Contact  
Project Maintainer - Your Name - [pranavtej.9.1a@gmail.com](mailto:pranavtej.9.1a@gmail.com)  
Project Link: https://github.com/Codebank-Pranav-Tej-Ch-Network/Software_Engineering_AppDev_Healthcare_project

## Contributors  

- **Ch Pranav Tej (Project Manager):** Worked on the AIML test analyzer, Exercise Plans, README file, and helped in final product integration. Also managed project progress by holding daily meetings and maintaining progress reports.  
- **Nikhil Muvvala (Full Stack Dev):** Developed Medication Reminders, Medicine Recycle, Health Wallet, overall UI, login/signup pages, and Profile page. Managed Firebase integration.  
- **Hemanth S (Full Stack Dev):** Worked on Blood Donation, Healthset Wallet, UI, Profile page, and Firebase backend.  
- **Vinay (Backend Dev):** Focused on Firebase setup including OAuth and Firestore. Developed the Medicine Recycle page.  
- **G Siddhardha (AR Dev):** Fully responsible for the AR app using Unity; managing 3D models, creating AR UI, implemented search bar for medicines, diseases, and procedures; currently supports heart and lung models with plans for animations and more organs in the future.  
