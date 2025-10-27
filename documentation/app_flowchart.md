flowchart TD
  A[User Accesses App] --> B[User Authentication]
  B --> C{Authenticated?}
  C -->|Yes| D[Dashboard]
  C -->|No| E[Login Page]
  E --> B
  D --> F[My Invitations]
  D --> G[Create New Invitation]
  G --> H[Select Category]
  H --> I[Select Theme]
  I --> J[Invitation Editor]
  J --> K[AI Content Assistant]
  K --> L[Live Preview]
  L --> M[Save Invitation]
  M --> N[View Public Invitation]
  N --> O[Share Link]
  F --> P[Manage Invitation]
  P --> Q{Action}
  Q -->|Edit| J
  Q -->|Delete| R[Delete Invitation]
  Q -->|View| N