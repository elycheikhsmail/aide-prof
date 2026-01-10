# Diagrammes d'Architecture - Intégration Backend-Frontend

## Vue d'Ensemble du Système

```mermaid
graph TB
    subgraph Client["Client Browser"]
        UI[React UI]
        Router[React Router]
        Auth[AuthContext]
        Eval[EvaluationsContext]
        Classes[ClassesContext]
    end
    
    subgraph Frontend["Frontend Layer - Vite :5173"]
        UI --> Router
        Router --> Auth
        Router --> Eval
        Router --> Classes
        Auth --> API[API Service]
        Eval --> API
        Classes --> API
    end
    
    subgraph Backend["Backend Layer - Hono :3000"]
        API -->|HTTP/JSON| Server[Hono Server]
        Server --> CORS[CORS Middleware]
        CORS --> Logger[Logger Middleware]
        Logger --> AuthMW[Auth Middleware]
        AuthMW --> Routes[API Routes]
        
        Routes --> AuthR[Auth Routes]
        Routes --> EvalR[Evaluations Routes]
        Routes --> ClassR[Classes Routes]
        Routes --> StudR[Students Routes]
        
        AuthR --> AuthS[Auth Service]
        EvalR --> EvalS[Evaluation Service]
        ClassR --> ClassS[Class Service]
        StudR --> StudS[Student Service]
        
        AuthS --> Repo[Repositories]
        EvalS --> Repo
        ClassS --> Repo
        StudS --> Repo
    end
    
    subgraph Data["Data Layer"]
        Repo --> Drizzle[Drizzle ORM]
        Drizzle --> PG[(PostgreSQL)]
    end
    
    style UI fill:#61dafb
    style Server fill:#ff6b6b
    style PG fill:#336791
    style API fill:#ffd93d
```

## Architecture en Couches

```mermaid
graph LR
    subgraph Presentation["Couche Présentation"]
        P1[Pages]
        P2[Components]
        P3[UI Components]
    end
    
    subgraph State["Couche État"]
        S1[Contexts]
        S2[Hooks]
    end
    
    subgraph Business["Couche Business Frontend"]
        B1[API Service]
        B2[Validators]
        B3[Type Mappers]
    end
    
    subgraph Network["Couche Réseau"]
        N1[HTTP Client]
        N2[Error Handling]
        N3[Interceptors]
    end
    
    subgraph BackendAPI["API Backend"]
        A1[Routes]
        A2[Middlewares]
        A3[Validators]
    end
    
    subgraph BackendBusiness["Couche Business Backend"]
        BB1[Services]
        BB2[Repositories]
    end
    
    subgraph DataAccess["Couche Données"]
        D1[Drizzle ORM]
        D2[PostgreSQL]
    end
    
    P1 --> S1
    P2 --> S1
    P3 --> S1
    S1 --> B1
    S2 --> B1
    B1 --> N1
    B2 --> N1
    B3 --> N1
    N1 --> A1
    N2 --> A1
    N3 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> BB1
    BB1 --> BB2
    BB2 --> D1
    D1 --> D2
```

## Flux d'Authentification Détaillé

```mermaid
sequenceDiagram
    actor User
    participant LoginPage
    participant AuthContext
    participant APIService
    participant HonoServer
    participant AuthService
    participant UserRepo
    participant Database
    
    User->>LoginPage: Enter email & password
    LoginPage->>AuthContext: login(email, password)
    
    Note over AuthContext: Set isLoading = true
    
    AuthContext->>APIService: authApi.login(email, password)
    APIService->>HonoServer: POST /api/v1/auth/login
    
    HonoServer->>HonoServer: Validate with Zod
    HonoServer->>AuthService: login({email, password})
    
    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>Database: SELECT * FROM users WHERE email = ?
    Database-->>UserRepo: User data
    UserRepo-->>AuthService: User object
    
    AuthService->>AuthService: Compare password hash
    
    alt Password valid
        AuthService->>AuthService: Create session
        AuthService->>Database: INSERT INTO sessions
        Database-->>AuthService: Session created
        
        AuthService-->>HonoServer: {user, sessionId}
        HonoServer->>HonoServer: Set-Cookie: session=...
        HonoServer-->>APIService: 200 OK + {user}
        
        APIService-->>AuthContext: User object
        AuthContext->>AuthContext: setUser(user)
        AuthContext->>AuthContext: setIsLoading(false)
        AuthContext-->>LoginPage: Success
        
        LoginPage->>LoginPage: navigate('/dashboard')
    else Password invalid
        AuthService-->>HonoServer: Error
        HonoServer-->>APIService: 401 Unauthorized
        APIService-->>AuthContext: ApiError
        AuthContext->>AuthContext: setError(message)
        AuthContext->>AuthContext: setIsLoading(false)
        AuthContext-->>LoginPage: Error
        LoginPage->>LoginPage: Display error message
    end
```

## Flux de Création d'Évaluation

```mermaid
sequenceDiagram
    actor Professor
    participant CreatePage
    participant EvalContext
    participant APIService
    participant HonoServer
    participant EvalService
    participant EvalRepo
    participant QuestionRepo
    participant Database
    
    Professor->>CreatePage: Fill evaluation form
    Professor->>CreatePage: Add questions
    Professor->>CreatePage: Click "Create"
    
    CreatePage->>EvalContext: addEvaluation(data)
    
    Note over EvalContext: Set isLoading = true
    
    EvalContext->>APIService: evaluationsApi.create(data)
    APIService->>HonoServer: POST /api/v1/evaluations
    
    HonoServer->>HonoServer: Check auth middleware
    HonoServer->>HonoServer: Check professor middleware
    HonoServer->>HonoServer: Validate with Zod
    
    HonoServer->>EvalService: create(professorId, data)
    
    EvalService->>Database: BEGIN TRANSACTION
    
    EvalService->>EvalRepo: create(evaluationData)
    EvalRepo->>Database: INSERT INTO evaluations
    Database-->>EvalRepo: Evaluation created
    EvalRepo-->>EvalService: Evaluation object
    
    loop For each question
        EvalService->>QuestionRepo: create(questionData)
        QuestionRepo->>Database: INSERT INTO questions
        Database-->>QuestionRepo: Question created
        QuestionRepo-->>EvalService: Question object
    end
    
    EvalService->>Database: COMMIT TRANSACTION
    
    EvalService-->>HonoServer: Complete evaluation
    HonoServer-->>APIService: 201 Created + {evaluation}
    
    APIService-->>EvalContext: Evaluation object
    EvalContext->>EvalContext: Add to local state
    EvalContext->>EvalContext: setIsLoading(false)
    EvalContext-->>CreatePage: Success
    
    CreatePage->>CreatePage: Show success message
    CreatePage->>CreatePage: navigate('/evaluations')
```

## Architecture des Contextes React

```mermaid
graph TB
    subgraph App["App Component"]
        Router[Router Provider]
    end
    
    subgraph Providers["Context Providers"]
        AuthP[AuthProvider]
        EvalP[EvaluationsProvider]
        ClassP[ClassesProvider]
    end
    
    subgraph Pages["Pages"]
        Login[Login Page]
        Dashboard[Dashboard]
        Evaluations[Evaluations Page]
        Classes[Classes Page]
    end
    
    subgraph Hooks["Custom Hooks"]
        useAuth[useAuth]
        useEval[useEvaluations]
        useClass[useClasses]
    end
    
    Router --> AuthP
    AuthP --> EvalP
    EvalP --> ClassP
    ClassP --> Pages
    
    Login --> useAuth
    Dashboard --> useAuth
    Dashboard --> useEval
    Dashboard --> useClass
    Evaluations --> useAuth
    Evaluations --> useEval
    Classes --> useAuth
    Classes --> useClass
    
    useAuth -.->|consumes| AuthP
    useEval -.->|consumes| EvalP
    useClass -.->|consumes| ClassP
```

## Gestion des États

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading: API Call
    Loading --> Success: Response OK
    Loading --> Error: Response Error
    Loading --> Timeout: Request Timeout
    
    Success --> Idle: Reset
    Error --> Idle: Clear Error
    Timeout --> Idle: Retry
    
    Success --> Loading: Refresh
    Error --> Loading: Retry
    
    note right of Loading
        isLoading = true
        error = null
    end note
    
    note right of Success
        isLoading = false
        data = response
        error = null
    end note
    
    note right of Error
        isLoading = false
        error = message
    end note
```

## Flux de Données - Évaluations

```mermaid
graph LR
    subgraph User Actions
        A1[Create]
        A2[Read]
        A3[Update]
        A4[Delete]
    end
    
    subgraph Context State
        S1[evaluations: Array]
        S2[isLoading: boolean]
        S3[error: string]
    end
    
    subgraph API Calls
        API1[POST /evaluations]
        API2[GET /evaluations]
        API3[PATCH /evaluations/:id]
        API4[DELETE /evaluations/:id]
    end
    
    subgraph Backend
        B1[Create Service]
        B2[Read Service]
        B3[Update Service]
        B4[Delete Service]
    end
    
    subgraph Database
        DB[(PostgreSQL)]
    end
    
    A1 --> API1
    A2 --> API2
    A3 --> API3
    A4 --> API4
    
    API1 --> B1
    API2 --> B2
    API3 --> B3
    API4 --> B4
    
    B1 --> DB
    B2 --> DB
    B3 --> DB
    B4 --> DB
    
    DB --> B2
    B2 --> API2
    API2 --> S1
    
    S1 --> S2
    S2 --> S3
```

## Architecture de Sécurité

```mermaid
graph TB
    subgraph Client
        C1[Browser]
        C2[Cookies]
    end
    
    subgraph Frontend
        F1[API Service]
        F2[Auth Context]
    end
    
    subgraph Backend
        B1[CORS Middleware]
        B2[Auth Middleware]
        B3[Professor Middleware]
        B4[Routes]
    end
    
    subgraph Security
        S1[Session Cookie HttpOnly]
        S2[Password Hashing bcrypt]
        S3[Input Validation Zod]
        S4[SQL Injection Protection Drizzle]
    end
    
    C1 --> F1
    C2 -.->|Automatic| F1
    F1 -->|credentials: include| B1
    B1 --> B2
    B2 --> S1
    B2 --> B3
    B3 --> B4
    B4 --> S2
    B4 --> S3
    B4 --> S4
    
    style S1 fill:#90EE90
    style S2 fill:#90EE90
    style S3 fill:#90EE90
    style S4 fill:#90EE90
```

## Gestion des Erreurs

```mermaid
graph TB
    subgraph Error Sources
        E1[Network Error]
        E2[API Error 4xx]
        E3[API Error 5xx]
        E4[Timeout]
        E5[Validation Error]
    end
    
    subgraph Error Handling
        H1[API Service]
        H2[Context Error State]
        H3[Error Boundary]
        H4[Toast Notifications]
    end
    
    subgraph User Feedback
        U1[Error Message]
        U2[Retry Button]
        U3[Fallback UI]
    end
    
    E1 --> H1
    E2 --> H1
    E3 --> H1
    E4 --> H1
    E5 --> H1
    
    H1 --> H2
    H1 --> H3
    H2 --> H4
    H3 --> H4
    
    H4 --> U1
    H4 --> U2
    H3 --> U3
```

## Cycle de Vie d'une Requête

```mermaid
graph LR
    A[User Action] --> B[Context Method]
    B --> C{isLoading?}
    C -->|No| D[Set isLoading=true]
    C -->|Yes| Z[Return]
    D --> E[API Service Call]
    E --> F[Fetch with timeout]
    F --> G{Response OK?}
    G -->|Yes| H[Parse JSON]
    G -->|No| I[Parse Error]
    H --> J[Update State]
    I --> K[Set Error State]
    J --> L[Set isLoading=false]
    K --> L
    L --> M[Trigger Re-render]
    M --> N[Update UI]
```

## Structure des Modules Backend

```mermaid
graph TB
    subgraph Routes Layer
        R1[auth.routes.ts]
        R2[evaluations.routes.ts]
        R3[classes.routes.ts]
        R4[students.routes.ts]
    end
    
    subgraph Services Layer
        S1[auth.service.ts]
        S2[evaluation.service.ts]
        S3[class.service.ts]
        S4[student.service.ts]
    end
    
    subgraph Repositories Layer
        P1[user.repository.ts]
        P2[evaluation.repository.ts]
        P3[class.repository.ts]
        P4[student.repository.ts]
        P5[base.repository.ts]
    end
    
    subgraph Database Layer
        D1[Drizzle ORM]
        D2[Schema Definitions]
        D3[Migrations]
    end
    
    R1 --> S1
    R2 --> S2
    R3 --> S3
    R4 --> S4
    
    S1 --> P1
    S2 --> P2
    S3 --> P3
    S4 --> P4
    
    P1 --> P5
    P2 --> P5
    P3 --> P5
    P4 --> P5
    
    P5 --> D1
    D1 --> D2
    D1 --> D3
```

## Déploiement et Environnements

```mermaid
graph TB
    subgraph Development
        D1[Local Frontend :5173]
        D2[Local Backend :3000]
        D3[Local PostgreSQL :5432]
    end
    
    subgraph Staging
        S1[Staging Frontend]
        S2[Staging Backend]
        S3[Staging Database]
    end
    
    subgraph Production
        P1[Production Frontend CDN]
        P2[Production Backend]
        P3[Production Database]
        P4[Load Balancer]
    end
    
    D1 --> D2
    D2 --> D3
    
    S1 --> S2
    S2 --> S3
    
    P4 --> P1
    P4 --> P2
    P2 --> P3
    
    style D1 fill:#61dafb
    style D2 fill:#ff6b6b
    style D3 fill:#336791
```

## Optimisations Futures

```mermaid
graph TB
    subgraph Current
        C1[Direct API Calls]
        C2[No Caching]
        C3[Full Page Loads]
    end
    
    subgraph Future
        F1[React Query]
        F2[Optimistic Updates]
        F3[Infinite Scroll]
        F4[WebSocket Updates]
        F5[Service Worker]
        F6[Code Splitting]
    end
    
    C1 -.->|Upgrade| F1
    C2 -.->|Add| F2
    C3 -.->|Implement| F3
    
    F1 --> F4
    F1 --> F5
    F1 --> F6
    
    style F1 fill:#FFD700
    style F2 fill:#FFD700
    style F3 fill:#FFD700
    style F4 fill:#FFD700
```
