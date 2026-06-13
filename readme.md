# DevPulse API

DevPulse is a backend API for reporting bugs and feature requests inside a software team. The API supports authentication, role based permissions, issue filtering, and issue workflow updates.

## Live URL

https://devpulse-api-abjim.vercel.app/

## GitHub Repository

https://github.com/abjim/devpulse-api

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Contributor and maintainer roles
- Create bug or feature request
- Public issue list and single issue details
- Filter issues by type and status
- Sort issues by newest or oldest
- Contributors can update only their own open issues
- Maintainers can update and delete any issue
- Raw SQL with native pg driver
- No ORM, query builder, or SQL JOIN used

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- pg
- bcrypt
- jsonwebtoken
- http-status-codes

## Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
````

## Local Setup

```bash
git clone https://github.com/abjim/devpulse-api.git
cd devpulse-api
npm install
npm run dev
```

## Database Setup

Run the SQL file from:

```txt
database/schema.sql
```

I used PostgreSQL triggers for updating the `updated_at` columns automatically.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | /api/auth/signup | Public | Register new user |
| POST | /api/auth/login | Public | Login and get JWT |

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | /api/issues | Authenticated | Create issue |
| GET | /api/issues | Public | Get all issues |
| GET | /api/issues/:id | Public | Get single issue |
| PATCH | /api/issues/:id | Authenticated | Update issue |
| DELETE | /api/issues/:id | Maintainer only | Delete issue |

## Query Parameters

`GET /api/issues` supports:

```txt
sort=newest | oldest
type=bug | feature_request
status=open | in_progress | resolved
```

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

## Permission Rules

### Contributor

- Can register and login
  
- Can create issue
  
- Can view all issues
  
- Can update own issue only when status is `open`
  
- Can not update issue status
  
- Can not delete issue
  

### Maintainer

- Can do everything contributor can do
  
- Can update any issue
  
- Can update issue status
  
- Can delete any issue
  

## Notes About No JOIN Rule

The assignment said not to use SQL JOIN. So for issue reporter information, I first load issues from the `issues` table. Then I collect reporter ids and load users separately using:

```sql
SELECT id, name, role FROM users WHERE id = ANY($1::int[])
```

After that I attach reporter information in TypeScript.

## Deployment

I deployed the API on vercel and used NeonDB for PostgreSQL.

Deployment steps I followed:

1. Created PostgreSQL database in NeonDB.
  
2. Ran the schema from `database/schema.sql`.
  
3. Pushed the code to GitHub.
  
4. Connected the GitHub repo with vercel.
  
5. Deployed and tested all endpoints with thunder client.
  

## Test Users

Maintainer:

```txt
email: maintainer@devpulse.com
password: password123
```

Contributor:

```txt
email: contributor@devpulse.com
password: password123
```
