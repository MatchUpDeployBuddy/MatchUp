# Running the Application Locally

This is a Next.js React application, designed to function as a Progressive Web App (PWA) and integrated with Supabase for backend services. Follow these steps to set up and run the project locally on your machine:

## 1. Clone the Repository

Use the following command to clone the repository to your local machine:

```bash
git clone https://github.com/MatchUpDeployBuddy/MatchUp.git
```

## 2. Install Dependencies

Navigate to the project directory and install the necessary dependencies:

```bash
npm install
```

This will download and install all the packages listed in `package.json`.

## 3. Set Up the Environment Variables

Create a `.env.local` file in the root directory of the project to configure environment variables. Below is an example `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_SITE_URL=<your-site-url>
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=<your-mapbox-access-token>
NEXT_PUBLIC_ONESIGNAL_APP_ID=<your-onesignal-app-id>
NEXT_PUBLIC_ONESIGNAL_REST_API_KEY=<your-onesignal-rest-api-key>
```

Replace the placeholders (`<your-supabase-url>`, etc.) with your actual values.

## 4. Start the Development Server

Run the following command to start the development server:

```bash
npm run dev
```

This will start the application in development mode and typically serve it at:

[http://localhost:3000](http://localhost:3000)

## 5. You're Ready to Go!

Open your browser and navigate to:

[http://localhost:3000](http://localhost:3000)

You can now explore the application locally.

---

# REST API Implementation and Documentation

The application includes a REST API implemented using Next.js `app/api` routes. This API is documented with OpenAPI, and the configuration file is located at:

```
./documentation/api.yaml
```

You can view and interact with the API documentation by copying the contents of `api.yaml` into a Swagger editor, such as [Swagger Editor](https://editor.swagger.io/). This provides a user-friendly interface to explore the available endpoints and their specifications.

Feel free to reach out if you encounter any issues during the setup process!
