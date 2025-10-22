flowchart TD
    Start[User Access] --> SignIn[Sign In Page]
    Start --> SignUp[Sign Up Page]
    SignIn --> Dashboard[User Dashboard]
    SignUp --> Dashboard
    Dashboard --> LabList[Lab Listing Page]
    LabList --> LabDetail[Lab Detail Page]
    Dashboard --> UploadLab[Upload Lab Page]
    UploadLab --> ProcessUpload[Handle Upload]
    ProcessUpload --> DB[Database]
    ProcessUpload --> LabDetail
    LabDetail --> AIAssistant[AI Assistant Page]
    AIAssistant --> AIProcess[Process AI Request]
    AIProcess --> LabDetail
    Dashboard --> Logout[Logout]
    Logout --> End[End]